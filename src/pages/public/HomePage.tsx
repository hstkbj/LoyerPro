import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../services/properties/propertyService';
import type { Property, SubscriptionPlan } from '../../types';
import { PropertyCard } from '../../components/public/PropertyCard';
import { useGeo } from '../../contexts/GeoContext';
import { LocationSelectorModal } from '../../components/layout/LocationSelectorModal';
import { getPricingPlansList } from '../../services/currency/currencyService';
import { planService } from '../../services/plans/planService';
import { Seo } from '../../components/seo/Seo';
import { SITE, absoluteUrl } from '../../lib/site';
import {
  Search,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Check,
  FileText,
  Wallet,
  Receipt,
  KeyRound,
  BadgeCheck,
  Eye,
  ChevronDown,
  Building2,
} from 'lucide-react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1100&q=70&fm=webp';

const ROOM_CATEGORIES = [
  { value: '', label: 'Tous les types' },
  { value: 'chambre_seule', label: 'Chambre individuelle' },
  { value: 'chambre_salon', label: 'Chambre et salon' },
  { value: 'studio', label: 'Studio' },
  { value: 'colocation', label: 'Colocation' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa ou maison' },
];

const FAQ = [
  {
    q: 'Comment savoir si un bailleur est fiable ?',
    a: "Les bailleurs et agences envoient une pièce d'identité (et un document d'immatriculation pour les agences). Notre équipe les examine, puis l'annonce reçoit un badge « vérifié ». Le badge réduit les risques mais ne remplace pas la prudence : visitez toujours le logement avant de payer.",
  },
  {
    q: 'Est-ce gratuit pour les locataires ?',
    a: 'Oui. Rechercher des logements, contacter un bailleur et demander une visite sont gratuits.',
  },
  {
    q: 'Que puis-je gérer en tant que propriétaire ou agence ?',
    a: 'Vos biens et chambres, vos locataires, vos contrats, les loyers encaissés, vos dépenses, les quittances en PDF et des rapports financiers, depuis un seul espace.',
  },
  {
    q: 'Comment payer un abonnement ?',
    a: 'Par Mobile Money ou carte bancaire via notre prestataire de paiement FedaPay. Un forfait gratuit est disponible pour démarrer avec un premier bien.',
  },
  {
    q: 'Dans quels pays LoyerPro est-il disponible ?',
    a: "Le site est pensé pour l'Afrique de l'Ouest et centrale, avec des annonces et des devises adaptées à votre pays. Vous pouvez changer de pays et de devise à tout moment depuis le haut de la page.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { currentCountry, currentCity, currentCurrency, isLocalizedOnly } = useGeo();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [dbPlans, setDbPlans] = useState<SubscriptionPlan[] | undefined>(undefined);

  const [searchCity, setSearchCity] = useState(currentCity);
  const [roomCategory, setRoomCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    let cancelled = false;
    planService
      .getAllPlans(false)
      .then((plans) => {
        if (!cancelled) setDbPlans(plans);
      })
      .catch(() => {
        if (!cancelled) setDbPlans(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pricingPlans = getPricingPlansList(currentCurrency, dbPlans);

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
    if (maxPrice && Number(maxPrice) > 0) params.set('maxPrice', maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.url,
        logo: absoluteUrl('/icon-512.png'),
        email: SITE.supportEmail,
      },
      {
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.url,
        inLanguage: 'fr',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  const fieldLabel = 'block text-[11px] font-semibold uppercase tracking-wider text-slate-500';
  const fieldControl =
    'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20';

  return (
    <>
      <Seo
        description="Trouvez une chambre, un studio ou un appartement auprès de bailleurs vérifiés. Propriétaires et agences : gérez biens, contrats, loyers et quittances en un seul espace."
        path="/"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-sand-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-800">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Bailleurs vérifiés par notre équipe
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
              Louez un logement <span className="text-brand-700">en toute confiance</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Chambres, studios et appartements publiés par des bailleurs dont l'identité a été contrôlée. Et pour
              les propriétaires : contrats, loyers et quittances au même endroit.
            </p>

            <form
              onSubmit={handleSearch}
              aria-label="Rechercher un logement"
              className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="home-city" className={fieldLabel}>Ville</label>
                  <select id="home-city" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className={fieldControl}>
                    <option value="">Toutes les villes ({currentCountry.name})</option>
                    {currentCountry.cities.map((cty) => (
                      <option key={cty} value={cty}>{cty}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="home-type" className={fieldLabel}>Type de logement</label>
                  <select id="home-type" value={roomCategory} onChange={(e) => setRoomCategory(e.target.value)} className={fieldControl}>
                    {ROOM_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="home-budget" className={fieldLabel}>Budget maximum ({currentCurrency})</label>
                  <input
                    id="home-budget"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder={currentCurrency === 'EUR' || currentCurrency === 'USD' ? 'Ex. 600' : 'Ex. 100000'}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={fieldControl}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Rechercher
                  </button>
                </div>
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {currentCountry.flag} {currentCountry.name}, prix en {currentCurrency}.
                </span>
                <button type="button" onClick={() => setLocationModalOpen(true)} className="font-semibold text-brand-700 underline underline-offset-2">
                  Modifier
                </button>
              </p>
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-700 px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
              >
                Je suis propriétaire : publier mon bien
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/properties?verifiedOnly=true" className="text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-brand-700">
                Voir uniquement les bailleurs vérifiés
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-100 shadow-2xl shadow-brand-900/10">
              <img
                src={HERO_IMAGE}
                alt="Façade d'un immeuble résidentiel moderne"
                width={1100}
                height={1375}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -left-8 bottom-10 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">Identité contrôlée</p>
                <p className="text-xs text-slate-500">CNI ou passeport examinés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Atouts */}
      <section className="border-y border-slate-200 bg-white">
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: ShieldCheck, title: 'Bailleurs vérifiés', text: "Pièce d'identité examinée avant publication." },
            { icon: Eye, title: 'Annonces transparentes', text: 'Loyer, charges et conditions affichés clairement.' },
            { icon: Receipt, title: 'Quittances en PDF', text: 'Générées automatiquement pour chaque loyer.' },
            { icon: Wallet, title: 'Paiement simple', text: 'Mobile Money et cartes bancaires pour les abonnements.' },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Annonces récentes */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="titre-annonces">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">Annonces récentes</p>
            <h2 id="titre-annonces" className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
              Disponibles en {currentCountry.name}
            </h2>
          </div>
          <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
            Voir tous les logements
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-sand-50 p-10 text-center sm:p-14">
            <Building2 className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Aucune annonce publiée en {currentCountry.name} pour le moment
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Élargissez la recherche à un autre pays, ou soyez le premier propriétaire à publier ici.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Changer de pays ou de ville
              </button>
              <Link to="/register" className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800">
                Publier un bien
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Comment ça marche */}
      <section className="bg-sand-50 py-16 lg:py-20" aria-labelledby="titre-etapes">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-700">Comment ça marche</p>
            <h2 id="titre-etapes" className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
              Deux parcours, un même niveau de confiance
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <KeyRound className="h-5 w-5 text-brand-700" aria-hidden="true" />
                Je cherche un logement
              </h3>
              <ol className="mt-6 space-y-5">
                {[
                  ['Je filtre', 'Ville, type de logement et budget dans ma devise.'],
                  ['Je compare', 'Photos, charges, équipements et badge du bailleur.'],
                  ['Je contacte', 'Je demande des renseignements ou une visite, gratuitement.'],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{t}</p>
                      <p className="text-sm text-slate-600">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/properties" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800">
                Parcourir les logements
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-3xl bg-brand-950 p-6 text-white sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-5 w-5 text-brand-300" aria-hidden="true" />
                Je loue mes biens
              </h3>
              <ol className="mt-6 space-y-5">
                {[
                  ['Je crée mon compte', "J'envoie mes documents d'identité pour obtenir le badge vérifié."],
                  ['Je publie', 'Mes annonces apparaissent auprès des locataires de ma ville.'],
                  ['Je gère', 'Contrats, loyers, dépenses et quittances depuis mon espace.'],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-300 text-sm font-bold text-brand-950">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{t}</p>
                      <p className="text-sm text-slate-300">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/register" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50">
                Créer mon compte gratuitement
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tarifs */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="titre-tarifs">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand-700">Tarifs</p>
          <h2 id="titre-tarifs" className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
            Un forfait pour chaque taille de parc
          </h2>
          <p className="mt-3 text-slate-600">
            Commencez gratuitement, changez de forfait quand vous le souhaitez. Prix affichés en {currentCurrency}.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl items-stretch gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => {
            const isPro = plan.highlight;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-8 ${
                  isPro ? 'border-brand-700 shadow-xl ring-2 ring-brand-700' : 'border-slate-200'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Le plus choisi
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 min-h-[40px] text-sm text-slate-600">{plan.description}</p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.formattedPrice}</span>
                    {plan.price > 0 && <span className="text-sm text-slate-500">/ {plan.period}</span>}
                  </div>
                  <p className="mt-2 inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {plan.max_properties > 1000 ? 'Biens et chambres illimités' : `Jusqu'à ${plan.max_properties} logements`}
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={`/register?plan=${plan.id}`}
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                    isPro
                      ? 'bg-brand-700 text-white hover:bg-brand-800'
                      : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {plan.price === 0 ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm">
          <Link to="/pricing" className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800">
            Comparer tous les forfaits en détail
          </Link>
        </p>
      </section>

      {/* 6. FAQ */}
      <section className="bg-sand-50 py-16 lg:py-20" aria-labelledby="titre-faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="titre-faq" className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">Questions fréquentes</h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            Une autre question ?{' '}
            <Link to="/contact" className="font-semibold text-brand-700 underline underline-offset-4">Écrivez-nous</Link>
          </p>
        </div>
      </section>

      {/* 7. CTA final */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-brand-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Prêt à louer ou à gérer sans tracas ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Créez votre compte en quelques minutes. Le forfait gratuit suffit pour publier votre premier bien.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-900 hover:bg-brand-50">
              Créer mon compte
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link to="/properties" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10">
              Chercher un logement
            </Link>
          </div>
        </div>
      </section>

      <LocationSelectorModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </>
  );
}
