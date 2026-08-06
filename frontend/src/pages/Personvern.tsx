import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Personvern() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <ShieldCheck className="header-title-icon text-primary-700" />
            <h1 className="header-title">Personvernerklæring</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="card-professional prose-sm text-slate-700 space-y-6">
          <p className="text-sm text-slate-500">Sist oppdatert: 6. august 2026</p>

          <section>
            <p>
              Denne erklæringen forklarer hvilke opplysninger RettBot+ behandler om deg, hvorfor, og
              hvilke rettigheter du har. Vi prøver å samle inn så lite som mulig, og å være ærlige om
              hva som faktisk skjer med dataene dine.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Behandlingsansvarlig</h2>
            <p>
              Grønberg Tech Solutions er behandlingsansvarlig for personopplysningene som behandles
              gjennom RettBot+. Kontakt for personvernspørsmål:{' '}
              <a href="mailto:helene721@gmail.com" className="text-primary-700 underline hover:text-primary-800">
                helene721@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Hvilke opplysninger vi behandler</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Konto:</strong> e-postadresse, navn og et hashet passord (vi ser aldri passordet i klartekst).</li>
              <li><strong>Saker og bevis:</strong> tekst, dokumenter og filer du selv legger inn. Dette lagres kryptert på serveren.</li>
              <li><strong>Teknisk:</strong> vanlige tjenerlogger (tidspunkt, feilmeldinger). Vi bruker ingen sporings- eller analyseverktøy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Formål og rettslig grunnlag</h2>
            <p>
              Vi behandler opplysningene for å levere tjenesten du ber om (konto, saksbehandling,
              AI-assistert juridisk arbeid). Rettslig grunnlag er oppfyllelse av avtalen med deg
              (GDPR art. 6 nr. 1 b) og ditt samtykke der du selv legger inn sensitive opplysninger.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Sensitive opplysninger og straffedomsopplysninger</h2>
            <p>
              I sakene du legger inn, kan det forekomme særlige kategorier av personopplysninger
              (GDPR art. 9 – for eksempel helse) og opplysninger om straffedommer og lovovertredelser
              (GDPR art. 10). Dette er opplysninger du selv velger å dele om deg selv.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Behandlingen bygger på ditt <strong>uttrykkelige samtykke</strong> (art. 9 nr. 2 bokstav a) og
                på at behandlingen er nødvendig for å fastsette, gjøre gjeldende eller forsvare rettskrav
                (art. 9 nr. 2 bokstav f).
              </li>
              <li>
                For straffedomsopplysninger (art. 10) behandler vi disse på vegne av deg som registrert, med
                grunnlag i samtykke og for å ivareta dine egne rettskrav, jf. personopplysningsloven § 11.
              </li>
              <li>
                Del ikke mer sensitiv informasjon enn det saken din faktisk krever. Du kan når som helst
                trekke samtykket tilbake og be om sletting.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">AI-behandling hos underleverandør</h2>
            <p>
              De juridiske funksjonene bruker en språkmodell fra <strong>Anthropic</strong> (Claude).
              Når du bruker en AI-funksjon, sendes teksten du har lagt inn (for eksempel saksfakta,
              spørsmål eller bevisbeskrivelser) til Anthropic for behandling, og svaret sendes tilbake.
              Anthropic er databehandler for dette, regulert av en databehandleravtale (DPA).
            </p>
            <p>
              <strong>Overføring til USA:</strong> Anthropic er etablert i USA, og opplysningene du sender
              til AI-funksjonene blir derfor overført til et tredjeland utenfor EØS. Overføringen er sikret
              gjennom EU-kommisjonens standard personvernbestemmelser (Standard Contractual Clauses / SCC)
              som del av databehandleravtalen med Anthropic. Du bør likevel være bevisst på hva du legger
              inn – unngå å dele mer sensitiv informasjon enn saken din faktisk krever.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Brukes dataene dine til å trene AI?</h2>
            <p>
              Nei. Anthropic bruker som standard ikke det du sender inn via API-et (spørsmål, saksfakta,
              bevisbeskrivelser) til å trene språkmodellene sine. Vi bruker heller ikke innholdet ditt til
              å trene noen egen modell.
            </p>
            <p>
              <strong>Logging:</strong> Vanlige tjenerlogger inneholder tekniske opplysninger (tidspunkt,
              feilmeldinger, hvilken funksjon som ble brukt), ikke selve saksinnholdet ditt. Vi logger ikke
              teksten du legger inn i AI-funksjonene.
            </p>
            <p>
              <strong>Lokal/offline bruk:</strong> RettBot+ er per i dag en skytjeneste. Den kan ikke kjøres
              lokalt på din egen maskin, og AI-delen krever at teksten sendes til Anthropic for behandling.
              Vil du holde noe helt privat, så la være å legge det inn – bruk heller delene som ikke
              involverer AI (for eksempel fristkalkulator, maler og innsynskrav-veiviseren).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Lagring og sikkerhet</h2>
            <p>
              Saksdata krypteres på serveren før lagring. Merk: dette er <strong>server-side</strong>
              {' '}kryptering – serveren har krypteringsnøkkelen. Tjenesten er per i dag ikke
              zero-knowledge (klient-side) kryptert. Overføring skjer over HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Lagringstid</h2>
            <p>
              Vi lagrer konto- og saksdata så lenge du har en aktiv konto. Du kan når som helst be om
              at kontoen og tilhørende data slettes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Informasjonskapsler og lokal lagring</h2>
            <p>
              RettBot+ setter ingen sporings- eller markedsføringskapsler. Vi bruker kun nødvendig
              lokal lagring i nettleseren (localStorage) for å holde deg innlogget.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Dine rettigheter</h2>
            <p>Du har rett til innsyn, retting, sletting og dataportabilitet. Ta kontakt for å benytte rettighetene.</p>
            <p>
              Er du uenig i hvordan vi behandler opplysningene dine, kan du klage til{' '}
              <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer"
                className="text-primary-700 underline hover:text-primary-800">Datatilsynet</a>.
            </p>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <strong>Ikke juridisk rådgivning:</strong> RettBot+ gir generell, AI-generert
              informasjon og erstatter ikke personlig rådgivning fra en advokat.
            </p>
          </section>
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-primary-700 underline hover:text-primary-800">← Tilbake til forsiden</Link>
        </p>
      </main>
    </div>
  );
}
