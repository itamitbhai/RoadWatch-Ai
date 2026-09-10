import { useMemo, useState } from 'react';
import { Bell, RotateCcw, Mail, MessageSquare, Monitor } from 'lucide-react';
import { useNotificationCenter } from '../context/NotificationCenterContext';
import { StatusBadge } from '../components/Badge';

const CHANNEL_ICON = { SMS: MessageSquare, Email: Mail, InApp: Monitor };

export default function NotificationCenter() {
  const { notifications, preferences, setPreferences, retry } = useNotificationCenter();
  const [channelFilter, setChannelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(
    () => notifications.filter((n) => (channelFilter === 'All' || n.channel === channelFilter) && (statusFilter === 'All' || n.status === statusFilter)),
    [notifications, channelFilter, statusFilter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Notification Center</h1>
        <p className="mt-1 text-sm text-slate-400">SMS, Email and in-app notifications triggered by violations and complaints (DEMO / MOCK delivery).</p>
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery Preferences</p>
        <div className="flex flex-wrap gap-3">
          {['sms', 'email', 'inApp'].map((key) => (
            <label key={key} className="flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={preferences[key]} onChange={(e) => setPreferences((p) => ({ ...p, [key]: e.target.checked }))} className="h-3.5 w-3.5 accent-cyan-500" />
              {key.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'SMS', 'Email', 'InApp'].map((c) => (
          <button key={c} onClick={() => setChannelFilter(c)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${channelFilter === c ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {c}
          </button>
        ))}
        <span className="mx-1 w-px bg-white/10" />
        {['All', 'Pending', 'Processing', 'Sent', 'Delivered', 'Failed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusFilter === s ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 100).map((n) => {
          const Icon = CHANNEL_ICON[n.channel] || Bell;
          return (
            <div key={n.id} className="glass flex items-center gap-3 rounded-xl p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300">
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">{n.type} · {n.to}</p>
                <p className="truncate text-[11px] text-slate-500">{n.subject || n.message}</p>
              </div>
              <StatusBadge status={n.status} />
              {n.status === 'Failed' && (
                <button onClick={() => retry(n.id)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/10">
                  <RotateCcw size={11} /> Retry
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="glass rounded-2xl p-12 text-center text-sm text-slate-500">No notifications match this filter.</div>}
      </div>
    </div>
  );
}
