import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGeo } from '../../contexts/GeoContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { UserRole, VerificationDocument } from '../../types';
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  MailCheck,
} from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { currentCountry, availableCountries } = useGeo();
  const [searchParams] = useSearchParams();

  // Forfait choisi depuis la page tarifs (/pricing?plan=X) : on le conserve
  // pour que l'utilisateur soit invité à payer juste après confirmation de
  // son compte, au lieu de rester silencieusement en forfait gratuit.
  const selectedPlan = searchParams.get('plan');
  if (typeof window !== 'undefined' && selectedPlan) {
    localStorage.setItem('loyerpro_pending_plan', selectedPlan);
  }

  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [role, setRole] = useState<UserRole>('owner');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [country, setCountry] = useState(currentCountry.name);
  const [city, setCity] = useState(currentCountry.cities[0] || 'Abidjan');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Document verification states
  const [docType, setDocType] = useState<'cni' | 'passport' | 'rccm'>('cni');
  const [uploadedDocs, setUploadedDocs] = useState<VerificationDocument[]>([]);
  const [uploadError, setUploadError] = useState('');

  const activeCountryObj = availableCountries.find((c) => c.name === country) || currentCountry;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, customType?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const newDoc: VerificationDocument = {
        id: 'doc_' + Math.random().toString(36).substring(2, 9),
        document_type: customType || docType,
        name: file.name,
        file_url: resultStr,
        uploaded_at: new Date().toISOString(),
        status: 'pending',
      };
      setUploadedDocs((prev) => [...prev, newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !password) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (role === 'agency' && !agencyName) {
      setError("Le nom de l'agence immobilière est obligatoire.");
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (uploadedDocs.length === 0) {
      setError("Veuillez joindre au moins une pièce d'identité ou document officiel pour validation de votre compte.");
      return;
    }

    setLoading(true);
    setError('');

    const res = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
      role,
      agencyName: role === 'agency' ? agencyName.trim() : undefined,
      country,
      city,
      verificationDocuments: uploadedDocs,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.requiresEmailConfirmation) {
      setAwaitingConfirmation(true);
    } else if (selectedPlan) {
      navigate(`/dashboard/settings?tab=subscription&selectedPlan=${selectedPlan}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (awaitingConfirmation) {
    return (
      <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 bg-slate-50 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <MailCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Vérifiez votre boîte mail</h1>
          <p className="text-sm text-slate-600">
            Nous avons envoyé un lien de confirmation à <strong>{email}</strong>. Cliquez dessus pour activer votre
            compte, puis connectez-vous.
          </p>
          {selectedPlan && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              Une fois connecté(e), vous pourrez activer et régler le forfait que vous avez choisi depuis
              Paramètres → Abonnement.
            </p>
          )}
          <p className="text-xs text-slate-400">
            Vous ne voyez rien ? Vérifiez vos courriers indésirables, ou patientez quelques minutes.
          </p>
          <Link to="/login">
            <Button className="w-full mt-2">Aller à la page de connexion</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold text-slate-900">
            Loyer<span className="text-emerald-600">Pro</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Enregistrement Bailleur & Agence
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Validation par audit documentaire sous 24h pour garantir la sécurité et la confiance des locataires.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-md">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Type Selector */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Profil de gestion
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'owner'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Propriétaire Bailleur
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agency')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'agency'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Agence / Cabinet Immobilier
                </button>
              </div>
            </div>

            {role === 'agency' && (
              <Input
                label="Raison sociale de l'Agence"
                required
                placeholder="Ex: Agence Immobilière Horizon"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            )}

            <Input
              label="Nom & Prénom du titulaire"
              required
              placeholder="Ex: Jean-Marc Kouassi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            {/* Country & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Pays d'activité
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    const found = availableCountries.find((c) => c.name === e.target.value);
                    if (found && found.cities[0]) setCity(found.cities[0]);
                  }}
                  className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {availableCountries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Ville principale
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {activeCountryObj.cities.map((cty) => (
                    <option key={cty} value={cty}>
                      {cty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Téléphone (WhatsApp)"
                required
                type="tel"
                placeholder="Ex: +225 07 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Adresse Email"
                type="email"
                required
                placeholder="contact@bailleur.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Input
              label="Mot de passe"
              type="password"
              required
              placeholder="Au moins 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* MANDATORY VERIFICATION SECTION */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Validation d'Identité & Accréditation (Obligatoire)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Envoyez votre pièce d'identité {role === 'agency' ? 'et votre Registre de Commerce' : 'officielle'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Audit requis
                </span>
              </div>

              {/* Document selection */}
              <div className="space-y-2">
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDocType('cni')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold ${
                      docType === 'cni' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Carte d'identité (CNI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType('passport')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold ${
                      docType === 'passport' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Passeport
                  </button>
                  {role === 'agency' && (
                    <button
                      type="button"
                      onClick={() => setDocType('rccm')}
                      className={`px-3 py-1.5 rounded-lg border font-semibold ${
                        docType === 'rccm' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      RCCM / Registre du commerce
                    </button>
                  )}
                </div>

                {/* Upload zone */}
                <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800">
                      Cliquez pour téléverser votre document ({docType.toUpperCase()})
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      JPG, PNG ou PDF lisible (recto-verso pour CNI) jusqu'à 10 Mo
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}

                {/* Uploaded Documents List */}
                {uploadedDocs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Documents joints ({uploadedDocs.length}) :
                    </span>
                    <div className="space-y-1.5">
                      {uploadedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-slate-900 truncate">{doc.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 uppercase font-mono">
                              {doc.document_type}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold" isLoading={loading}>
              <span>Soumettre mon dossier & créer mon compte</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Déjà inscrit ?{' '}
            <Link to="/auth/login" className="font-bold text-slate-900 hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
