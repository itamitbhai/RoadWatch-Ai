import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import BusCard from '../components/BusCard';
import UrbanMap from '../components/map/UrbanMap';

export default function Fleet() {
  const { buses } = useSimulation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      buses.filter(
        (b) =>
          b.id.toLowerCase().includes(query.toLowerCase()) ||
          b.route.toLowerCase().includes(query.toLowerCase()) ||
          b.currentLocation.toLowerCase().includes(query.toLowerCase())
      ),
    [buses, query]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Live Bus Fleet</h1>
          <p className="mt-1 text-sm text-slate-400">Real-time GPS, camera and AI status across {buses.length} active buses.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bus, route or location..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-500/40 focus:bg-white/[0.07]"
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <UrbanMap buses={filtered} height="380px" zoom={12} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((bus) => (
          <BusCard key={bus.id} bus={bus} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center text-sm text-slate-500">No buses match your search.</div>
      )}
    </div>
  );
}
