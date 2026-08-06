import { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  /** Valgfri sak å avgrense til. Uten den samles alt brukeren har lagret. */
  caseRef?: string;
  className?: string;
}

/**
 * Laster ned en PDF-saksmappe (tidslinje + bevis + dokumenter) via et
 * autentisert kall, og trigger nedlasting i nettleseren.
 */
export default function DownloadSaksmappe({ caseRef, className = '' }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const url = caseRef
        ? `/api/saksmappe/pdf?case_ref=${encodeURIComponent(caseRef)}`
        : '/api/saksmappe/pdf';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('nedlasting feilet');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = caseRef ? `saksmappe_${caseRef}.pdf` : 'saksmappe.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch {
      alert('Kunne ikke laste ned saksmappen. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={loading}
      className={`inline-flex items-center gap-2 btn-primary disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Last ned saksmappe (PDF)
    </button>
  );
}
