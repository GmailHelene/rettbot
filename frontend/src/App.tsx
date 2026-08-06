import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import PenaltiesLookup from './pages/PenaltiesLookup';
import TrialSimulator from './pages/TrialSimulator';
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
          
          {/* App routes (available to all) */}
          <Route path="/app" element={<Dashboard />} />
          <Route path="/evidence-analysis" element={<EvidenceAnalysis />} />
          <Route path="/legal-research" element={<LegalResearch />} />
          <Route path="/defense-strategy" element={<DefenseStrategy />} />
          <Route path="/document-generator" element={<DocumentGenerator />} />
          <Route path="/penalties" element={<PenaltiesLookup />} />
          <Route path="/rights-protection" element={<RightsProtection />} />
          <Route path="/trial-simulator" element={<TrialSimulator />} />
          <Route path="/corruption-assessment" element={<CorruptionAssessment />} />
          <Route path="/evidence-upload" element={<EvidenceUpload />} />
          <Route path="/legal-chat" element={<LegalChat />} />
          
          {/* Auth-required routes */}
          <Route
            path="/my-cases"
            element={
              <ProtectedRoute>
                <MyCases />
              </ProtectedRoute>
            }
          />

          {/* Personvern */}
          <Route path="/personvern" element={<Personvern />} />

          {/* Eskaleringsguide */}
          <Route path="/hvor-klager-du" element={<Eskalering />} />

          {/* Dokumentmaler */}
          <Route path="/maler" element={<Maler />} />

          {/* Fristkalkulator */}
          <Route path="/fristkalkulator" element={<Fristkalkulator />} />

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
