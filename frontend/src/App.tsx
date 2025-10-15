import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
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
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
