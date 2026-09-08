import { AlertTriangle, Bus, Droplets, TrafficCone, Zap } from 'lucide-react';
import { SeverityBadge } from './Badge';

const ICONS = {
  Pothole: AlertTriangle,
  'Damaged Road': AlertTriangle,
  Waterlogging: Droplets,
  'Missing Divider': TrafficCone,
  'Missing Zebra Crossing': TrafficCone,
  'Damaged Traffic Sign': TrafficCone,
  'Traffic Congestion': Bus,
  'Rash Driving': Zap,
  'Pedestrian Risk': AlertTriangle,
};

export default function EventFeed({ events, limit = 12, onSelect }) {
  const list = events.slice(0, limit);

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Bus className="text-slate-600" size={28} />
        <p className="text-sm text-slate-500">No live events yet. Start simulation to see activity.</p>
      </div>
    );
  }

  return (
    <div className="thin-scroll max-h-[420px] space-y-2 overflow-y-auto pr-1">
      {list.map((ev) => {
        const Icon = ICONS[ev.type] || AlertTriangle;
        return (
          <button
            key={ev.id}
            onClick={() => onSelect?.(ev)}
            className="animate-fade-in flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-cyan-500/20 hover:bg-white/5"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-cyan-300">
              <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-slate-200">
                  <span className="font-semibold text-cyan-400">{ev.busId}</span> detected {ev.type.toLowerCase()}
                </p>
                <span className="shrink-0 font-mono text-[11px] text-slate-500">
                  {new Date(ev.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-slate-500">{ev.location}</span>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-500">{ev.confidence}% confidence</span>
                <SeverityBadge severity={ev.severity} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
