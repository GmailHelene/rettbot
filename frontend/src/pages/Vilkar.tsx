import { Link } from 'react-router-dom';
import { ArrowLeft, ScrollText } from 'lucide-react';

export default function Vilkar() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <ScrollText className="header-title-icon text-primary-700" />
            <h1 className="header-title">Brukervilkår</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="card-professional text-slate-700 space-y-6">
          <p className="text-sm text-slate-500">Sist oppdatert: 6. august 2026</p>

          <p>
            Disse vilkårene gjelder når du bruker RettBot+. Ved å bruke tjenesten godtar du dem. Les
            dem gjennom – de er skrevet så tydelig vi klarer.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Hva RettBot+ er – og ikke er</h2>
            <p>
              RettBot+ er et digitalt verktøy som bruker kunstig intelligens til å gi generell
              juridisk informasjon, hjelpe deg å forstå norsk lov, og lage utkast til dokumenter.
              RettBot+ er <strong>ikke</strong> en advokat, gir ikke individuell juridisk rådgivning,
              og er ikke en erstatning for å snakke med en advokat eller offentlig rettshjelp i en
              konkret sak.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Ingen garanti for riktighet</h2>
            <p>
              Svar fra AI kan være ufullstendige eller feil. Vi kan ikke garantere at informasjonen
              er korrekt, oppdatert eller passer din situasjon. Du er selv ansvarlig for
              beslutninger du tar. Sjekk alltid viktige opplysninger mot en offisiell kilde (for
              eksempel Lovdata) eller en advokat før du handler.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Ditt ansvar som bruker</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Du må bruke tjenesten lovlig og ikke til å skade andre.</li>
              <li>Du er ansvarlig for innholdet du legger inn, og for å ha rett til å dele det.</li>
              <li>Del ikke mer sensitiv informasjon enn nødvendig.</li>
              <li>Er du under 18 år, bør du ha samtykke fra en voksen.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Data og personvern</h2>
            <p>
              Når du bruker AI-funksjonene, sendes teksten du legger inn til vår AI-leverandør
              (Anthropic) for behandling. Hvordan vi håndterer data står i{' '}
              <Link to="/personvern" className="text-primary-700 underline">personvernerklæringen</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Ansvarsbegrensning</h2>
            <p>
              Så langt loven tillater, er RettBot+ ikke ansvarlig for tap eller skade som følger av
              bruk av tjenesten, inkludert beslutninger tatt på grunnlag av informasjon fra
              tjenesten. Tjenesten leveres «som den er».
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Endringer</h2>
            <p>
              Vi kan endre tjenesten og disse vilkårene. Vesentlige endringer vil bli synlige her,
              med ny «sist oppdatert»-dato.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Kontakt</h2>
            <p>Spørsmål om vilkårene? Kontakt: <strong>[sett inn kontakt-e-post]</strong>.</p>
          </section>
        </div>

        <p className="mt-6 text-center">
          <Link to="/personvern" className="text-primary-700 underline hover:text-primary-800">Personvernerklæring</Link>
        </p>
      </main>
    </div>
  );
}
