import { useNavigate } from 'react-router-dom';
import { Bus, Camera, Cpu, Gauge, MapPin, ScanLine } from 'lucide-react';
import { formatRelative } from '../data/mockData';

export default function BusCard({ bus }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/fleet/${bus.id}`)}
      className="group glass w-full rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.35)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
            <Bus size={17} />
          </div>
          <div>
            <p className="font-bold text-white">{bus.id}</p>
            <p className="text-[11px] text-slate-500">{bus.plate}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          LIVE
        </span>
      </div>

      <p className="mt-3 truncate text-xs text-slate-400">{bus.route}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin size={12} className="text-slate-500" /> {bus.currentLocation}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Gauge size={12} className="text-slate-500" /> {bus.speed} km/h
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Camera size={12} className="text-slate-500" /> {bus.cameraStatus}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Cpu size={12} className="text-slate-500" /> {bus.aiStatus}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-cyan-300">
          <ScanLine size={13} />
          <span className="font-semibold">{bus.detections}</span>
          <span className="text-slate-500">detections</span>
        </div>
        <span className="text-[11px] text-slate-600">{formatRelative(new Date(bus.lastUpdate))}</span>
      </div>
    </button>
  );
}
