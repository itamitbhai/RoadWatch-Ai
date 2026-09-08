import { useMemo, useState } from 'react';
import { AlertOctagon, Camera, MapPin, Search } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import Modal from '../components/Modal';
import UrbanMap from '../components/map/UrbanMap';
import { getCategoryMeta } from '../components/map/mapIcons';
import EmergencyResponsePanel from '../components/EmergencyResponsePanel';

const STATUS_FILTERS = ['All', 'Reported', 'Investigating', 'Resolved'];

export default function IncidentManagement() {
  const { incidents, updateIncidentStatus, dispatches, policeCalls, simulateEmergencyIncident } = useSimulation();
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [mapModal, setMapModal] = useState(null);
  const [evidenceModal, setEvidenceModal] = useState(null);

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const statusMatch = statusFilter === 'All' || inc.status === statusFilter;
      const q = query.toLowerCase();
      const queryMatch =
        !q ||
        inc.id.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.vehicleNumber.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.busId.toLowerCase().includes(q);
      return statusMatch && queryMatch;
    });
  }, [incidents, statusFilter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Incident Management</h1>
          <p className="mt-1 text-sm text-slate-400">{incidents.filter((i) => i.status !== 'Resolved').length} active incidents across the fleet.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, plate, road, bus..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-500/40 focus:bg-white/[0.07]"
          />
        </div>
      </div>

      <EmergencyResponsePanel dispatches={dispatches} policeCalls={policeCalls} onSimulate={simulateEmergencyIncident} />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === f
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((inc) => (
          <div key={inc.id} className="glass flex flex-col rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300">
                  <AlertOctagon size={16} />
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-500">{inc.id}</p>
                  <p className="text-sm font-bold text-white">{inc.type}</p>
                </div>
              </div>
              <SeverityBadge severity={inc.severity} />
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-400">
              <p>Vehicle: <span className="font-mono font-semibold text-slate-200">{inc.vehicleNumber}</span></p>
              <p>Number Plate Confidence: <span className="font-semibold text-slate-200">{inc.plateConfidence}%</span></p>
              <p className="flex items-center gap-1"><MapPin size={11} /> {inc.location}</p>
              <p>Timestamp: <span className="font-semibold text-slate-200">{new Date(inc.timestamp).toLocaleTimeString('en-IN')}</span></p>
              <p>Source: <span className="font-semibold text-cyan-300">{inc.busId}</span></p>
            </div>

            <div className="mt-3">
              <StatusBadge status={inc.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
              <button
                onClick={() => setMapModal(inc)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10"
              >
                View on Map
              </button>
              <button
                onClick={() => setEvidenceModal(inc)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10"
              >
                View Evidence
              </button>
              <button
                disabled={inc.status !== 'Reported'}
                onClick={() => updateIncidentStatus(inc.id, 'Investigating')}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Mark Investigating
              </button>
              <button
                disabled={inc.status === 'Resolved'}
                onClick={() => updateIncidentStatus(inc.id, 'Resolved')}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center text-sm text-slate-500">No incidents match this filter.</div>
      )}

      <Modal open={!!mapModal} onClose={() => setMapModal(null)} title={mapModal ? `${mapModal.id} · ${mapModal.type}` : ''} maxWidth="max-w-2xl">
        {mapModal && <UrbanMap incidents={[mapModal]} buses={[]} events={[]} center={mapModal.coords} zoom={15} height="380px" />}
      </Modal>

      <Modal open={!!evidenceModal} onClose={() => setEvidenceModal(null)} title={evidenceModal ? `Evidence · ${evidenceModal.id}` : ''} maxWidth="max-w-lg">
        {evidenceModal && <EvidencePanel incident={evidenceModal} />}
      </Modal>
    </div>
  );
}

function EvidencePanel({ incident }) {
  const { emoji } = getCategoryMeta(incident.type);
  return (
    <div className="space-y-4">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#0b0f16] to-[#171d29]">
        <div className="absolute inset-x-6 top-8 flex h-24 w-40 items-center justify-center rounded-md border-2 border-rose-500 shadow-[0_0_16px_rgba(239,68,68,0.4)]">
          <span className="absolute -top-5 left-0 rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-black">
            {incident.type} {incident.confidence}%
          </span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded bg-black/50 px-2 py-1 text-[10px] font-semibold text-white">
          <Camera size={11} className="text-cyan-400" /> {incident.busId} · FRONT CAMERA
        </div>
        <span className="text-5xl opacity-30">{emoji}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Detail label="Vehicle Number" value={incident.vehicleNumber} />
        <Detail label="Plate Confidence" value={`${incident.plateConfidence}%`} />
        <Detail label="Location" value={incident.location} />
        <Detail label="Timestamp" value={new Date(incident.timestamp).toLocaleString('en-IN')} />
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-medium text-white">{value}</p>
    </div>
  );
}
