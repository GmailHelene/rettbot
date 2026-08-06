import { apiFetch } from '../lib/api';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, ArrowLeft, AlertCircle, Loader, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Kunne ikke sende tilbakestillingslenke');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Noe gikk galt. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
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

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-3">E-post sendt</h2>
              <p className="text-slate-600 text-sm mb-5">
                Hvis <strong>{email}</strong> finnes hos oss, har vi sendt en tilbakestillingslenke dit.
                Sjekk innboksen og følg instruksjonene for å lage et nytt passord.
              </p>
              <p className="text-sm text-slate-500 mb-6">
                Mottok du ikke e-posten? Sjekk spam-mappen eller{' '}
                <button onClick={() => setSuccess(false)} className="text-primary-700 hover:text-primary-800 underline">
                  prøv igjen
                </button>
                .
              </p>
              <Link to="/login" className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake til innlogging
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Forgot Password Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Glemt passord?</h2>
          <p className="text-slate-600 text-sm mb-6">
            Skriv inn e-postadressen din, så sender vi deg en lenke for å tilbakestille passordet.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fp-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-post
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="fp-email"
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
                  <p className="font-medium mb-1">Sikker tilbakestilling</p>
                  <ul className="space-y-0.5 text-xs text-primary-700/90">
                    <li>Lenken er gyldig i 1 time</li>
                    <li>Kan kun brukes én gang</li>
                    <li>Utløper automatisk av sikkerhetshensyn</li>
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
                  Sender …
                </>
              ) : (
                'Send tilbakestillingslenke'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til innlogging
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
