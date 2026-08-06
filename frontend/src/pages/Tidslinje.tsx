import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ListOrdered, Plus, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DownloadSaksmappe from '../components/DownloadSaksmappe';

interface TimelineEvent {
  id: number;
  event_date: string;
  title: string;
  details: string;
  case_ref?: string | null;
}

export default function Tidslinje() {
  const { token } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [cases, setCases] = useState<{ case_number: string; title: string }[]>([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [caseRef, setCaseRef] = useState('');

  const load = async () => {
    try {
      const res = await apiFetch('/api/timeline', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Kunne ikke hente tidslinjen');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    apiFetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { cases: [] }))
      .then((d) => setCases((d.cases || []).map((c: any) => ({ case_number: c.case_number, title: c.title }))))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const add = async () => {
    if (!date || !title.trim()) {
      setError('Dato og tittel er påkrevd.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch('/api/timeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_date: date, title, details, case_ref: caseRef || null }),
      });
      if (!res.ok) throw new Error('Kunne ikke lagre hendelsen');
      setDate('');
      setTitle('');
      setDetails('');
      setCaseRef('');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Slette denne hendelsen?')) return;
    try {
      await apiFetch(`/api/timeline/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      /* ignore */
    }
  };

  const fmt = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <ListOrdered className="header-title-icon text-primary-700" />
            <div>
              <h1 className="header-title">Saks-tidslinje</h1>
              <p className="header-subtitle">Dokumentér hva som skjedde, og når</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-600">
            Samle tidslinje, bevis og dokumenter i én PDF du kan skrive ut eller ta med til advokat.
          </p>
          <DownloadSaksmappe />
        </div>

        {/* Legg til */}
        <div className="card-professional mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Ny hendelse</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dato</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Knytt til sak (valgfritt)</label>
              <select value={caseRef} onChange={(e) => setCaseRef(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
                <option value="">Ingen sak</option>
                {cases.map((c) => (
                  <option key={c.case_number} value={c.case_number}>
                    {c.title} ({c.case_number})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tittel</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kort hva som skjedde"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Detaljer (valgfritt)</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Hvem var involvert, hva ble sagt/gjort, vitner …"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button onClick={add} disabled={saving}
            className="mt-4 inline-flex items-center gap-2 btn-primary disabled:opacity-60">
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Legg til hendelse
          </button>
        </div>

        {/* Tidslinje */}
        {loading ? (
          <p className="text-slate-500">Laster …</p>
        ) : events.length === 0 ? (
          <div className="card-professional text-center py-10">
            <ListOrdered className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-900">Ingen hendelser ennå</h2>
            <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
              Start med datoen du mottok vedtaket eller da noe skjedde. En tidslinje gjør saken
              lett å forklare for en klageinstans eller advokat senere.
            </p>
            <p className="mt-3 text-xs text-slate-400">Bruk skjemaet over for å legge inn den første hendelsen.</p>
          </div>
        ) : (
          <ol className="relative border-l-2 border-slate-200 ml-3 space-y-6">
            {events.map((ev) => (
              <li key={ev.id} className="ml-6">
                <span className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-primary-600 border-2 border-white" />
                <div className="card-professional">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-primary-700 capitalize">{fmt(ev.event_date)}</p>
                      <h3 className="font-semibold text-slate-900">{ev.title}</h3>
                      {ev.details && <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{ev.details}</p>}
                      {ev.case_ref && <p className="mt-2 text-xs text-slate-500">Sak: {ev.case_ref}</p>}
                    </div>
                    <button onClick={() => remove(ev.id)} aria-label="Slett hendelse"
                      className="p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
