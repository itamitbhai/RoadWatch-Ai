import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { LANGUAGES } from '../i18n';
import { saveState } from '../utils/storage';

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function change(code) {
    i18n.changeLanguage(code);
    saveState('lang.v1', code);
    setOpen(false);
  }

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
      >
        <Globe size={14} /> {compact ? current.code.toUpperCase() : current.label}
      </button>
      {open && (
        <div className="glass-strong animate-fade-in absolute right-0 top-10 z-50 w-40 rounded-xl p-1.5 shadow-2xl shadow-black/50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-white/10"
            >
              {l.label}
              {l.code === current.code && <Check size={13} className="text-cyan-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
