import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Folder, Trash2, Edit, Eye, AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface Case {
  id: number;
  case_number: string;
  title: string;
  case_type: string;
  created_at: string;
  updated_at: string;
}

interface CaseDetails extends Case {
  description: string;
  facts: string;
  evidence: string[];
  status: string;
}

export default function MyCases() {
  const { token } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null);
  const [linkedTimeline, setLinkedTimeline] = useState<any[]>([]);
  const [linkedEvidence, setLinkedEvidence] = useState<any[]>([]);
  const [linkedDocuments, setLinkedDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create case form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCaseType, setNewCaseType] = useState('criminal');
  const [newFacts, setNewFacts] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCases();
  }, [token]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kunne ikke laste saker');
      }

      const data = await response.json();
      setCases(data.cases || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseDetails = async (caseId: number) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kunne ikke laste saksdetaljer');
      }

      const data = await response.json();
      const c = data.case ?? data;
      setSelectedCase(c);

      // Hent tidslinje + bevis knyttet til denne saken (via saksnummer)
      const ref = c.case_number;
      const [tlRes, evRes, docRes] = await Promise.all([
        fetch('/api/timeline', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/evidence', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const tl = tlRes.ok ? (await tlRes.json()).events || [] : [];
      const ev = evRes.ok ? (await evRes.json()).evidence || [] : [];
      const docs = docRes.ok ? (await docRes.json()).documents || [] : [];
      setLinkedTimeline(tl.filter((e: any) => e.case_ref === ref));
      setLinkedEvidence(ev.filter((e: any) => e.case_ref === ref));
      setLinkedDocuments(docs.filter((e: any) => e.case_ref === ref));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const downloadDoc = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w\s-]/g, '').trim() || 'dokument'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createCase = async () => {
    try {
      setCreating(true);
      setError('');

      const evidenceArray = newEvidence
        .split('\n')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          case_type: newCaseType,
          facts: newFacts,
          evidence: evidenceArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Kunne ikke opprette sak');
      }

      // Reset form and reload cases
      setNewTitle('');
      setNewDescription('');
      setNewFacts('');
      setNewEvidence('');
      setShowCreateModal(false);
      await loadCases();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteCase = async (caseId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne saken? Dette kan ikke angres.')) {
      return;
    }

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kunne ikke slette sak');
      }

      // Reload cases
      await loadCases();
      setSelectedCase(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mine Saker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Saksdata krypteres server-side før lagring
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ny sak
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cases List */}
            <div className="lg:col-span-1 space-y-4">
              {cases.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Du har ingen saker ennå
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Opprett din første sak
                  </button>
                </div>
              ) : (
                cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer transition-all ${
                      selectedCase?.id === caseItem.id
                        ? 'ring-2 ring-blue-500'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => loadCaseDetails(caseItem.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {caseItem.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {caseItem.case_number}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {caseItem.case_type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Opprettet: {formatDate(caseItem.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Case Details */}
            <div className="lg:col-span-2">
              {selectedCase ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedCase.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCase.case_number}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteCase(selectedCase.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Beskrivelse
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedCase.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Sakens fakta
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedCase.facts}
                      </p>
                    </div>

                    {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Bevis
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {selectedCase.evidence.map((ev, idx) => (
                            <li key={idx}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Tidslinje for saken</h3>
                        <Link to="/tidslinje" className="text-sm text-primary-700 hover:text-primary-800 underline">
                          Legg til →
                        </Link>
                      </div>
                      {linkedTimeline.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ingen hendelser knyttet til denne saken ennå.</p>
                      ) : (
                        <ol className="border-l-2 border-gray-200 dark:border-gray-700 ml-2 space-y-3">
                          {linkedTimeline.map((ev) => (
                            <li key={ev.id} className="ml-4">
                              <p className="text-xs font-medium text-primary-700 capitalize">
                                {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{ev.title}</p>
                              {ev.details && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{ev.details}</p>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Bevis lastet opp</h3>
                        <Link to="/evidence-upload" className="text-sm text-primary-700 hover:text-primary-800 underline">
                          Last opp →
                        </Link>
                      </div>
                      {linkedEvidence.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ingen bevisfiler knyttet til denne saken ennå.</p>
                      ) : (
                        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                          {linkedEvidence.map((ev) => (
                            <li key={ev.id}>
                              {ev.filename}
                              {ev.description ? ` – ${ev.description}` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Lagrede dokumenter</h3>
                        <Link to="/maler" className="text-sm text-primary-700 hover:text-primary-800 underline">
                          Lag nytt →
                        </Link>
                      </div>
                      {linkedDocuments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ingen lagrede dokumenter for denne saken ennå.</p>
                      ) : (
                        <ul className="space-y-2">
                          {linkedDocuments.map((doc) => (
                            <li key={doc.id} className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2">
                              <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{doc.title}</span>
                              <button
                                onClick={() => downloadDoc(doc.title, doc.content)}
                                className="text-sm text-primary-700 hover:text-primary-800 underline flex-shrink-0"
                              >
                                Last ned
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Opprettet: {formatDate(selectedCase.created_at)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sist oppdatert: {formatDate(selectedCase.updated_at)}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Saksdata lagres kryptert server-side og er kun tilgjengelig for din konto.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Velg en sak for å se detaljer
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Opprett ny sak
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sakstittel
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Kort beskrivende tittel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sakstype
                </label>
                <select
                  value={newCaseType}
                  onChange={(e) => setNewCaseType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="criminal">Straffesak</option>
                  <option value="civil">Sivilsak</option>
                  <option value="administrative">Forvaltningssak</option>
                  <option value="labor">Arbeidssak</option>
                  <option value="family">Familiesak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beskrivelse
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Kort oppsummering av saken"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sakens fakta
                </label>
                <textarea
                  value={newFacts}
                  onChange={(e) => setNewFacts(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Detaljert beskrivelse av faktiske forhold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bevis (en per linje)
                </label>
                <textarea
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Vitneprov fra A&#10;Dokumentbevis B&#10;Teknisk bevis C"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={createCase}
                disabled={creating || !newTitle || !newDescription}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center"
              >
                {creating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Oppretter...
                  </>
                ) : (
                  'Opprett sak'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
