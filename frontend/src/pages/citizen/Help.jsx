import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'How do I report a road or traffic issue?', a: 'Go to "Report an Issue", pick a category, add a photo and location, and submit. You\'ll get a Complaint ID instantly.' },
  { q: 'How long does resolution take?', a: 'It depends on priority — Critical issues target 24 hours, High 48 hours, Medium 5 days, and Low 10 days. You can see the target date on the tracking page.' },
  { q: 'Do I need to create an account to report an issue?', a: 'No — reporting and tracking a complaint by ID does not require an account. Contact details are optional and only used to send you SMS/email updates.' },
  { q: 'What happens if the same issue is reported by multiple people?', a: 'Our system automatically detects likely-duplicate reports by location and description and merges them, so one department response covers all reporters.' },
  { q: 'How will I know when my complaint is resolved?', a: 'You will receive an SMS and/or email (if you provided contact details) as soon as the department verifies the resolution. You can also check the status anytime on the Track Complaint page.' },
  { q: 'Is this connected to a real government system?', a: 'This is a demo/hackathon deployment. Notifications, ANPR and vehicle lookups are simulated (DEMO MODE) — the platform is built so real government/SMS/email providers can be connected later.' },
];

export default function Help() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Help &amp; FAQ</h1>
        <p className="mt-1 text-sm text-slate-400">Common questions about reporting issues and tracking complaints.</p>
      </div>

      <div className="space-y-2">
        {FAQS.map((f, i) => (
          <div key={f.q} className="glass overflow-hidden rounded-xl">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-200">
              {f.q}
              <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="border-t border-white/5 px-4 py-3 text-xs text-slate-400">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
