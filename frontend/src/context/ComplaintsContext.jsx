import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { loadState, saveState } from '../utils/storage';
import { createSeedComplaints, nextComplaintId, DEPARTMENTS, departmentForCategory } from '../data/complaintsData';
import { calculatePriority } from '../services/priorityService';
import { findDuplicateCandidates } from '../services/duplicateService';
import { computeSlaDeadline, slaState } from '../services/slaService';
import { sendSMS, sendEmail, pushInApp } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { useAudit } from './AuditContext';

const ComplaintsContext = createContext(null);

function buildInitialState() {
  const complaints = loadState('complaints.v1', null) || createSeedComplaints();
  return { complaints };
}

function appendHistory(complaint, status, note, by) {
  return {
    ...complaint,
    statusHistory: [...complaint.statusHistory, { status, at: Date.now(), note, by }],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_COMPLAINT':
      return { ...state, complaints: [action.payload, ...state.complaints] };
    case 'PATCH_COMPLAINT':
      return {
        ...state,
        complaints: state.complaints.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload.patch } : c)),
      };
    default:
      return state;
  }
}

export function ComplaintsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const { user } = useAuth();
  const { logAction } = useAudit();
  const complaintsRef = useRef(state.complaints);
  useEffect(() => {
    complaintsRef.current = state.complaints;
  }, [state.complaints]);

  useEffect(() => {
    saveState('complaints.v1', state.complaints);
  }, [state.complaints]);

  // Periodic SLA sweep — mirrors the interval-tick approach SimulationContext
  // already uses. Escalates newly-overdue complaints up the chain and raises
  // an in-app alert, independent of any admin interaction.
  useEffect(() => {
    const interval = setInterval(() => {
      complaintsRef.current.forEach((c) => {
        if (['Resolved', 'Rejected'].includes(c.status)) return;
        const overdue = slaState(c.slaDeadline, c.status) === 'Overdue';
        if (overdue && c.escalationLevel < 2) {
          const nextLevel = c.escalationLevel + 1;
          dispatch({ type: 'PATCH_COMPLAINT', payload: { id: c.id, patch: { escalationLevel: nextLevel } } });
          pushInApp({
            message: `${c.id} is overdue — escalated to ${['Department Officer', 'Supervisor', 'Administrator'][nextLevel]}.`,
            refType: 'complaint',
            refId: c.id,
            type: 'Overdue Complaint',
          });
          logAction({ user: null, action: 'SLA escalation', entity: 'Complaint', entityId: c.id, meta: { level: nextLevel } });
        }
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [logAction]);

  const submitComplaint = useCallback(
    (payload) => {
      const now = Date.now();
      const { priority } = calculatePriority({
        category: payload.category,
        locationImportance: payload.locationImportance || 'medium',
        similarCount: 0,
        aiConfidence: 80,
      });
      const draft = {
        id: nextComplaintId(),
        category: payload.category,
        description: payload.description,
        images: payload.images || [],
        videoMeta: payload.videoMeta || null,
        location: payload.location,
        landmark: payload.landmark || '',
        coords: payload.coords,
        contactName: payload.contactName || null,
        contactPhone: payload.contactPhone || null,
        contactEmail: payload.contactEmail || null,
        submittedAt: now,
        status: 'Submitted',
        priority,
        department: null,
        assignedAt: null,
        slaDeadline: computeSlaDeadline(priority, now),
        statusHistory: [{ status: 'Submitted', at: now, note: 'Citizen submitted complaint via portal.', by: payload.contactName || 'Citizen' }],
        duplicateOf: null,
        resolution: null,
        feedback: null,
        citizenNotified: false,
        escalationLevel: 0,
      };

      const duplicateCandidates = findDuplicateCandidates(draft, complaintsRef.current);
      dispatch({ type: 'ADD_COMPLAINT', payload: draft });
      pushInApp({ message: `New complaint ${draft.id} — ${draft.category} at ${draft.location}.`, refType: 'complaint', refId: draft.id, type: 'New Complaint' });
      logAction({ user: null, action: 'Citizen submitted complaint', entity: 'Complaint', entityId: draft.id, meta: { category: draft.category } });

      return { complaint: draft, duplicateCandidates };
    },
    [logAction]
  );

  const notifyCitizen = useCallback((complaint, { type, smsMessage, emailSubject, emailMessage }) => {
    if (complaint.contactPhone) {
      sendSMS({ to: complaint.contactPhone, message: smsMessage, refType: 'complaint', refId: complaint.id, type });
    }
    if (complaint.contactEmail) {
      sendEmail({ to: complaint.contactEmail, subject: emailSubject, message: emailMessage, refType: 'complaint', refId: complaint.id, type });
    }
    pushInApp({ message: smsMessage, refType: 'complaint', refId: complaint.id, type });
  }, []);

  const updateStatus = useCallback(
    (id, status, note = '') => {
      const complaint = complaintsRef.current.find((c) => c.id === id);
      if (!complaint) return;
      const updated = appendHistory({ ...complaint, status }, status, note || `Status updated to ${status}.`, user?.name || 'Admin');
      dispatch({ type: 'PATCH_COMPLAINT', payload: { id, patch: updated } });
      logAction({ user, action: `Complaint status → ${status}`, entity: 'Complaint', entityId: id, meta: { note } });
      if (status !== 'Submitted') {
        notifyCitizen(updated, {
          type: 'Complaint Status Changed',
          smsMessage: `Your complaint ${id} is now "${status}".`,
          emailSubject: `Complaint ${id} — Status Update`,
          emailMessage: `Your complaint regarding ${complaint.category} at ${complaint.location} is now marked "${status}".${note ? `\n\nNote: ${note}` : ''}`,
        });
      }
    },
    [logAction, user, notifyCitizen]
  );

  const assignComplaint = useCallback(
    (id, department) => {
      const complaint = complaintsRef.current.find((c) => c.id === id);
      if (!complaint) return;
      const now = Date.now();
      const updated = appendHistory(
        { ...complaint, status: 'Assigned', department, assignedAt: now, slaDeadline: computeSlaDeadline(complaint.priority, now) },
        'Assigned',
        `Assigned to ${department}.`,
        user?.name || 'Admin'
      );
      dispatch({ type: 'PATCH_COMPLAINT', payload: { id, patch: updated } });
      logAction({ user, action: 'Complaint assigned', entity: 'Complaint', entityId: id, meta: { department } });
      notifyCitizen(updated, {
        type: 'Complaint Assigned',
        smsMessage: `Your complaint ${id} has been assigned to ${department}.`,
        emailSubject: `Complaint ${id} — Assigned to ${department}`,
        emailMessage: `Your complaint regarding ${complaint.category} at ${complaint.location} has been assigned to ${department} for resolution.`,
      });
    },
    [logAction, user, notifyCitizen]
  );

  const changePriority = useCallback(
    (id, priority) => {
      dispatch({ type: 'PATCH_COMPLAINT', payload: { id, patch: { priority, slaDeadline: computeSlaDeadline(priority) } } });
      logAction({ user, action: `Priority changed → ${priority}`, entity: 'Complaint', entityId: id });
    },
    [logAction, user]
  );

  const addNote = useCallback(
    (id, note) => {
      const complaint = complaintsRef.current.find((c) => c.id === id);
      if (!complaint) return;
      const updated = appendHistory(complaint, complaint.status, note, user?.name || 'Admin');
      dispatch({ type: 'PATCH_COMPLAINT', payload: { id, patch: updated } });
      logAction({ user, action: 'Note added', entity: 'Complaint', entityId: id, meta: { note } });
    },
    [logAction, user]
  );

  const resolveComplaint = useCallback(
    (id, { images, notes }) => {
      const complaint = complaintsRef.current.find((c) => c.id === id);
      if (!complaint) return;
      const now = Date.now();
      const resolution = { images: images || [], notes, resolvedAt: now, resolvedBy: user?.name || 'Field Staff' };
      const updated = appendHistory(
        { ...complaint, status: 'Resolved', resolution, citizenNotified: true },
        'Resolved',
        'Resolution evidence uploaded and verified.',
        user?.name || 'Admin'
      );
      dispatch({ type: 'PATCH_COMPLAINT', payload: { id, patch: updated } });
      logAction({ user, action: 'Complaint resolved', entity: 'Complaint', entityId: id });
      notifyCitizen(updated, {
        type: 'Complaint Resolved',
        smsMessage: `Your complaint ${id} regarding ${complaint.category} at ${complaint.location} has been resolved. Thank you for helping improve road safety.`,
        emailSubject: `Complaint ${id} — Resolved`,
        emailMessage: `Good news — your complaint regarding ${complaint.category} at ${complaint.location} has been resolved on ${new Date(now).toLocaleDateString('en-IN')}.\n\nResolution notes: ${notes}\n\nWe'd love your feedback via the citizen portal.`,
      });
    },
    [logAction, user, notifyCitizen]
  );

  const submitFeedback = useCallback(
    (id, feedback) => {
      dispatch({ type: 'PATCH_COMPLAINT', payload: { id, patch: { feedback: { ...feedback, submittedAt: Date.now() } } } });
      logAction({ user: null, action: 'Citizen submitted feedback', entity: 'Complaint', entityId: id, meta: feedback });
    },
    [logAction]
  );

  const mergeComplaints = useCallback(
    (duplicateId, primaryId) => {
      const primary = complaintsRef.current.find((c) => c.id === primaryId);
      const duplicate = complaintsRef.current.find((c) => c.id === duplicateId);
      if (!primary || !duplicate) return;
      const updated = appendHistory(duplicate, duplicate.status, `Merged into ${primaryId} as a duplicate report.`, user?.name || 'Admin');
      dispatch({ type: 'PATCH_COMPLAINT', payload: { id: duplicateId, patch: { ...updated, duplicateOf: primaryId } } });
      logAction({ user, action: 'Complaints merged', entity: 'Complaint', entityId: duplicateId, meta: { mergedInto: primaryId } });
    },
    [logAction, user]
  );

  const value = useMemo(
    () => ({
      complaints: state.complaints,
      departments: DEPARTMENTS,
      departmentForCategory,
      submitComplaint,
      updateStatus,
      assignComplaint,
      changePriority,
      addNote,
      resolveComplaint,
      submitFeedback,
      mergeComplaints,
      findById: (id) => state.complaints.find((c) => c.id === id) || null,
    }),
    [state.complaints, submitComplaint, updateStatus, assignComplaint, changePriority, addNote, resolveComplaint, submitFeedback, mergeComplaints]
  );

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within ComplaintsProvider');
  return ctx;
}
