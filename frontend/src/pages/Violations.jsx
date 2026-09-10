import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, MapPin, FileDown, Camera } from 'lucide-react';
import { useViolations } from '../context/ViolationsContext';
import { useNotificationCenter } from '../context/NotificationCenterContext';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import Modal from '../components/Modal';
import { generateViolationPdf } from '../services/pdfService';
import { VIOLATION_STATUSES } from '../data/violationsData';

const STATUS_FILTERS = ['All', ...VIOLATION_STATUSES];

export default function Violations() {
  const { violations, verifyViolation, findVehicle } = useViolations();
  const { notifications } = useNotificationCenter();
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => {
    return violations.filter((v) => {
      const statusMatch = statusFilter === 'All' || v.status === statusFilter;
      const q = query.toLowerCase();
      const queryMatch = !q || v.id.toLowerCase().includes(q) || v.vehicleNumber.toLowerCase().includes(q) || v.violationType.toLowerCase().includes(q) || v.location.toLowerCase().includes(q);
      return statusMatch && queryMatch;
    });
  }, [violations, statusFilter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Traffic Violations</h1>
          <p className="mt-1 text-sm text-slate-400">{violations.filter((v) => v.status === 'Pending').length} pending review out of {violations.length} logged violations.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, plate, type, road..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/40"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === f ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((v) => {
          const notif = notifications.find((n) => n.refType === 'violation' && n.refId === v.id && n.channel === 'SMS');
          return (
            <div key={v.id} className="glass flex flex-col rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300">
                    <ScanLine size={16} />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-slate-500">{v.id}</p>
                    <p className="text-sm font-bold text-white">{v.violationType}</p>
                  </div>
                </div>
                <SeverityBadge severity={v.severity} />
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <p>Vehicle: <span className="font-mono font-semibold text-slate-200">{v.vehicleNumber}</span></p>
                <p>AI Confidence: <span className="font-semibold text-slate-200">{v.confidence}%</span></p>
                <p className="flex items-center gap-1"><MapPin size={11} /> {v.location}</p>
                <p>{new Date(v.timestamp).toLocaleString('en-IN')}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge status={v.status} />
                {notif && <StatusBadge status={notif.status} />}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                <button onClick={() => setDetail(v)} className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10">
                  <Camera size={12} /> Evidence
                </button>
                <button onClick={() => generateViolationPdf(v, findVehicle(v.vehicleNumber))} className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10">
                  <FileDown size={12} /> PDF
                </button>
                <button
                  disabled={v.status !== 'Pending'}
                  onClick={() => verifyViolation(v.id, 'Verified')}
                  className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Verify
                </button>
                <button
                  disabled={v.status === 'Rejected' || v.status === 'Enforced'}
                  onClick={() => verifyViolation(v.id, 'Rejected')}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="glass rounded-2xl p-12 text-center text-sm text-slate-500">No violations match this filter.</div>}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.id} · ${detail.violationType}` : ''} maxWidth="max-w-lg">
        {detail && (
          <div className="space-y-4">
            <img src={detail.evidenceImage} alt="Evidence" className="w-full rounded-xl border border-white/10" />
            <div className="flex items-center gap-3">
              <img src={detail.plateImage} alt="Plate" className="w-36 rounded-lg border border-white/10" />
              <div className="text-xs text-slate-400">
                <p>Plate confidence: <span className="font-semibold text-slate-200">{detail.plateConfidence}%</span></p>
                <p>Camera: <span className="font-semibold text-slate-200">{detail.cameraId}</span></p>
                <p>Source: {detail.source}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">{detail.aiAnalysis}</p>
            <Link to="/admin/vehicles" className="text-xs font-semibold text-cyan-300 hover:underline">View vehicle registry →</Link>
          </div>
        )}
      </Modal>
    </div>
  );
}
