import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dagspass from './pages/Dagspass';
import DagspassKvittering from './pages/DagspassKvittering';
import NotFound from './pages/NotFound';
import CookieConsent from './components/CookieConsent';
import ProtectedRoute from './components/ProtectedRoute';
import SiteFooter from './components/SiteFooter';
import TitleManager from './components/TitleManager';
import TopNav from './components/TopNav';
import AccessBanner from './components/AccessBanner';
import AiConsentGate from './components/AiConsentGate';

// Rute-basert code splitting: tunge sider lastes først når de faktisk besøkes.
// Dette holder den første JS-pakken (forside + innlogging) liten og rask.
const PenaltiesLookup = lazy(() => import('./pages/PenaltiesLookup'));
const RightsProtection = lazy(() => import('./pages/RightsProtection'));
const EvidenceAnalysis = lazy(() => import('./pages/EvidenceAnalysis'));
const LegalResearch = lazy(() => import('./pages/LegalResearch'));
const DefenseStrategy = lazy(() => import('./pages/DefenseStrategy'));
const DocumentGenerator = lazy(() => import('./pages/DocumentGenerator'));
const CorruptionAssessment = lazy(() => import('./pages/CorruptionAssessment'));
const EvidenceUpload = lazy(() => import('./pages/EvidenceUpload'));
const LegalChat = lazy(() => import('./pages/LegalChat'));
const MyCases = lazy(() => import('./pages/MyCases'));
const Personvern = lazy(() => import('./pages/Personvern'));
const Eskalering = lazy(() => import('./pages/Eskalering'));
const Maler = lazy(() => import('./pages/Maler'));
const Fristkalkulator = lazy(() => import('./pages/Fristkalkulator'));
const Innsynskrav = lazy(() => import('./pages/Innsynskrav'));
const KomIGang = lazy(() => import('./pages/KomIGang'));
const Eksempler = lazy(() => import('./pages/Eksempler'));
const Veivisere = lazy(() => import('./pages/Veivisere'));
const Veiviser = lazy(() => import('./pages/Veiviser'));
const MinKonto = lazy(() => import('./pages/MinKonto'));
const Vilkar = lazy(() => import('./pages/Vilkar'));
const Tidslinje = lazy(() => import('./pages/Tidslinje'));

function PageFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500"
      role="status"
      aria-live="polite"
    >
      Laster …
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TitleManager />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow focus:text-primary-700"
        >
          Hopp til innhold
        </a>
        <TopNav />
        <AccessBanner />
        <div id="main-content">
        <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard (åpen) */}
          <Route path="/app" element={<Dashboard />} />

          {/* AI-verktøy - krever innlogging (beskytter mot misbruk av Anthropic-API-et) */}
          <Route path="/evidence-analysis" element={<ProtectedRoute><AiConsentGate><EvidenceAnalysis /></AiConsentGate></ProtectedRoute>} />
          <Route path="/legal-research" element={<ProtectedRoute><AiConsentGate><LegalResearch /></AiConsentGate></ProtectedRoute>} />
          <Route path="/defense-strategy" element={<ProtectedRoute><AiConsentGate><DefenseStrategy /></AiConsentGate></ProtectedRoute>} />
          <Route path="/document-generator" element={<ProtectedRoute><AiConsentGate><DocumentGenerator /></AiConsentGate></ProtectedRoute>} />
          <Route path="/penalties" element={<ProtectedRoute><PenaltiesLookup /></ProtectedRoute>} />
          <Route path="/rights-protection" element={<ProtectedRoute><AiConsentGate><RightsProtection /></AiConsentGate></ProtectedRoute>} />
          <Route path="/corruption-assessment" element={<ProtectedRoute><AiConsentGate><CorruptionAssessment /></AiConsentGate></ProtectedRoute>} />
          <Route path="/evidence-upload" element={<ProtectedRoute><EvidenceUpload /></ProtectedRoute>} />
          <Route path="/legal-chat" element={<ProtectedRoute><AiConsentGate><LegalChat /></AiConsentGate></ProtectedRoute>} />

          <Route path="/dagspass" element={<ProtectedRoute><Dagspass /></ProtectedRoute>} />
          <Route path="/dagspass/kvittering" element={<ProtectedRoute><DagspassKvittering /></ProtectedRoute>} />

          {/* Auth-required routes */}
          <Route
            path="/my-cases"
            element={
              <ProtectedRoute>
                <MyCases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/min-konto"
            element={
              <ProtectedRoute>
                <MinKonto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tidslinje"
            element={
              <ProtectedRoute>
                <Tidslinje />
              </ProtectedRoute>
            }
          />

          {/* Personvern */}
          <Route path="/personvern" element={<Personvern />} />

          {/* Brukervilkår */}
          <Route path="/vilkar" element={<Vilkar />} />

          {/* Eskaleringsguide */}
          <Route path="/hvor-klager-du" element={<Eskalering />} />

          {/* Dokumentmaler */}
          <Route path="/maler" element={<Maler />} />

          {/* Fristkalkulator */}
          <Route path="/fristkalkulator" element={<Fristkalkulator />} />

          {/* Innsynskrav-veiviser */}
          <Route path="/innsynskrav" element={<Innsynskrav />} />

          {/* Kom i gang */}
          <Route path="/kom-i-gang" element={<KomIGang />} />

          {/* Eksempler */}
          <Route path="/eksempler" element={<Eksempler />} />

          {/* Guidede veivisere */}
          <Route path="/veivisere" element={<Veivisere />} />
          <Route path="/veivisere/:id" element={<Veiviser />} />

          {/* Ekte 404-side for ukjente adresser */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </div>
        <SiteFooter />
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
