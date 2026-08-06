import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, User, AlertCircle, Loader, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passordene er ikke like');
      setLoading(false);
      return;
    }

    try {
      // register() oppdaterer AuthContext OG localStorage, slik at beskyttede
      // ruter og AI-kall virker umiddelbart etter registrering.
      await register(email, password, fullName);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Registrering feilet. Prøv igjen.');
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

        {/* Register Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Opprett konto</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Fullt navn
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-slate-900"
                  placeholder="Ola Nordmann"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-post
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Passord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-slate-900"
                  placeholder="Minst 8 tegn"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Passord må være minst 8 tegn.</p>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                Bekreft passord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-slate-900"
                  placeholder="Gjenta passordet"
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
                  Oppretter konto …
                </>
              ) : (
                'Opprett konto'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              Har du allerede konto?{' '}
              <Link to="/login" className="text-primary-700 hover:text-primary-800 font-semibold">
                Logg inn
              </Link>
            </p>
            <Link to="/" className="inline-block mt-3 text-slate-500 hover:text-slate-700 text-sm">
              Fortsett uten innlogging
            </Link>
          </div>
        </div>

        {/* Security + terms */}
        <div className="mt-6 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Saksdata krypteres server-side · passord hashet med bcrypt · HTTPS</span>
          </div>
          <p className="text-slate-400 text-xs">
            Ved å opprette konto godtar du våre{' '}
            <Link to="/vilkar" className="text-primary-700 hover:text-primary-800">vilkår</Link> og{' '}
            <Link to="/personvern" className="text-primary-700 hover:text-primary-800">personvernregler</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
