import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, AlertCircle, BookOpen, Info } from 'lucide-react';

interface PenaltyData {
  offense_type: string;
  statute_reference: string;
  minimum_penalty: string;
  maximum_penalty: string;
  typical_range: string;
  severity_factors: string[];
  mitigating_factors: string[];
  evidence_considerations: string[];
}

export default function PenaltiesLookup() {
  const [selectedOffense, setSelectedOffense] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PenaltyData | null>(null);
  const [error, setError] = useState<string>('');

  const offenseTypes = [
    { id: 'narkotika', name: 'Narkotikaforbrytelser', icon: '💊' },
    { id: 'vold', name: 'Voldsforbrytelser', icon: '⚔️' },
    { id: 'tyveri', name: 'Tyverier og ran', icon: '🔓' },
    { id: 'bedrageri', name: 'Bedrageri og økonomisk kriminalitet', icon: '💰' }
  ];

  const handleLookup = async () => {
    if (!selectedOffense) {
      setError('Vennligst velg en lovbruddstype');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://rettbot.com/api/legal/penalties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offense: selectedOffense,
          facts: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API request failed');
      }

      const data = await response.json();
      
      // Backend returns {success, results, ai_summary}
      // We need to transform to match PenaltyData interface
      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        const transformed: PenaltyData = {
          offense_type: selectedOffense,
          statute_reference: firstResult.statute,
          minimum_penalty: firstResult.typical_penalties.split('-')[0]?.trim() || 'Ingen minimum',
          maximum_penalty: firstResult.typical_penalties.split('-')[1]?.trim() || firstResult.typical_penalties,
          typical_range: firstResult.typical_penalties,
          severity_factors: firstResult.severity_factors,
          mitigating_factors: [], // Backend doesn't provide this yet
          evidence_considerations: firstResult.evidence_considerations
        };
        setResult(transformed);
      } else {
        throw new Error('Ingen resultater funnet');
      }
    } catch (err) {
      setError('Kunne ikke hente straffedata. Prøv igjen.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Scale className="w-8 h-8 mr-3 text-red-600" />
                Strafferamme Lookup
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Se strafferammer etter norsk lov
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Offense Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Velg lovbruddstype
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offenseTypes.map((offense) => (
              <button
                key={offense.id}
                onClick={() => setSelectedOffense(offense.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOffense === offense.id
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{offense.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {offense.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          <button
            onClick={handleLookup}
            disabled={loading || !selectedOffense}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Henter data...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5 mr-2" />
                Søk i Straffeloven
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {result.offense_type}
              </h2>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4 mr-2" />
                <span className="font-mono text-sm">{result.statute_reference}</span>
              </div>
            </div>

            {/* Penalty Ranges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
                  Minimum
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.minimum_penalty}
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-1">
                  Typisk område
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.typical_range}
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-sm text-red-600 dark:text-red-400 font-semibold mb-1">
                  Maksimum
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.maximum_penalty}
                </div>
              </div>
            </div>

            {/* Severity Factors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ⚠️ Skjerpende omstendigheter
              </h3>
              <ul className="space-y-2">
                {result.severity_factors.map((factor, index) => (
                  <li
                    key={index}
                    className="flex items-start bg-orange-50 dark:bg-orange-900/20 p-3 rounded"
                  >
                    <span className="text-orange-600 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mitigating Factors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ✓ Formildende omstendigheter
              </h3>
              <ul className="space-y-2">
                {result.mitigating_factors.map((factor, index) => (
                  <li
                    key={index}
                    className="flex items-start bg-green-50 dark:bg-green-900/20 p-3 rounded"
                  >
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence Considerations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📋 Bevishensyn
              </h3>
              <ul className="space-y-2">
                {result.evidence_considerations.map((consideration, index) => (
                  <li
                    key={index}
                    className="flex items-start bg-gray-50 dark:bg-gray-700 p-3 rounded"
                  >
                    <span className="text-gray-600 dark:text-gray-400 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
