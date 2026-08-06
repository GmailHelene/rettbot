import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, ChevronRight } from 'lucide-react';

interface Situation {
  title: string;
  description: string;
  actions: { label: string; to: string }[];
}

const situations: Situation[] = [
  {
    title: 'Jeg har fått et vedtak jeg er uenig i',
    description: 'Sjekk fristen, finn hvem du klager til, og skriv klagen.',
    actions: [
      { label: 'Regn ut klagefristen', to: '/fristkalkulator' },
      { label: 'Hvor klager du?', to: '/hvor-klager-du' },
      { label: 'Klagemal', to: '/maler' },
    ],
  },
  {
    title: 'Jeg vil klage på politiet',
    description: 'Ulik vei for kritikkverdig oppførsel og for mulig straffbart forhold.',
    actions: [
      { label: 'Hvor klager du?', to: '/hvor-klager-du' },
      { label: 'Mal: klage på politiet', to: '/maler' },
    ],
  },
  {
    title: 'Jeg vil varsle om kritikkverdige forhold',
    description: 'Vurder saken og finn rett instans å varsle til.',
    actions: [
      { label: 'Varsling og korrupsjon', to: '/corruption-assessment' },
      { label: 'Hvor klager du?', to: '/hvor-klager-du' },
    ],
  },
  {
    title: 'Jeg vil vite hva myndighetene har på meg',
    description: 'Be om innsyn i egne opplysninger eller offentlige dokumenter.',
    actions: [{ label: 'Lag et innsynskrav', to: '/innsynskrav' }],
  },
  {
    title: 'Jeg vil forstå rettighetene mine og loven',
    description: 'Slå opp i norsk lov på klarspråk, eller still et spørsmål.',
    actions: [
      { label: 'Juridisk oppslag', to: '/legal-research' },
      { label: 'Rettighetsvern', to: '/rights-protection' },
      { label: 'Juridisk chat', to: '/legal-chat' },
    ],
  },
  {
    title: 'Jeg er involvert i en straffesak',
    description: 'Forstå strafferammer, bygg en forsvarsstrategi og vurder bevis.',
    actions: [
      { label: 'Strafferammer', to: '/penalties' },
      { label: 'Forsvarsstrategi', to: '/defense-strategy' },
      { label: 'Bevisanalyse', to: '/evidence-analysis' },
    ],
  },
  {
    title: 'Jeg vil dokumentere saken min',
    description: 'Bygg en tidslinje og samle bevis trygt ett sted.',
    actions: [
      { label: 'Saks-tidslinje', to: '/tidslinje' },
      { label: 'Last opp bevis', to: '/evidence-upload' },
      { label: 'Mine saker', to: '/my-cases' },
    ],
  },
];

export default function KomIGang() {
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
              <h1 className="header-title">Kom i gang</h1>
              <p className="header-subtitle">Velg situasjonen som passer best</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-slate-600 mb-6">
          Ikke sikker på hvor du skal begynne? Velg det som ligner mest på din situasjon, så peker vi
          deg til de riktige verktøyene.
        </p>

        <div className="space-y-4">
          {situations.map((s) => (
            <div key={s.title} className="card-professional">
              <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{s.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.actions.map((a, i) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className={
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ' +
                      (i === 0
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
                    }
                  >
                    {a.label}
                    {i === 0 && <ChevronRight className="w-4 h-4" aria-hidden="true" />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            RettBot+ gir generell informasjon og hjelp til å hjelpe deg selv – ikke individuell
            juridisk rådgivning. Ved en alvorlig eller konkret sak: kontakt en advokat eller et{' '}
            <Link to="/hvor-klager-du" className="underline">rettshjelptiltak</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
