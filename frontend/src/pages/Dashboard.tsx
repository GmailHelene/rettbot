import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  User,
  LogOut,
  LogIn,
  FolderOpen,
  ChevronRight
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
  const { user, isAuthenticated, logout } = useAuth();

  const features: Feature[] = [
    {
      id: 'evidence',
      title: 'Bevisanalyse',
      description: 'AI-drevet analyse av juridiske bevis og dokumenter',
      icon: <FileSearch className="icon-md" />,
      path: '/evidence-analysis',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'research',
      title: 'Juridisk Research',
      description: 'Søk i norsk lov og juridisk praksis',
      icon: <Scale className="icon-md" />,
      path: '/legal-research',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'strategy',
      title: 'Forsvarsstrategi',
      description: 'Generer forsvarsstrategi basert på saksdetaljer',
      icon: <Shield className="icon-md" />,
      path: '/defense-strategy',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'documents',
      title: 'Dokumentgenerator',
      description: 'Lag juridiske dokumenter automatisk',
      icon: <FileText className="icon-md" />,
      path: '/document-generator',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'penalties',
      title: 'Strafferamme Lookup',
      description: 'Se strafferammer etter norsk lov',
      icon: <Gavel className="icon-md" />,
      path: '/penalties',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'rights',
      title: 'Rettighetssvern',
      description: 'Rapporter brudd på rettigheter og generer klager',
      icon: <ShieldAlert className="icon-md" />,
      path: '/rights-protection',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'trial',
      title: 'Rettssal Simulator',
      description: 'Simuler rettsaker med ulike advokatkvaliteter',
      icon: <Briefcase className="icon-md" />,
      path: '/trial-simulator',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'corruption',
      title: 'Korrupsjonsvurdering',
      description: 'Analyser potensielle korrupsjonssaker',
      icon: <AlertTriangle className="icon-md" />,
      path: '/corruption-assessment',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'upload',
      title: 'Last opp Bevis',
      description: 'Sikker opplasting av dokumenter og filer',
      icon: <Upload className="icon-md" />,
      path: '/evidence-upload',
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'chat',
      title: 'AI Juridisk Chat',
      description: 'Chat med AI juridisk assistent',
      icon: <MessageSquare className="icon-md" />,
      path: '/legal-chat',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="header-professional">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="header-title">
                RettBot+ Dashboard
              </h1>
              <p className="header-subtitle">
                Profesjonell AI-drevet juridisk assistent
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-slate-700 px-3 py-2 bg-slate-100 rounded-md">
                    <User className="icon-sm" />
                    <span>{user?.full_name}</span>
                  </div>
                  <Link
                    to="/my-cases"
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FolderOpen className="icon-sm" />
                    <span>Mine Saker</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                  >
                    <LogOut className="icon-sm" />
                    <span>Logg ut</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <LogIn className="icon-sm" />
                    <span>Logg inn</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <User className="icon-sm" />
                    <span>Opprett konto</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="mb-8 card-professional">
          <h2 className="text-xl font-semibold mb-2 text-slate-800">Velkommen til RettBot+</h2>
          <p className="text-slate-600 text-sm">
            Velg en funksjon nedenfor for å komme i gang med AI-assistert juridisk arbeid.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className="card-professional group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  {feature.icon}
                </div>
                <ChevronRight className="icon-sm text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-slate-800 group-hover:text-slate-900">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </Link>
          ))}
        </div>

        {/* API Status */}
        <div className="mt-8 card-professional">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Shield className="icon-sm mr-2 text-slate-600" />
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
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <span className="text-sm text-slate-700 font-mono">
                  /api/{endpoint}
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-600">
            RettBot+ © 2025 | Zero-Knowledge AI Legal Defense Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
