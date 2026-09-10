import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, ScanLine, Construction, ShieldAlert, TrafficCone, ArrowUpRight, Activity, Camera, FileCheck2, Send, Building2, Bell, BarChart3, X, Check } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { useViolations } from '../context/ViolationsContext';
import { useComplaints } from '../context/ComplaintsContext';
import KPICard from '../components/KPICard';
import EventFeed from '../components/EventFeed';
import UrbanMap from '../components/map/UrbanMap';
import Modal from '../components/Modal';
import { SeverityBadge } from '../components/Badge';

const IMPACT_STEPS = [
  { icon: Camera, label: 'AI Detection' },
  { icon: FileCheck2, label: 'Evidence' },
  { icon: Send, label: 'Automated Action' },
  { icon: Building2, label: 'Department Response' },
  { icon: Bell, label: 'Citizen Notification' },
  { icon: BarChart3, label: 'Measurable Impact' },
];

const BEFORE_ITEMS = ['Manual Detection', 'Manual Complaint Filing', 'Manual Follow-up', 'Delayed Resolution'];
const AFTER_ITEMS = ['AI Detection', 'Automatic Evidence', 'Smart Prioritization', 'Automated Notification', 'Department Assignment', 'Real-time Tracking', 'Citizen Feedback', 'Analytics'];

export default function Dashboard() {
  const { kpis, buses, events, incidents, roadTrafficStats, simulationRunning, congestionTrend } = useSimulation();
  const { violations } = useViolations();
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const trends = useMemo(
    () => ({
      buses: 4,
      detections: 12,
      hazards: 8,
      incidents: -6,
      congestion: 3,
    }),
    []
  );

  const cards = [
    { icon: Bus, label: 'Active Buses', value: kpis.activeBuses, trend: trends.buses, accent: 'cyan', trendLabel: 'All units reporting GPS' },
    { icon: ScanLine, label: 'AI Detections Today', value: kpis.aiDetectionsToday, trend: trends.detections, accent: 'blue', trendLabel: 'Across all fleet cameras' },
    { icon: Construction, label: 'Road Hazards', value: kpis.roadHazards, trend: trends.hazards, accent: 'amber', trendLabel: 'Potholes, waterlogging & more' },
    { icon: ShieldAlert, label: 'Active Incidents', value: kpis.activeIncidents, trend: trends.incidents, accent: 'rose', trendLabel: 'Under investigation' },
    { icon: TrafficCone, label: 'Congested Zones', value: kpis.congestedZones, trend: trends.congestion, accent: 'emerald', trendLabel: 'Density ≥ 70%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Urban Intelligence Command Center</h1>
          <p className="mt-1 text-sm text-slate-400">
            Every public transport bus operates as a mobile AI sensor — continuously mapping road conditions, traffic and safety across the city.
          </p>
        </div>
        <div className={`flex items-center gap-2 self-start rounded-lg border px-3 py-1.5 text-xs font-semibold sm:self-auto ${
          simulationRunning ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-400'
        }`}>
          <Activity size={13} className={simulationRunning ? 'animate-pulse' : ''} />
          {simulationRunning ? 'Live fleet telemetry streaming' : 'Simulation idle — start from navbar'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <KPICard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass rounded-2xl p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Live Bus Fleet</h2>
              <p className="text-xs text-slate-500">{buses.length} buses reporting across 10 routes</p>
            </div>
            <button
              onClick={() => navigate('/admin/fleet')}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-white/10"
            >
              Full Fleet View <ArrowUpRight size={13} />
            </button>
          </div>
          <UrbanMap buses={buses} events={events.slice(0, 20)} incidents={incidents.filter((i) => i.status !== 'Resolved').slice(0, 6)} height="420px" zoom={12} />
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">Live Event Feed</h2>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Streaming
            </span>
          </div>
          <EventFeed events={events} limit={14} onSelect={setSelectedEvent} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass rounded-2xl p-4 xl:col-span-2">
          <h2 className="mb-1 font-semibold text-white">City-Wide Congestion Trend</h2>
          <p className="mb-3 text-xs text-slate-500">Aggregated congestion index across all monitored corridors</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={congestionTrend}>
              <defs>
                <linearGradient id="congestionFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="congestion" stroke="#22d3ee" strokeWidth={2} fill="url(#congestionFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="mb-3 font-semibold text-white">Top Congested Corridors</h2>
          <div className="space-y-3">
            {roadTrafficStats
              .slice()
              .sort((a, b) => b.density - a.density)
              .slice(0, 5)
              .map((r) => (
                <div key={r.road}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{r.road}</span>
                    <span className="text-slate-500">{r.density}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${r.density >= 80 ? 'bg-rose-500' : r.density >= 60 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                      style={{ width: `${r.density}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">AI → Action → Impact</h2>
            <p className="text-xs text-slate-500">From detection to measurable civic outcome — the full closed-loop pipeline.</p>
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={() => navigate('/admin/detection-studio')} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-medium text-cyan-300 hover:bg-white/10">Run Demo</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {IMPACT_STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
                <s.icon size={16} className="text-cyan-300" />
                <span className="text-[10px] font-medium text-slate-300">{s.label}</span>
              </div>
              {i < IMPACT_STEPS.length - 1 && <ArrowUpRight size={14} className="rotate-45 text-slate-600" />}
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ImpactStat label="Violations Auto-Detected" value={violations.length} />
          <ImpactStat label="Complaints Routed" value={complaints.length} />
          <ImpactStat label="Resolved Issues" value={complaints.filter((c) => c.status === 'Resolved').length} />
          <ImpactStat label="Citizens Notified" value={complaints.filter((c) => c.citizenNotified).length} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/5 pt-5 sm:grid-cols-2">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-300">Before UrbanSense AI</p>
            <ul className="space-y-1.5">
              {BEFORE_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-400"><X size={12} className="text-rose-400" /> {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">After UrbanSense AI</p>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {AFTER_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-400"><Check size={12} className="text-emerald-400" /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.type || 'Event Detail'}>
        {selectedEvent && (
          <div className="space-y-3 text-sm">
            <SeverityBadge severity={selectedEvent.severity} />
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <Detail label="Bus" value={selectedEvent.busId} />
              <Detail label="Confidence" value={`${selectedEvent.confidence}%`} />
              <Detail label="Location" value={selectedEvent.location} />
              <Detail label="Status" value={selectedEvent.status} />
              <Detail label="GPS" value={`${selectedEvent.coords[0].toFixed(4)}, ${selectedEvent.coords[1].toFixed(4)}`} />
              <Detail label="Timestamp" value={new Date(selectedEvent.timestamp).toLocaleTimeString('en-IN')} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ImpactStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
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
