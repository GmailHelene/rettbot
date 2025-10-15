import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, Download, Copy, Check } from 'lucide-react';

interface DocumentResult {
  success: boolean;
  document: {
    type: string;
    content: string;
    metadata: {
      created: string;
      case_number?: string;
      court?: string;
    };
  };
}

export default function DocumentGenerator() {
  const [documentType, setDocumentType] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [court, setCourt] = useState('');
  const [details, setDetails] = useState('');
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const documentTypes = [
    { id: 'klage', name: 'Klage', icon: '📝', description: 'Formell klage til myndighet' },
    { id: 'anke', name: 'Anke', icon: '⚖️', description: 'Anke av dom' },
    { id: 'begjæring', name: 'Begjæring', icon: '📄', description: 'Rettslig begjæring' },
    { id: 'stevning', name: 'Stevning', icon: '📋', description: 'Sivil stevning' },
    { id: 'kontrakt', name: 'Kontrakt', icon: '🤝', description: 'Juridisk kontrakt' },
    { id: 'tilsvar', name: 'Tilsvar', icon: '💬', description: 'Tilsvar til påstand' }
  ];

  const handleGenerate = async () => {
    if (!documentType || !details.trim()) {
      setError('Vennligst velg dokumenttype og fyll ut detaljer');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://rettbot.com/api/legal/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: documentType,
          case_details: {
            case_number: caseNumber || null,
            court: court || null,
            details: details
          },
          strategy: strategy || null,
          template: null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke generere dokument. Prøv igjen.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.document.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result.document.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.document.type}_${result.document.metadata.created.split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
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
                <FileText className="w-8 h-8 mr-3 text-orange-600" />
                Dokumentgenerator
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Lag profesjonelle juridiske dokumenter med AI
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
            {/* Document Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Velg dokumenttype *
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {documentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDocumentType(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      documentType === type.id
                        ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Case Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Saksinformasjon (valgfritt)
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Saksnummer
                  </label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="F.eks: 22-123456MED-OTIR/01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domstol/Myndighet
                  </label>
                  <input
                    type="text"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    placeholder="F.eks: Oslo tingrett"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Detaljer *
              </h2>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Beskriv hva dokumentet skal inneholde..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Strategy */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Strategi (valgfritt)
              </h2>
              <textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Lim inn forsvarsstrategi..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              disabled={loading || !documentType || !details.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2" />
                  Genererer dokument...
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6 mr-2" />
                  Generer dokument
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          {result && (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    📄 {result.document.type.charAt(0).toUpperCase() + result.document.type.slice(1)}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="Kopier til utklippstavle"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Last ned dokument"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Opprettet: {new Date(result.document.metadata.created).toLocaleString('nb-NO')}</div>
                  {result.document.metadata.case_number && (
                    <div>Saksnummer: {result.document.metadata.case_number}</div>
                  )}
                  {result.document.metadata.court && (
                    <div>Domstol: {result.document.metadata.court}</div>
                  )}
                </div>
              </div>

              {/* Document Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {result.document.content}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>OBS:</strong> Dette dokumentet er AI-generert og bør gjennomgås av en advokat før bruk.
                </p>
              </div>
            </div>
          )}

          {!result && (
            <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
              <div className="text-center text-gray-400 dark:text-gray-600">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Velg dokumenttype og fyll ut detaljer</p>
                <p className="text-sm mt-2">AI vil generere et profesjonelt juridisk dokument</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
