import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

interface Status {
  has_access: boolean;
  access_until: string | null;
  ai_free_left: number;
  price_kr: number;
}

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const utc = iso.endsWith('Z') ? iso : iso + 'Z';
  const ms = new Date(utc).getTime() - Date.now();
  if (isNaN(ms)) return null;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// Skjul banneret på sider der det ikke gir mening.
const HIDE_ON = ['/login', '/register', '/forgot-password', '/reset-password'];

const cta =
  'whitespace-nowrap rounded-md bg-primary-700 text-white px-3 py-1 text-xs font-medium hover:bg-primary-800';

export default function AccessBanner() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/billing/status');
        if (res.ok && !cancelled) setStatus(await res.json());
      } catch {
        /* stille - banneret er ikke kritisk */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, pathname]);

  if (!isAuthenticated || !status) return null;
  if (HIDE_ON.includes(pathname) || pathname.startsWith('/dagspass')) return null;

  // Aktiv tilgang: varsle bare når det nærmer seg slutten (≤ 3 dager igjen).
  if (status.has_access) {
    const d = daysLeft(status.access_until);
    if (d === null || d > 3) return null;
    return (
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span>
            Tilgangen din utløper om {d} {d === 1 ? 'dag' : 'dager'}. Etterpå trenger du et dagspass for AI-verktøyene og PDF-saksmappe.
          </span>
          <Link to="/dagspass" className={cta}>Se dagspass</Link>
        </div>
      </div>
    );
  }

  // Ingen aktiv tilgang: tips om dagspass (nøytralt formulert).
  return (
    <div className="bg-primary-50 border-b border-primary-200 text-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <span>
          {status.ai_free_left > 0
            ? `Du har ${status.ai_free_left} gratis AI-kjøringer igjen. Deretter trenger du et dagspass (${status.price_kr} kr) for full tilgang.`
            : `Gratiskvoten er brukt opp. Kjøp et dagspass (${status.price_kr} kr) for 24 timer full tilgang til AI-verktøyene og PDF-saksmappe.`}
        </span>
        <Link to="/dagspass" className={cta}>Kjøp dagspass</Link>
      </div>
    </div>
  );
}
