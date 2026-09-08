import { useMemo, useState } from 'react';
import { Flame, Layers } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import UrbanMap from '../components/map/UrbanMap';
import { getCategoryMeta } from '../components/map/mapIcons';
import { SeverityBadge } from '../components/Badge';

const HAZARD_TYPES = ['Pothole', 'Waterlogging', 'Damaged Road'];
const INFRA_TYPES = ['Missing Divider', 'Missing Zebra Crossing', 'Damaged Traffic Sign'];

const FILTERS = ['All Events', 'Road Hazards', 'Traffic', 'Incidents', 'Infrastructure', 'Buses', 'Ambulances'];

export default function GISMap() {
  const { buses, events, incidents, roadTrafficStats, ambulances, dispatches } = useSimulation();
  const [filter, setFilter] = useState('All Events');
  const [heatmap, setHeatmap] = useState(false);
  const [selected, setSelected] = useState(null);

  const showBuses = filter === 'All Events' || filter === 'Buses';
  const showAmbulances = filter === 'All Events' || filter === 'Ambulances';

  const filteredEvents = useMemo(() => {
    if (filter === 'Buses' || filter === 'Incidents' || filter === 'Ambulances') return [];
    if (filter === 'All Events') return events;
    if (filter === 'Road Hazards') return events.filter((e) => HAZARD_TYPES.includes(e.type));
    if (filter === 'Traffic') return events.filter((e) => e.category === 'traffic');
    if (filter === 'Infrastructure') return events.filter((e) => INFRA_TYPES.includes(e.type));
    return events;
  }, [events, filter]);

  const filteredIncidents = useMemo(() => {
    if (filter === 'All Events' || filter === 'Incidents') return incidents;
    return [];
  }, [incidents, filter]);

  const filteredDispatches = useMemo(() => (showAmbulances ? dispatches : []), [dispatches, showAmbulances]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">GIS Urban Intelligence Map</h1>
          <p className="mt-1 text-sm text-slate-400">City-wide spatial view of fleet-sourced detections and incidents.</p>
        </div>
        <button
          onClick={() => setHeatmap((v) => !v)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
            heatmap ? 'border-orange-500/40 bg-orange-500/15 text-orange-300' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Flame size={16} /> Congestion Heatmap {heatmap ? 'On' : 'Off'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Layers size={15} className="text-slate-500" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <UrbanMap
            buses={showBuses ? buses : []}
            events={filteredEvents}
            incidents={filteredIncidents}
            ambulances={showAmbulances ? ambulances : []}
            dispatches={filteredDispatches}
            roadTrafficStats={roadTrafficStats}
            showHeatmap={heatmap}
            height="calc(100vh - 320px)"
            zoom={12.5}
            onSelect={setSelected}
          />
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="mb-3 font-semibold text-white">Legend</h2>
          <div className="space-y-2 text-xs">
            {['Bus', 'Ambulance', 'Pothole', 'Waterlogging', 'Traffic Congestion', 'Damaged Traffic Sign', 'Hit & Run'].map((t) => {
              const { emoji } = getCategoryMeta(t);
              return (
                <div key={t} className="flex items-center gap-2 text-slate-400">
                  <span className="text-base leading-none">{emoji}</span> {t}
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-white/5 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected</h3>
            {selected ? (
              <div className="space-y-2 text-xs">
                <p className="text-sm font-bold text-white">{selected.data.type || selected.data.id}</p>
                {selected.data.severity && <SeverityBadge severity={selected.data.severity} />}
                {selected.data.confidence && <p className="text-slate-400">Confidence: {selected.data.confidence}%</p>}
                {selected.data.busId && <p className="text-slate-400">Bus: {selected.data.busId}</p>}
                {selected.data.location && <p className="text-slate-400">Location: {selected.data.location}</p>}
                {selected.data.status && <p className="text-slate-400">Status: {selected.data.status}</p>}
                {selected.data.name && !selected.data.type && <p className="text-slate-400">{selected.data.name}</p>}
                {(selected.data.coords || selected.data.position) && (
                  <p className="font-mono text-slate-500">
                    {(selected.data.coords || selected.data.position)[0].toFixed(4)}, {(selected.data.coords || selected.data.position)[1].toFixed(4)}
                  </p>
                )}
                {selected.data.timestamp && <p className="text-slate-500">{new Date(selected.data.timestamp).toLocaleTimeString('en-IN')}</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click any marker on the map to inspect details here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
