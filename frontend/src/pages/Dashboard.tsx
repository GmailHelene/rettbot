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
  Briefcase,
  MessageSquare,
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
    intro: 'Forstå hva politiet og myndighetene faktisk har lov til – og hva du kan gjøre.',
    features: [
      {
        id: 'rights',
        title: 'Rettighetsvern og klage',
        description: 'Kjenn rettighetene dine, og få hjelp til å skrive en klage når de brytes.',
        icon: <ShieldAlert className="icon-md" />,
        path: '/rights-protection',
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
      {
        id: 'trial',
        title: 'Rettssak-simulator',
        description: 'Se hvordan saken kan spille seg ut, og forbered deg på argumentene.',
        icon: <Briefcase className="icon-md" />,
        path: '/trial-simulator',
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
        description: 'Lag klage, anke eller brev til rett instans – ferdig formulert.',
        icon: <FileText className="icon-md" />,
        path: '/document-generator',
      },
    ],
  },
  {
    title: 'Slå opp og spør',
    features: [
      {
        id: 'research',
        title: 'Juridisk oppslag',
        description: 'Søk i norsk lov og få forklaring på klarspråk – med henvisninger.',
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
        <ChevronRight className="icon-sm text-slate-400 group-hover:text-slate-600 transition-colors" />
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
              RettBot+ hjelper deg å forstå norsk lov, dokumentere saken din og skrive klagen selv –
              når du står mot politi, myndigheter eller et system som ikke lytter.
            </p>
            <p className="mt-3 text-primary-200 text-sm">
              Ikke en advokat. Et verktøy som gjør deg tryggere på din egen sak.
            </p>
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

        {/* Ansvarsfraskrivelse */}
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            <strong>Viktig:</strong> RettBot+ gir generell, AI-generert juridisk informasjon og er
            ikke en erstatning for personlig rådgivning fra en advokat. Ved en konkret sak bør du
            kontakte en advokat eller offentlig rettshjelp.
          </p>
        </div>
      </main>
    </div>
  );
}
