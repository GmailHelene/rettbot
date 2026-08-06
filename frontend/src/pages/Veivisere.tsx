import { Link } from 'react-router-dom';
import { ArrowLeft, Footprints, ChevronRight } from 'lucide-react';
import { veivisere } from '../data/veivisere';

/**
 * Oversikt over de guidede veiviserne. Folk i krise trenger en rekkefølge å
 * følge, ikke bare en chat.
 */
export default function Veivisere() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary-50 text-primary-700">
              <Footprints className="w-6 h-6" />
            </div>
            <div>
              <h1 className="header-title">Veivisere</h1>
              <p className="header-subtitle">Steg for steg gjennom en konkret situasjon</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-slate-600 text-sm mb-6 max-w-2xl">
          Velg situasjonen din, så tar vi deg gjennom stegene i riktig rekkefølge - med lenker til
          verktøyene du trenger underveis. Du kan krysse av etter hvert som du gjør dem.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {veivisere.map((v) => (
            <Link
              key={v.id}
              to={`/veivisere/${v.id}`}
              className="card-professional block hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary-50 text-primary-700 rounded-full px-2.5 py-0.5 font-medium">
                  {v.badge}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">{v.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{v.intro}</p>
              <p className="mt-3 text-xs text-slate-500">{v.steps.length} steg</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
