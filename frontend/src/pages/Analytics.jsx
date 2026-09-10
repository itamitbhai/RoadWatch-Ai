import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertTriangle, TrendingUp, MapPin, Award, ShieldAlert } from 'lucide-react';
import { useViolations } from '../context/ViolationsContext';
import { useComplaints } from '../context/ComplaintsContext';

const tooltipStyle = { background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 };

function countBy(arr, key) {
  const map = {};
  arr.forEach((item) => {
    const k = item[key];
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function Analytics() {
  const { violations } = useViolations();
  const { complaints, departments } = useComplaints();

  const violationsByType = useMemo(() => countBy(violations, 'violationType').slice(0, 8), [violations]);
  const complaintsByCategory = useMemo(() => countBy(complaints, 'category').slice(0, 8), [complaints]);
  const complaintsByLocation = useMemo(() => countBy(complaints, 'location').slice(0, 6), [complaints]);

  const avgResolutionHours = useMemo(() => {
    const resolved = complaints.filter((c) => c.status === 'Resolved' && c.resolution);
    if (!resolved.length) return 0;
    return Math.round(resolved.reduce((sum, c) => sum + (c.resolution.resolvedAt - c.submittedAt) / 3600000, 0) / resolved.length);
  }, [complaints]);

  const slaCompliance = useMemo(() => {
    const resolved = complaints.filter((c) => c.status === 'Resolved' && c.resolution);
    if (!resolved.length) return 0;
    const onTime = resolved.filter((c) => c.resolution.resolvedAt <= c.slaDeadline).length;
    return Math.round((onTime / resolved.length) * 100);
  }, [complaints]);

  const satisfaction = useMemo(() => {
    const rated = complaints.filter((c) => c.feedback);
    if (!rated.length) return null;
    return (rated.reduce((sum, c) => sum + c.feedback.rating, 0) / rated.length).toFixed(1);
  }, [complaints]);

  const fastestDept = useMemo(() => {
    const stats = departments
      .map((d) => {
        const resolved = complaints.filter((c) => c.department === d.name && c.status === 'Resolved' && c.resolution);
        if (!resolved.length) return null;
        const avg = resolved.reduce((sum, c) => sum + (c.resolution.resolvedAt - c.assignedAt) / 3600000, 0) / resolved.length;
        return { name: d.name, avg };
      })
      .filter(Boolean);
    return stats.sort((a, b) => a.avg - b.avg)[0];
  }, [complaints, departments]);

  const criticalUnresolved =
    complaints.filter((c) => c.priority === 'CRITICAL' && !['Resolved', 'Rejected'].includes(c.status)).length +
    violations.filter((v) => v.severity === 'HIGH' && v.status === 'Pending').length;

  const insightCards = [
    { icon: MapPin, label: 'Most Problematic Zone', value: complaintsByLocation[0]?.name || '—' },
    { icon: ShieldAlert, label: 'Most Common Violation', value: violationsByType[0]?.name || '—' },
    { icon: TrendingUp, label: 'Highest Complaint Category', value: complaintsByCategory[0]?.name || '—' },
    { icon: Award, label: 'Fastest Resolving Dept.', value: fastestDept ? `${fastestDept.name.split(' ')[0]} (${Math.round(fastestDept.avg)}h)` : '—' },
    { icon: AlertTriangle, label: 'Critical Unresolved', value: criticalUnresolved },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Smart City Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">Combined traffic violation and citizen complaint intelligence.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {insightCards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
              <c.icon size={16} />
            </div>
            <p className="mt-3 truncate text-lg font-bold text-white">{c.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <h2 className="mb-3 font-semibold text-white">Violations by Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={violationsByType} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="mb-3 font-semibold text-white">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={complaintsByCategory} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={140} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Avg. Resolution Time" value={`${avgResolutionHours}h`} />
        <MetricCard label="SLA Compliance" value={`${slaCompliance}%`} />
        <MetricCard label="Citizen Satisfaction" value={satisfaction ? `${satisfaction} / 5★` : 'No ratings yet'} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="glass rounded-2xl p-5 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
