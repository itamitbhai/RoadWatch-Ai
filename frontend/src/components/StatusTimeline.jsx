import { Check, Clock, XCircle } from 'lucide-react';

const STEPS = ['Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Notified'];

export default function StatusTimeline({ complaint }) {
  if (complaint.status === 'Rejected') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
        <XCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">This complaint was reviewed and closed.</p>
          <p className="mt-1 text-xs text-rose-300/80">See the notes below for the review outcome.</p>
        </div>
      </div>
    );
  }

  const effectiveStatus = complaint.status === 'Resolved' && complaint.citizenNotified ? 'Notified' : complaint.status;
  const currentIndex = STEPS.indexOf(effectiveStatus);

  return (
    <div>
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  done ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-white/15 text-slate-500'
                }`}
              >
                {done ? <Check size={13} /> : <Clock size={12} />}
              </div>
              {!isLast && <div className={`w-0.5 flex-1 ${i < currentIndex ? 'bg-emerald-400/50' : 'bg-white/10'}`} style={{ minHeight: 26 }} />}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-semibold ${done ? 'text-white' : 'text-slate-500'}`}>{step}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
