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
  Briefcase
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export default function Dashboard() {
  const features: Feature[] = [
    {
      id: 'evidence',
      title: 'Bevisanalyse',
      description: 'AI-drevet analyse av juridiske bevis og dokumenter',
      icon: <FileSearch className="w-8 h-8" />,
      path: '/evidence-analysis',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'research',
      title: 'Juridisk Research',
      description: 'Søk i norsk lov og juridisk praksis',
      icon: <Scale className="w-8 h-8" />,
      path: '/legal-research',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'strategy',
      title: 'Forsvarsstrategi',
      description: 'Generer forsvarsstrategi basert på saksdetaljer',
      icon: <Shield className="w-8 h-8" />,
      path: '/defense-strategy',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'documents',
      title: 'Dokumentgenerator',
      description: 'Lag juridiske dokumenter automatisk',
      icon: <FileText className="w-8 h-8" />,
      path: '/document-generator',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'penalties',
      title: 'Strafferamme Lookup',
      description: 'Se strafferammer etter norsk lov',
      icon: <Gavel className="w-8 h-8" />,
      path: '/penalties',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'rights',
      title: 'Rettighetssvern',
      description: 'Rapporter brudd på rettigheter og generer klager',
      icon: <ShieldAlert className="w-8 h-8" />,
      path: '/rights-protection',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'trial',
      title: 'Rettssal Simulator',
      description: 'Simuler rettsaker med ulike advokatkvaliteter',
      icon: <Briefcase className="w-8 h-8" />,
      path: '/trial-simulator',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'corruption',
      title: 'Korrupsjonsvurdering',
      description: 'Analyser potensielle korrupsjonssaker',
      icon: <AlertTriangle className="w-8 h-8" />,
      path: '/corruption-assessment',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'upload',
      title: 'Last opp Bevis',
      description: 'Sikker opplasting av dokumenter og filer',
      icon: <Upload className="w-8 h-8" />,
      path: '/evidence-upload',
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'chat',
      title: 'AI Juridisk Chat',
      description: 'Chat med AI juridisk assistent',
      icon: <MessageSquare className="w-8 h-8" />,
      path: '/legal-chat',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                RettBot+ Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                AI-drevet juridisk plattform med zero-knowledge sikkerhet
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status: <span className="text-green-600 font-semibold">Online</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Velkommen til RettBot+</h2>
          <p className="text-blue-100">
            Velg en funksjon nedenfor for å komme i gang med AI-assistert juridisk arbeid.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    {feature.icon}
                  </div>
                  <svg
                    className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/90">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* API Status */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            API Endpoints Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'evidence/analyze',
              'legal/research',
              'defense/strategy',
              'legal/document',
              'legal/penalties',
              'rights/violations',
              'rights/appeal',
              'trial/simulate',
              'corruption/assess',
              'evidence/upload'
            ].map((endpoint) => (
              <div
                key={endpoint}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  /api/{endpoint}
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            RettBot+ © 2025 | Zero-Knowledge AI Legal Defense Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
