import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Liten «hva nå?»-modul som binder et AI-svar til de konkrete handlingsverktøyene.
 */
export default function NesteSteg({ items }: { items: { label: string; to: string }[] }) {
  return (
    <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-5">
      <h3 className="text-sm font-semibold text-primary-900 mb-3">Neste steg</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <Link
            key={it.to + it.label}
            to={it.to}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-primary-200 text-sm text-primary-800 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {it.label}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
