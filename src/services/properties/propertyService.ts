import { getSupabase } from '../supabase/client';
import type { Property } from '../../types';

const STORAGE_KEY = 'loyerpro_data_properties';

// Curated high-standard seed listings across key countries so public pages are rich, informative, and visually stunning
export const INITIAL_VERIFIED_PROPERTIES: Property[] = [
  // --- CÔTE D'IVOIRE ---
  {
    id: 'prop-ci-01',
    user_id: 'owner-ci-1',
    title: 'Chambre meublée autonome avec balcon privatif',
    slug: 'chambre-meublee-autonome-cocody-angre',
    type: 'Chambre seule',
    country: "Côte d'Ivoire",
    city: 'Abidjan',
    neighborhood: 'Cocody Angré 8ème Tranche',
    address: 'Rue des Ambassades, Ilot 14',
    price: 90000,
    currency: 'XOF',
    bedrooms: 1,
    bathrooms: 1,
    surface: 24,
    room_category: 'chambre_seule',
    bathroom_type: 'private',
    kitchen_type: 'shared',
    deposit_months: 2,
    charges_included: true,
    utilities_included: ['Eau courante', 'Wi-Fi Fibre 100Mbps', 'Ménage des communs', 'Gardien 24h/7'],
    amenities: ['Climatisation', 'Wi-Fi haut débit', 'Lit queen size', 'Placard intégré', 'Balcon', 'Sécurité 24/7', 'Compteur CIE à carte'],
    description: 'Magnifique chambre moderne entièrement climatisée dans une résidence sécurisée avec vigile. Salle de douche privative avec eau chaude, grand lit confort, penderie et espace bureau. Idéal pour jeune cadre ou étudiant sérieux.',
    conditions: '2 mois de caution + 1 mois de loyer d’avance. Pièce d’identité et justificatif de revenus requis.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Amadou Koné',
      agency_name: 'Résidences Cocody Prestige',
      phone: '+225 07 48 29 10 33',
      email: 'amadou.kone@residences-cocody.ci',
      role: 'agency',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'prop-ci-02',
    user_id: 'owner-ci-2',
    title: 'Studio standing neuf avec cuisine américaine',
    slug: 'studio-standing-neuf-marcory-zone4',
    type: 'Studio',
    country: "Côte d'Ivoire",
    city: 'Abidjan',
    neighborhood: 'Marcory Zone 4',
    address: 'Rue du Canal',
    price: 180000,
    currency: 'XOF',
    bedrooms: 1,
    bathrooms: 1,
    surface: 38,
    room_category: 'studio',
    bathroom_type: 'private',
    kitchen_type: 'private',
    deposit_months: 2,
    charges_included: false,
    utilities_included: ['Gardiennage', 'Entretien des parties communes'],
    amenities: ['Climatiseur split', 'Cuisine équipée', 'Groupe électrogène', 'Parking fermé', 'Chauffe-eau'],
    description: 'Charmant studio tout confort dans un immeuble neuf avec ascenseur et groupe électrogène. Cuisine américaine avec rangements, baie vitrée lumineuse, finitions soignées.',
    conditions: 'Bail de 1 an renouvelable. Caution 2 mois.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Mme Clarisse Kouassi',
      phone: '+225 05 92 11 44 80',
      email: 'clarisse.kouassi@loyerpro.ci',
      role: 'owner',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-18T14:30:00Z',
  },
  {
    id: 'prop-ci-03',
    user_id: 'owner-ci-3',
    title: 'Appartement 3 pièces lumineux avec grande terrasse',
    slug: 'appartement-3-pieces-plateau-dokui',
    type: 'Appartement',
    country: "Côte d'Ivoire",
    city: 'Abidjan',
    neighborhood: 'Riviera Palmeraie',
    address: 'Boulevard Mitterrand face Rosiers',
    price: 320000,
    currency: 'XOF',
    bedrooms: 2,
    bathrooms: 2,
    surface: 88,
    room_category: 'appartement',
    bathroom_type: 'private',
    kitchen_type: 'private',
    deposit_months: 2,
    charges_included: false,
    utilities_included: ['Sécurité', 'Espace poubelles'],
    amenities: ['Terrasse panoramique', 'Parking réservé', '2 Salles de bain', 'Placards', 'Baies vitrées'],
    description: 'Superbe appartement T3 traversant, salon spacieux et aéré, cuisine séparée avec buanderie, suite parentale avec douche italienne. Proche commerces et transports.',
    conditions: 'Contrat d’un an, dépôt de garantie légal.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Cabinet Immobilier Ivoire Horizon',
      agency_name: 'Ivoire Horizon Immo',
      phone: '+225 27 22 41 80 00',
      email: 'contact@ivoirehorizon.ci',
      role: 'agency',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-20T09:00:00Z',
  },

  // --- SÉNÉGAL ---
  {
    id: 'prop-sn-01',
    user_id: 'owner-sn-1',
    title: 'Chambre individuelle moderne dans colocation chic',
    slug: 'chambre-individuelle-colocation-almadies',
    type: 'Colocation',
    country: 'Sénégal',
    city: 'Dakar',
    neighborhood: 'Almadies',
    address: 'Route des Almadies, près ambassade USA',
    price: 130000,
    currency: 'XOF',
    bedrooms: 1,
    bathrooms: 1,
    surface: 26,
    room_category: 'colocation',
    bathroom_type: 'private',
    kitchen_type: 'shared',
    deposit_months: 1,
    charges_included: true,
    utilities_included: ['Fibre optique Orange', 'Eau Senelec', 'Femme de ménage 2x/semaine', 'Sécurité'],
    amenities: ['Piscine commune', 'Wi-Fi haut débit', 'Salle de bain privative', 'Smart TV', 'Balcon', 'Climatisation'],
    description: 'Chambre privative avec salle d’eau dans un grand duplex contemporain aux Almadies. Cuisine partagée ultra-équipée, salon convivial, accès piscine et terrasse sur le toit.',
    conditions: 'Ambiance calme et studieuse. Pas de nuisances sonores.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Babacar Diop',
      agency_name: 'Dakar Coliving & Suites',
      phone: '+221 77 340 12 90',
      email: 'babacar@dakarcoliving.sn',
      role: 'agency',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-22T11:00:00Z',
  },
  {
    id: 'prop-sn-02',
    user_id: 'owner-sn-2',
    title: 'Studio meublé cosy vue mer',
    slug: 'studio-meuble-mermoz-vue-mer',
    type: 'Studio',
    country: 'Sénégal',
    city: 'Dakar',
    neighborhood: 'Mermoz / Ouakam',
    address: 'Corniche Ouest',
    price: 210000,
    currency: 'XOF',
    bedrooms: 1,
    bathrooms: 1,
    surface: 35,
    room_category: 'studio',
    bathroom_type: 'private',
    kitchen_type: 'private',
    deposit_months: 2,
    charges_included: true,
    utilities_included: ['Eau', 'Wi-Fi fibre', 'Gardien'],
    amenities: ['Vue sur l’océan', 'Cuisine équipée', 'Chauffe-eau', 'Climatiseur', 'Ascenseur'],
    description: 'Idéal pour séjours professionnels ou expatriés. Proche université, hôpitaux et commerces. Balcon avec coucher de soleil magnifique.',
    conditions: 'Caution 2 mois, disponible immédiatement.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Fatou Ndiaye',
      phone: '+221 70 812 55 20',
      email: 'fatou.ndiaye@loyerpro.sn',
      role: 'owner',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-23T15:00:00Z',
  },

  // --- CAMEROUN ---
  {
    id: 'prop-cm-01',
    user_id: 'owner-cm-1',
    title: 'Chambre moderne ventilée & climatisée Bonapriso',
    slug: 'chambre-moderne-bonapriso-douala',
    type: 'Chambre seule',
    country: 'Cameroun',
    city: 'Douala',
    neighborhood: 'Bonapriso',
    address: 'Rue Njo-Njo',
    price: 85000,
    currency: 'XAF',
    bedrooms: 1,
    bathrooms: 1,
    surface: 22,
    room_category: 'chambre_seule',
    bathroom_type: 'private',
    kitchen_type: 'shared',
    deposit_months: 2,
    charges_included: true,
    utilities_included: ['Eau Eneo', 'Vigile de nuit', 'Nettoyage des couloirs'],
    amenities: ['Salle de bain interne', 'Climatisation', 'Compteur individuel', 'Barreaudage sécurité', 'Forage d’eau'],
    description: 'Chambre indépendante propre et sécurisée à Bonapriso, quartier calme et résidentiel. Forage automatique (eau 24/24), sanitaires modernes.',
    conditions: 'Contrat semestriel ou annuel. Personne seule de préférence.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Samuel Eto’o Mbassi',
      agency_name: 'Littoral Immo Conseil',
      phone: '+237 699 44 22 10',
      email: 'contact@littoral-immo.cm',
      role: 'agency',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-24T08:00:00Z',
  },
  {
    id: 'prop-cm-02',
    user_id: 'owner-cm-2',
    title: 'Appartement 2 chambres de standing Bastos',
    slug: 'appartement-2-chambres-bastos-yaounde',
    type: 'Appartement',
    country: 'Cameroun',
    city: 'Yaoundé',
    neighborhood: 'Bastos',
    address: 'Descente ambassade de Grèce',
    price: 350000,
    currency: 'XAF',
    bedrooms: 2,
    bathrooms: 2,
    surface: 95,
    room_category: 'appartement',
    bathroom_type: 'private',
    kitchen_type: 'private',
    deposit_months: 2,
    charges_included: false,
    utilities_included: ['Gardiennage armé', 'Service poubelle'],
    amenities: ['Groupe électrogène automatique', 'Réservoir d’eau 5000L', 'Parking sous-sol', 'Climatisation intégrale'],
    description: 'Splendide appartement au coeur de Bastos. Finitions européennes, cuisine avec placards laqués, dressing dans la chambre principale.',
    conditions: 'Caution 2 mois.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Mme Chantal Ngo',
      phone: '+237 677 31 19 05',
      email: 'chantal.ngo@loyerpro.cm',
      role: 'owner',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-25T16:00:00Z',
  },

  // --- FRANCE ---
  {
    id: 'prop-fr-01',
    user_id: 'owner-fr-1',
    title: 'Studio meublé avec balcon proche métro',
    slug: 'studio-meuble-paris-11',
    type: 'Studio',
    country: 'France',
    city: 'Paris',
    neighborhood: '11ème arrondissement (Bastille / Voltaire)',
    address: 'Rue de la Roquette',
    price: 780,
    currency: 'EUR',
    bedrooms: 1,
    bathrooms: 1,
    surface: 25,
    room_category: 'studio',
    bathroom_type: 'private',
    kitchen_type: 'private',
    deposit_months: 1,
    charges_included: true,
    utilities_included: ['Chauffage collectif', 'Eau froide et chaude', 'Entretien ascenseur', 'Local vélo sécurisé'],
    amenities: ['Kitchenette équipée', 'Fibre optique', 'Ascenseur', 'Digicode / Interphone', 'Double vitrage'],
    description: 'Joli studio parisien lumineux au 4ème étage avec ascenseur. Pièce de vie avec canapé lit confort bultex, rangements, coin bureau, salle d’eau rénovée avec WC suspendu.',
    conditions: 'Dossier complet demandé : contrat de travail, 3 derniers bulletins de salaire ou garant (Garantme / Visale acceptés).',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Julien Mercier',
      agency_name: 'Mercier Gestion Patrimoine',
      phone: '+33 6 42 18 90 12',
      email: 'j.mercier@patrimoine-paris.fr',
      role: 'agency',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-26T10:00:00Z',
  },
  {
    id: 'prop-fr-02',
    user_id: 'owner-fr-2',
    title: 'Chambre privée en colocation étudiante & jeune actif',
    slug: 'chambre-colocation-lyon-part-dieu',
    type: 'Colocation',
    country: 'France',
    city: 'Lyon',
    neighborhood: 'Part-Dieu / Préfecture',
    address: 'Avenue de Saxe',
    price: 490,
    currency: 'EUR',
    bedrooms: 1,
    bathrooms: 1,
    surface: 18,
    room_category: 'colocation',
    bathroom_type: 'shared',
    kitchen_type: 'shared',
    deposit_months: 1,
    charges_included: true,
    utilities_included: ['Électricité', 'Chauffage', 'Fibre WiFi 1Gbps', 'Assurance habitation incluse'],
    amenities: ['Lit 140x200', 'Grand dressing', 'Bail individuel sans solidarité', 'Lave-linge & Sèche-linge', 'Éligible APL'],
    description: 'Chambre calme donnant sur cour arborée dans un grand T4 traversant rénové à neuf. Cuisine moderne avec lave-vaisselle, grand salon convivial.',
    conditions: 'Bail individuel, éligible aux aides au logement (CAF/APL).',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Claire Dupont',
      phone: '+33 6 11 88 77 00',
      email: 'claire.dupont@loyerpro.fr',
      role: 'owner',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-27T12:00:00Z',
  },

  // --- BÉNIN ---
  {
    id: 'prop-bj-01',
    user_id: 'owner-bj-1',
    title: 'Chambre & Salon meublé de standing Haie Vive',
    slug: 'chambre-salon-meuble-haie-vive-cotonou',
    type: 'Chambre & Salon',
    country: 'Bénin',
    city: 'Cotonou',
    neighborhood: 'Haie Vive',
    address: 'Près de l’Aéroport & Restaurants',
    price: 160000,
    currency: 'XOF',
    bedrooms: 1,
    bathrooms: 1,
    surface: 45,
    room_category: 'chambre_salon',
    bathroom_type: 'private',
    kitchen_type: 'private',
    deposit_months: 2,
    charges_included: true,
    utilities_included: ['Eau SONEB', 'Wi-Fi haut débit', 'Gardien de jour et nuit'],
    amenities: ['Climatiseur Inverter', 'Smart TV', 'Terrasse privative', 'Compteur SBEE séparé', 'Parking moto/voiture'],
    description: 'Logement spacieux dans le quartier le plus prisé de Cotonou. Finition soignée, cuisine aménagée, salle d’eau moderne avec chauffe-eau.',
    conditions: 'Caution 2 mois + 1 mois d’avance.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Désiré Hounnou',
      agency_name: 'Benin Prestige Habitat',
      phone: '+229 97 12 34 56',
      email: 'contact@prestigehabitat.bj',
      role: 'agency',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-02-28T09:00:00Z',
  },

  // --- MAROC ---
  {
    id: 'prop-ma-01',
    user_id: 'owner-ma-1',
    title: 'Studio moderne ensoleillé quartier Maarif',
    slug: 'studio-moderne-maarif-casablanca',
    type: 'Studio',
    country: 'Maroc',
    city: 'Casablanca',
    neighborhood: 'Maârif Extension',
    address: 'Boulevard Ghandi',
    price: 3800,
    currency: 'MAD',
    bedrooms: 1,
    bathrooms: 1,
    surface: 42,
    room_category: 'studio',
    bathroom_type: 'private',
    kitchen_type: 'private',
    deposit_months: 1,
    charges_included: true,
    utilities_included: ['Syndic', 'Entretien de l’immeuble', 'Concierge permanent'],
    amenities: ['Ascenseur', 'Place de garage titrée', 'Cuisine américaine équipée', 'Climatisation réversible', 'Balcon'],
    description: 'Magnifique studio neuf au 3ème étage, exposition plein sud. Salon lumineux, cuisine moderne intégrée avec hotte et plaques, salle de bain italienne.',
    conditions: 'Bail légalisé, caution 1 mois.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1502005229762-ee1b2b814a60?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Karim Benjelloun',
      agency_name: 'Casa Prime Real Estate',
      phone: '+212 6 61 23 45 67',
      email: 'k.benjelloun@casaprime.ma',
      role: 'agency',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-03-01T14:00:00Z',
  },

  // --- CANADA ---
  {
    id: 'prop-ca-01',
    user_id: 'owner-ca-1',
    title: 'Chambre meublée tout inclus Plateau Mont-Royal',
    slug: 'chambre-tout-inclus-plateau-montreal',
    type: 'Chambre seule',
    country: 'Canada',
    city: 'Montréal',
    neighborhood: 'Plateau Mont-Royal',
    address: 'Avenue du Mont-Royal Est',
    price: 750,
    currency: 'CAD',
    bedrooms: 1,
    bathrooms: 1,
    surface: 20,
    room_category: 'chambre_seule',
    bathroom_type: 'shared',
    kitchen_type: 'shared',
    deposit_months: 1,
    charges_included: true,
    utilities_included: ['Hydro-Québec (Chauffage/Élec)', 'Wi-Fi Illimité Vidéotron', 'Laveuse-sécheuse'],
    amenities: ['Chauffage inclus', 'Près métro Mont-Royal', 'Meublé avec literie', 'Cour arrière partagée', 'Planchers de bois franc'],
    description: 'Belle grande chambre privée ensoleillée dans un appartement typique montréalais. À 5 minutes du métro, cafés, épiceries et parcs.',
    conditions: 'Enquête de crédit ou caution parentale pour étudiants.',
    status: 'available',
    published: true,
    owner_verified: true,
    photos: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      full_name: 'Marc-André Tremblay',
      phone: '+1 514 820 9911',
      email: 'tremblay.immo@loyerpro.ca',
      role: 'owner',
      is_verified: true,
      verification_status: 'verified',
    },
    created_at: '2026-03-02T16:00:00Z',
  },
];

function getLocalProperties(): Property[] {
  if (typeof window === 'undefined') return INITIAL_VERIFIED_PROPERTIES;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // initialize with initial verified properties
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VERIFIED_PROPERTIES));
    return INITIAL_VERIFIED_PROPERTIES;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VERIFIED_PROPERTIES));
      return INITIAL_VERIFIED_PROPERTIES;
    }
    return parsed;
  } catch {
    return INITIAL_VERIFIED_PROPERTIES;
  }
}

function saveLocalProperties(items: Property[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const propertyService = {
  // Public list of published properties with full localization & room filtering
  async getPublishedProperties(filters?: {
    country?: string;
    city?: string;
    type?: string;
    roomCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    search?: string;
    chargesIncludedOnly?: boolean;
    verifiedOnly?: boolean;
  }): Promise<Property[]> {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase
        .from('properties')
        .select('*, profiles:user_id(full_name, agency_name, phone, role, verification_status)')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (filters?.country && filters.country !== 'International (Tous pays)' && filters.country !== 'GLOBAL') {
        query = query.eq('country', filters.country);
      }
      if (filters?.city && filters.city !== 'Toutes les villes') {
        query = query.eq('city', filters.city);
      }
      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.minPrice) query = query.gte('price', filters.minPrice);
      if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters?.bedrooms) query = query.gte('bedrooms', filters.bedrooms);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let results = data as Property[];
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          results = results.filter(
            p =>
              p.title.toLowerCase().includes(s) ||
              (p.city && p.city.toLowerCase().includes(s)) ||
              (p.neighborhood && p.neighborhood.toLowerCase().includes(s)) ||
              (p.description && p.description.toLowerCase().includes(s))
          );
        }
        return results;
      }
    }

    // Local verified store
    let items = getLocalProperties().filter(p => p.published);

    if (filters?.country && filters.country !== 'International (Tous pays)' && filters.country !== 'GLOBAL') {
      const targetCountry = filters.country.toLowerCase();
      const filteredByCountry = items.filter(p => p.country && p.country.toLowerCase() === targetCountry);
      // If matches exist in this country, restrict to country
      if (filteredByCountry.length > 0) {
        items = filteredByCountry;
      }
    }

    if (filters?.city && filters.city !== 'Toutes les villes') {
      const targetCity = filters.city.toLowerCase();
      const filteredByCity = items.filter(p => p.city && p.city.toLowerCase() === targetCity);
      if (filteredByCity.length > 0) {
        items = filteredByCity;
      }
    }

    if (filters?.type) {
      items = items.filter(p => p.type.toLowerCase() === filters.type!.toLowerCase());
    }

    if (filters?.roomCategory) {
      items = items.filter(p => p.room_category === filters.roomCategory);
    }

    if (filters?.chargesIncludedOnly) {
      items = items.filter(p => p.charges_included);
    }

    if (filters?.verifiedOnly) {
      items = items.filter(p => p.owner_verified || p.owner?.is_verified);
    }

    if (filters?.minPrice) {
      items = items.filter(p => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice) {
      items = items.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters?.bedrooms) {
      items = items.filter(p => p.bedrooms >= filters.bedrooms!);
    }

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(
        p =>
          p.title.toLowerCase().includes(s) ||
          (p.city && p.city.toLowerCase().includes(s)) ||
          (p.neighborhood && p.neighborhood.toLowerCase().includes(s)) ||
          (p.description && p.description.toLowerCase().includes(s)) ||
          (p.address && p.address.toLowerCase().includes(s))
      );
    }

    return items;
  },

  // Get single property by slug or ID
  async getPropertyBySlug(slugOrId: string): Promise<Property | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles:user_id(full_name, agency_name, phone, role, verification_status)')
        .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
        .single();

      if (!error && data) return data as Property;
    }

    const items = getLocalProperties();
    return items.find(p => p.slug === slugOrId || p.id === slugOrId) || null;
  },

  async getPropertyById(id: string): Promise<Property | null> {
    return this.getPropertyBySlug(id);
  },

  // Owner properties
  async getMyProperties(userId?: string): Promise<Property[]> {
    const supabase = getSupabase();
    if (supabase) {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }
      if (uid) {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Property[];
      }
    }

    const items = getLocalProperties();
    return userId ? items.filter(p => p.user_id === userId) : items;
  },

  async getOwnerProperties(userId: string): Promise<Property[]> {
    return this.getMyProperties(userId);
  },

  // SuperAdmin: get all properties
  async getAllProperties(): Promise<Property[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles:user_id(full_name, agency_name, phone, role)')
        .order('created_at', { ascending: false });

      if (!error && data) return data as Property[];
    }
    return getLocalProperties();
  },

  // Create property
  async createProperty(property: Partial<Property> & { title: string; price: number; city: string }): Promise<Property> {
    const supabase = getSupabase();
    let uid = property.user_id;

    if (supabase) {
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id || '00000000-0000-0000-0000-000000000000';
      }

      const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
      const isPub = property.published ?? property.is_published ?? true;

      const payload = {
        type: 'Chambre seule',
        bedrooms: 1,
        bathrooms: 1,
        surface: 20,
        amenities: [],
        photos: [],
        status: 'available',
        ...property,
        published: isPub,
        slug,
        user_id: uid,
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(payload)
        .select()
        .single();

      if (!error && data) return data as Property;
    }

    const items = getLocalProperties();
    const isPub = property.published ?? property.is_published ?? true;
    const newProperty: Property = {
      type: 'Chambre seule',
      bedrooms: 1,
      bathrooms: 1,
      surface: 20,
      amenities: [],
      photos: property.photos && property.photos.length > 0 
        ? property.photos 
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
      status: 'available',
      ...property,
      published: isPub,
      slug: property.slug || property.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
      user_id: uid || 'local_user',
      id: 'prop_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.unshift(newProperty);
    saveLocalProperties(items);
    return newProperty;
  },

  // Update property
  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) return data as Property;
    }

    const items = getLocalProperties();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Bien non trouvé');

    const updated = {
      ...items[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    items[idx] = updated;
    saveLocalProperties(items);
    return updated;
  },

  // Delete property
  async deleteProperty(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('properties').delete().eq('id', id);
    }

    const items = getLocalProperties().filter(p => p.id !== id);
    saveLocalProperties(items);
  },

  // Toggle published status
  async togglePublish(id: string, currentPublished: boolean): Promise<Property> {
    return this.updateProperty(id, { published: !currentPublished });
  },
};
