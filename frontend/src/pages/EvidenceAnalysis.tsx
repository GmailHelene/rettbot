import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Brain, CheckCircle, AlertCircle, Scale } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AiDisclaimer from '../components/AiDisclaimer';
import ConfidenceBadge from '../components/ConfidenceBadge';

interface AnalysisResult {
  success: boolean;
  assessment: {
    relevance: string;
    legal_value: number;
    evidence_type: string;
    suggested_category: string;
    chain_of_custody: string[];
    potential_issues: string[];
    recommendations: string[];
    auto_tags: string[];
    related_laws: string[];
    summary: string;
    confidence: number;
  };
}

export default function EvidenceAnalysis() {
  const navigate = useNavigate();
  const { token } = useAuth();
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
      const response = await fetch('/api/evidence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          file_name: "evidence_text.txt",
          file_type: "text/plain",
          file_size: evidenceText.length,
          description: evidenceText,
          case_context: caseContext,
          encrypted_content: btoa(evidenceText) // Simple base64 encoding for demo
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

  const getRelevanceColor = (relevance: string) => {
    switch(relevance) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-primary-700 hover:text-primary-800 mb-4 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-1.5" />
            Tilbake til forsiden
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-700">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bevisanalyse</h1>
              <p className="text-slate-600 text-sm">AI-drevet analyse av juridiske bevis</p>
            </div>
          </div>
        </div>

        <AiDisclaimer className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-700" />
              Last opp bevis
            </h2>

            <div className="space-y-5">
              {/* Case Context */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
                  Sakskontekst
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
                  Bevistekst
                </label>
                <textarea
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Lim inn beviset her: Vitneforklaring, dokument, kommunikasjon, etc..."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
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
            {result?.success && result.assessment ? (
              <>
                {/* Confidence & Relevance */}
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${getCredibilityColor(result.assessment.confidence)} transition-all hover:shadow-xl`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-gray-700 dark:text-gray-300">
                        AI Konfidans
                      </h3>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">{result.assessment.confidence}%</p>
                      <ConfidenceBadge value={result.assessment.confidence} className="mt-2" />
                    </div>
                    <div className={`p-3 rounded-lg border-2 ${getRelevanceColor(result.assessment.relevance)}`}>
                      <h3 className="text-sm font-semibold uppercase tracking-wide mb-1">
                        Relevans
                      </h3>
                      <p className="text-lg font-bold capitalize">{result.assessment.relevance}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence Type & Legal Value */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Bevistype & Verdi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Type:</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{result.assessment.evidence_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Juridisk verdi:</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                            style={{ width: `${result.assessment.legal_value}%` }}
                          />
                        </div>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{result.assessment.legal_value}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Sammendrag
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.assessment.summary}
                  </p>
                </div>

                {/* Related Laws */}
                {result.assessment.related_laws.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-green-600" />
                      Relaterte Lovbestemmelser
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {result.assessment.related_laws.map((law, idx) => (
                        <div key={idx} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-green-800 dark:text-green-200 font-medium">{law}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-600" />
                    AI Anbefalinger
                  </h3>
                  <ul className="space-y-3">
                    {result.assessment.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Potential Issues */}
                {result.assessment.potential_issues.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Potensielle Problemer
                    </h3>
                    <ul className="space-y-3">
                      {result.assessment.potential_issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Chain of Custody */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Bevissikring (Chain of Custody)
                  </h3>
                  <ol className="space-y-3">
                    {result.assessment.chain_of_custody.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tags */}
                {result.assessment.auto_tags.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Auto-genererte Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.assessment.auto_tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-all hover:shadow-xl">
                <Brain className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-500 mb-2">
                  Klar for Analyse
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
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
