import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertCircle, FileText, Target, AlertTriangle } from 'lucide-react';

interface StrategyResult {
  success: boolean;
  strategy: {
    primary_theory: string;
    weaknesses: Array<{
      issue: string;
      impact: string;
      mitigation: string;
    }>;
    alternative_defenses: string[];
    procedural_challenges: string[];
    motion_strategy: string[];
    risk_assessment: {
      conviction_risk: string;
      sentencing_range: string;
      plea_recommendation: string;
    };
    next_steps: string[];
  };
}

export default function DefenseStrategy() {
  const [caseFacts, setCaseFacts] = useState('');
  const [charges, setCharges] = useState('');
  const [evidence, setEvidence] = useState('');
  const [legalResearch, setLegalResearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyResult | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!caseFacts.trim() || !charges.trim()) {
      setError('Vennligst fyll ut sakens fakta og tiltale');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const evidenceList = evidence.trim() ? evidence.split('\n').filter(e => e.trim()) : [];
      
      const response = await fetch('/api/defense/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_facts: caseFacts,
          charges: charges,
          evidence: evidenceList,
          legal_research: legalResearch || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke generere strategi. Prøv igjen.');
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
              <ArrowLeft className="header-icon" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Shield className="header-title-icon mr-3 text-green-600" />
                Forsvarsstrategi
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                AI-generert forsvarsstrategi basert på saksdetaljer
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
            {/* Case Facts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Sakens fakta *
              </h2>
              <textarea
                value={caseFacts}
                onChange={(e) => setCaseFacts(e.target.value)}
                placeholder="Beskriv hva som skjedde i detalj..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Charges */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Tiltale/Beskyldninger *
              </h2>
              <textarea
                value={charges}
                onChange={(e) => setCharges(e.target.value)}
                placeholder="F.eks: Grov narkotikaforbrytelse etter straffeloven §231..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Evidence */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Bevis (ett per linje)
              </h2>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="DNA-bevis&#10;Vitneforklaring&#10;Overvåkingsvideo"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Legal Research */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Juridisk research (valgfritt)
              </h2>
              <textarea
                value={legalResearch}
                onChange={(e) => setLegalResearch(e.target.value)}
                placeholder="Lim inn resultater fra juridisk research..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !caseFacts.trim() || !charges.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2" />
                  Genererer strategi...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6 mr-2" />
                  Generer forsvarsstrategi
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          {result && (
            <div className="space-y-6">
              {/* Primary Theory */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🎯 Primær forsvarsteori
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {result.strategy.primary_theory}
                </div>
              </div>

              {/* Weaknesses */}
              {result.strategy.weaknesses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    ⚠️ Svakheter og hvordan håndtere dem
                  </h2>
                  <div className="space-y-4">
                    {result.strategy.weaknesses.map((weakness, index) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-r">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {weakness.issue}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                          <span className="font-semibold">Påvirkning:</span> {weakness.impact}
                        </p>
                        <p className="text-orange-600 dark:text-orange-400 text-sm">
                          <span className="font-semibold">Tiltak:</span> {weakness.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Defenses */}
              {result.strategy.alternative_defenses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    🔄 Alternative forsvar
                  </h2>
                  <ul className="space-y-2">
                    {result.strategy.alternative_defenses.map((defense, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-blue-50 dark:bg-blue-900/20 p-3 rounded"
                      >
                        <span className="text-blue-600 mr-2">{index + 1}.</span>
                        <span className="text-gray-700 dark:text-gray-300">{defense}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Procedural Challenges */}
              {result.strategy.procedural_challenges.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    ⚖️ Prosessuelle innsigelser
                  </h2>
                  <ul className="space-y-2">
                    {result.strategy.procedural_challenges.map((challenge, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-purple-50 dark:bg-purple-900/20 p-3 rounded"
                      >
                        <span className="text-purple-600 mr-2">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Motion Strategy */}
              {result.strategy.motion_strategy.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    📝 Begjæringer/Anker strategi
                  </h2>
                  <ul className="space-y-2">
                    {result.strategy.motion_strategy.map((motion, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-green-50 dark:bg-green-900/20 p-3 rounded"
                      >
                        <span className="text-green-600 mr-2">→</span>
                        <span className="text-gray-700 dark:text-gray-300">{motion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Assessment */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Risikovurdering
                </h2>
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-sm text-red-600 dark:text-red-400 font-semibold mb-1">
                      Domfellelsesrisiko
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {result.strategy.risk_assessment.conviction_risk}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold mb-1">
                      Forventet strafferamme
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {result.strategy.risk_assessment.sentencing_range}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
                      Tilståelsessak anbefaling
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {result.strategy.risk_assessment.plea_recommendation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              {result.strategy.next_steps.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    ✅ Neste steg
                  </h2>
                  <ol className="space-y-2">
                    {result.strategy.next_steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-gray-50 dark:bg-gray-700 p-3 rounded"
                      >
                        <span className="text-gray-600 dark:text-gray-400 mr-2 font-semibold">{index + 1}.</span>
                        <span className="text-gray-700 dark:text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {!result && (
            <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
              <div className="text-center text-gray-400 dark:text-gray-600">
                <Shield className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Fyll ut saksinformasjon</p>
                <p className="text-sm mt-2">AI vil generere en omfattende forsvarsstrategi</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
