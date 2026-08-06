import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Lagrer et generert brev/dokument (kryptert) i en av brukerens saker.
 * Vises kun for innloggede brukere.
 */
export default function SaveToCase({
  getContent,
  defaultTitle,
}: {
  getContent: () => string;
  defaultTitle: string;
}) {
  const { token, isAuthenticated } = useAuth();
  const [cases, setCases] = useState<{ case_number: string; title: string }[]>([]);
  const [caseRef, setCaseRef] = useState('');
  const [title, setTitle] = useState(defaultTitle);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { cases: [] }))
      .then((d) => setCases((d.cases || []).map((c: any) => ({ case_number: c.case_number, title: c.title }))))
      .catch(() => {});
  }, [token]);

  if (!isAuthenticated) {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <Link to="/login" className="text-primary-700 underline hover:text-primary-800">Logg inn</Link> for å
        lagre dette i en sak, sammen med tidslinje og bevis.
      </div>
    );
  }

  const save = async () => {
    setError('');
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || defaultTitle, content: getContent(), case_ref: caseRef || null }),
      });
      if (!res.ok) throw new Error('Kunne ikke lagre dokumentet');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || 'Noe gikk galt');
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-800 mb-2">Lagre i en sak</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tittel"
          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        />
        <select
          value={caseRef}
          onChange={(e) => setCaseRef(e.target.value)}
          aria-label="Velg sak"
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">Ingen sak</option>
          {cases.map((c) => (
            <option key={c.case_number} value={c.case_number}>
              {c.title} ({c.case_number})
            </option>
          ))}
        </select>
        <button
          onClick={save}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Lagret' : 'Lagre'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
