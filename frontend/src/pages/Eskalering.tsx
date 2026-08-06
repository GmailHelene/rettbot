import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, ExternalLink, Search } from 'lucide-react';
import { escalationAreas } from '../data/escalation';

export default function Eskalering() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const filtered = escalationAreas
    .map((area) => ({
      ...area,
      bodies: query
        ? area.bodies.filter((b) =>
            `${area.area} ${b.name} ${b.handles} ${b.when}`.toLowerCase().includes(query)
          )
        : area.bodies,
    }))
    .filter((area) => !query || area.area.toLowerCase().includes(query) || area.bodies.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <Compass className="header-title-icon text-primary-700" />
            <div>
              <h1 className="header-title">Hvor klager du?</h1>
              <p className="header-subtitle">Norske klage- og tilsynsorganer, etter område</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-slate-600 mb-6">
          Står du fast mot en offentlig instans? Her er en oversikt over hvor ulike klager og saker
          hører hjemme. Klikk deg videre til den offisielle nettsiden for å se frister og
          fremgangsmåte.
        </p>

        <div className="relative mb-8">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søk – f.eks. «politi», «personvern», «NAV», «diskriminering»"
            aria-label="Søk i klageorganer"
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-slate-500">Ingen treff. Prøv et annet søkeord.</p>
        ) : (
          <div className="space-y-8">
            {filtered.map((area) => (
              <section key={area.id} aria-label={area.area}>
                <h2 className="text-xl font-bold text-slate-900">{area.area}</h2>
                <p className="mt-1 mb-4 text-sm text-slate-600">{area.intro}</p>
                <div className="space-y-3">
                  {area.bodies.map((b) => (
                    <a
                      key={b.name}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block card-professional hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary-700">
                            {b.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-700">{b.handles}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            <span className="font-medium text-slate-600">Når:</span> {b.when}
                          </p>
                        </div>
                        <ExternalLink
                          className="w-5 h-5 text-slate-400 group-hover:text-primary-700 flex-shrink-0 mt-1"
                          aria-hidden="true"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            <strong>Merk:</strong> Dette er generell informasjon om hvor saker hører hjemme, ikke
            juridisk rådgivning. Frister og fremgangsmåte kan variere – sjekk alltid hos den
            aktuelle instansen, eller kontakt en advokat eller et rettshjelptiltak ved en konkret sak.
          </p>
        </div>
      </main>
    </div>
  );
}
