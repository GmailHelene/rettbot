import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, X } from 'lucide-react';

/**
 * Global «kjøp dagspass»-dialog. Vises når et hvilket som helst API-kall får 402
 * (gratiskvote/prøveperiode oppbrukt). apiFetch sender et 'rettbot:paywall'-event.
 */
export default function PaywallModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      setMessage(detail || 'Prøveperioden eller gratiskvoten din er brukt opp.');
      setOpen(true);
    };
    window.addEventListener('rettbot:paywall', handler);
    return () => window.removeEventListener('rettbot:paywall', handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600"
          aria-label="Lukk"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-6 h-6 text-primary-700" />
          <h2 className="text-lg font-semibold text-slate-900">Trenger du mer tilgang?</h2>
        </div>
        <p className="text-sm text-slate-600">{message}</p>
        <p className="text-sm text-slate-600 mt-2">
          Et dagspass gir deg 24 timer full tilgang til AI-verktøyene og PDF-saksmappe. Engangsbetaling, fornyes ikke.
        </p>
        <div className="mt-5 flex gap-3">
          <Link to="/dagspass" onClick={() => setOpen(false)} className="btn-primary">
            Se dagspass
          </Link>
          <button onClick={() => setOpen(false)} className="btn-secondary">
            Ikke nå
          </button>
        </div>
      </div>
    </div>
  );
}
