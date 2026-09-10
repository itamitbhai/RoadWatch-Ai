import { useTranslation } from 'react-i18next';
import { ShieldCheck, Languages, Bell, ScrollText, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotificationCenter } from '../context/NotificationCenterContext';
import { useAudit } from '../context/AuditContext';
import { LANGUAGES } from '../i18n';
import { saveState } from '../utils/storage';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { preferences, setPreferences } = useNotificationCenter();
  const { log } = useAudit();
  const canViewAudit = user && (user.role === 'Administrator' || user.role === 'Supervisor');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-slate-400">System mode, language, notification preferences and account.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>
          <strong>{t('common.demoMode')}</strong> — SMS/Email use a simulated gateway, ANPR is simulated, and there is
          no connected government database. Every service module is structured to accept real provider credentials
          (Twilio/MSG91, SendGrid/SES, a real ANPR/Maps API) via environment configuration in a production deployment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck size={15} className="text-cyan-400" /> Account
          </p>
          {user ? (
            <div className="text-xs text-slate-400">
              <p className="text-sm font-semibold text-slate-200">{user.name}</p>
              <p>Role: {user.role}</p>
              {user.department && <p>Department: {user.department}</p>}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Not signed in.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Languages size={15} className="text-cyan-400" /> {t('settings.language')}
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  i18n.changeLanguage(l.code);
                  saveState('lang.v1', l.code);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  i18n.language === l.code ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Bell size={15} className="text-cyan-400" /> {t('settings.notificationPrefs')}
          </p>
          <div className="flex flex-wrap gap-3">
            {['sms', 'email', 'inApp'].map((key) => (
              <label key={key} className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={preferences[key]} onChange={(e) => setPreferences((p) => ({ ...p, [key]: e.target.checked }))} className="h-3.5 w-3.5 accent-cyan-500" />
                {key.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {canViewAudit && (
          <div className="glass rounded-2xl p-4 sm:col-span-2">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <ScrollText size={15} className="text-cyan-400" /> Audit Log
            </p>
            <div className="max-h-64 space-y-1.5 overflow-y-auto thin-scroll">
              {log.slice(0, 60).map((entry) => (
                <div key={entry.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">{entry.user.name}</span> ({entry.user.role}) — {entry.action}
                  {entry.entityId && <span className="text-slate-500"> · {entry.entityId}</span>}
                  <span className="float-right text-slate-600">{new Date(entry.timestamp).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {log.length === 0 && <p className="text-xs text-slate-500">No audit events yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
