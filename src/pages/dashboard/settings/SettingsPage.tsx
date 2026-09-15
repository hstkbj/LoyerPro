import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useGeo } from '../../../contexts/GeoContext';
import { getPricingPlansList } from '../../../services/currency/currencyService';
import { planService } from '../../../services/plans/planService';
import { subscriptionService } from '../../../services/subscriptions/subscriptionService';
import { openFedaPayCheckout, verifyFedaPayTransaction } from '../../../services/payments/fedapayCheckout';
import type { VerificationDocument, SubscriptionPlan, Subscription } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Settings,
  CreditCard,
  User,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Upload,
  CheckCircle2,
  Clock,
  FileText,
  FileCheck,
  X,
  AlertCircle,
} from 'lucide-react';

export function SettingsPage() {
  const { profile, updateProfile, submitVerificationDocuments } = useAuth();
  const { currentCountry, currentCurrency, availableCountries, formatPrice } = useGeo();
  const [searchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as 'profile' | 'verification' | 'subscription') || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'verification' | 'subscription'>(initialTab);
  const selectedPlanFromUrl = searchParams.get('selectedPlan');
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [agencyName, setAgencyName] = useState(profile?.agency_name || '');
  const [country, setCountry] = useState(profile?.country || currentCountry.name);
  const [city, setCity] = useState(profile?.city || currentCountry.cities[0] || 'Abidjan');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Verification state
  const [docType, setDocType] = useState<'cni' | 'passport' | 'rccm' | 'deed'>('cni');
  const [newDocs, setNewDocs] = useState<VerificationDocument[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Abonnement : plans réels gérés par le SuperAdmin (/superadmin/plans) +
  // abonnement réellement actif de l'utilisateur (plus de valeurs codées en dur).
  const [dbPlans, setDbPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadSubscriptionData() {
      setSubLoading(true);
      try {
        const [plansRes, subRes] = await Promise.all([
          planService.getAllPlans(false),
          subscriptionService.getMySubscription(profile?.id),
        ]);
        if (!cancelled) {
          setDbPlans(plansRes);
          setCurrentSubscription(subRes);
        }
      } catch (err) {
        console.error('Erreur de chargement des données d\'abonnement:', err);
      } finally {
        if (!cancelled) setSubLoading(false);
      }
    }
    loadSubscriptionData();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const refreshSubscription = async () => {
    try {
      const sub = await subscriptionService.getMySubscription(profile?.id);
      setCurrentSubscription(sub);
    } catch (err) {
      console.error(err);
    }
  };

  // Si l'utilisateur arrive ici avec ?selectedPlan=X (venant de /pricing puis
  // inscription/connexion), on lui propose immédiatement le paiement de ce
  // forfait au lieu de le laisser chercher le bon bouton lui-même.
  useEffect(() => {
    if (
      !autoTriggered &&
      selectedPlanFromUrl &&
      !subLoading &&
      dbPlans.length > 0 &&
      (!currentSubscription || currentSubscription.plan_id !== selectedPlanFromUrl)
    ) {
      const rawPlan = dbPlans.find((p) => p.id === selectedPlanFromUrl);
      if (rawPlan) {
        setAutoTriggered(true);
        handleChoosePlan(rawPlan);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanFromUrl, subLoading, dbPlans, currentSubscription, autoTriggered]);

  const handleChoosePlan = async (rawPlan: SubscriptionPlan) => {
    setPaymentError('');
    setPaymentNotice('');

    // Forfait gratuit : pas de paiement, activation immédiate.
    if (!rawPlan.price || rawPlan.price === 0) {
      setPayingPlanId(rawPlan.id);
      try {
        await subscriptionService.upgradeSubscription(rawPlan.id, 'Gratuit', profile?.id);
        await refreshSubscription();
      } catch (err: any) {
        setPaymentError(err?.message || 'Erreur lors du passage au forfait gratuit.');
      } finally {
        setPayingPlanId(null);
      }
      return;
    }

    // Forfait payant : on ouvre le vrai module de paiement FedaPay.
    setPayingPlanId(rawPlan.id);
    openFedaPayCheckout({
      amount: rawPlan.price,
      currency: rawPlan.currency || 'XOF',
      description: `Abonnement LoyerPro — ${rawPlan.name}`,
      customerEmail: profile?.email,
      customerFirstname: profile?.full_name?.split(' ')[0],
      customerLastname: profile?.full_name?.split(' ').slice(1).join(' ') || profile?.full_name,
      customerPhone: profile?.phone,
      onApproved: async (transactionId) => {
        setPaymentNotice('Vérification du paiement en cours...');
        const verification = await verifyFedaPayTransaction(transactionId);
        if (!verification.approved) {
          setPayingPlanId(null);
          setPaymentNotice('');
          setPaymentError(
            verification.error ||
              "Le paiement n'a pas pu être confirmé. Si un montant a été débité, contactez le support avec votre référence de transaction."
          );
          return;
        }
        try {
          await subscriptionService.upgradeSubscription(rawPlan.id, 'FedaPay', profile?.id, transactionId);
          await refreshSubscription();
          setPaymentNotice(`Forfait ${rawPlan.name} activé avec succès !`);
        } catch (err: any) {
          setPaymentError(err?.message || "Le paiement a été confirmé mais l'activation de l'abonnement a échoué. Contactez le support.");
        } finally {
          setPayingPlanId(null);
        }
      },
      onDismissed: () => {
        setPayingPlanId(null);
      },
      onError: (message) => {
        setPayingPlanId(null);
        setPaymentError(message);
      },
    });
  };

  const plans = getPricingPlansList(currentCurrency, dbPlans.length > 0 ? dbPlans : undefined);
  const verificationStatus = profile?.verification_status || 'unverified';
  const existingDocs = profile?.verification_documents || [];

  const activeCountryObj = availableCountries.find((c) => c.name === country) || currentCountry;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        agency_name: agencyName.trim() || undefined,
        country,
        city: city.trim(),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        document_type: docType,
        name: file.name,
        file_url: resultStr,
        uploaded_at: new Date().toISOString(),
        status: 'pending',
      };
      setNewDocs((prev) => [...prev, newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNewDoc = (id: string) => {
    setNewDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmitDocs = async () => {
    if (newDocs.length === 0) return;
    setUploadLoading(true);
    setUploadError('');

    try {
      await submitVerificationDocuments(newDocs);
      setNewDocs([]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors de l'envoi des documents.");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Paramètres & Conformité
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gérez votre profil bailleur, vos documents d'identité et votre formule d'abonnement.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Profil & Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'verification'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Pièces d'Identité & CNI</span>
          {verificationStatus === 'verified' && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Certifié
            </span>
          )}
          {verificationStatus === 'pending' && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              En cours
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'subscription'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Abonnement ({currentCurrency})</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs max-w-2xl space-y-6">
          {profileSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Vos informations ont été mises à jour avec succès.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Nom & Prénom"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            {profile?.role === 'agency' && (
              <Input
                label="Nom de l'Agence Immobilière"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                required
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Input
              label="Numéro WhatsApp / Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" isLoading={profileLoading} className="font-bold">
                Enregistrer mon profil
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Verification Tab */}
      {activeTab === 'verification' && (
        <div className="space-y-6 max-w-3xl">
          {/* Status Banner */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Statut de Conformité du compte
                  </h3>
                  <p className="text-xs text-slate-500">
                    Audit des pièces d'identité garantissant la sécurité des transactions
                  </p>
                </div>
              </div>

              {verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Bailleur Certifié
                </span>
              )}
              {verificationStatus === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Audit en cours (24h)
                </span>
              )}
              {verificationStatus === 'unverified' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Non vérifié
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
              {verificationStatus === 'verified'
                ? 'Félicitations ! Votre profil est validé par notre équipe. Toutes vos annonces de chambres et biens bénéficient de la mention prioritaire "Bailleur Certifié CNI".'
                : verificationStatus === 'pending'
                ? "Vos pièces d'identité sont actuellement en cours d'examen par notre service conformité. Vous recevrez une notification dès validation."
                : "Pour activer le badge de confiance et maximiser les prises de contact de locataires sérieux, veuillez téléverser une copie de votre CNI, passeport ou attestation."}
            </div>
          </div>

          {/* Existing Documents */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Pièces d'identité enregistrées ({existingDocs.length})
            </h4>

            {existingDocs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Aucune pièce n'a encore été soumise pour ce compte.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {existingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 uppercase">
                        {doc.document_type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 truncate">
                      <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Document reçu
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload New Document */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Ajouter une nouvelle pièce d'identité
            </h4>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Documents envoyés avec succès. Notre équipe les traitera sous 24h.</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
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
              <button
                type="button"
                onClick={() => setDocType('rccm')}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  docType === 'rccm' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
                }`}
              >
                Registre du Commerce (RCCM)
              </button>
              <button
                type="button"
                onClick={() => setDocType('deed')}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  docType === 'deed' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
                }`}
              >
                Titre de propriété / Mandat
              </button>
            </div>

            <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors">
              <Upload className="h-6 w-6 text-slate-400" />
              <div className="text-center">
                <span className="text-xs font-bold text-slate-800">
                  Téléverser un document ({docType.toUpperCase()})
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Format image (JPG, PNG) ou PDF lisible jusqu'à 10 Mo
                </p>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {newDocs.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700">Fichiers prêts à être envoyés :</span>
                {newDocs.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">{d.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-blue-800 border uppercase">
                        {d.document_type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewDoc(d.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <Button
                  onClick={handleSubmitDocs}
                  isLoading={uploadLoading}
                  variant="primary"
                  size="md"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Envoyer ces documents pour validation
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {!subLoading && !currentSubscription && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Choisissez un forfait pour continuer</p>
                <p className="text-xs mt-0.5">
                  Le reste du tableau de bord (biens, locataires, contrats...) reste inaccessible tant que vous
                  n'avez pas activé un forfait ci-dessous — même le forfait gratuit, en un clic.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Formule active
              </span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-lg font-bold text-slate-900">
                  {subLoading ? 'Chargement...' : currentSubscription?.plan?.name || 'Aucun forfait actif'}
                </h2>
                {!subLoading && currentSubscription && (
                  <Badge variant={currentSubscription?.status === 'active' ? 'success' : 'default'}>
                    {currentSubscription?.status === 'active' ? 'Actif' : currentSubscription?.status || 'Actif'}
                  </Badge>
                )}
                {!subLoading && !currentSubscription && (
                  <Badge variant="warning">En attente de choix</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Devise paramétrée : {currentCurrency} • Facturation sécurisée par FedaPay
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              <span>Mobile Money & Cartes Bancaires</span>
            </div>
          </div>

          {paymentError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{paymentError}</span>
            </div>
          )}
          {paymentNotice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs p-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{paymentNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isRecommended = p.highlight;
              const rawPlan = dbPlans.find((dp) => dp.id === p.id);
              const isCurrentPlan = currentSubscription?.plan_id === p.id;
              const isPaying = payingPlanId === p.id;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-6 bg-white space-y-4 flex flex-col justify-between ${
                    isRecommended ? 'border-slate-900 ring-2 ring-slate-900 shadow-md' : 'border-slate-200'
                  } ${isCurrentPlan ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                      {isCurrentPlan ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Votre forfait
                        </span>
                      ) : isRecommended ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                          Recommandé
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900">
                      {p.formattedPrice}
                      {p.price > 0 && <span className="text-xs font-normal text-slate-500"> / {p.period}</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</p>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isRecommended ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full font-bold text-xs"
                    disabled={isCurrentPlan || isPaying || !rawPlan}
                    isLoading={isPaying}
                    onClick={() => rawPlan && handleChoosePlan(rawPlan)}
                  >
                    {isCurrentPlan ? 'Forfait Actif' : p.price === 0 ? 'Passer au Gratuit' : `Choisir ${p.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Paiement sécurisé par FedaPay. En cas de souci de paiement, contactez le support avec la référence de transaction affichée après le paiement.
          </p>
        </div>
      )}
    </div>
  );
}
