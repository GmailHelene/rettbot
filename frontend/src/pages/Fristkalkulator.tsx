import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarClock } from 'lucide-react';

const PRESETS = [
  { label: '2 uker', days: 14 },
  { label: '3 uker', days: 21 },
  { label: '6 uker', days: 42 },
  { label: 'Egendefinert', days: 0 },
];

function fmt(d: Date) {
  return d.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function daysBetween(from: Date, to: Date) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function Fristkalkulator() {
  const [received, setReceived] = useState('');
  const [preset, setPreset] = useState(PRESETS[1]); // 3 uker
  const [customDays, setCustomDays] = useState('21');

  const days = preset.days === 0 ? parseInt(customDays || '0', 10) : preset.days;

  let deadline: Date | null = null;
  let remaining: number | null = null;
  if (received && days > 0) {
    const start = new Date(received + 'T00:00:00');
    if (!isNaN(start.getTime())) {
      deadline = new Date(start);
      deadline.setDate(deadline.getDate() + days);
      remaining = daysBetween(new Date(), deadline);
    }
  }

  const status =
    remaining === null
      ? null
      : remaining < 0
      ? { text: 'Fristen er utløpt', cls: 'bg-red-50 text-red-800 border-red-200' }
      : remaining <= 3
      ? { text: `Haster - ${remaining} dag(er) igjen`, cls: 'bg-amber-50 text-amber-900 border-amber-200' }
      : { text: `${remaining} dager igjen`, cls: 'bg-green-50 text-green-800 border-green-200' };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <CalendarClock className="header-title-icon text-primary-700" />
            <div>
              <h1 className="header-title">Fristkalkulator</h1>
              <p className="header-subtitle">Regn ut når klage-/ankefristen din går ut</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="card-professional space-y-5">
          <div>
            <label htmlFor="mottatt" className="block text-sm font-medium text-slate-700 mb-1">
              Når mottok du vedtaket/avgjørelsen?
            </label>
            <input
              id="mottatt"
              type="date"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Frist</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(p)}
                  className={
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ' +
                    (preset.label === p.label
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            {preset.days === 0 && (
              <div className="mt-3">
                <label htmlFor="custom" className="block text-sm text-slate-600 mb-1">
                  Antall dager
                </label>
                <input
                  id="custom"
                  type="number"
                  min={1}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-32 px-4 py-2 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {deadline && status && (
            <div className={`rounded-lg border p-4 ${status.cls}`} aria-live="polite">
              <p className="text-sm">Fristen går ut</p>
              <p className="text-lg font-bold capitalize">{fmt(deadline)}</p>
              <p className="mt-1 text-sm font-medium">{status.text}</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            <strong>Viktig:</strong> Den nøyaktige fristen står i vedtaket/avgjørelsen din - den kan
            avvike fra standardvalgene her. Dette er kun et hjelpemiddel for å regne ut en dato, ikke
            juridisk rådgivning. Har du allerede oversittet fristen, kan du i noen tilfeller be om at
            klagen behandles likevel - kontakt instansen eller et{' '}
            <Link to="/hvor-klager-du" className="underline">rettshjelptiltak</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
