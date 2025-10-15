import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, AlertCircle, Building2, FileText, TrendingUp } from 'lucide-react';

interface AssessmentResult {
  success: boolean;
  assessment: {
    severity_score: number;
    corruption_type: string;
    affected_institutions: string[];
    evidence_strength: string;
    legal_violations: string[];
    escalation_path: Array<{
      level: number;
      authority: string;
      timeframe: string;
      requirements: string[];
    }>;
    recommendations: string[];
    risk_assessment: string;
  };
}

export default function CorruptionAssessment() {
  const [allegations, setAllegations] = useState('');
  const [evidence, setEvidence] = useState('');
  const [institutions, setInstitutions] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');

  const handleAssess = async () => {
    if (!allegations.trim() || !evidence.trim() || !institutions.trim()) {
      setError('Vennligst fyll ut beskyldninger, bevis og involverte institusjoner');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const evidenceList = evidence.split('\n').filter(e => e.trim());
      const institutionsList = institutions.split('\n').filter(i => i.trim());
      
      const response = await fetch('https://rettbot.com/api/corruption/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allegations: allegations,
          evidence: evidenceList,
          institutions: institutionsList,
          context: context || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke utføre vurdering. Prøv igjen.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-yellow-600" />
                Korrupsjonsvurdering
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Analyser potensielle korrupsjonssaker og få eskaleringsplan
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Allegations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Korrupsjonsbeskyldninger *
              </h2>
              <textarea
                value={allegations}
                onChange={(e) => setAllegations(e.target.value)}
                placeholder="Beskriv korrupsjonsbeskyldningene i detalj..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Evidence */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Bevis (ett per linje) *
              </h2>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="E-poster&#10;Dokumenter&#10;Vitneforklaringer&#10;Overføringer"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Institutions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Involverte institusjoner (ett per linje) *
              </h2>
              <textarea
                value={institutions}
                onChange={(e) => setInstitutions(e.target.value)}
                placeholder="Politi&#10;Kommune&#10;Domstol&#10;NAV"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Context */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ekstra kontekst (valgfritt)
              </h2>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Tilleggsinformasjon..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <button
              onClick={handleAssess}
              disabled={loading || !allegations.trim() || !evidence.trim() || !institutions.trim()}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2" />
                  Analyserer korrupsjon...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Analyser korrupsjonssak
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          {result && (
            <div className="space-y-6">
              {/* Severity Score */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Alvorlighetsvurdering
                </h2>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Alvorlighetsgrad</span>
                    <span className="font-bold text-xl">{result.assessment.severity_score}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        result.assessment.severity_score >= 7 ? 'bg-red-600' :
                        result.assessment.severity_score >= 4 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${result.assessment.severity_score * 10}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Type:</span> {result.assessment.corruption_type}</div>
                  <div><span className="font-semibold">Bevisstyrke:</span> {result.assessment.evidence_strength}</div>
                </div>
              </div>

              {/* Affected Institutions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🏛️ Berørte institusjoner
                </h2>
                <ul className="space-y-2">
                  {result.assessment.affected_institutions.map((inst, index) => (
                    <li
                      key={index}
                      className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded"
                    >
                      <Building2 className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Violations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  ⚖️ Mulige lovbrudd
                </h2>
                <ul className="space-y-2">
                  {result.assessment.legal_violations.map((violation, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-red-50 dark:bg-red-900/20 p-3 rounded"
                    >
                      <span className="text-red-600 mr-2">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{violation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Escalation Path */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Eskaleringsplan (8 nivåer)
                </h2>
                <div className="space-y-4">
                  {result.assessment.escalation_path.map((step, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-r">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                          {step.level}
                        </span>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {step.authority}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Tidsramme: {step.timeframe}
                      </p>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Krav:</span>
                        <ul className="ml-4 mt-1 space-y-1">
                          {step.requirements.map((req, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-400">• {req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  ⚠️ Risikovurdering
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {result.assessment.risk_assessment}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  💡 Anbefalinger
                </h2>
                <ul className="space-y-2">
                  {result.assessment.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-green-50 dark:bg-green-900/20 p-3 rounded"
                    >
                      <span className="text-green-600 mr-2">→</span>
                      <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!result && (
            <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
              <div className="text-center text-gray-400 dark:text-gray-600">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Fyll ut informasjon om korrupsjonssaken</p>
                <p className="text-sm mt-2">AI vil analysere og gi eskaleringsplan</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
