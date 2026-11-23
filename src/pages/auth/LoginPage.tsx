import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Honeypot } from '../../components/ui/Honeypot';
import { Seo } from '../../components/seo/Seo';
import { checkSpam, createSpamGuard } from '../../lib/antiSpam';
import * as v from '../../lib/validation';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const guard = useMemo(() => createSpamGuard(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = v.compact({
      email: v.email(email),
      password: v.required(password, 'Le mot de passe'),
    });
    setFieldErrors(errs);
    if (!v.isValid(errs)) {
      setError('');
      return;
    }
    const spam = checkSpam({ guard, honeypotValue: honeypot, formKey: 'login', maxPerWindow: 10 });
    if (!spam.ok) {
      if (!spam.silent) setError(spam.message);
      return;
    }

    setLoading(true);
    setError('');

    const res = await signIn(email.trim(), password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      // Si l'utilisateur avait choisi un forfait payant depuis /pricing
      // avant de s'inscrire, on l'emmène directement finaliser le paiement
      // au lieu de le laisser silencieusement en forfait gratuit.
      const pendingPlan = localStorage.getItem('loyerpro_pending_plan');
      if (pendingPlan) {
        localStorage.removeItem('loyerpro_pending_plan');
        navigate(`/dashboard/settings?tab=subscription&selectedPlan=${pendingPlan}`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Seo title="Connexion" path="/login" noindex />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="mb-4 inline-flex" aria-label="LoyerPro, retour à l'accueil">
          <Logo />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Connexion à votre espace
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Gérez vos biens, loyers, locataires et contrats
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm">
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="relative space-y-4">
            <Honeypot value={honeypot} onChange={setHoneypot} />
            <Input
              label="Adresse Email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              error={fieldErrors.email}
              placeholder="bailleur@exemple.bj"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-1">
              <Input
                label="Mot de passe"
                type="password"
                required
                autoComplete="current-password"
                error={fieldErrors.password}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-right">
                <Link
                  to="/auth/reset-password"
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
              <span>Se connecter</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="font-semibold text-slate-900 hover:underline">
              Créer mon compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
