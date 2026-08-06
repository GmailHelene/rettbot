import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Fast banner over AI-genererte svar. Vises alltid, ikke bare når noe er galt.
 * Minner om at innholdet må kontrolleres mot kilden, og at verktøyet ikke
 * erstatter advokat.
 */
export default function AiDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 p-3.5 flex items-start gap-2.5 ${className}`}
      role="note"
    >
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-900 leading-relaxed">
        <strong>AI-generert - sjekk alltid kilden.</strong> Dette er automatisk generert
        informasjon som kan inneholde feil. Kontroller paragrafer, lover og datoer mot{' '}
        <a
          href="https://lovdata.no"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-amber-950"
        >
          Lovdata
        </a>{' '}
        før du handler. I alvorlige saker eller ved korte frister: kontakt advokat eller se{' '}
        <Link to="/hvor-klager-du" className="underline hover:text-amber-950">
          hvor du klager
        </Link>
        . RettBot+ erstatter ikke en advokat.
      </p>
    </div>
  );
}
