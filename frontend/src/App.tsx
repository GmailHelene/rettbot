import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import PenaltiesLookup from './pages/PenaltiesLookup';
import RightsProtection from './pages/RightsProtection';
import EvidenceAnalysis from './pages/EvidenceAnalysis';
import LegalResearch from './pages/LegalResearch';
import DefenseStrategy from './pages/DefenseStrategy';
import DocumentGenerator from './pages/DocumentGenerator';
import CorruptionAssessment from './pages/CorruptionAssessment';
import EvidenceUpload from './pages/EvidenceUpload';
import LegalChat from './pages/LegalChat';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyCases from './pages/MyCases';
import Personvern from './pages/Personvern';
import CookieConsent from './components/CookieConsent';
import ProtectedRoute from './components/ProtectedRoute';
import SiteFooter from './components/SiteFooter';
import TitleManager from './components/TitleManager';
import TopNav from './components/TopNav';
import NotFound from './pages/NotFound';
import Eskalering from './pages/Eskalering';
import Maler from './pages/Maler';
import Fristkalkulator from './pages/Fristkalkulator';
import Innsynskrav from './pages/Innsynskrav';
import KomIGang from './pages/KomIGang';
import Eksempler from './pages/Eksempler';
import MinKonto from './pages/MinKonto';
import Vilkar from './pages/Vilkar';
import Tidslinje from './pages/Tidslinje';

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
        <div id="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Dashboard (åpen) */}
          <Route path="/app" element={<Dashboard />} />

          {/* AI-verktøy – krever innlogging (beskytter mot misbruk av Anthropic-API-et) */}
          <Route path="/evidence-analysis" element={<ProtectedRoute><EvidenceAnalysis /></ProtectedRoute>} />
          <Route path="/legal-research" element={<ProtectedRoute><LegalResearch /></ProtectedRoute>} />
          <Route path="/defense-strategy" element={<ProtectedRoute><DefenseStrategy /></ProtectedRoute>} />
          <Route path="/document-generator" element={<ProtectedRoute><DocumentGenerator /></ProtectedRoute>} />
          <Route path="/penalties" element={<ProtectedRoute><PenaltiesLookup /></ProtectedRoute>} />
          <Route path="/rights-protection" element={<ProtectedRoute><RightsProtection /></ProtectedRoute>} />
          <Route path="/corruption-assessment" element={<ProtectedRoute><CorruptionAssessment /></ProtectedRoute>} />
          <Route path="/evidence-upload" element={<ProtectedRoute><EvidenceUpload /></ProtectedRoute>} />
          <Route path="/legal-chat" element={<ProtectedRoute><LegalChat /></ProtectedRoute>} />
          
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

          {/* Ekte 404-side for ukjente adresser */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
        <SiteFooter />
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
