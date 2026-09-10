import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../services/properties/propertyService';
import type { Property } from '../../types';
import { PropertyCard } from '../../components/public/PropertyCard';
import { Button } from '../../components/ui/Button';
import { useGeo } from '../../contexts/GeoContext';
import { LocationSelectorModal } from '../../components/layout/LocationSelectorModal';
import { getPricingPlansList } from '../../services/currency/currencyService';
import {
  Search,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  MapPin,
  Bed,
  SlidersHorizontal,
  Home,
  Users,
  Compass,
  Check,
  CreditCard,
  Smartphone,
} from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { currentCountry, currentCity, currentCurrency, isLocalizedOnly } = useGeo();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Search state
  const [searchCity, setSearchCity] = useState(currentCity);
  const [roomCategory, setRoomCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const pricingPlans = getPricingPlansList(currentCurrency);

  useEffect(() => {
    setSearchCity(currentCity);
  }, [currentCity]);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const list = await propertyService.getPublishedProperties({
          country: isLocalizedOnly ? currentCountry.name : undefined,
          city: isLocalizedOnly && currentCity ? currentCity : undefined,
        });
        setProperties(list);
      } catch (err) {
        console.error('Error loading properties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, [currentCountry.name, currentCity, isLocalizedOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (roomCategory) params.set('roomCategory', roomCategory);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section with Real Architecture Photography */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80"
            alt="Immeubles et appartements modernes"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative mx-auto max-w-5xl space-y-6">
          {/* Geolocation Notice Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:px-4 rounded-xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <span className="text-base">{currentCountry.flag}</span>
              <span className="font-semibold text-emerald-400">Localisation détectée :</span>
              <span className="font-medium text-white">{currentCountry.name} {currentCity ? `(${currentCity})` : ''}</span>
              <span className="hidden sm:inline text-slate-400">· Devise active : <strong className="text-white">{currentCurrency}</strong></span>
            </div>
            <button
              onClick={() => setLocationModalOpen(true)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              Changer de localité ou devise
            </button>
          </div>

          <div className="text-center space-y-4 pt-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Trouvez votre chambre ou appartement idéal.<br className="hidden sm:inline" />
              <span className="text-emerald-400">Bailleurs vérifiés par pièce d'identité.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
              La première plateforme internationale garantissant zéro arnaque : baux en règle, charges transparentes et quittances automatisées.
            </p>
          </div>

          {/* Quick Filter Search Box */}
          <div className="mx-auto max-w-4xl pt-2">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 rounded-2xl bg-white p-3.5 shadow-2xl text-slate-900"
            >
              {/* Ville */}
              <div className="sm:col-span-3 text-left px-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ville / Secteur
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-transparent py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">Toutes les villes ({currentCountry.name})</option>
                  {currentCountry.cities.map((cty) => (
                    <option key={cty} value={cty}>
                      {cty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type de logement / chambre */}
              <div className="sm:col-span-4 text-left px-2 sm:border-l sm:border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Type de Chambre ou Logement
                </label>
                <select
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                  className="w-full bg-transparent py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">Toutes les catégories</option>
                  <option value="chambre_seule">Chambre individuelle</option>
                  <option value="chambre_salon">Chambre & Salon autonome</option>
                  <option value="studio">Studio indépendant</option>
                  <option value="colocation">Colocation / Chambre en colocation</option>
                  <option value="appartement">Appartement familial</option>
                  <option value="villa">Villa / Maison entière</option>
                </select>
              </div>

              {/* Budget Max */}
              <div className="sm:col-span-3 text-left px-2 sm:border-l sm:border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Budget max ({currentCurrency})
                </label>
                <input
                  type="number"
                  placeholder={`Ex: ${currentCurrency === 'EUR' || currentCurrency === 'USD' ? '600' : '100000'}`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="sm:col-span-2 flex items-center">
                <Button type="submit" variant="primary" className="w-full h-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  <Search className="mr-1.5 h-4 w-4" />
                  Trouver
                </Button>
              </div>
            </form>

            {/* Fast Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-300">
              <span className="text-slate-400">Recherches rapides :</span>
              <button
                onClick={() => {
                  setRoomCategory('chambre_seule');
                  navigate('/properties?roomCategory=chambre_seule');
                }}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px]"
              >
                Chambres seules
              </button>
              <button
                onClick={() => {
                  setRoomCategory('studio');
                  navigate('/properties?type=Studio');
                }}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px]"
              >
                Studios meublés
              </button>
              <button
                onClick={() => {
                  setRoomCategory('colocation');
                  navigate('/properties?roomCategory=colocation');
                }}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px]"
              >
                Colocations
              </button>
              <button
                onClick={() => navigate('/properties?verifiedOnly=true')}
                className="px-2.5 py-1 rounded-full bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3" />
                Bailleurs certifiés uniquement
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Listings Section (Filtered by Country/City) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {isLocalizedOnly ? `${currentCountry.flag} Disponible en ${currentCountry.name}` : '🌍 Toutes les localités'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Chambres & Logements prêts à habiter
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Annonces auditées avec photos réelles, détail des charges et baux sécurisés.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/properties"
              className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors"
            >
              <span>Consulter tout le catalogue</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <Building2 className="mx-auto h-12 w-12 text-slate-400" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Aucune chambre publiée dans {currentCountry.name} pour l'instant
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Vous pouvez élargir la recherche à tous les pays ou être le premier propriétaire à publier une annonce dans cette localité !
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocationModalOpen(true)}
              >
                Changer de pays / ville
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/auth/register')}
              >
                Déposer un bien dans {currentCountry.name}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Dual Perspective: Locataires vs Propriétaires */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Locataire */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xs space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Users className="h-3.5 w-3.5" />
              Vous cherchez une chambre ou un logement ?
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Louez en toute tranquillité, sans démarcheur suspect
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pièces d'identité vérifiées :</strong> Aucun faux propriétaire ou arnaque d'acompte.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Clarté sur les charges :</strong> Sachez à l'avance si l'eau, l'électricité et le Wi-Fi sont inclus.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Quittances officielles :</strong> Téléchargez vos reçus certifiés pour chaque loyer payé.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to="/properties">
                <Button variant="primary" size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                  Parcourir les chambres disponibles
                </Button>
              </Link>
            </div>
          </div>

          {/* Card Propriétaire */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xs space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
              <Building2 className="h-3.5 w-3.5" />
              Vous êtes propriétaire bailleur ou agence ?
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Gérez votre patrimoine sans stress et encaissez à temps
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Validation par CNI / Registre :</strong> Obtenez le badge officiel qui attire les meilleurs locataires.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Quittances en 1 clic :</strong> Générées avec QR code de conformité et envoyables par WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Devise locale adaptée :</strong> Facturation et loyers calculés dans votre monnaie ({currentCurrency}).</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to="/auth/register">
                <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Créer un compte Bailleur Certifié
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tarifs & Abonnements Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs">
            <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
            Tarifs Transparents & Sans Surprise
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Des forfaits pensés pour votre région
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            100% gratuit pour les locataires. Forfaits de gestion tout-en-un pour bailleurs et agences, convertis en temps réel dans votre devise ({currentCurrency}).
          </p>

          <div className="pt-1 flex items-center justify-center">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all"
            >
              <span>{currentCountry.flag}</span>
              <span>Devise locale : <strong className="text-emerald-700">{currentCurrency}</strong></span>
              <span className="text-[11px] text-slate-400 font-normal underline decoration-slate-300">Modifier</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const isPro = plan.highlight;
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-3xl p-6 sm:p-8 bg-white border transition-all ${
                  isPro
                    ? 'border-slate-900 shadow-xl ring-2 ring-slate-900 relative'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                    Formule Recommandée
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px] leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="pt-2 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        {plan.formattedPrice}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-slate-500 font-medium">/ {plan.period}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-2 border border-emerald-200">
                      Capacité : {plan.max_properties > 1000 ? 'Biens & Chambres illimités' : `Jusqu'à ${plan.max_properties} logements`}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => navigate(`/auth/register?plan=${plan.id}`)}
                    variant={isPro ? 'primary' : 'outline'}
                    size="md"
                    className={`w-full font-bold text-xs ${
                      isPro ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''
                    }`}
                  >
                    {plan.price === 0 ? 'Commencer Gratuitement' : 'Choisir cette formule'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Methods Badges */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              Moyens de paiement acceptés :
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold">Wave</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold">Orange Money</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold">MTN MoMo</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold">Moov Money</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold">Cartes Bancaires</span>
          </div>
        </div>
      </section>

      {/* 5. Verification & Security Section */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="h-4 w-4" />
              Protocole de Certification LoyerPro
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pourquoi exiger l'envoi de pièces d'identité et documents officiels ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pour protéger locataires et investisseurs, LoyerPro audite manuellement chaque inscription de bailleur. Fini les faux mandataires et les escroqueries de caution : seuls les comptes validés obtiennent le badge vert de publication.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link to="/about#verification">
              <Button variant="outline-white" size="md" className="font-bold">
                En savoir plus sur la vérification
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="primary" size="md" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                Commencer mon inscription
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
