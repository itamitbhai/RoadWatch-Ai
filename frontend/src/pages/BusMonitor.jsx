import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Gauge, MapPinned, Radar, Sparkles, Clock3 } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import CameraPanel from '../components/CameraPanel';
import EventFeed from '../components/EventFeed';
import { CAMERA_LABELS, randomInt } from '../data/mockData';

const CATEGORIES = ['Vehicle', 'Pedestrian', 'Pothole', 'Traffic Sign'];

export default function BusMonitor() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { buses, events, simulateDetectionForBus, simulationRunning } = useSimulation();
  const bus = buses.find((b) => b.id === busId);

  const [counts, setCounts] = useState({ Vehicle: 14, Pedestrian: 6, Pothole: 2, 'Traffic Sign': 1 });
  const [confidence, setConfidence] = useState({ Vehicle: 91, Pedestrian: 97, Pothole: 94, 'Traffic Sign': 89 });
  const [pulseKey, setPulseKey] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const cat = CATEGORIES[randomInt(0, CATEGORIES.length - 1)];
      setCounts((prev) => ({ ...prev, [cat]: prev[cat] + randomInt(1, 2) }));
      setConfidence((prev) => ({ ...prev, [cat]: Math.min(99, Math.max(80, prev[cat] + randomInt(-2, 2))) }));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const busEvents = useMemo(() => events.filter((e) => e.busId === busId), [events, busId]);

  if (!bus) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-slate-300">Bus {busId} not found or offline.</p>
        <button onClick={() => navigate('/fleet')} className="mt-4 rounded-lg bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/25">
          Back to Fleet
        </button>
      </div>
    );
  }

  function handleSimulate() {
    const event = simulateDetectionForBus(bus.id, bus);
    setPulseKey(event.id);
    setTimeout(() => setPulseKey(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/fleet')} className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              {bus.id} <span className="text-slate-500">|</span> Route: {bus.route}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">Plate {bus.plate} · Driver {bus.driver}</p>
          </div>
        </div>
        <button
          onClick={handleSimulate}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 active:scale-95"
        >
          <Sparkles size={16} /> Simulate Detection
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:col-span-3">
          {CAMERA_LABELS.map((label) => (
            <CameraPanel key={label} label={label} active />
          ))}
        </div>

        <div className="glass flex flex-col rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Radar size={16} className="text-cyan-400" />
            <h2 className="font-semibold text-white">AI Detections</h2>
          </div>

          <div className="space-y-2.5">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-sm text-slate-300">{cat}</span>
                <span className="font-mono text-sm font-bold text-cyan-300">{String(counts[cat]).padStart(2, '0')}</span>
              </div>
            ))}
          </div>

          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">AI Confidence</p>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <div key={cat}>
                <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                  <span>{cat}</span>
                  <span>{confidence[cat]}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700" style={{ width: `${confidence[cat]}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-white/5 pt-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500"><MapPinned size={13} /> GPS</span>
              <span className="font-mono text-slate-300">{bus.position[0].toFixed(4)}, {bus.position[1].toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500"><Gauge size={13} /> Speed</span>
              <span className="font-mono text-slate-300">{bus.speed} km/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500"><Clock3 size={13} /> Timestamp</span>
              <span className="font-mono text-slate-300">{now.toLocaleTimeString('en-IN', { hour12: true })}</span>
            </div>
          </div>

          {!simulationRunning && (
            <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-300">
              Fleet simulation is idle. Start it from the navbar for continuous GPS movement.
            </p>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">Detection & Incident Feed — {bus.id}</h2>
          {pulseKey && <span className="animate-fade-in text-xs font-semibold text-emerald-400">New detection logged ✓</span>}
        </div>
        <EventFeed events={busEvents} limit={10} />
      </div>
    </div>
  );
}
