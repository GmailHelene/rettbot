import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scale, Lock, AlertCircle, Loader, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Ugyldig tilbakestillingslenke');
      setTokenValid(false);
      return;
    }
    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await apiFetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Ugyldig eller utløpt tilbakestillingslenke');
      }

      setTokenValid(true);
    } catch (err: any) {
      setError(err.message);
      setTokenValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passordene er ikke like');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Passordet må være minst 8 tegn');
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Kunne ikke tilbakestille passord');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Noe gikk galt. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 text-primary-700 border border-primary-100">
              <Scale className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">RettBot+</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">{children}</div>
      </div>
    </div>
  );

  if (tokenValid === false) {
    return (
      <Shell>
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Ugyldig lenke</h2>
          <p className="text-slate-600 text-sm mb-6">
            {error || 'Tilbakestillingslenken er ugyldig eller har utløpt.'}
          </p>
          <button onClick={() => navigate('/forgot-password')} className="btn-primary">
            Be om ny lenke
          </button>
        </div>
      </Shell>
    );
  }

  if (success) {
    return (
      <Shell>
        <div className="text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Passord tilbakestilt</h2>
          <p className="text-slate-600 text-sm mb-4">
            Passordet ditt er oppdatert. Du blir sendt videre til innloggingssiden.
          </p>
          <div className="text-sm text-slate-500">Videresender om 3 sekunder …</div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Nytt passord</h2>
      <p className="text-slate-600 text-sm mb-6">Opprett et sterkt og sikkert passord for kontoen din.</p>

      {tokenValid === null ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-7 h-7 animate-spin text-primary-600" />
          <span className="ml-2 text-slate-600">Validerer lenke …</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="rp-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nytt passord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                id="rp-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-slate-900"
                placeholder="Minst 8 tegn"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Bruk minst 8 tegn - gjerne en blanding av bokstaver, tall og symboler.</p>
          </div>

          <div>
            <label htmlFor="rp-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
              Bekreft nytt passord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                id="rp-confirm"
                type={showPassword ? 'text' : 'password'}
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

          <div className="p-3.5 bg-primary-50 border border-primary-100 rounded-lg">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-800">
                <p className="font-medium mb-1">Sikker kryptering</p>
                <ul className="space-y-0.5 text-xs text-primary-700/90">
                  <li>Passord hashet med bcrypt</li>
                  <li>Saksdata krypteres server-side</li>
                  <li>Tilbakestillingstoken hashes og slettes etter bruk</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Oppdaterer …
              </>
            ) : (
              'Oppdater passord'
            )}
          </button>
        </form>
      )}
    </Shell>
  );
}
