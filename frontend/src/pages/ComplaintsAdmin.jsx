import { useMemo, useState } from 'react';
import { Search, MapPin, FileDown, GitMerge, Link2 } from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import Modal from '../components/Modal';
import StatusTimeline from '../components/StatusTimeline';
import EvidenceUploader from '../components/EvidenceUploader';
import { COMPLAINT_STATUSES, CATEGORY_EMOJI } from '../data/complaintsData';
import { COMPLAINT_CATEGORIES } from '../services/priorityService';
import { findDuplicateCandidates } from '../services/duplicateService';
import { slaState } from '../services/slaService';
import { generateComplaintPdf } from '../services/pdfService';

const STATUS_TABS = ['All', ...COMPLAINT_STATUSES];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function StatCounter({ label, value, accent = 'text-slate-200' }) {
  return (
    <div className="glass rounded-xl px-3 py-2.5 text-center">
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

export default function ComplaintsAdmin() {
  const { complaints, departments, updateStatus, assignComplaint, changePriority, addNote, resolveComplaint, mergeComplaints } = useComplaints();
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const counts = useMemo(() => {
    const c = { Total: complaints.length };
    COMPLAINT_STATUSES.forEach((s) => { c[s] = complaints.filter((x) => x.status === s).length; });
    return c;
  }, [complaints]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const statusMatch = statusFilter === 'All' || c.status === statusFilter;
      const catMatch = categoryFilter === 'All' || c.category === categoryFilter;
      const q = query.toLowerCase();
      const queryMatch = !q || c.id.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || (c.contactName || '').toLowerCase().includes(q);
      return statusMatch && catMatch && queryMatch;
    });
  }, [complaints, statusFilter, categoryFilter, query]);

  const open = complaints.find((c) => c.id === openId) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Citizen Complaints</h1>
        <p className="mt-1 text-sm text-slate-400">Verify, assign, and resolve road &amp; traffic issues reported through the citizen portal.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        <StatCounter label="Total" value={counts.Total} accent="text-white" />
        {COMPLAINT_STATUSES.map((s) => (
          <StatCounter key={s} label={s} value={counts[s]} />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === f ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none">
            <option value="All">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-44 rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-2 text-xs text-slate-200 outline-none focus:border-cyan-500/40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const sla = slaState(c.slaDeadline, c.status);
          return (
            <div key={c.id} className="glass flex flex-col rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-lg">{CATEGORY_EMOJI[c.category] || '📍'}</div>
                  <div>
                    <p className="font-mono text-xs text-slate-500">{c.id}</p>
                    <p className="text-sm font-bold text-white">{c.category}</p>
                  </div>
                </div>
                <PriorityBadge priority={c.priority} />
              </div>

              <p className="mt-2 line-clamp-2 text-xs text-slate-400">{c.description}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-1"><MapPin size={11} /> {c.location}</p>
                <p>{c.contactName || 'Anonymous'} · {new Date(c.submittedAt).toLocaleDateString('en-IN')}</p>
                {c.department && <p>Dept: <span className="text-slate-300">{c.department}</span></p>}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge status={c.status} />
                {!['Resolved', 'Rejected'].includes(c.status) && <StatusBadge status={sla} />}
                {c.duplicateOf && <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400">Merged → {c.duplicateOf}</span>}
              </div>

              <button onClick={() => setOpenId(c.id)} className="mt-4 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10">
                View &amp; Manage
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="glass rounded-2xl p-12 text-center text-sm text-slate-500">No complaints match this filter.</div>}

      <Modal open={!!open} onClose={() => setOpenId(null)} title={open ? `${open.id} · ${open.category}` : ''} maxWidth="max-w-3xl">
        {open && <ComplaintDetail complaint={open} allComplaints={complaints} departments={departments} onUpdateStatus={updateStatus} onAssign={assignComplaint} onPriority={changePriority} onNote={addNote} onResolve={resolveComplaint} onMerge={mergeComplaints} onOpen={setOpenId} />}
      </Modal>
    </div>
  );
}

function ComplaintDetail({ complaint, allComplaints, departments, onUpdateStatus, onAssign, onPriority, onNote, onResolve, onMerge, onOpen }) {
  const [dept, setDept] = useState(complaint.department || departments[0].name);
  const [note, setNote] = useState('');
  const [resImages, setResImages] = useState([]);
  const [resVideo, setResVideo] = useState(null);
  const [resNotes, setResNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const duplicates = useMemo(() => findDuplicateCandidates(complaint, allComplaints), [complaint, allComplaints]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <p className="text-sm text-slate-300">{complaint.description}</p>

        <div className="flex flex-wrap gap-2">
          {complaint.images.map((src, i) => (
            <img key={i} src={src} alt="" className="h-20 w-28 rounded-lg border border-white/10 object-cover" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
          <p>Location: <span className="text-slate-200">{complaint.location}</span></p>
          <p>Landmark: <span className="text-slate-200">{complaint.landmark || '—'}</span></p>
          <p>Submitted: <span className="text-slate-200">{new Date(complaint.submittedAt).toLocaleString('en-IN')}</span></p>
          <p>Contact: <span className="text-slate-200">{complaint.contactName || 'Anonymous'}</span></p>
        </div>

        {duplicates.length > 0 && !complaint.duplicateOf && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-300"><Link2 size={13} /> This issue may already have been reported.</p>
            <div className="mt-2 space-y-1.5">
              {duplicates.slice(0, 3).map((d) => (
                <div key={d.complaint.id} className="flex items-center justify-between text-xs">
                  <button onClick={() => onOpen(d.complaint.id)} className="text-cyan-300 hover:underline">{d.complaint.id} ({Math.round(d.score * 100)}% match)</button>
                  <button onClick={() => onMerge(complaint.id, d.complaint.id)} className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/10">
                    <GitMerge size={11} /> Merge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <StatusTimeline complaint={complaint} />

        {complaint.resolution && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <p className="font-semibold">Resolution notes</p>
            <p className="mt-1">{complaint.resolution.notes}</p>
          </div>
        )}

        {complaint.feedback && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            Citizen feedback: {complaint.feedback.satisfaction} · {complaint.feedback.rating}★ {complaint.feedback.comment && `— "${complaint.feedback.comment}"`}
          </div>
        )}

        <button onClick={() => generateComplaintPdf(complaint)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
          <FileDown size={13} /> Download Complaint PDF
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow Actions</p>
          <div className="flex flex-wrap gap-2">
            {complaint.status === 'Submitted' && (
              <button onClick={() => onUpdateStatus(complaint.id, 'Under Review')} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20">Start Review</button>
            )}
            {complaint.status === 'Under Review' && (
              <button onClick={() => onUpdateStatus(complaint.id, 'Verified')} className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20">Mark Verified</button>
            )}
            {complaint.status === 'Assigned' && (
              <button onClick={() => onUpdateStatus(complaint.id, 'In Progress')} className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20">Mark In Progress</button>
            )}
            {!['Resolved', 'Rejected'].includes(complaint.status) && (
              <button
                onClick={() => { onUpdateStatus(complaint.id, 'Rejected', rejectReason || 'Not a valid road safety issue.'); setRejectReason(''); }}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
              >
                Reject
              </button>
            )}
          </div>
        </div>

        {complaint.status === 'Verified' && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assign Department</p>
            <div className="flex gap-2">
              <select value={dept} onChange={(e) => setDept(e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 outline-none">
                {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <button onClick={() => onAssign(complaint.id, dept)} className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20">Assign</button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</p>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITIES.map((p) => (
              <button key={p} onClick={() => onPriority(complaint.id, p)} className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${complaint.priority === p ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {complaint.status === 'In Progress' && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">Upload Resolution Evidence</p>
            <EvidenceUploader images={resImages} onImagesChange={setResImages} videoMeta={resVideo} onVideoChange={setResVideo} maxImages={3} />
            <textarea value={resNotes} onChange={(e) => setResNotes(e.target.value)} placeholder="Resolution notes..." rows={2} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-slate-200 outline-none" />
            <button
              disabled={!resNotes.trim()}
              onClick={() => onResolve(complaint.id, { images: resImages, notes: resNotes })}
              className="mt-2 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
            >
              Mark Resolved &amp; Notify Citizen
            </button>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Add Note</p>
          <div className="flex gap-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note..." className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 outline-none" />
            <button onClick={() => { if (note.trim()) { onNote(complaint.id, note); setNote(''); } }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10">Add</button>
          </div>
        </div>

        <div className="max-h-40 space-y-1.5 overflow-y-auto thin-scroll border-t border-white/5 pt-3">
          {complaint.statusHistory.slice().reverse().map((h, i) => (
            <div key={i} className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">{h.status}</span> — {h.note} <span className="text-slate-600">({new Date(h.at).toLocaleString('en-IN')} · {h.by})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
