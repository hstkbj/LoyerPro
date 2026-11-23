// Gestion du consentement aux cookies / traceurs.
// Les cookies strictement nécessaires (session de connexion) ne demandent pas de consentement.
// Les mesures d'audience Google Analytics ne sont chargées qu'après acceptation.

const STORAGE_KEY = 'loyerpro_cookie_consent_v1';
export const CONSENT_EVENT = 'loyerpro:consent-changed';

export interface ConsentState {
  analytics: boolean;
  decidedAt: string;
}

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== 'boolean') return null;
    return parsed as ConsentState;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean) {
  const state: ConsentState = { analytics, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // stockage indisponible : le choix vaut pour la session en cours seulement
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export function resetConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}
