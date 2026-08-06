import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { getVeiviser } from '../data/veivisere';
import FeedbackWidget from '../components/FeedbackWidget';

const storageKey = (id: string) => `rb_veiviser_${id}`;

/**
 * En enkelt veiviser som en avkryssbar sjekkliste. Avkryssingen lagres lokalt
 * i nettleseren, så du kan komme tilbake og fortsette der du slapp.
 */
export default function Veiviser() {
  const { id } = useParams();
  const guide = getVeiviser(id);

  const [done, setDone] = useState<number[]>(() => {
    if (!guide) return [];
    try {
      const raw = localStorage.getItem(storageKey(guide.id));
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  });

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="card-professional max-w-md text-center">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">Fant ikke veiviseren</h1>
          <p className="text-slate-600 text-sm mb-4">Denne veiviseren finnes ikke.</p>
          <Link to="/veivisere" className="text-primary-700 underline hover:text-primary-800">
            Se alle veivisere
          </Link>
        </div>
      </div>
    );
  }

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      try {
        localStorage.setItem(storageKey(guide.id), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const pct = Math.round((done.length / guide.steps.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/veivisere" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div>
            <h1 className="header-title">{guide.title}</h1>
            <p className="header-subtitle">{guide.badge}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-slate-600 text-sm mb-5">{guide.intro}</p>

        {/* Fremdrift */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{done.length} av {guide.steps.length} steg</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-primary-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Steg */}
        <ol className="space-y-3">
          {guide.steps.map((step, i) => {
            const isDone = done.includes(i);
            return (
              <li key={i} className="card-professional">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="flex-shrink-0 mt-0.5"
                    aria-pressed={isDone}
                    aria-label={isDone ? 'Marker som ikke gjort' : 'Marker som gjort'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h2 className={`text-base font-semibold ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {i + 1}. {step.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                    {step.link && (
                      <Link
                        to={step.link.to}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-primary-700 hover:text-primary-800 font-medium"
                      >
                        {step.link.label}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Dette er praktisk veiledning, ikke juridisk rådgivning. I en alvorlig sak bør du kontakte
          advokat eller offentlig rettshjelp.
        </div>

        <FeedbackWidget tool={`veiviser-${guide.id}`} className="mt-6" />
      </main>
    </div>
  );
}
