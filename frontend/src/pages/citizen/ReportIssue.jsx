import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Link2, ClipboardCopy } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintsContext';
import { useToast } from '../../context/ToastContext';
import { COMPLAINT_CATEGORIES, CATEGORY_EMOJI } from '../../data/complaintsData';
import EvidenceUploader from '../../components/EvidenceUploader';
import LocationPicker from '../../components/LocationPicker';

export default function ReportIssue() {
  const { t } = useTranslation();
  const { submitComplaint } = useComplaints();
  const { push } = useToast();
  const navigate = useNavigate();

  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [videoMeta, setVideoMeta] = useState(null);
  const [coords, setCoords] = useState(null);
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const canSubmit = category && description.trim().length > 4 && coords;

  function handleLocationChange(latlng, nearestRoadName) {
    setCoords(latlng);
    setLocation(nearestRoadName);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const { complaint, duplicateCandidates } = submitComplaint({
      category, description, images, videoMeta, coords, location, landmark,
      contactName: contactName || null, contactPhone: contactPhone || null, contactEmail: contactEmail || null,
    });
    setSubmitted({ complaint, duplicateCandidates });
    push({ title: t('report.successTitle'), message: `${t('report.successBody')} ID: ${complaint.id}`, variant: 'success' });
  }

  if (submitted) {
    return (
      <div className="glass mx-auto max-w-lg rounded-2xl p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-400" />
        <h1 className="text-xl font-bold text-white">{t('report.successTitle')}</h1>
        <p className="mt-2 text-sm text-slate-400">{t('report.successBody')}</p>

        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
          <span className="font-mono text-sm font-bold text-cyan-300">{submitted.complaint.id}</span>
          <button onClick={() => navigator.clipboard?.writeText(submitted.complaint.id)} className="text-slate-400 hover:text-white">
            <ClipboardCopy size={14} />
          </button>
        </div>

        {submitted.duplicateCandidates.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-300">
            <p className="flex items-center gap-1.5 font-semibold"><Link2 size={13} /> {t('report.duplicateWarning')}</p>
            <p className="mt-1 text-amber-300/80">Similar reports: {submitted.duplicateCandidates.slice(0, 3).map((d) => d.complaint.id).join(', ')}. Our team will review and merge duplicates automatically.</p>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => navigate(`/track/${submitted.complaint.id}`)} className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/25">
            Track This Complaint
          </button>
          <button onClick={() => { setSubmitted(null); setDescription(''); setImages([]); setCoords(null); setLandmark(''); }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t('report.title')}</h1>
        <p className="mt-1 text-sm text-slate-400">Fields marked required must be filled before you can submit.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t('report.category')} *</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {COMPLAINT_CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center text-[11px] font-medium transition-colors ${
                category === c ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{CATEGORY_EMOJI[c] || '📍'}</span>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t('report.description')} *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe the issue in a few sentences..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/40"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Evidence</label>
        <EvidenceUploader images={images} onImagesChange={setImages} videoMeta={videoMeta} onVideoChange={setVideoMeta} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t('report.location')} *</label>
        <LocationPicker coords={coords} onChange={handleLocationChange} landmark={landmark} onLandmarkChange={setLandmark} />
        {location && <p className="mt-1.5 text-xs text-slate-500">Nearest road: <span className="text-slate-300">{location}</span></p>}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t('report.contactOptional')}</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40" />
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone (for SMS updates)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40" />
          <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email (for updates)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40" />
        </div>
      </div>

      <button type="submit" disabled={!canSubmit} className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40">
        {t('report.submit')}
      </button>
    </form>
  );
}
