import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, ScanLine, CheckCircle2, Loader2, FileDown, Radio, Clock } from 'lucide-react';
import { useViolations } from '../context/ViolationsContext';
import { useNotificationCenter } from '../context/NotificationCenterContext';
import { useToast } from '../context/ToastContext';
import { runAnpr } from '../services/anprService';
import { generateViolationPdf } from '../services/pdfService';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import { VIOLATION_TYPES } from '../data/violationsData';

const STEPS = [
  'Uploading traffic video',
  'Running AI Detection Engine',
  'Violation type identified',
  'Running ANPR (number plate recognition)',
  'Vehicle number extracted',
  'Violation record created',
  'Notifying vehicle owner',
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function DetectionStudio() {
  const { createViolation, verifyViolation, findVehicle } = useViolations();
  const { notifications } = useNotificationCenter();
  const { push } = useToast();
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [violationType, setViolationType] = useState(VIOLATION_TYPES[0]);
  const [result, setResult] = useState(null);

  async function runDetection() {
    if (!file) return;
    setRunning(true);
    setResult(null);
    setStepIndex(0);
    await wait(700);

    setStepIndex(1);
    await wait(900);

    setStepIndex(2);
    await wait(500);

    setStepIndex(3);
    const anpr = await runAnpr();

    setStepIndex(4);
    await wait(400);

    const violation = createViolation({
      violationType,
      vehicleNumber: anpr.plate,
      confidence: anpr.confidence,
      plateImage: anpr.plateImage,
      plateConfidence: anpr.confidence,
      source: `Demo Upload — ${file.name}`,
    });
    setStepIndex(5);
    await wait(500);

    setStepIndex(6);
    verifyViolation(violation.id, 'Verified');
    await wait(400);

    setResult(violation);
    setRunning(false);
    push({ title: 'Violation Pipeline Complete', message: `${violation.id} created and owner notified (demo mode).`, variant: 'success' });
  }

  const vehicle = result ? findVehicle(result.vehicleNumber) : null;
  const relatedNotifications = result ? notifications.filter((n) => n.refType === 'violation' && n.refId === result.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Traffic Monitoring — Detection Studio</h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload a traffic video to walk through the full AI pipeline: detection → ANPR → violation record → evidence PDF → owner notification.
        </p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
          DEMO MODE — simulated AI pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass space-y-4 rounded-2xl p-5 xl:col-span-1">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Violation type to simulate</label>
            <select
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              disabled={running}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/40"
            >
              {VIOLATION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 p-6 text-center hover:border-cyan-500/40">
            <UploadCloud size={22} className="text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">{file ? file.name : 'Upload Traffic Video'}</span>
            <span className="text-[11px] text-slate-500">MP4/WebM — demo only, not actually analyzed frame-by-frame</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <button
            onClick={runDetection}
            disabled={!file || running}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
            {running ? 'Running AI Pipeline…' : 'Run AI Detection'}
          </button>

          <div className="space-y-2 border-t border-white/5 pt-3">
            {STEPS.map((s, i) => {
              const done = stepIndex > i || (!running && result && i <= 6);
              const active = running && stepIndex === i;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  {done ? (
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                  ) : active ? (
                    <Loader2 size={14} className="shrink-0 animate-spin text-cyan-400" />
                  ) : (
                    <Clock size={14} className="shrink-0 text-slate-600" />
                  )}
                  <span className={done ? 'text-slate-300' : active ? 'text-cyan-300' : 'text-slate-600'}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 xl:col-span-2">
          {!result ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-sm text-slate-500">
              <Radio size={28} className="mb-3 text-slate-700" />
              Run the AI pipeline to generate a violation record, evidence PDF and simulated owner notification here.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-slate-500">{result.id}</p>
                  <h2 className="text-lg font-bold text-white">{result.violationType}</h2>
                </div>
                <div className="flex gap-2">
                  <SeverityBadge severity={result.severity} />
                  <StatusBadge status={result.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <img src={result.evidenceImage} alt="Evidence" className="w-full rounded-xl border border-white/10 object-cover" />
                <div className="flex flex-col justify-center gap-3">
                  <img src={result.plateImage} alt="Number plate" className="w-40 rounded-lg border border-white/10" />
                  <p className="text-xs text-slate-400">
                    Vehicle: <span className="font-mono font-semibold text-slate-200">{result.vehicleNumber}</span>
                  </p>
                  <p className="text-xs text-slate-400">ANPR confidence: <span className="font-semibold text-slate-200">{result.plateConfidence}%</span></p>
                  <p className="text-xs text-slate-400">AI confidence: <span className="font-semibold text-slate-200">{result.confidence}%</span></p>
                  {vehicle && (
                    <p className="text-xs text-slate-400">
                      Previous violations: <span className="font-semibold text-slate-200">{Math.max(0, vehicle.totalViolations - 1)}</span> ·{' '}
                      <Link to="/admin/vehicles" className="text-cyan-300 hover:underline">View vehicle history</Link>
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-400">{result.aiAnalysis}</div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {relatedNotifications.map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
                    <span className="font-medium text-slate-300">{n.channel} notification</span>
                    <StatusBadge status={n.status} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => generateViolationPdf(result, vehicle)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                <FileDown size={15} /> Download Violation PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
