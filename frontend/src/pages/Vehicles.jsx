import { useMemo, useState } from 'react';
import { Car, Search, AlertTriangle } from 'lucide-react';
import { useViolations } from '../context/ViolationsContext';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import Modal from '../components/Modal';

const RISK_STYLES = {
  HIGH: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  MEDIUM: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  LOW: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

export default function Vehicles() {
  const { vehicles } = useViolations();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return vehicles.filter((v) => !q || v.plate.toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q));
  }, [vehicles, query]);

  const sorted = useMemo(() => filtered.slice().sort((a, b) => b.totalViolations - a.totalViolations), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vehicle Registry (ANPR)</h1>
          <p className="mt-1 text-sm text-slate-400">Mock demo registry — {vehicles.length} vehicles, {vehicles.filter((v) => v.riskStatus === 'HIGH').length} flagged as repeat offenders.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plate or owner..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/40"
          />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        This is a fictional demo registry for illustrating the ANPR → vehicle-history workflow — it is not connected to any real government vehicle database.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Plate</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Violations</th>
              <th className="px-4 py-3">Last Violation</th>
              <th className="px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((v) => (
              <tr key={v.plate} onClick={() => setSelected(v)} className="cursor-pointer hover:bg-white/5">
                <td className="px-4 py-3 font-mono font-semibold text-slate-200">{v.plate}</td>
                <td className="px-4 py-3 text-slate-300">{v.ownerName}</td>
                <td className="px-4 py-3 text-slate-400">{v.vehicleType} · {v.color}</td>
                <td className="px-4 py-3 text-slate-300">{v.totalViolations}</td>
                <td className="px-4 py-3 text-slate-500">{v.lastViolation ? new Date(v.lastViolation.timestamp).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${RISK_STYLES[v.riskStatus]}`}>{v.riskStatus}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.plate} · Violation History` : ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                <Car size={18} />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">{selected.ownerName}</p>
                <p className="text-xs text-slate-400">{selected.model} · {selected.vehicleType} · Registered {selected.registeredSince}</p>
              </div>
              <span className={`ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${RISK_STYLES[selected.riskStatus]}`}>
                {selected.riskStatus} RISK
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{selected.totalViolations} total violations</p>
              <div className="max-h-72 space-y-2 overflow-y-auto thin-scroll">
                {selected.violations.map((viol) => (
                  <div key={viol.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs">
                    <div>
                      <p className="font-medium text-slate-200">{viol.violationType}</p>
                      <p className="text-slate-500">{new Date(viol.timestamp).toLocaleDateString('en-IN')} · {viol.location}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <SeverityBadge severity={viol.severity} />
                      <StatusBadge status={viol.status} />
                    </div>
                  </div>
                ))}
                {selected.violations.length === 0 && <p className="text-xs text-slate-500">No prior violations on record.</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
