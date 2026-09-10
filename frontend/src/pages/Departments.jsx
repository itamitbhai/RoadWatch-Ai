import { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { slaState } from '../services/slaService';

export default function Departments() {
  const { complaints, departments } = useComplaints();

  const stats = useMemo(
    () =>
      departments.map((d) => {
        const deptComplaints = complaints.filter((c) => c.department === d.name);
        const resolved = deptComplaints.filter((c) => c.status === 'Resolved');
        const overdue = deptComplaints.filter((c) => !['Resolved', 'Rejected'].includes(c.status) && slaState(c.slaDeadline, c.status) === 'Overdue');
        const avgHours = resolved.length
          ? Math.round(resolved.reduce((sum, c) => sum + (c.resolution.resolvedAt - c.assignedAt) / 3600000, 0) / resolved.length)
          : null;
        return {
          ...d,
          assigned: deptComplaints.filter((c) => c.status === 'Assigned').length,
          inProgress: deptComplaints.filter((c) => c.status === 'In Progress').length,
          resolved: resolved.length,
          overdue: overdue.length,
          total: deptComplaints.length,
          avgHours,
        };
      }),
    [complaints, departments]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Departments</h1>
        <p className="mt-1 text-sm text-slate-400">Per-department workload, SLA compliance and resolution performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((d) => (
          <div key={d.id} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                <Building2 size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{d.name}</p>
                <p className="text-xs text-slate-500">{d.head}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <Stat label="Assigned" value={d.assigned} />
              <Stat label="In Progress" value={d.inProgress} />
              <Stat label="Resolved" value={d.resolved} accent="text-emerald-300" />
              <Stat label="Overdue" value={d.overdue} accent={d.overdue ? 'text-rose-300' : 'text-slate-300'} />
            </div>
            <div className="mt-3 border-t border-white/5 pt-3 text-xs text-slate-400">
              Avg. resolution time: <span className="font-semibold text-slate-200">{d.avgHours !== null ? `${d.avgHours}h` : '—'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent = 'text-slate-200' }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] py-2">
      <p className={`text-base font-bold ${accent}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
