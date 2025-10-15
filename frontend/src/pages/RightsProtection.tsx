import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Send, AlertTriangle } from 'lucide-react';

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
      const response = await fetch('https://rettbot.com/api/rights/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('https://rettbot.com/api/rights/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Tilbake til Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Rettighetsbeskytt</h1>
              <p className="text-white/60">Rapporter krenkelser og generer klage</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              Rapporter Krenkelse
            </h2>

            <div className="space-y-6">
              {/* Violation Type */}
              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Type Krenkelse
                </label>
                <select
                  value={selectedViolation}
                  onChange={(e) => setSelectedViolation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:outline-none transition-colors"
                >
                  <option value="">Velg type krenkelse...</option>
                  {violationTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-slate-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Beskriv Situasjonen
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beskriv hva som skjedde, når det skjedde, hvem var involvert..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-purple-400 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeViolation}
                disabled={loading || !selectedViolation || !description.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyserer...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Analyser Krenkelse
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Analysis Results */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-400" />
                    Analyse Resultat
                  </h2>

                  <div className="space-y-4">
                    {/* Severity */}
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                      <div className="text-red-300 text-sm mb-1">Alvorlighetsgrad</div>
                      <div className="text-white font-semibold text-lg">{result.severity}</div>
                    </div>

                    {/* Legal Basis */}
                    <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                      <div className="text-blue-300 text-sm mb-2">Juridisk Grunnlag</div>
                      <ul className="space-y-1">
                        {result.legal_basis.map((law, idx) => (
                          <li key={idx} className="text-white text-sm flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{law}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                      <div className="text-green-300 text-sm mb-2">Anbefalte Tiltak</div>
                      <ul className="space-y-1">
                        {result.actions.map((action, idx) => (
                          <li key={idx} className="text-white text-sm flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Appeal Process */}
                    <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                      <div className="text-purple-300 text-sm mb-2">Klageprosess</div>
                      <div className="space-y-2 text-white text-sm">
                        <div><strong>Frist:</strong> {result.appeal_process.deadline}</div>
                        <div><strong>Myndighet:</strong> {result.appeal_process.authority}</div>
                        <div className="mt-3">
                          <strong className="text-purple-300">Nødvendige dokumenter:</strong>
                          <ul className="mt-1 space-y-1">
                            {result.appeal_process.required_documents.map((doc, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Generate Complaint Button */}
                    <button
                      onClick={generateComplaint}
                      disabled={loading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Genererer klage...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Generer Formell Klage
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Complaint Text */}
                {complaint && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-green-400" />
                      Generert Klage
                    </h2>
                    <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                      <pre className="text-white text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {complaint}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(complaint);
                        alert('Klage kopiert til utklippstavle!');
                      }}
                      className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                    >
                      📋 Kopier til Utklippstavle
                    </button>
                  </div>
                )}
              </>
            )}

            {!result && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">
                  Velg type krenkelse og beskriv situasjonen for å få analyse og klagemal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
