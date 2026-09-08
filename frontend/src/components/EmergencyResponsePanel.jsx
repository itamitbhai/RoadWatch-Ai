import { Ambulance, PhoneCall, Siren } from 'lucide-react';

const DISPATCH_STYLES = {
  Dispatched: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'En Route': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'On Scene': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const CALL_STYLES = {
  Calling: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Connected: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Acknowledged: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

function timeAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export default function EmergencyResponsePanel({ dispatches = [], policeCalls = [], onSimulate }) {
  const activeDispatches = dispatches.slice(0, 6);
  const activeCalls = policeCalls.slice(0, 6);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Siren size={17} className="text-rose-400" />
          <h2 className="font-semibold text-white">Emergency Response — Auto Dispatch</h2>
        </div>
        {onSimulate && (
          <button
            onClick={() => onSimulate()}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 active:scale-95"
          >
            <Siren size={13} /> Simulate Emergency
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-slate-500">
        When an accident is detected, the nearest ambulance is auto-notified and relevant departments are auto-called — no manual dispatch needed.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <Ambulance size={13} /> Ambulance Dispatch Log
          </p>
          {activeDispatches.length === 0 ? (
            <p className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-500">
              No ambulance dispatches yet. An accident or hit &amp; run will trigger one automatically.
            </p>
          ) : (
            <div className="thin-scroll max-h-64 space-y-2 overflow-y-auto pr-1">
              {activeDispatches.map((d) => (
                <div key={d.id} className="animate-fade-in rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{d.ambulanceName}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${DISPATCH_STYLES[d.status]}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    → {d.location} · {d.distanceKm} km · ETA {d.etaMin} min
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">{d.incidentType} · {d.incidentId} · {timeAgo(d.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <PhoneCall size={13} /> Department Call Log
          </p>
          {activeCalls.length === 0 ? (
            <p className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-500">
              No calls placed yet. Police / municipal departments are auto-called per incident type.
            </p>
          ) : (
            <div className="thin-scroll max-h-64 space-y-2 overflow-y-auto pr-1">
              {activeCalls.map((c) => (
                <div key={c.id} className="animate-fade-in rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{c.department}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CALL_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {c.station} · {c.distanceKm} km from {c.location}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">{c.incidentType} · {c.incidentId} · {timeAgo(c.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
