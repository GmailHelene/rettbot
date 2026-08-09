import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Ticket, Loader, CheckCircle2, KeyRound } from 'lucide-react';

interface Status {
  has_access: boolean;
  access_until: string | null;
  ai_free_used: number;
  ai_free_limit: number;
  ai_free_left: number;
  trial_used: boolean;
  price_kr: number;
  dagspass_hours: number;
  trial_days: number;
  payment_configured: boolean;
}

function formatUntil(iso: string | null): string {
  if (!iso) return '';
  // access_until lagres som naiv UTC – tolk som UTC for riktig lokal visning.
  const utc = iso.endsWith('Z') ? iso : iso + 'Z';
  try {
    return new Date(utc).toLocaleString('nb-NO', { dateStyle: 'long', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function Dagspass() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadStatus = async () => {
    try {
      const res = await apiFetch('/api/billing/status');
      if (res.ok) setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    if (params.get('avbrutt')) {
      setMsg({ type: 'err', text: 'Betalingen ble avbrutt. Du er ikke belastet.' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const buy = async () => {
    setBuying(true);
    setMsg(null);
    try {
      const res = await apiFetch('/api/billing/create-checkout-session', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // til Stripes betalingsside
      } else {
        setMsg({ type: 'err', text: data.detail || 'Kunne ikke starte betaling.' });
        setBuying(false);
      }
    } catch {
      setMsg({ type: 'err', text: 'Noe gikk galt. Prøv igjen.' });
      setBuying(false);
    }
  };

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setRedeeming(true);
    setMsg(null);
    try {
      const res = await apiFetch('/api/billing/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'ok', text: `Prøvekode aktivert – du har full tilgang i ${data.days} dager.` });
        setCode('');
        await loadStatus();
      } else {
        setMsg({ type: 'err', text: data.detail || 'Ugyldig kode.' });
      }
    } finally {
      setRedeeming(false);
    }
  };

  const price = status?.price_kr ?? 79;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Tilbake">
            <ArrowLeft className="header-icon" />
          </Link>
          <div className="flex items-center gap-3">
            <Ticket className="header-title-icon text-primary-700" />
            <h1 className="header-title">Dagspass</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {msg && (
          <div
            role="status"
            className={`rounded-lg p-4 text-sm ${
              msg.type === 'ok'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="card-professional flex items-center gap-2 text-slate-500">
            <Loader className="w-4 h-4 animate-spin" /> Laster …
          </div>
        ) : status?.has_access ? (
          <div className="card-professional border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Full tilgang er aktiv</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Du har ubegrenset tilgang til AI-verktøyene og PDF-saksmappe til{' '}
                  <strong>{formatUntil(status.access_until)}</strong>.
                </p>
                <Link to="/" className="btn-primary inline-block mt-4">Gå til verktøyene</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="card-professional">
              <h2 className="text-lg font-semibold text-slate-900">Kjøp dagspass</h2>
              <p className="text-sm text-slate-600 mt-1">
                {status ? `Du har ${status.ai_free_left} av ${status.ai_free_limit} gratis AI-kjøringer igjen.` : ''} Trenger
                du mer? Et dagspass gir deg <strong>{status?.dagspass_hours ?? 24} timer full tilgang</strong>.
              </p>
              <ul className="text-sm text-slate-700 mt-4 space-y-1 list-disc pl-5">
                <li>Ubegrenset bruk av alle AI-verktøyene</li>
                <li>PDF-saksmappe (samle sak, bevis og tidslinje)</li>
                <li>Lagre og organisere sakene dine</li>
              </ul>
              <div className="mt-5 flex items-center gap-4">
                <span className="text-2xl font-bold text-slate-900">{price} kr</span>
                <button onClick={buy} disabled={buying} className="btn-primary flex items-center gap-2">
                  {buying && <Loader className="w-4 h-4 animate-spin" />}
                  Kjøp dagspass
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Engangsbetaling. Fornyes ikke automatisk – tilgangen utløper etter {status?.dagspass_hours ?? 24} timer.
                Betaling håndteres trygt av Stripe; vi lagrer aldri kortinformasjonen din.
              </p>
              {status && !status.payment_configured && (
                <p className="text-xs text-amber-700 mt-2">Betaling er ikke satt opp ennå.</p>
              )}
            </div>

            <div className="card-professional">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-primary-700" />
                <h2 className="text-lg font-semibold text-slate-900">Har du en prøvekode?</h2>
              </div>
              <p className="text-sm text-slate-600">
                Løs inn en kode for {status?.trial_days ?? 7} dager full tilgang – gratis.
              </p>
              {status?.trial_used ? (
                <p className="text-sm text-slate-500 mt-3">Du har allerede brukt en prøvekode.</p>
              ) : (
                <form onSubmit={redeem} className="mt-3 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Skriv inn kode"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Prøvekode"
                  />
                  <button type="submit" disabled={redeeming || !code.trim()} className="btn-secondary flex items-center gap-2">
                    {redeeming && <Loader className="w-4 h-4 animate-spin" />}
                    Løs inn
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        <p className="text-xs text-slate-500">
          RettBot er et verktøy, ikke en advokat. Kjernen – forstå vedtak, frister, maler og innsynskrav – er alltid gratis.
        </p>
      </main>
    </div>
  );
}
