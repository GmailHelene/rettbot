import { Link } from 'react-router-dom';
import {
  Scale,
  FileSearch,
  Shield,
  FileText,
  AlertTriangle,
  Upload,
  Gavel,
  ShieldAlert,
  MessageSquare,
  BookOpen,
  Footprints,
  Compass,
  ClipboardList,
  CalendarClock,
  FileKey,
  ListOrdered,
  ChevronRight,
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

interface Group {
  title: string;
  intro?: string;
  features: Feature[];
}

const groups: Group[] = [
  {
    title: 'Rettighetene dine',
    intro: 'Forstå hva politiet og myndighetene faktisk har lov til - og hva du kan gjøre.',
    features: [
      {
        id: 'veivisere',
        title: 'Veivisere',
        description: 'Steg for steg gjennom en situasjon: klage på politiet, anke vedtak, dokumentér, varsling.',
        icon: <Footprints className="icon-md" />,
        path: '/veivisere',
      },
      {
        id: 'escalation',
        title: 'Hvor klager du?',
        description: 'Oversikt over norske klage- og tilsynsorganer - finn rett instans for saken din.',
        icon: <Compass className="icon-md" />,
        path: '/hvor-klager-du',
      },
      {
        id: 'rights',
        title: 'Rettighetsvern og klage',
        description: 'Kjenn rettighetene dine, og få hjelp til å skrive en klage når de brytes.',
        icon: <ShieldAlert className="icon-md" />,
        path: '/rights-protection',
      },
      {
        id: 'deadline',
        title: 'Fristkalkulator',
        description: 'Regn ut når klage- eller ankefristen din går ut - ikke gå glipp av fristen.',
        icon: <CalendarClock className="icon-md" />,
        path: '/fristkalkulator',
      },
      {
        id: 'access',
        title: 'Innsynskrav',
        description: 'Be om innsyn i egne personopplysninger eller offentlige dokumenter - ferdig brev.',
        icon: <FileKey className="icon-md" />,
        path: '/innsynskrav',
      },
      {
        id: 'examples',
        title: 'Eksempler',
        description: 'Slik ser en god klage ut, vanlige feil, og hva som ofte fungerer.',
        icon: <BookOpen className="icon-md" />,
        path: '/eksempler',
      },
      {
        id: 'penalties',
        title: 'Strafferammer',
        description: 'Hva sier loven, og hva risikerer du? Slå opp strafferammer etter norsk lov.',
        icon: <Gavel className="icon-md" />,
        path: '/penalties',
      },
      {
        id: 'strategy',
        title: 'Forsvarsstrategi',
        description: 'Bygg en forsvarsstrategi ut fra faktum, tiltale og bevis i din sak.',
        icon: <Shield className="icon-md" />,
        path: '/defense-strategy',
      },
    ],
  },
  {
    title: 'Varsling og systemkritikk',
    intro: 'Når du står mot et system som ikke lytter.',
    features: [
      {
        id: 'corruption',
        title: 'Varsling og korrupsjon',
        description: 'Mistanke om maktmisbruk eller korrupsjon? Vurder saken og finn rett instans å varsle.',
        icon: <AlertTriangle className="icon-md" />,
        path: '/corruption-assessment',
      },
    ],
  },
  {
    title: 'Bevis og dokumenter',
    features: [
      {
        id: 'evidence',
        title: 'Bevisanalyse',
        description: 'Få en vurdering av hvor sterke bevisene dine er, og hva som mangler.',
        icon: <FileSearch className="icon-md" />,
        path: '/evidence-analysis',
      },
      {
        id: 'upload',
        title: 'Last opp bevis',
        description: 'Lagre dokumenter og filer trygt (kryptert), knyttet til saken din.',
        icon: <Upload className="icon-md" />,
        path: '/evidence-upload',
      },
      {
        id: 'documents',
        title: 'Dokumentgenerator',
        description: 'Lag klage, anke eller brev til rett instans - ferdig formulert.',
        icon: <FileText className="icon-md" />,
        path: '/document-generator',
      },
      {
        id: 'templates',
        title: 'Maler',
        description: 'Ferdige skjeletter for klage, anke, anmeldelse og innsyn - fyll ut og last ned.',
        icon: <ClipboardList className="icon-md" />,
        path: '/maler',
      },
      {
        id: 'timeline',
        title: 'Saks-tidslinje',
        description: 'Dokumentér hva som skjedde og når - bygg en oversikt over saken din.',
        icon: <ListOrdered className="icon-md" />,
        path: '/tidslinje',
      },
    ],
  },
  {
    title: 'Slå opp og spør',
    features: [
      {
        id: 'research',
        title: 'Juridisk oppslag',
        description: 'Søk i norsk lov og få forklaring på klarspråk - med henvisninger.',
        icon: <Scale className="icon-md" />,
        path: '/legal-research',
      },
      {
        id: 'chat',
        title: 'Juridisk chat',
        description: 'Still spørsmål om saken din og få veiledning på vanlig norsk.',
        icon: <MessageSquare className="icon-md" />,
        path: '/legal-chat',
      },
    ],
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link
      to={feature.path}
      className="card-professional group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-50 text-primary-700 rounded-lg group-hover:bg-primary-100 transition-colors">
          {feature.icon}
        </div>
        <ChevronRight className="icon-sm text-slate-500 group-hover:text-slate-600 transition-colors" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-slate-800 group-hover:text-slate-900">
        {feature.title}
      </h3>
      <p className="text-sm text-slate-600">{feature.description}</p>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-10 rounded-2xl bg-primary-700 text-white px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Kjenn rettighetene dine. Stå stødig mot systemet.
            </h1>
            <p className="mt-4 text-primary-100 text-lg">
              RettBot+ hjelper deg å forstå norsk lov, dokumentere saken din og skrive klagen selv -
              når du står mot politi, myndigheter eller et system som ikke lytter.
            </p>
            <p className="mt-3 text-primary-200 text-sm">
              Ikke en advokat. Et verktøy som gjør deg tryggere på din egen sak.
            </p>
            <Link
              to="/kom-i-gang"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white text-primary-700 font-semibold px-5 py-3 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Kom i gang
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Grupperte funksjoner */}
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">{group.title}</h2>
                {group.intro && <p className="mt-1 text-sm text-slate-600">{group.intro}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.features.map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Pris / dagspass */}
        <div className="mt-10 rounded-xl border border-primary-200 bg-primary-50 p-6 sm:flex sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">14 dager gratis</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Nye brukere får <strong>14 dager full tilgang gratis</strong> - ingen kortinfo, ingenting som
              fornyes. Kjernen (forstå vedtak, frister, maler, innsynskrav) er alltid gratis. Trenger du mer
              AI-hjelp etter prøveperioden, får du et <strong>dagspass: 24 timer full tilgang for 79 kr</strong>.
            </p>
          </div>
          <Link to="/dagspass" className="btn-primary whitespace-nowrap mt-4 sm:mt-0 inline-block">
            Se dagspass
          </Link>
        </div>

        {/* Ærlige begrensninger */}
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Dette kan RettBot+ ikke</h2>
          <p className="text-sm text-slate-600 mb-4">
            Vi vil heller være ærlige enn å love for mye. Verktøyet hjelper deg å forstå og
            dokumentere saken din selv, men det har klare grenser:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Det kan ikke avgjøre om du «vinner» saken, eller garantere et utfall.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Det kan ikke tolke bevisene dine eller vurdere hvor sterke de er i en domstol.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Det erstatter ikke en advokat i alvorlige saker (straffesak, barnevern, tvangssaker).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              AI-en kan ta feil. Kontroller alltid lover, paragrafer og frister mot Lovdata.
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            Ved en konkret, alvorlig sak: kontakt advokat eller offentlig rettshjelp. Se{' '}
            <Link to="/hvor-klager-du" className="text-primary-700 underline hover:text-primary-800">
              hvor du klager
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
