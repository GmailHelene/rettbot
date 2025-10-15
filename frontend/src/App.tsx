import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PenaltiesLookup from './pages/PenaltiesLookup';
import TrialSimulator from './pages/TrialSimulator';
import RightsProtection from './pages/RightsProtection';

// Placeholder components - we'll build these next
const EvidenceAnalysis = () => <div className="p-8">Evidence Analysis - Coming Soon</div>;
const LegalResearch = () => <div className="p-8">Legal Research - Coming Soon</div>;
const DefenseStrategy = () => <div className="p-8">Defense Strategy - Coming Soon</div>;
const DocumentGenerator = () => <div className="p-8">Document Generator - Coming Soon</div>;
const CorruptionAssessment = () => <div className="p-8">Corruption Assessment - Coming Soon</div>;
const EvidenceUpload = () => <div className="p-8">Evidence Upload - Coming Soon</div>;
const LegalChat = () => <div className="p-8">Legal Chat - Coming Soon</div>;

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
