import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { loadState, saveState } from '../utils/storage';
import {
  createSeedVehicles,
  createSeedViolations,
  createVehicleRecord,
  generateViolation,
  withViolationHistory,
} from '../data/violationsData';
import { subscribe } from '../services/notificationBus';
import { sendSMS, sendEmail } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { useAudit } from './AuditContext';

const ViolationsContext = createContext(null);

function buildInitialState() {
  const vehicles = loadState('vehicles.v1', null) || createSeedVehicles();
  const violations = loadState('violations.v1', null) || createSeedViolations(vehicles);
  return { vehicles, violations };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_VIOLATION':
      return { ...state, violations: [action.payload, ...state.violations] };
    case 'UPDATE_VIOLATION':
      return {
        ...state,
        violations: state.violations.map((v) => (v.id === action.payload.id ? { ...v, ...action.payload.patch } : v)),
      };
    case 'ENSURE_VEHICLE':
      if (state.vehicles.some((v) => v.plate === action.payload.plate)) return state;
      return { ...state, vehicles: [action.payload, ...state.vehicles] };
    default:
      return state;
  }
}

function combineChannelStatus(statuses) {
  if (statuses.some((s) => s === 'Failed')) return 'Failed';
  if (statuses.length && statuses.every((s) => s === 'Delivered')) return 'Delivered';
  if (statuses.some((s) => s === 'Sent' || s === 'Delivered')) return 'Sent';
  if (statuses.some((s) => s === 'Processing')) return 'Processing';
  return 'Pending';
}

export function ViolationsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const { user } = useAuth();
  const { logAction } = useAudit();
  const channelStatusRef = useRef({});
  const violationsRef = useRef(state.violations);
  useEffect(() => {
    violationsRef.current = state.violations;
  }, [state.violations]);

  useEffect(() => {
    saveState('violations.v1', state.violations);
  }, [state.violations]);

  useEffect(() => {
    saveState('vehicles.v1', state.vehicles);
  }, [state.vehicles]);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      const n = event.notification;
      if (n.refType !== 'violation') return;
      const bucket = { ...(channelStatusRef.current[n.refId] || {}), [n.channel]: n.status };
      channelStatusRef.current[n.refId] = bucket;
      const combined = combineChannelStatus(Object.values(bucket));
      dispatch({ type: 'UPDATE_VIOLATION', payload: { id: n.refId, patch: { notificationStatus: combined } } });
    });
    return unsubscribe;
  }, []);

  const notifyForViolation = useCallback((violation) => {
    sendSMS({
      to: `Registered mobile of ${violation.vehicleNumber}`,
      message: `Traffic Violation detected for vehicle ${violation.vehicleNumber} on ${new Date(violation.timestamp).toLocaleDateString('en-IN')} at ${violation.location}. Please check your violation report for details. Ref: ${violation.id}`,
      refType: 'violation',
      refId: violation.id,
      type: 'Traffic Violation',
    });
    sendEmail({
      to: `owner.${violation.vehicleNumber.toLowerCase()}@demo-mail.in`,
      subject: `Traffic Violation Notice — ${violation.id}`,
      message: `Dear Vehicle Owner,\n\nA "${violation.violationType}" violation was detected for vehicle ${violation.vehicleNumber} on ${new Date(violation.timestamp).toLocaleString('en-IN')} at ${violation.location}. AI confidence: ${violation.confidence}%.\n\nA full violation report with evidence is available in the Traffic Department portal.`,
      refType: 'violation',
      refId: violation.id,
      type: 'Traffic Violation',
      attachmentLabel: `${violation.id}_Violation_Report.pdf`,
    });
  }, []);

  const createViolation = useCallback(
    (overrides = {}) => {
      const violation = generateViolation({ timestamp: new Date(), source: 'Demo Upload — Detection Studio', ...overrides });
      dispatch({ type: 'ADD_VIOLATION', payload: violation });
      dispatch({ type: 'ENSURE_VEHICLE', payload: createVehicleRecord(violation.vehicleNumber) });
      logAction({ user, action: 'AI detection created violation', entity: 'Violation', entityId: violation.id, meta: { type: violation.violationType } });
      return violation;
    },
    [logAction, user]
  );

  const verifyViolation = useCallback(
    (id, status) => {
      dispatch({ type: 'UPDATE_VIOLATION', payload: { id, patch: { status } } });
      logAction({ user, action: `Violation marked ${status}`, entity: 'Violation', entityId: id });
      if (status === 'Verified' || status === 'Enforced') {
        const violation = violationsRef.current.find((v) => v.id === id);
        if (violation) notifyForViolation(violation);
      }
    },
    [logAction, user, notifyForViolation]
  );

  const vehiclesWithHistory = useMemo(() => withViolationHistory(state.vehicles, state.violations), [state.vehicles, state.violations]);

  const findVehicle = useCallback((plate) => vehiclesWithHistory.find((v) => v.plate === plate) || null, [vehiclesWithHistory]);

  const value = useMemo(
    () => ({
      violations: state.violations,
      vehicles: vehiclesWithHistory,
      createViolation,
      verifyViolation,
      findVehicle,
    }),
    [state.violations, vehiclesWithHistory, createViolation, verifyViolation, findVehicle]
  );

  return <ViolationsContext.Provider value={value}>{children}</ViolationsContext.Provider>;
}

export function useViolations() {
  const ctx = useContext(ViolationsContext);
  if (!ctx) throw new Error('useViolations must be used within ViolationsProvider');
  return ctx;
}
