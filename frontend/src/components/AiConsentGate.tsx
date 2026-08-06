import { useEffect, useState, ReactNode } from 'react';
import { ShieldCheck, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'rb_ai_consent';

/**
 * Krever eksplisitt samtykke (GDPR art. 9 nr. 2 a) før brukeren kan bruke
 * AI-verktøyene. Samtykket registreres server-side (med tidsstempel) og caches
 * lokalt så det bare spørres én gang.
 */
export default function AiConsentGate({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [status, setStatus] = useState<'loading' | 'need' | 'ok'>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1' ? 'ok' : 'loading';
    } catch {
      return 'loading';
    }
  });
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'ok') return;
    let cancelled = false;
    fetch('/api/consent/ai', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { consented: false }))
      .then((d) => {
        if (cancelled) return;
        if (d.consented) {
          try {
            localStorage.setItem(STORAGE_KEY, '1');
          } catch {
            /* ignore */
          }
          setStatus('ok');
        } else {
          setStatus('need');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('need');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const give = async () => {
    setSaving(true);
    try {
      await fetch('/api/consent/ai', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      setStatus('ok');
    } catch {
      alert('Kunne ikke lagre samtykket. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'ok') return <>{children}</>;

  if (status === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500"
        role="status"
        aria-live="polite"
      >
        <Loader className="w-6 h-6 animate-spin mr-2" /> Laster …
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary-50 text-primary-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Før du bruker AI-verktøyene</h1>
        </div>

        <div className="text-sm text-slate-700 space-y-3">
          <p>
            Når du bruker AI-funksjonene, sendes teksten du legger inn til vår AI-leverandør{' '}
            <strong>Anthropic</strong> for behandling. Anthropic er etablert i <strong>USA</strong>, så
            opplysningene overføres dit (sikret med EUs standard personvernbestemmelser, SCC).
          </p>
          <p>
            Teksten kan inneholde sensitive opplysninger (art. 9) og opplysninger om straffedommer
            (art. 10). Del ikke mer enn saken din faktisk krever. Les mer i{' '}
            <Link to="/personvern" className="text-primary-700 underline hover:text-primary-800">
              personvernerklæringen
            </Link>
            .
          </p>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4"
          />
          <span>
            Jeg samtykker til at teksten jeg legger inn behandles av AI (Anthropic), inkludert
            overføring til USA.
          </span>
        </label>

        <button
          onClick={give}
          disabled={!accepted || saving}
          className="mt-5 w-full btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : null}
          Samtykk og fortsett
        </button>
        <Link to="/" className="mt-3 block text-center text-sm text-slate-500 hover:text-slate-700">
          Avbryt
        </Link>
      </div>
    </div>
  );
}
