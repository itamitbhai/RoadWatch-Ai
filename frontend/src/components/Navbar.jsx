import { useEffect, useRef, useState } from 'react';
import { Bell, Menu, Play, Radio, Satellite, UserCircle2 } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function Navbar({ onMenuClick }) {
  const now = useClock();
  const { simulationRunning, toggleSimulation, events } = useSimulation();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const recentEvents = events.slice(0, 6);

  return (
    <header className="glass sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-white/5 px-4 sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Satellite size={18} className="text-white" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse-slow rounded-full bg-emerald-400 ring-2 ring-base-950" />
        </div>
        <div className="hidden sm:block">
          <p className="text-glow-cyan text-base font-bold leading-none tracking-tight text-white">UrbanSense AI</p>
          <p className="mt-0.5 text-[11px] leading-none text-slate-400">Urban Intelligence Command Center</p>
        </div>
      </div>

      <div className="mx-2 hidden h-8 w-px bg-white/10 md:block" />

      <div className="hidden items-center gap-2 md:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-emerald-400">SYSTEM ONLINE</span>
      </div>

      <div className="flex-1" />

      <div className="hidden flex-col items-end leading-none lg:flex">
        <span className="font-mono text-sm font-semibold text-slate-200">
          {now.toLocaleTimeString('en-IN', { hour12: true })}
        </span>
        <span className="mt-0.5 text-[11px] text-slate-500">
          {now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <button
        onClick={toggleSimulation}
        className={`ml-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
          simulationRunning
            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_16px_-4px_rgba(16,185,129,0.6)]'
            : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
        }`}
      >
        {simulationRunning ? <Radio size={14} className="animate-pulse" /> : <Play size={14} />}
        <span className="hidden sm:inline">{simulationRunning ? 'Fleet Simulation Running' : 'Start Simulation'}</span>
        <span className="sm:hidden">{simulationRunning ? 'Live' : 'Start'}</span>
      </button>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5"
        >
          <Bell size={19} />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-rose-500" />
        </button>
        {notifOpen && (
          <div className="glass-strong animate-fade-in absolute right-0 top-12 w-80 rounded-xl p-2 shadow-2xl shadow-black/50">
            <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Activity</p>
            <div className="max-h-72 space-y-1 overflow-y-auto thin-scroll">
              {recentEvents.map((e) => (
                <div key={e.id} className="rounded-lg px-2 py-2 hover:bg-white/5">
                  <p className="text-xs font-medium text-slate-200">
                    {e.busId} · {e.type}
                  </p>
                  <p className="text-[11px] text-slate-500">{e.location} · {e.confidence}% confidence</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ml-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
        <UserCircle2 size={22} className="text-slate-300" />
        <div className="hidden leading-none xl:block">
          <p className="text-xs font-semibold text-slate-200">Admin</p>
          <p className="text-[10px] text-slate-500">Transport Dept.</p>
        </div>
      </div>
    </header>
  );
}
