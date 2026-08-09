import { apiFetch } from '../lib/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader, Ticket } from 'lucide-react';

function formatUntil(iso: string | null): string {
  if (!iso) return '';
  const utc = iso.endsWith('Z') ? iso : iso + 'Z';
  try {
    return new Date(utc).toLocaleString('nb-NO', { dateStyle: 'long', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function DagspassKvittering() {
  const [state, setState] = useState<'venter' | 'aktiv' | 'treg'>('venter');
  const [until, setUntil] = useState<string | null>(null);

  useEffect(() => {
    let tries = 0;
    let timer: number;
    const check = async () => {
      tries += 1;
      try {
        const res = await apiFetch('/api/billing/status');
        if (res.ok) {
          const data = await res.json();
          if (data.has_access) {
            setUntil(data.access_until);
            setState('aktiv');
            return;
          }
        }
      } catch {
        /* prøv igjen */
      }
      if (tries >= 6) {
        setState('treg');
      } else {
        timer = window.setTimeout(check, 1500);
      }
    };
    check();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="header-professional">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center gap-3">
          <Ticket className="header-title-icon text-primary-700" />
          <h1 className="header-title">Kvittering</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {state === 'venter' && (
          <div className="card-professional flex items-center gap-2 text-slate-600">
            <Loader className="w-5 h-5 animate-spin" /> Registrerer betalingen …
          </div>
        )}

        {state === 'aktiv' && (
          <div className="card-professional border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Takk – dagspasset er aktivt!</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Du har full tilgang til {formatUntil(until)}. Lykke til med saken din.
                </p>
                <Link to="/" className="btn-primary inline-block mt-4">Gå til verktøyene</Link>
              </div>
            </div>
          </div>
        )}

        {state === 'treg' && (
          <div className="card-professional">
            <h2 className="text-lg font-semibold text-slate-900">Betalingen er registrert</h2>
            <p className="text-sm text-slate-600 mt-1">
              Tilgangen aktiveres vanligvis i løpet av sekunder. Ta en titt på{' '}
              <Link to="/dagspass" className="text-primary-700 underline">dagspass-siden</Link> om litt – står den
              fortsatt ikke aktiv etter noen minutter, kontakt oss på{' '}
              <a href="mailto:helene721@gmail.com" className="text-primary-700 underline">helene721@gmail.com</a>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
