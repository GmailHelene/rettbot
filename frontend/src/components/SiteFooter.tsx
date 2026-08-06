import { Link } from 'react-router-dom';

/**
 * Global footer – vises på alle sider. Samler juridiske lenker og
 * «ikke juridisk rådgivning»-ansvarsfraskrivelsen ett sted.
 */
export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-slate-600">
            RettBot+ © 2026 · AI-assistert juridisk verktøy for norske borgere
          </p>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-primary-700">Hjem</Link>
            <Link to="/eksempler" className="text-slate-600 hover:text-primary-700">Eksempler</Link>
            <Link to="/personvern" className="text-slate-600 hover:text-primary-700">Personvern</Link>
            <Link to="/vilkar" className="text-slate-600 hover:text-primary-700">Vilkår</Link>
            <a
              href="https://www.datatilsynet.no"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-primary-700"
            >
              Datatilsynet
            </a>
          </nav>
        </div>
        <p className="mt-4 text-xs text-slate-500 max-w-3xl">
          RettBot+ gir generell, AI-generert juridisk informasjon og er ikke en erstatning for
          personlig rådgivning fra en advokat. Ved en konkret sak bør du kontakte en advokat eller
          offentlig rettshjelp.
        </p>
      </div>
    </footer>
  );
}
