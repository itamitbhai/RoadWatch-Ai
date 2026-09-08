import { useMemo } from 'react';
import { Car, Bike, Bus as BusIcon, Truck, Rocket } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';

const VEHICLE_ICONS = { Cars: Car, Bikes: Bike, Buses: BusIcon, Trucks: Truck, 'Auto Rickshaws': Rocket };
const VEHICLE_COLORS = { Cars: '#38bdf8', Bikes: '#a855f7', Buses: '#22d3ee', Trucks: '#f97316', 'Auto Rickshaws': '#eab308' };

const CHART_COLORS = { Cars: '#38bdf8', Bikes: '#a855f7', Buses: '#22d3ee', Trucks: '#f97316' };

function congestionColor(density) {
  if (density >= 80) return '#ef4444';
  if (density >= 60) return '#f97316';
  if (density >= 40) return '#eab308';
  return '#22c55e';
}

const tooltipStyle = { background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 };

export default function TrafficAnalytics() {
  const { vehicleStats, hourlyVehicleSeries, roadTrafficStats } = useSimulation();

  const totalVehicles = useMemo(() => Object.values(vehicleStats).reduce((a, b) => a + b, 0), [vehicleStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Traffic Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">Vehicle classification, density and congestion insights from {totalVehicles.toLocaleString('en-IN')} detections today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Object.entries(vehicleStats).map(([label, value]) => {
          const Icon = VEHICLE_ICONS[label];
          return (
            <div key={label} className="glass rounded-2xl p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${VEHICLE_COLORS[label]}22`, color: VEHICLE_COLORS[label] }}>
                <Icon size={17} />
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{value.toLocaleString('en-IN')}</p>
              <p className="mt-0.5 text-xs text-slate-500">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <h2 className="mb-1 font-semibold text-white">Vehicle Count Over Time</h2>
          <p className="mb-3 text-xs text-slate-500">Hourly classification across the fleet's cameras</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyVehicleSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {Object.keys(CHART_COLORS).map((key) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[key]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="mb-1 font-semibold text-white">Traffic Density by Road</h2>
          <p className="mb-3 text-xs text-slate-500">Current density index per corridor</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={roadTrafficStats} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="road" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="density" radius={[0, 6, 6, 0]}>
                {roadTrafficStats.map((r) => (
                  <Cell key={r.road} fill={congestionColor(r.density)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="mb-1 font-semibold text-white">Average Speed by Corridor</h2>
          <p className="mb-3 text-xs text-slate-500">Km/h, derived from GPS telemetry</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={roadTrafficStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="road" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgSpeed" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="mb-1 font-semibold text-white">Estimated Route Delay</h2>
          <p className="mb-3 text-xs text-slate-500">Minutes lost to congestion, per corridor</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={roadTrafficStats}>
              <defs>
                <linearGradient id="delayFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="road" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="delay" stroke="#f97316" strokeWidth={2} fill="url(#delayFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <h2 className="mb-1 font-semibold text-white">Congestion Heatmap</h2>
        <p className="mb-4 text-xs text-slate-500">Live density, speed, congestion level and delay per corridor</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 pb-2">Road</th>
                <th className="px-3 pb-2">Traffic Density</th>
                <th className="px-3 pb-2">Avg Speed</th>
                <th className="px-3 pb-2">Congestion</th>
                <th className="px-3 pb-2">Delay</th>
              </tr>
            </thead>
            <tbody>
              {roadTrafficStats.map((r) => (
                <tr key={r.road} className="rounded-xl bg-white/[0.02]">
                  <td className="rounded-l-xl px-3 py-3 font-medium text-slate-200">{r.road}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.density}%`, background: congestionColor(r.density) }} />
                      </div>
                      <span className="text-xs text-slate-400">{r.density}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-300">{r.avgSpeed} km/h</td>
                  <td className="px-3 py-3">
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ borderColor: `${congestionColor(r.density)}55`, color: congestionColor(r.density), background: `${congestionColor(r.density)}15` }}
                    >
                      {r.congestion}
                    </span>
                  </td>
                  <td className="rounded-r-xl px-3 py-3 text-slate-300">{r.delay} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
