import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCog, Download, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DownloadSaksmappe from '../components/DownloadSaksmappe';

export default function MinKonto() {
  const { user, token, logout } = useAuth();
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [error, setError] = useState('');

  const exportData = async () => {
    setBusy('export');
    setError('');
    try {
      const res = await fetch('/api/user/export', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Kunne ikke laste ned data');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rettbot-mine-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || 'Noe gikk galt');
    } finally {
      setBusy(null);
    }
  };

  const deleteAccount = async () => {
    if (
      !confirm(
        'Er du helt sikker? Dette sletter kontoen din og ALLE saker og bevis permanent. Handlingen kan ikke angres.'
      )
    )
      return;
    setBusy('delete');
    setError('');
    try {
      const res = await fetch('/api/user/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Kunne ikke slette kontoen');
      logout(); // tømmer sesjon og sender til forsiden
    } catch (e: any) {
      setError(e.message || 'Noe gikk galt');
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <UserCog className="header-title-icon text-primary-700" />
            <h1 className="header-title">Min konto</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="card-professional">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Kontoinformasjon</h2>
          <dl className="text-sm text-slate-700 space-y-1">
            <div className="flex gap-2">
              <dt className="font-medium text-slate-500 w-24">Navn:</dt>
              <dd>{user?.full_name || '-'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-slate-500 w-24">E-post:</dt>
              <dd>{user?.email || '-'}</dd>
            </div>
          </dl>
        </div>

        <div className="card-professional">
          <h2 className="text-lg font-semibold text-slate-900">Dine data (GDPR)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Du har rett til innsyn i og portabilitet av dine egne data.
          </p>
          <button
            onClick={exportData}
            disabled={busy !== null}
            className="mt-4 inline-flex items-center gap-2 btn-primary disabled:opacity-60"
          >
            {busy === 'export' ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Last ned mine data (JSON)
          </button>
          <div className="mt-3">
            <DownloadSaksmappe />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            JSON er for dataportabilitet. Saksmappen (PDF) er en lesbar oppsummering av tidslinje,
            bevis og dokumenter - grei å skrive ut eller ta med til en advokat.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5" aria-hidden="true" />
            Slett kontoen min
          </h2>
          <p className="mt-1 text-sm text-red-800">
            Sletter kontoen din og alle saker og bevis permanent. Dette kan ikke angres.
          </p>
          <button
            onClick={deleteAccount}
            disabled={busy !== null}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
          >
            {busy === 'delete' ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Slett kontoen min permanent
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
      </main>
    </div>
  );
}
