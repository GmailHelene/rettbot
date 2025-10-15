import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisResult {
  summary: string;
  key_points: string[];
  legal_relevance: string;
  recommendations: string[];
  credibility_score: number;
  timeline?: string[];
}

export default function EvidenceAnalysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evidenceText, setEvidenceText] = useState('');
  const [caseContext, setCaseContext] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeEvidence = async () => {
    if (!evidenceText.trim() || !caseContext.trim()) {
      alert('Vennligst fyll inn både beviset og saks kontekst');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://rettbot.com/api/evidence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_text: evidenceText,
          case_context: caseContext,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Kunne ikke analysere beviset. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-300';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container-legal section-legal">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-900 hover:text-blue-700 mb-4 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Tilbake til Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-600 rounded-2xl shadow-xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-blue-900 mb-2">Bevisanalyse</h1>
              <p className="text-neutral-600 text-lg">AI-drevet analyse av juridiske bevis</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-6 flex items-center gap-3">
              <Upload className="w-5 h-5 text-amber-600" />
              Last Opp Bevis
            </h2>

            <div className="space-y-5">
              {/* Case Context */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
                  Saks Kontekst
                </label>
                <textarea
                  value={caseContext}
                  onChange={(e) => setCaseContext(e.target.value)}
                  placeholder="Beskriv saken: Type sak, involverte parter, hovedspørsmål..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
              </div>

              {/* Evidence Text */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
                  Bevis Tekst
                </label>
                <textarea
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Lim inn beviset her: Vitneforklaring, dokument, kommunikasjon, etc..."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  💡 Tips: Jo mer detaljert, desto bedre analyse
                </p>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeEvidence}
                disabled={loading || !evidenceText.trim() || !caseContext.trim()}
                className="w-full text-lg py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Analyserer med GPT-4...
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6" />
                    Analyser Bevis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Credibility Score */}
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${getCredibilityColor(result.credibility_score)} transition-all hover:shadow-xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-gray-700 dark:text-gray-300">
                        Troverdighetsscore
                      </h3>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">{result.credibility_score}%</p>
                    </div>
                    <CheckCircle className="w-12 h-12 opacity-50" />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Sammendrag
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {result.summary}
                  </p>
                </div>

                {/* Key Points */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-4">
                    🎯 Nøkkelpunkter
                  </h3>
                  <ul className="space-y-3">
                    {result.key_points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal Relevance */}
                <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 border border-amber-200 dark:border-amber-800 rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-4">
                    ⚖️ Juridisk Relevans
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.legal_relevance}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border border-green-200 dark:border-green-800 rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-400 mb-4">
                    💡 Anbefalinger
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">{idx + 1}.</span>
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline (if available) */}
                {result.timeline && result.timeline.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
                    <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-4">
                      📅 Tidslinje
                    </h3>
                    <div className="space-y-3">
                      {result.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-900 dark:text-blue-400 font-bold text-sm flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 pt-1">{event}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-all hover:shadow-xl">
                <Brain className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                  Klar for Analyse
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Last opp beviset ditt til venstre for å få en detaljert AI-analyse
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
