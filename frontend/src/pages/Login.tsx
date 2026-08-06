import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, AlertCircle, Loader, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // login() oppdaterer AuthContext OG localStorage, slik at beskyttede
      // ruter og AI-kall (som leser token fra context) virker umiddelbart.
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Innlogging feilet. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 text-primary-700 border border-primary-100">
              <Scale className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">RettBot+</h1>
          <p className="text-slate-500 text-sm mt-1">Kjenn rettighetene dine. Stå stødig mot systemet.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Logg inn</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-post
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-slate-900"
                  placeholder="din@epost.no"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Passord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-slate-900"
                  placeholder="Minst 8 tegn"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start" role="alert">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Logger inn …
                </>
              ) : (
                'Logg inn'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-primary-700 hover:text-primary-800 text-sm font-medium">
              Glemt passord?
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              Har du ikke konto?{' '}
              <Link to="/register" className="text-primary-700 hover:text-primary-800 font-semibold">
                Registrer deg
              </Link>
            </p>
            <Link to="/" className="inline-block mt-3 text-slate-500 hover:text-slate-700 text-sm">
              Fortsett uten innlogging
            </Link>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Data krypteres server-side og overføres via HTTPS</span>
        </div>
      </div>
    </div>
  );
}
