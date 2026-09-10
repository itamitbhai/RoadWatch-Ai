import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ThumbsUp, Meh, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintsContext';

const SATISFACTION_OPTIONS = [
  { value: 'Yes', icon: ThumbsUp },
  { value: 'Partially', icon: Meh },
  { value: 'No', icon: ThumbsDown },
];

export default function Feedback() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { findById, submitFeedback } = useComplaints();
  const complaint = findById(id?.toUpperCase());

  const [satisfaction, setSatisfaction] = useState('Yes');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  if (!complaint) {
    return <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center text-sm text-slate-400">Complaint not found.</div>;
  }

  if (complaint.status !== 'Resolved') {
    return <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center text-sm text-slate-400">Feedback is available once this complaint has been resolved.</div>;
  }

  if (done || complaint.feedback) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <CheckCircle2 size={36} className="mx-auto mb-3 text-emerald-400" />
        <p className="text-lg font-semibold text-white">{t('feedback.thanks')}</p>
        <button onClick={() => navigate('/')} className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
          Back to Home
        </button>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitFeedback(complaint.id, { satisfaction, rating, comment });
    setDone(true);
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto max-w-md space-y-5 rounded-2xl p-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('feedback.title')}</h1>
        <p className="mt-1 text-xs text-slate-500">{complaint.id} · {complaint.category} at {complaint.location}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('feedback.question')}</p>
        <div className="flex gap-2">
          {SATISFACTION_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setSatisfaction(opt.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium ${
                satisfaction === opt.value ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <opt.icon size={18} />
              {t(`feedback.${opt.value.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('feedback.ratingLabel')}</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)}>
              <Star size={26} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t('feedback.commentLabel')}</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/40" />
      </div>

      <button type="submit" className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/25">
        {t('feedback.submit')}
      </button>
    </form>
  );
}
