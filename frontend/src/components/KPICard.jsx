import AnimatedCounter from './AnimatedCounter';

export default function KPICard({ icon: Icon, label, value, trend, trendLabel, accent = 'cyan', format }) {
  const accentMap = {
    cyan: 'from-cyan-500/20 text-cyan-300 border-cyan-500/20',
    blue: 'from-blue-500/20 text-blue-300 border-blue-500/20',
    rose: 'from-rose-500/20 text-rose-300 border-rose-500/20',
    amber: 'from-amber-500/20 text-amber-300 border-amber-500/20',
    emerald: 'from-emerald-500/20 text-emerald-300 border-emerald-500/20',
  };
  const isUp = trend >= 0;

  return (
    <div className="group glass relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_0_30px_-10px_rgba(56,189,248,0.35)]">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${accentMap[accent]} opacity-30 blur-2xl transition-opacity group-hover:opacity-50`} />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-white/5 ${accentMap[accent]}`}>
          <Icon size={19} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <p className="text-3xl font-bold tracking-tight text-white">
          <AnimatedCounter value={value} format={format} />
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        {trendLabel && <p className="mt-2 text-[11px] text-slate-500">{trendLabel}</p>}
      </div>
    </div>
  );
}
