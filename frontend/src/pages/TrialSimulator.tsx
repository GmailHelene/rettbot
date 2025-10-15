import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, TrendingUp, AlertCircle, Users, Target } from 'lucide-react';

interface SimulationResult {
  predicted_outcome: string;
  defense_score: number;
  prosecution_score: number;
  key_factors: string[];
  recommendations: string[];
  learning_points: string[];
  confidence_level: string;
}

export default function TrialSimulator() {
  const [caseType, setCaseType] = useState('');
  const [defenseSkill, setDefenseSkill] = useState('middels');
  const [prosecutionSkill, setProsecutionSkill] = useState('middels');
  const [caseStrength, setCaseStrength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState('');

  const skillLevels = [
    { id: 'dårlig', name: 'Dårlig', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', emoji: '😰' },
    { id: 'middels', name: 'Middels', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', emoji: '😐' },
    { id: 'god', name: 'God', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', emoji: '😊' },
    { id: 'elite', name: 'Elite', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', emoji: '🌟' }
  ];

  const caseTypes = [
    { id: 'narkotika', name: 'Narkotikaforbrytelse', icon: '💊' },
    { id: 'vold', name: 'Voldsforbrytelse', icon: '⚔️' },
    { id: 'tyveri', name: 'Tyveri/Ran', icon: '🔓' },
    { id: 'bedrageri', name: 'Bedrageri', icon: '💰' }
  ];

  const handleSimulate = async () => {
    if (!caseType) {
      setError('Vennligst velg en sakstype');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://rettbot.com/api/trial/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_type: caseType,
          defense_skill: defenseSkill,
          prosecution_skill: prosecutionSkill,
          case_strength: caseStrength
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Kunne ikke kjøre simulering. Prøv igjen.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillBadge = (skill: string) => {
    const level = skillLevels.find(s => s.id === skill);
    return level ? (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${level.color}`}>
        {level.emoji} {level.name}
      </span>
    ) : null;
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
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="w-8 h-8 mr-3 text-indigo-600" />
                Rettssal Simulator
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Simuler rettsaker med forskjellige advokatkvaliteter
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Case Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Sakstype
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {caseTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCaseType(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      caseType === type.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Defense Skill */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Forsvarers nivå
              </h2>
              <div className="space-y-2">
                {skillLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setDefenseSkill(level.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      defenseSkill === level.id
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{level.emoji}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {level.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prosecution Skill */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-600" />
                Aktoratets nivå
              </h2>
              <div className="space-y-2">
                {skillLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setProsecutionSkill(level.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      prosecutionSkill === level.id
                        ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{level.emoji}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {level.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <button
              onClick={handleSimulate}
              disabled={loading || !caseType}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2" />
                  Simulerer rettssak...
                </>
              ) : (
                <>
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Kjør simulering
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          {result && (
            <div className="space-y-6">
              {/* Outcome */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Predikert utfall
                </h2>
                <div className={`p-4 rounded-lg text-center ${
                  result.predicted_outcome.includes('Dom') || result.predicted_outcome.includes('skyldig')
                    ? 'bg-red-100 dark:bg-red-900/20'
                    : 'bg-green-100 dark:bg-green-900/20'
                }`}>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {result.predicted_outcome}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tillitsnivå: {result.confidence_level}
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  ⚖️ Poengsum
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-green-600 font-semibold">Forsvar</span>
                      <span className="font-bold">{result.defense_score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${result.defense_score}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-red-600 font-semibold">Aktorat</span>
                      <span className="font-bold">{result.prosecution_score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-red-600 h-3 rounded-full transition-all"
                        style={{ width: `${result.prosecution_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Factors */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🔑 Nøkkelfaktorer
                </h2>
                <ul className="space-y-2">
                  {result.key_factors.map((factor, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-blue-50 dark:bg-blue-900/20 p-3 rounded"
                    >
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  💡 Anbefalinger
                </h2>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-purple-50 dark:bg-purple-900/20 p-3 rounded"
                    >
                      <span className="text-purple-600 mr-2">→</span>
                      <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning Points */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📚 Læringspunkter
                </h2>
                <ul className="space-y-2">
                  {result.learning_points.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-gray-50 dark:bg-gray-700 p-3 rounded"
                    >
                      <span className="text-gray-600 dark:text-gray-400 mr-2">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!result && (
            <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
              <div className="text-center text-gray-400 dark:text-gray-600">
                <Briefcase className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Konfigurer saken og kjør simulering</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
