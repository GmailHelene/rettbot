import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scale, User, LogOut, LogIn, FolderOpen } from 'lucide-react';

// Auth-sidene har eget fullskjerm-uttrykk - skjul topp-navigasjonen der.
const HIDDEN_ON = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function TopNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-slate-900"
            aria-label="RettBot+ - til forsiden"
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-md bg-primary-600 text-white"
              aria-hidden="true"
            >
              <Scale className="w-4 h-4" />
            </span>
            <span>
              RettBot<span className="text-primary-600">+</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 text-sm" aria-label="Hovedmeny">
            {isAuthenticated ? (
              <>
                <Link
                  to="/min-konto"
                  className="hidden sm:flex items-center gap-1.5 text-slate-600 px-2 py-1.5 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span className="max-w-[10rem] truncate">{user?.full_name}</span>
                </Link>
                <Link
                  to="/my-cases"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <FolderOpen className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mine saker</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Logg ut</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>Logg inn</span>
                </Link>
                <Link to="/register" className="btn-primary !py-1.5 !px-3">
                  Opprett konto
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
