const SEVERITY_STYLES = {
  HIGH: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const STATUS_STYLES = {
  Active: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Investigating: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Reported: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Online: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Offline: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

export function SeverityBadge({ severity }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_STYLES[status] || STATUS_STYLES.Reported}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Pill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-300 ${className}`}>
      {children}
    </span>
  );
}
