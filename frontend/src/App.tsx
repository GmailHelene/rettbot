import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TitleManager />
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

          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SiteFooter />
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
