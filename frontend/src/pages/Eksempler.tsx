import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import NesteSteg from '../components/NesteSteg';
import FeedbackWidget from '../components/FeedbackWidget';

/**
 * Anonymiserte, illustrative eksempler. Ingen ekte saker - strukturer du kan
 * tilpasse selv. Bygger tillit ved å vise hva som faktisk funker, uten å love
 * for mye.
 */
export default function Eksempler() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary-50 text-primary-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="header-title">Eksempler</h1>
              <p className="header-subtitle">Slik ser en god klage ut, og hva som ofte feiler</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Eksemplene under er <strong>illustrasjoner</strong>, ikke ekte saker. De viser strukturen i
          en god klage så du kan tilpasse den til din egen situasjon. Navn, datoer og saksnummer er
          oppdiktet.
        </div>

        {/* Anatomien i en god klage */}
        <section className="card-professional">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Anatomien i en god klage</h2>
          <p className="text-slate-600 text-sm mb-4">
            En klage som blir tatt seriøst, har som regel de samme delene. Rekkefølgen betyr mindre
            enn at delene er der:
          </p>
          <ol className="space-y-3 text-sm text-slate-700">
            <li><strong>1. Hvem og hva:</strong> Navnet ditt, hva du klager på, og saksnummer/vedtaksdato hvis du har det.</li>
            <li><strong>2. Hva vedtaket sier:</strong> Én til to setninger om avgjørelsen du er uenig i.</li>
            <li><strong>3. Hvorfor du er uenig:</strong> Konkret. Vis til faktum og til paragrafen eller regelen du mener er brutt eller feil brukt.</li>
            <li><strong>4. Hva du krever:</strong> Tydelig. «Jeg ber om at vedtaket oppheves» / «at saken behandles på nytt». Ikke la instansen gjette.</li>
            <li><strong>5. Vedlegg:</strong> List opp dokumentene du legger ved (vedtak, korrespondanse, kvitteringer).</li>
            <li><strong>6. Dato og signatur.</strong></li>
          </ol>
        </section>

        {/* Illustrasjon 1 */}
        <section className="card-professional">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Eksempel 1: klage på henleggelse</h2>
            <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">illustrasjon</span>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-line font-mono leading-relaxed">
{`Til: Statsadvokaten i [region]
Fra: [Navn], [adresse]
Dato: 14.03.2026
Gjelder: Klage på henleggelse - politiets sak nr. [XX-XXXXXX]

Jeg klager på politiets beslutning av 28.02.2026 om å henlegge saken
etter bevisets stilling.

Grunnlag:
- Det ble aldri innhentet [konkret bevis, f.eks. overvåkningsvideo] som
  var tilgjengelig og som jeg pekte på i anmeldelsen.
- Vitnet [rolle, ikke navn] ble ikke avhørt.

Jeg ber om at henleggelsen omgjøres og at etterforskningen gjenopptas,
jf. straffeprosessloven § 59 a om klage på henleggelse.

Vedlegg: kopi av anmeldelse, e-post til etterforsker 05.02.2026.

[Signatur]`}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Legg merke til: den er kort, viser til et <strong>konkret</strong> bevis som mangler, og
            sier tydelig hva som kreves. Ingen sinte utrop. Klagefristen på henleggelse er tre uker -
            regn den ut før du sender.
          </p>
        </section>

        {/* Illustrasjon 2 */}
        <section className="card-professional">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Eksempel 2: klage på forvaltningsvedtak</h2>
            <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">illustrasjon</span>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-line font-mono leading-relaxed">
{`Til: [Etaten som fattet vedtaket]
Fra: [Navn], [fødselsnr./saksnr.]
Dato: 14.03.2026
Gjelder: Klage på vedtak av 20.02.2026, saksnr. [XXXX]

Jeg klager på vedtaket om [avslag på ...].

Jeg mener vedtaket bygger på feil faktum: [kort, konkret]. Etaten har
ikke vurdert [dokumentet/opplysningen] jeg sendte inn 10.02.2026.

Jeg ber om at vedtaket omgjøres. Dersom dere opprettholder vedtaket,
ber jeg om at klagen sendes videre til [klageinstans] for behandling.

Jeg ber samtidig om innsyn i alle dokumentene i saken, jf.
forvaltningsloven § 18.

Vedlegg: [liste]

[Signatur]`}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Her bruker du to grep samtidig: du klager, og du ber om innsyn. Innsyn tidlig gir deg
            dokumentene du trenger for å underbygge klagen. Klagefristen på forvaltningsvedtak er som
            regel tre uker fra du mottok vedtaket.
          </p>
        </section>

        {/* Vanlige feil */}
        <section className="card-professional">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Vanlige feil
          </h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Å vente for lenge. Fristen er ofte tre uker, og en oversittet frist stopper saken uansett hvor god den er.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Å skrive en lang, følelsesladd tekst uten struktur. Saksbehandleren leser mange klager og leter etter det konkrete.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Å ikke vise til vedtaket, datoen eller paragrafen. Da blir det vanskelig å behandle.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Å ikke si tydelig hva du krever. «Jeg er misfornøyd» er ikke et krav.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Å sende til feil instans. Sjekk hvor klagen faktisk skal.</li>
          </ul>
        </section>

        {/* Hva som funker */}
        <section className="card-professional">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Hva som ofte fungerer
          </h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span> Hold deg til fakta og datoer. Det som kan dokumenteres, veier tyngst.</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span> Vis til den konkrete paragrafen eller regelen, ikke bare at noe «føles urett».</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span> Be om innsyn tidlig. Da får du sakens dokumenter og ser hva de faktisk har lagt til grunn.</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span> Vær kort og konkret på hva du krever.</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span> Ta alt skriftlig, og ta vare på kopier. En tidslinje hjelper deg å huske rekkefølgen.</li>
          </ul>
        </section>

        <div className="rounded-lg border border-primary-100 bg-primary-50 p-4 flex items-start gap-2.5">
          <Lightbulb className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-800">
            Dette er generelle eksempler, ikke juridisk rådgivning. I en alvorlig sak bør du få en
            advokat eller offentlig rettshjelp til å se over klagen før du sender den.
          </p>
        </div>

        <NesteSteg
          items={[
            { label: 'Bruk en mal', to: '/maler' },
            { label: 'Hvor klager du?', to: '/hvor-klager-du' },
            { label: 'Regn ut fristen', to: '/fristkalkulator' },
          ]}
        />

        <FeedbackWidget tool="eksempler" className="mt-8" />
      </main>
    </div>
  );
}
