import { useEffect, useState } from 'react';
import { Video } from 'lucide-react';
import { AI_OBJECT_LABELS, pickRandom, randomInt } from '../data/mockData';

const BOX_COLORS = {
  Vehicle: '#22d3ee',
  Car: '#3b82f6',
  Bus: '#a855f7',
  Pedestrian: '#f97316',
  Pothole: '#ef4444',
  'Traffic Sign': '#eab308',
};

function randomBox(id) {
  const label = pickRandom(AI_OBJECT_LABELS);
  return {
    id,
    label,
    color: BOX_COLORS[label],
    top: randomInt(15, 65),
    left: randomInt(8, 70),
    width: randomInt(14, 26),
    height: randomInt(10, 22),
    confidence: randomInt(84, 99),
  };
}

export default function CameraPanel({ label, active = true }) {
  const [boxes, setBoxes] = useState(() => Array.from({ length: randomInt(2, 4) }, (_, i) => randomBox(i)));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const interval = setInterval(() => {
      setBoxes(Array.from({ length: randomInt(2, 5) }, (_, i) => randomBox(i)));
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#070a10]">
      {/* simulated road backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0b0f16 0%, #10151f 45%, #171d29 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 opacity-70"
        style={{
          background: 'linear-gradient(180deg, transparent, #05070a 95%)',
        }}
      />
      {/* lane perspective lines */}
      <div className="absolute inset-0 flex justify-center overflow-hidden opacity-40">
        <div
          className="h-full w-1 bg-gradient-to-b from-transparent via-slate-500 to-transparent"
          style={{ transform: 'perspective(200px) rotateX(35deg) translateX(-60px)' }}
        />
        <div
          className="h-full w-1 bg-gradient-to-b from-transparent via-slate-500 to-transparent"
          style={{ transform: 'perspective(200px) rotateX(35deg) translateX(60px)' }}
        />
      </div>

      {/* scan line */}
      {active && (
        <div className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/10 via-cyan-400/5 to-transparent" />
      )}

      {/* bounding boxes */}
      {active &&
        boxes.map((box) => (
          <div
            key={`${box.id}-${tick}`}
            className="animate-fade-in absolute rounded-sm"
            style={{
              top: `${box.top}%`,
              left: `${box.left}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
              border: `1.5px solid ${box.color}`,
              boxShadow: `0 0 8px ${box.color}55`,
            }}
          >
            <span
              className="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-bold text-black"
              style={{ background: box.color }}
            >
              {box.label} {box.confidence}%
            </span>
          </div>
        ))}

      {/* header overlay */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-2.5">
        <span className="flex items-center gap-1.5 rounded bg-black/50 px-2 py-1 text-[10px] font-bold tracking-wider text-white">
          <Video size={11} className="text-cyan-400" /> {label}
        </span>
        {active && (
          <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] font-semibold text-rose-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" /> REC
          </span>
        )}
      </div>

      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-xs font-semibold text-slate-500">CAMERA OFFLINE</p>
        </div>
      )}
    </div>
  );
}
