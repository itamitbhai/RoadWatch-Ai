import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, FileSearch, ShieldCheck, Camera, Bell, CheckCircle2 } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintsContext';

export default function CitizenHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { complaints } = useComplaints();

  const stats = useMemo(() => {
    const resolved = complaints.filter((c) => c.status === 'Resolved');
    const avgHours = resolved.length
      ? Math.round(resolved.reduce((s, c) => s + (c.resolution.resolvedAt - c.submittedAt) / 3600000, 0) / resolved.length)
      : 0;
    return { total: complaints.length, resolved: resolved.length, avgHours };
  }, [complaints]);

  const categories = [
    { icon: '🕳️', label: 'Potholes' },
    { icon: '💡', label: 'Street Lights' },
    { icon: '🚦', label: 'Traffic Signals' },
    { icon: '💧', label: 'Waterlogging' },
    { icon: '🅿️', label: 'Illegal Parking' },
    { icon: '🗑️', label: 'Garbage' },
  ];

  return (
    <div className="space-y-8">
      <div className="glass overflow-hidden rounded-2xl p-8 text-center sm:p-12">
        <span className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
          <ShieldCheck size={12} /> Patna Smart City Initiative
        </span>
        <h1 className="text-glow-cyan mx-auto max-w-2xl text-2xl font-bold text-white sm:text-3xl">{t('home.heroTitle')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">{t('home.heroSubtitle')}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => navigate('/report')} className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/25">
            <AlertTriangle size={15} /> {t('home.reportCta')}
          </button>
          <button onClick={() => navigate('/track')} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10">
            <FileSearch size={15} /> {t('home.trackCta')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard value={stats.total} label="Complaints Logged" />
        <StatCard value={stats.resolved} label="Issues Resolved" accent="text-emerald-300" />
        <StatCard value={stats.avgHours ? `${stats.avgHours}h` : '—'} label="Avg. Resolution Time" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">What can you report?</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => (
            <div key={c.label} className="glass flex flex-col items-center gap-1.5 rounded-xl p-3 text-center">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-[11px] text-slate-400">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StepCard icon={Camera} step="1" title="Report" desc="Snap a photo, pick the location and describe the issue — takes under a minute." />
        <StepCard icon={Bell} step="2" title="We Route It" desc="Your report is verified and automatically assigned to the right department." />
        <StepCard icon={CheckCircle2} step="3" title="Get Notified" desc="Track progress live and get an SMS/email the moment it's resolved." />
      </div>
    </div>
  );
}

function StatCard({ value, label, accent = 'text-white' }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function StepCard({ icon: Icon, step, title, desc }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
          <Icon size={16} />
        </div>
        <span className="text-xs font-bold text-slate-500">STEP {step}</span>
      </div>
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{desc}</p>
    </div>
  );
}
