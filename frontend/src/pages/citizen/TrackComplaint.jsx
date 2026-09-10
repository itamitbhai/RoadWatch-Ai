import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Building2, Star } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintsContext';
import StatusTimeline from '../../components/StatusTimeline';
import { PriorityBadge, StatusBadge } from '../../components/Badge';
import { CATEGORY_EMOJI } from '../../data/complaintsData';

export default function TrackComplaint() {
  const { t } = useTranslation();
  const { id: paramId } = useParams();
  const { findById } = useComplaints();
  const navigate = useNavigate();
  const [input, setInput] = useState(paramId || '');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  function runSearch(id) {
    const found = findById(id.trim().toUpperCase());
    setResult(found);
    setSearched(true);
  }

  useEffect(() => {
    if (paramId) runSearch(paramId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t('track.title')}</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); navigate(`/track/${input.trim()}`); runSearch(input); }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`${t('track.inputLabel')} (e.g. CMP-2026-00125)`}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/40"
        />
        <button type="submit" className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/25">
          <Search size={15} /> {t('track.searchButton')}
        </button>
      </form>

      {searched && !result && <div className="glass rounded-2xl p-8 text-center text-sm text-slate-400">{t('track.notFound')}</div>}

      {result && (
        <div className="glass space-y-5 rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_EMOJI[result.category] || '📍'}</span>
              <div>
                <p className="font-mono text-xs text-slate-500">{result.id}</p>
                <h2 className="text-lg font-bold text-white">{result.category}</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <PriorityBadge priority={result.priority} />
              <StatusBadge status={result.status} />
            </div>
          </div>

          <p className="text-sm text-slate-300">{result.description}</p>

          {result.images?.[0] && <img src={result.images[0]} alt="" className="w-full rounded-xl border border-white/10" />}

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
            <p className="flex items-center gap-1"><MapPin size={12} /> {result.location}</p>
            {result.department && <p className="flex items-center gap-1"><Building2 size={12} /> {result.department}</p>}
            <p>Submitted: {new Date(result.submittedAt).toLocaleDateString('en-IN')}</p>
            {!['Resolved', 'Rejected'].includes(result.status) && <p>SLA target: {new Date(result.slaDeadline).toLocaleDateString('en-IN')}</p>}
          </div>

          <StatusTimeline complaint={result} />

          {result.resolution && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-emerald-300">Resolved</p>
              <p className="mt-1 text-xs text-emerald-300/80">{result.resolution.notes}</p>
              {result.resolution.images?.[0] && <img src={result.resolution.images[0]} alt="" className="mt-2 w-full rounded-lg border border-white/10" />}
            </div>
          )}

          {result.status === 'Resolved' && !result.feedback && (
            <button onClick={() => navigate(`/feedback/${result.id}`)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/20">
              <Star size={14} /> Rate This Resolution
            </button>
          )}
          {result.feedback && (
            <p className="text-center text-xs text-slate-500">You rated this resolution {result.feedback.rating}★. Thank you for your feedback.</p>
          )}
        </div>
      )}
    </div>
  );
}
