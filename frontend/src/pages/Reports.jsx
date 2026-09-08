import { useMemo, useState } from 'react';
import { FileBarChart, Loader2, Sparkles, TrendingUp, Construction, ShieldAlert, TrafficCone } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';
import { randomInt, pickRandom } from '../data/mockData';

function buildInsights({ events, incidents, roadTrafficStats, buses }) {
  const insights = [];
  const roadEvents = events.filter((e) => e.category === 'road');
  const highSeverityPotholes = roadEvents.filter((e) => e.type === 'Pothole' && e.severity === 'HIGH').length;
  const topRoad = roadTrafficStats.slice().sort((a, b) => b.density - a.density)[0];
  const worstDelayRoute = pickRandom(buses).route;
  const repeatedType = pickRandom(['Missing Zebra Crossing', 'Damaged Traffic Sign', 'Missing Divider']);

  insights.push(`${topRoad.road} experienced a ${randomInt(14, 32)}% increase in traffic density during peak hours.`);
  insights.push(`${Math.max(highSeverityPotholes, randomInt(8, 15))} high-severity potholes were detected across ${randomInt(3, 6)} routes.`);
  insights.push(`Route ${worstDelayRoute} experienced an estimated ${randomInt(9, 24)}-minute delay due to congestion.`);
  insights.push(`${randomInt(2, 5)} infrastructure deficiencies (${repeatedType}) were detected repeatedly by multiple buses.`);
  insights.push(`${incidents.filter((i) => i.status !== 'Resolved').length} incidents remain under active investigation across the fleet.`);
  insights.push(`Average fleet-wide detection confidence held at ${randomInt(90, 97)}% across ${events.length} logged events.`);
  return insights;
}

export default function Reports() {
  const sim = useSimulation();
  const { push } = useToast();
  const [insights, setInsights] = useState(() => buildInsights(sim));
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(new Date());

  const summary = useMemo(() => {
    const roadEvents = sim.events.filter((e) => e.category === 'road');
    const trafficEvents = sim.events.filter((e) => e.category === 'traffic');
    return {
      detectionsToday: sim.events.length,
      roadIssues: roadEvents.length,
      trafficEvents: trafficEvents.length,
      incidents: sim.incidents.length,
      activeIncidents: sim.incidents.filter((i) => i.status !== 'Resolved').length,
      avgDensity: Math.round(sim.roadTrafficStats.reduce((a, r) => a + r.density, 0) / sim.roadTrafficStats.length),
    };
  }, [sim.events, sim.incidents, sim.roadTrafficStats]);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setInsights(buildInsights(sim));
      setLastGenerated(new Date());
      setGenerating(false);
      push({ title: 'Report Generated', message: 'Latest AI-driven insights are ready for review.', variant: 'success' });
    }, 1200);
  }

  const cards = [
    {
      icon: FileBarChart,
      title: 'Daily Detection Summary',
      value: summary.detectionsToday,
      unit: 'AI detections',
      desc: `${summary.roadIssues} road issues · ${summary.trafficEvents} traffic events logged today`,
      accent: 'cyan',
    },
    {
      icon: Construction,
      title: 'Weekly Road Condition Report',
      value: summary.roadIssues,
      unit: 'infrastructure flags',
      desc: 'Potholes, waterlogging & damaged infrastructure across all routes',
      accent: 'amber',
    },
    {
      icon: TrafficCone,
      title: 'Traffic Congestion Report',
      value: `${summary.avgDensity}%`,
      unit: 'avg. city density',
      desc: 'Aggregated across 8 monitored corridors',
      accent: 'blue',
    },
    {
      icon: ShieldAlert,
      title: 'Incident Report',
      value: summary.activeIncidents,
      unit: `of ${summary.incidents} incidents active`,
      desc: 'Hit & run, rash driving, pedestrian risk & accidents',
      accent: 'rose',
    },
  ];

  const accentMap = {
    cyan: 'text-cyan-300 bg-cyan-500/10',
    amber: 'text-amber-300 bg-amber-500/10',
    blue: 'text-blue-300 bg-blue-500/10',
    rose: 'text-rose-300 bg-rose-500/10',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Insights</h1>
          <p className="mt-1 text-sm text-slate-400">AI-synthesized summaries drawn from live fleet telemetry.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:opacity-60"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {generating ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="glass rounded-2xl p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentMap[c.accent]}`}>
              <c.icon size={17} />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs font-medium text-slate-400">{c.unit}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{c.desc}</p>
            <p className="mt-2 text-xs font-semibold text-slate-300">{c.title}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="text-cyan-400" />
            <h2 className="font-semibold text-white">AI-Generated Insights</h2>
          </div>
          <span className="text-[11px] text-slate-500">Updated {lastGenerated.toLocaleTimeString('en-IN')}</span>
        </div>
        <div className="space-y-2.5">
          {insights.map((line, i) => (
            <div key={i} className="animate-fade-in flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-[11px] font-bold text-cyan-300">
                {i + 1}
              </span>
              <p className="text-sm text-slate-300">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
