// Configuration centrale du site : une seule source de vérité pour le nom,
// l'URL, les coordonnées de contact et les informations légales.
// Surchargeable via les variables d'environnement VITE_* (voir .env.example).

const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;

function clean(value: string | undefined, fallback: string): string {
  const v = (value || '').trim();
  return v || fallback;
}

export const SITE = {
  name: 'LoyerPro',
  tagline: 'Gestion locative et logements vérifiés',
  description:
    "LoyerPro simplifie la location : trouvez un logement auprès de bailleurs vérifiés, ou gérez vos biens, contrats, loyers et quittances depuis un seul espace.",
  // URL publique, sans slash final. Sert aux balises canoniques et au partage.
  url: clean(env.VITE_SITE_URL, typeof window !== 'undefined' ? window.location.origin : 'https://loyerpro.vercel.app').replace(/\/+$/, ''),
  locale: 'fr_FR',
  themeColor: '#0f766e',
  ogImage: '/og-image.png',
  supportEmail: clean(env.VITE_SUPPORT_EMAIL, 'support@loyerpro.com'),
  // Numéro WhatsApp au format international sans "+" (ex. 22997000000).
  whatsappNumber: clean(env.VITE_WHATSAPP_NUMBER, ''),
  phoneDisplay: clean(env.VITE_SUPPORT_PHONE, ''),
  // Lien vers le tableau de bord Vercel Analytics (visible uniquement du superadmin).
  vercelAnalyticsUrl: clean(env.VITE_VERCEL_ANALYTICS_URL, ''),
} as const;

// Informations légales affichées dans la politique de confidentialité et les
// conditions générales. À COMPLÉTER avec la vraie raison sociale.
export const LEGAL = {
  companyName: clean(env.VITE_LEGAL_NAME, 'LoyerPro'),
  legalForm: clean(env.VITE_LEGAL_FORM, ''),
  registration: clean(env.VITE_LEGAL_REGISTRATION, ''),
  address: clean(env.VITE_LEGAL_ADDRESS, 'Porto-Novo, Bénin'),
  country: 'République du Bénin',
  dpoEmail: clean(env.VITE_DPO_EMAIL, clean(env.VITE_SUPPORT_EMAIL, 'support@loyerpro.com')),
  lastUpdated: '20 novembre 2026',
} as const;

export function absoluteUrl(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${p}`;
}

export function whatsappLink(message?: string): string | null {
  if (!SITE.whatsappNumber) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${SITE.whatsappNumber.replace(/[^0-9]/g, '')}${text}`;
}
