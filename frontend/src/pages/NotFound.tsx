import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary-50 text-primary-700">
          <FileQuestion className="w-7 h-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-primary-700">404</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Siden finnes ikke</h1>
        <p className="mt-2 text-slate-600">
          Vi fant ikke siden du lette etter. Den kan ha blitt flyttet, eller så er det en feil i adressen.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6">
          Til forsiden
        </Link>
      </div>
    </div>
  );
}
