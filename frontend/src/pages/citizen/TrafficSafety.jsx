import { ShieldAlert, Camera, Info } from 'lucide-react';
import { VIOLATION_TYPES } from '../../data/violationsData';
import { getCategoryMeta } from '../../components/map/mapIcons';

const TIPS = [
  'Always wear a helmet on two-wheelers — even for short trips.',
  'Never ride triple on a two-wheeler; it reduces control and increases injury risk.',
  'Stop fully at red lights — AI cameras log signal jumps automatically.',
  'Stick to your lane; wrong-side driving is a leading cause of head-on collisions.',
  'Observe posted speed limits, especially near schools and markets.',
  'Wear your seatbelt even for short in-city drives.',
  'Never use your phone while driving — pull over safely first.',
];

export default function TrafficSafety() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Traffic Safety</h1>
        <p className="mt-1 text-sm text-slate-400">How AI-powered monitoring keeps Patna's roads safer, and what it watches for.</p>
      </div>

      <div className="glass flex items-start gap-3 rounded-2xl p-5">
        <Camera size={20} className="mt-0.5 shrink-0 text-cyan-400" />
        <div className="text-sm text-slate-300">
          <p className="font-semibold text-white">AI Detection Engine</p>
          <p className="mt-1 text-xs text-slate-400">
            Traffic cameras and fleet-mounted sensors run real-time AI detection to flag common violations. Every
            detection is evidence-backed (image + timestamp + location) and reviewed by a traffic officer before any
            enforcement action — the AI never issues a penalty on its own.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Violation Types Monitored</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VIOLATION_TYPES.map((type) => {
            const { emoji } = getCategoryMeta(type);
            return (
              <div key={type} className="glass flex items-center gap-2 rounded-xl p-3 text-xs text-slate-300">
                <span className="text-lg">{emoji}</span> {type}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldAlert size={16} className="text-amber-400" /> Safety Tips
        </p>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-cyan-400" /> {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
        <Info size={14} className="mt-0.5 shrink-0" />
        This page is for a demo/hackathon deployment — detections shown across the platform are simulated for
        illustration and are not sourced from live government camera feeds.
      </div>
    </div>
  );
}
