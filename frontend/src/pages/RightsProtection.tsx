import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Send, AlertTriangle } from 'lucide-react';
import NesteSteg from '../components/NesteSteg';
import { useAuth } from '../contexts/AuthContext';
import AiDisclaimer from '../components/AiDisclaimer';
import FeedbackWidget from '../components/FeedbackWidget';

interface ViolationResponse {
  violation_type: string;
  legal_basis: string[];
  severity: string;
  actions: string[];
  appeal_process: {
    deadline: string;
    authority: string;
    required_documents: string[];
  };
  template?: string;
}

export default function RightsProtection() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<ViolationResponse | null>(null);
  const [complaint, setComplaint] = useState('');

  const violationTypes = [
    { value: 'besøksforbud_avslag', label: 'Besøksforbud avslag - Politiet nektet søknad' },
    { value: 'politi_overgrep', label: 'Politi overgrep - Mishandling eller maktmisbruk' },
    { value: 'dommer_partisk', label: 'Partisk dommer - Urettferdig behandling i retten' },
    { value: 'nektet_dokumentinnsyn', label: 'Nektet dokumentinnsyn - Tilgang til sakspapirer' },
  ];

  const analyzeViolation = async () => {
    if (!selectedViolation || !description.trim()) {
      alert('Vennligst velg type krenkelse og beskriv situasjonen');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/rights/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          violation_type: selectedViolation,
          description: description,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Kunne ikke analysere krenkelsen. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const generateComplaint = async () => {
    if (!result) return;

    setLoading(true);
    setComplaint('');

    try {
      const response = await fetch('/api/rights/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          violation_type: selectedViolation,
          description: description,
          authority: result.appeal_process.authority,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setComplaint(data.complaint_text);
    } catch (error) {
      console.error('Error:', error);
      alert('Kunne ikke generere klage. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary-50 text-primary-700">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="header-title">Rettighetsvern og klage</h1>
              <p className="header-subtitle">Rapportér en krenkelse og få hjelp til klage</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AiDisclaimer className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skjema */}
          <div className="card-professional">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Rapportér krenkelse
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type krenkelse</label>
                <select
                  value={selectedViolation}
                  onChange={(e) => setSelectedViolation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="">Velg type krenkelse …</option>
                  {violationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beskriv situasjonen</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beskriv hva som skjedde, når det skjedde, og hvem som var involvert …"
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-y"
                />
              </div>

              <button
                onClick={analyzeViolation}
                disabled={loading || !selectedViolation || !description.trim()}
                className="w-full btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Analyserer …
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Analyser krenkelse
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultat */}
          <div className="space-y-6">
            {result && (
              <>
                <div className="card-professional">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-700" />
                    Analyseresultat
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-red-700 text-sm mb-1">Alvorlighetsgrad</div>
                      <div className="text-slate-900 font-semibold text-lg">{result.severity}</div>
                    </div>

                    <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                      <div className="text-primary-800 text-sm mb-2 font-medium">Juridisk grunnlag</div>
                      <ul className="space-y-1">
                        {result.legal_basis.map((law, idx) => (
                          <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                            <span className="text-primary-600 mt-0.5">•</span>
                            <span>{law}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-green-700 text-sm mb-2 font-medium">Anbefalte tiltak</div>
                      <ul className="space-y-1">
                        {result.actions.map((action, idx) => (
                          <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-slate-600 text-sm mb-2 font-medium">Klageprosess</div>
                      <div className="space-y-2 text-slate-700 text-sm">
                        <div><strong>Frist:</strong> {result.appeal_process.deadline}</div>
                        <div><strong>Myndighet:</strong> {result.appeal_process.authority}</div>
                        <div className="mt-3">
                          <strong className="text-slate-800">Nødvendige dokumenter:</strong>
                          <ul className="mt-1 space-y-1">
                            {result.appeal_process.required_documents.map((doc, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-slate-500">•</span>
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={generateComplaint}
                      disabled={loading}
                      className="w-full btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Genererer klage …
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Generer formell klage
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {complaint && (
                  <div className="card-professional">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Generert klage
                    </h2>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <pre className="text-slate-800 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {complaint}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(complaint);
                        alert('Klage kopiert til utklippstavlen.');
                      }}
                      className="mt-4 w-full px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Kopier til utklippstavlen
                    </button>
                  </div>
                )}
                <NesteSteg
                  items={[
                    { label: 'Skriv klagen', to: '/maler' },
                    { label: 'Hvor klager du?', to: '/hvor-klager-du' },
                    { label: 'Regn ut fristen', to: '/fristkalkulator' },
                  ]}
                />
              </>
            )}

            {!result && (
              <div className="card-professional text-center py-12">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  Velg type krenkelse og beskriv situasjonen for å få analyse og klagemal.
                </p>
              </div>
            )}
          </div>
        </div>
        {result && <FeedbackWidget tool="rights-protection" className="mt-6" />}
      </main>
    </div>
  );
}
