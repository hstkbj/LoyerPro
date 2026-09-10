import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getSupabase } from '../../services/supabase/client';
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/login`,
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
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900">
            Loyer<span className="text-emerald-600">Pro</span>
          </span>
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
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <Input
                label="Adresse Email"
                type="email"
                required
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
