import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, AlertCircle, FileText, Scale, Globe } from 'lucide-react';

interface ResearchResult {
  success: boolean;
  research: {
    answer: string;
    norwegian_laws: Array<{
      statute: string;
      text: string;
      relevance: string;
    }>;
    echr_cases: Array<{
      case_name: string;
      summary: string;
      relevance: string;
    }>;
    precedents: Array<{
      court: string;
      case_number: string;
      summary: string;
      relevance: string;
    }>;
    citations: string[];
    confidence: string;
    recommendations: string[];
  };
}

export default function LegalResearch() {
  const [query, setQuery] = useState('');
  const [caseType, setCaseType] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState('');

  const caseTypes = [
    { id: 'straffesak', name: 'Straffesak', icon: '⚖️' },
    { id: 'sivil', name: 'Sivil sak', icon: '📋' },
    { id: 'forvaltning', name: 'Forvaltningsrett', icon: '🏛️' },
    { id: 'menneskerettigheter', name: 'Menneskerettigheter', icon: '👤' }
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Vennligst skriv inn et spørsmål');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://rettbot.com/api/legal/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          case_type: caseType || null,
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
      setError(err.message || 'Kunne ikke utføre søk. Prøv igjen.');
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
                <Scale className="header-title-icon mr-3 text-purple-600" />
                Juridisk Research
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Søk i norsk lov, EMD-praksis og rettspraksis
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Search Form */}
          <div className="space-y-6">
            {/* Main Query */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Juridisk spørsmål *
              </h2>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="F.eks: Hva er strafferammen for grov narkotikaforbrytelse etter straffeloven §231?"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Case Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sakstype (valgfritt)
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {caseTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCaseType(type.id === caseType ? '' : type.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      caseType === type.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
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

            {/* Context */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Ekstra kontekst (valgfritt)
              </h2>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Tilleggsinformasjon som kan være relevant..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2" />
                  Søker i lovdatabaser...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6 mr-2" />
                  Søk i norsk lov
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          {result && (
            <div className="space-y-6">
              {/* Answer */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📋 Svar
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {result.research.answer}
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Tillitsnivå: <span className="font-semibold">{result.research.confidence}</span>
                </div>
              </div>

              {/* Norwegian Laws */}
              {result.research.norwegian_laws.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Norske lover
                  </h2>
                  <div className="space-y-4">
                    {result.research.norwegian_laws.map((law, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {law.statute}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{law.text}</p>
                        <p className="text-blue-600 dark:text-blue-400 text-sm italic">
                          Relevans: {law.relevance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ECHR Cases */}
              {result.research.echr_cases.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-purple-600" />
                    EMD-praksis
                  </h2>
                  <div className="space-y-4">
                    {result.research.echr_cases.map((echrCase, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-r">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {echrCase.case_name}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{echrCase.summary}</p>
                        <p className="text-purple-600 dark:text-purple-400 text-sm italic">
                          Relevans: {echrCase.relevance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Precedents */}
              {result.research.precedents.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-green-600" />
                    Rettspraksis
                  </h2>
                  <div className="space-y-4">
                    {result.research.precedents.map((precedent, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-r">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {precedent.court} - {precedent.case_number}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{precedent.summary}</p>
                        <p className="text-green-600 dark:text-green-400 text-sm italic">
                          Relevans: {precedent.relevance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.research.recommendations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    💡 Anbefalinger
                  </h2>
                  <ul className="space-y-2">
                    {result.research.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded"
                      >
                        <span className="text-yellow-600 mr-2">→</span>
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citations */}
              {result.research.citations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    📚 Kilder
                  </h2>
                  <ul className="space-y-1 text-sm">
                    {result.research.citations.map((citation, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400">
                        {index + 1}. {citation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!result && (
            <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
              <div className="text-center text-gray-400 dark:text-gray-600">
                <BookOpen className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Skriv inn spørsmål for å søke</p>
                <p className="text-sm mt-2">AI vil søke i norsk lov, EMD og rettspraksis</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
