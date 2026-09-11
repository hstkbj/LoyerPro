export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  cities: string[];
}

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+225',
    cities: ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Grand-Bassam', 'Korhogo'],
  },
  {
    code: 'SN',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+221',
    cities: ['Dakar', 'Thiès', 'Saly', 'Saint-Louis', 'Mbour', 'Ziguinchor'],
  },
  {
    code: 'CM',
    name: 'Cameroun',
    flag: '🇨🇲',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    phonePrefix: '+237',
    cities: ['Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Limbe', 'Garoua'],
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '+33',
    cities: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Nantes'],
  },
  {
    code: 'BJ',
    name: 'Bénin',
    flag: '🇧🇯',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+229',
    cities: ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Ouidah', 'Bohicon'],
  },
  {
    code: 'TG',
    name: 'Togo',
    flag: '🇹🇬',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+228',
    cities: ['Lomé', 'Kpalimé', 'Kara', 'Atakpamé', 'Sokodé'],
  },
  {
    code: 'MA',
    name: 'Maroc',
    flag: '🇲🇦',
    currency: 'MAD',
    currencySymbol: 'DH',
    phonePrefix: '+212',
    cities: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès'],
  },
  {
    code: 'GA',
    name: 'Gabon',
    flag: '🇬🇦',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    phonePrefix: '+241',
    cities: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem'],
  },
  {
    code: 'CD',
    name: 'RD Congo',
    flag: '🇨🇩',
    currency: 'USD',
    currencySymbol: '$',
    phonePrefix: '+243',
    cities: ['Kinshasa', 'Lubumbashi', 'Goma', 'Kolwezi', 'Bukavu'],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: '$CA',
    phonePrefix: '+1',
    cities: ['Montréal', 'Québec', 'Toronto', 'Ottawa', 'Gatineau'],
  },
  {
    code: 'GLOBAL',
    name: 'International (Tous pays)',
    flag: '🌍',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '+',
    cities: ['Toutes les villes'],
  },
];

// Plans with regional dynamic pricing depending on currency
export interface PlanLocalizedPricing {
  starter: { price: number; display: string };
  pro: { monthly: number; yearly: number; displayMonthly: string; displayYearly: string };
  agency: { monthly: number; yearly: number; displayMonthly: string; displayYearly: string };
}

export const REGIONAL_PRICING: Record<string, PlanLocalizedPricing> = {
  XOF: {
    starter: { price: 0, display: 'Gratuit' },
    pro: { monthly: 15000, yearly: 150000, displayMonthly: '15 000 FCFA', displayYearly: '150 000 FCFA' },
    agency: { monthly: 45000, yearly: 450000, displayMonthly: '45 000 FCFA', displayYearly: '450 000 FCFA' },
  },
  XAF: {
    starter: { price: 0, display: 'Gratuit' },
    pro: { monthly: 15000, yearly: 150000, displayMonthly: '15 000 FCFA', displayYearly: '150 000 FCFA' },
    agency: { monthly: 45000, yearly: 450000, displayMonthly: '45 000 FCFA', displayYearly: '450 000 FCFA' },
  },
  EUR: {
    starter: { price: 0, display: 'Gratuit' },
    pro: { monthly: 24, yearly: 240, displayMonthly: '24 €', displayYearly: '240 €' },
    agency: { monthly: 69, yearly: 690, displayMonthly: '69 €', displayYearly: '690 €' },
  },
  USD: {
    starter: { price: 0, display: 'Free' },
    pro: { monthly: 25, yearly: 250, displayMonthly: '$25', displayYearly: '$250' },
    agency: { monthly: 75, yearly: 750, displayMonthly: '$75', displayYearly: '$750' },
  },
  CAD: {
    starter: { price: 0, display: 'Gratuit' },
    pro: { monthly: 35, yearly: 350, displayMonthly: '35 $CA', displayYearly: '350 $CA' },
    agency: { monthly: 99, yearly: 990, displayMonthly: '99 $CA', displayYearly: '990 $CA' },
  },
  MAD: {
    starter: { price: 0, display: 'Gratuit' },
    pro: { monthly: 250, yearly: 2500, displayMonthly: '250 DH', displayYearly: '2 500 DH' },
    agency: { monthly: 750, yearly: 7500, displayMonthly: '750 DH', displayYearly: '7 500 DH' },
  },
};

export function getPricingForCurrency(currency: string): PlanLocalizedPricing {
  return REGIONAL_PRICING[currency] || REGIONAL_PRICING.EUR;
}

// Taux de conversion approximatifs depuis le XOF (référence : prix saisis par le
// superadmin dans Plans & Tarifs, toujours exprimés en XOF). Permet d'afficher un
// prix cohérent dans la devise locale du visiteur SANS dupliquer une grille de
// prix par devise : le superadmin ne pilote qu'une seule source de vérité (la DB).
export const XOF_EXCHANGE_RATES: Record<string, number> = {
  XOF: 1,
  XAF: 1, // parité fixe CFA
  EUR: 1 / 655.96, // parité fixe XOF/EUR
  USD: 1 / 610,
  CAD: 1 / 450,
  MAD: 1 / 61,
};

function convertFromXof(amountXof: number, currency: string): number {
  const rate = XOF_EXCHANGE_RATES[currency] ?? XOF_EXCHANGE_RATES.EUR;
  const converted = amountXof * rate;
  // Arrondi "propre" : entiers pour FCFA, 2 décimales max pour les autres devises
  if (currency === 'XOF' || currency === 'XAF') return Math.round(converted);
  return Math.round(converted * 100) / 100;
}

export interface FormattedSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  period: string;
  description: string;
  features: string[];
  max_properties: number;
  highlight?: boolean;
}

/**
 * Construit la liste des plans affichés sur la page tarifs publique.
 *
 * Si `basePlans` est fourni (chargé depuis la base via planService, donc
 * piloté par le SuperAdmin dans Plans & Tarifs), les prix, noms, descriptions
 * et fonctionnalités proviennent directement de la base — seule la conversion
 * de devise est calculée ici. Sans connexion Supabase, on retombe sur une
 * grille par défaut pour que la page reste fonctionnelle hors-ligne.
 */
export function getPricingPlansList(currency: string, basePlans?: Array<{ id: string; name: string; price: number; description: string; features: string[]; max_properties: number; is_featured?: boolean; interval?: string }>): FormattedSubscriptionPlan[] {
  if (basePlans && basePlans.length > 0) {
    return basePlans.map(plan => {
      const convertedPrice = convertFromXof(plan.price, currency);
      return {
        id: plan.id,
        name: plan.name,
        price: convertedPrice,
        formattedPrice: convertedPrice === 0 ? 'Gratuit' : formatCurrencyAmount(convertedPrice, currency),
        period: plan.interval === 'year' ? 'an' : 'mois',
        description: plan.description,
        features: plan.features,
        max_properties: plan.max_properties,
        highlight: plan.is_featured,
      };
    });
  }

  const p = getPricingForCurrency(currency);

  return [
    {
      id: 'free',
      name: 'Starter Gratuit',
      price: p.starter.price,
      formattedPrice: p.starter.display,
      period: 'toujours',
      description: 'Idéal pour démarrer avec un premier bien ou une chambre en colocation.',
      features: [
        'Gestion de 1 à 2 logements / chambres',
        'Génération de quittances de loyer PDF',
        'Enregistrement des paiements & dépenses',
        'Publication sur le portail public',
      ],
      max_properties: 2,
    },
    {
      id: 'pro_monthly',
      name: 'Bailleur Pro',
      price: p.pro.monthly,
      formattedPrice: p.pro.displayMonthly,
      period: 'mois',
      description: 'Pour les propriétaires exigeants souhaitant automatiser leur gestion.',
      features: [
        'Jusqu’à 15 logements & chambres',
        'Badge "Bailleur Certifié CNI" prioritaire',
        'Rappels automatiques d’échéances WhatsApp/SMS',
        'Rapports financiers & bilans annuels exportables',
        'Réception directe des demandes de visite',
      ],
      max_properties: 15,
      highlight: true,
    },
    {
      id: 'agency_monthly',
      name: 'Agence & Patrimoine',
      price: p.agency.monthly,
      formattedPrice: p.agency.displayMonthly,
      period: 'mois',
      description: 'Conçu pour les cabinets immobiliers et gestionnaires de parcs locatifs.',
      features: [
        'Chambres et immeubles illimités',
        'Multi-gestionnaires & accès collaborateurs',
        'Gestion complète des états des lieux et cautions',
        'Rapprochement comptable & balance des loyers',
        'Support dédié prioritaire 7j/7',
      ],
      max_properties: 9999,
    },
  ];
}

/**
 * Format any amount into the local currency
 */
export function formatCurrencyAmount(amount: number, currency: string = 'XOF'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ' + currency;

  if (currency === 'XOF' || currency === 'XAF' || currency === 'FCFA') {
    return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
  }
  if (currency === 'EUR') {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'CAD') {
    return `${amount.toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $CA`;
  }
  if (currency === 'MAD') {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} DH`;
  }

  return `${amount.toLocaleString('fr-FR')} ${currency}`;
}

/**
 * Intelligent country detection by timezone and browser environment
 */
export function detectUserCountry(): CountryConfig {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || '').toLowerCase();

    // Timezone mapping
    if (tz.includes('Abidjan')) return SUPPORTED_COUNTRIES.find(c => c.code === 'CI')!;
    if (tz.includes('Dakar')) return SUPPORTED_COUNTRIES.find(c => c.code === 'SN')!;
    if (tz.includes('Douala') || tz.includes('Yaounde')) return SUPPORTED_COUNTRIES.find(c => c.code === 'CM')!;
    if (tz.includes('Porto-Novo') || tz.includes('Cotonou')) return SUPPORTED_COUNTRIES.find(c => c.code === 'BJ')!;
    if (tz.includes('Lome')) return SUPPORTED_COUNTRIES.find(c => c.code === 'TG')!;
    if (tz.includes('Libreville')) return SUPPORTED_COUNTRIES.find(c => c.code === 'GA')!;
    if (tz.includes('Casablanca')) return SUPPORTED_COUNTRIES.find(c => c.code === 'MA')!;
    if (tz.includes('Kinshasa') || tz.includes('Lubumbashi')) return SUPPORTED_COUNTRIES.find(c => c.code === 'CD')!;
    if (tz.includes('Paris') || tz.includes('Europe/')) return SUPPORTED_COUNTRIES.find(c => c.code === 'FR')!;
    if (tz.includes('Montreal') || tz.includes('Toronto') || tz.includes('America/Halifax') || tz.includes('America/Vancouver')) {
      return SUPPORTED_COUNTRIES.find(c => c.code === 'CA')!;
    }

    // Language heuristics
    if (lang.includes('ci')) return SUPPORTED_COUNTRIES.find(c => c.code === 'CI')!;
    if (lang.includes('sn')) return SUPPORTED_COUNTRIES.find(c => c.code === 'SN')!;
    if (lang.includes('cm')) return SUPPORTED_COUNTRIES.find(c => c.code === 'CM')!;
    if (lang.includes('bj')) return SUPPORTED_COUNTRIES.find(c => c.code === 'BJ')!;
    if (lang.includes('fr')) return SUPPORTED_COUNTRIES.find(c => c.code === 'FR')!;
  } catch (err) {
    console.warn('Geolocation detection fallback', err);
  }

  // Default to Côte d'Ivoire / West Africa as central Francophone hub or France
  return SUPPORTED_COUNTRIES[0];
}
