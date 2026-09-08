import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const VARIANT_STYLES = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', ring: 'border-emerald-500/30' },
  danger: { icon: AlertTriangle, color: 'text-rose-400', ring: 'border-rose-500/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', ring: 'border-amber-500/30' },
  info: { icon: Info, color: 'text-cyan-400', ring: 'border-cyan-500/30' },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const cfg = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info;
        const Icon = cfg.icon;
        return (
          <div
            key={toast.id}
            className={`animate-slide-up glass-strong pointer-events-auto flex items-start gap-3 rounded-xl border ${cfg.ring} p-3.5 shadow-lg shadow-black/40`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${cfg.color}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{toast.title}</p>
              {toast.message && <p className="mt-0.5 truncate text-xs text-slate-400">{toast.message}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
