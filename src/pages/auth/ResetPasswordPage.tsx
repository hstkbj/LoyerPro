import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getSupabase } from '../../services/supabase/client';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Honeypot } from '../../components/ui/Honeypot';
import { Seo } from '../../components/seo/Seo';
import { checkSpam, createSpamGuard } from '../../lib/antiSpam';
import * as v from '../../lib/validation';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const guard = useMemo(() => createSpamGuard(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = v.email(email);
    setEmailError(err);
    if (err) return;
    const spam = checkSpam({ guard, honeypotValue: honeypot, formKey: 'reset', maxPerWindow: 3 });
    if (!spam.ok) {
      if (spam.silent) setSent(true);
      else setError(spam.message);
      return;
    }

    setLoading(true);
    setError('');

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Seo title="Mot de passe oublié" path="/reset-password" noindex />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="mb-4 inline-flex" aria-label="LoyerPro, retour à l'accueil">
          <Logo />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Récupération de mot de passe
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Recevez un lien de réinitialisation sécurisé par email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Email envoyé</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Si un compte correspond à <span className="font-semibold">{email}</span>, vous recevrez un lien pour réinitialiser votre mot de passe.
              </p>
              <div className="pt-2">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-xs font-semibold text-slate-900 hover:underline"
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="relative space-y-4">
              <Honeypot value={honeypot} onChange={setHoneypot} />
              {error && (
                <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <Input
                label="Adresse Email"
                type="email"
                required
                autoComplete="email"
                error={emailError}
                placeholder="votre-email@exemple.bj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                Envoyer le lien
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
