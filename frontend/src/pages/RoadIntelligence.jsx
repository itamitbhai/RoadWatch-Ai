import { useMemo, useState } from 'react';
import { AlertTriangle, Droplets, TrafficCone, Construction, Milestone, OctagonAlert } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import { DETECTION_TYPES } from '../data/mockData';

const TYPE_ICONS = {
  Pothole: AlertTriangle,
  Waterlogging: Droplets,
  'Damaged Road': Construction,
  'Missing Divider': Milestone,
  'Missing Zebra Crossing': TrafficCone,
  'Damaged Traffic Sign': OctagonAlert,
};

const FILTERS = ['All', 'High Severity', 'Medium', 'Low', 'Resolved'];

export default function RoadIntelligence() {
  const { events, updateEventStatus } = useSimulation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const roadEvents = useMemo(() => events.filter((e) => e.category === 'road'), [events]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(DETECTION_TYPES.map((t) => [t, 0]));
    roadEvents.forEach((e) => (map[e.type] = (map[e.type] || 0) + 1));
    return map;
  }, [roadEvents]);

  const filtered = useMemo(() => {
    return roadEvents.filter((e) => {
      const severityMatch =
        activeFilter === 'All' ||
        (activeFilter === 'High Severity' && e.severity === 'HIGH') ||
        (activeFilter === 'Medium' && e.severity === 'MEDIUM') ||
        (activeFilter === 'Low' && e.severity === 'LOW') ||
        (activeFilter === 'Resolved' && e.status === 'Resolved');
      const typeMatch = typeFilter === 'All' || e.type === typeFilter;
      return severityMatch && typeMatch;
    });
  }, [roadEvents, activeFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Road Intelligence</h1>
        <p className="mt-1 text-sm text-slate-400">Infrastructure deficiencies detected by fleet-mounted AI cameras.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {DETECTION_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type];
          const active = typeFilter === type;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(active ? 'All' : type)}
              className={`glass rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 ${active ? 'border-cyan-500/40 ring-1 ring-cyan-500/30' : ''}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-cyan-300">
                <Icon size={17} />
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{counts[type] || 0}</p>
              <p className="mt-0.5 text-xs text-slate-500">{type}s</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === f
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
        {typeFilter !== 'All' && (
          <button onClick={() => setTypeFilter('All')} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300">
            {typeFilter} ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.slice(0, 60).map((e) => {
          const Icon = TYPE_ICONS[e.type] || AlertTriangle;
          return (
            <div key={e.id} className="glass rounded-2xl p-4 transition-all hover:border-white/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-cyan-300">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-white">{e.type} Detected</p>
                    <p className="text-[11px] text-slate-500">{e.id}</p>
                  </div>
                </div>
                <SeverityBadge severity={e.severity} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <p>Confidence: <span className="font-semibold text-slate-200">{e.confidence}%</span></p>
                <p>Bus: <span className="font-semibold text-slate-200">{e.busId}</span></p>
                <p className="col-span-2">Location: <span className="font-semibold text-slate-200">{e.location}</span></p>
                <p className="col-span-2">Detected: <span className="font-semibold text-slate-200">{new Date(e.timestamp).toLocaleString('en-IN')}</span></p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <StatusBadge status={e.status} />
                {e.status !== 'Resolved' && (
                  <button
                    onClick={() => updateEventStatus(e.id, 'Resolved')}
                    className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center text-sm text-slate-500">No detections match this filter.</div>
      )}
    </div>
  );
}
