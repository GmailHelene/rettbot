import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'rettbot_cookie_consent';

/**
 * Enkel, ærlig personvern-/informasjonskapsel-banner.
 * RettBot+ bruker i dag kun nødvendig lagring (localStorage for innlogging) og
 * ingen sporing/analyse – banneren er derfor informativ (Lånekassen-stil).
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Personvern og informasjonskapsler"
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-lg"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-slate-700 flex-1">
          RettBot+ bruker kun <strong>nødvendig lagring</strong> for innlogging – ingen sporing eller
          analyse. Merk at tekst du sender inn behandles av en AI-leverandør. Les mer i{' '}
          <Link to="/personvern" className="text-primary-700 underline hover:text-primary-800">
            personvernerklæringen
          </Link>
          .
        </p>
        <button onClick={accept} className="btn-primary whitespace-nowrap">
          Jeg forstår
        </button>
      </div>
    </div>
  );
}
