// LoyerPro - Intégration Google Analytics 4 (gtag.js)
// Le script gtag.js n'est chargé que si VITE_GA_MEASUREMENT_ID est défini,
// afin de ne jamais casser l'application en son absence (dev, self-host...).

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let initialized = false;

export function getGaMeasurementId(): string {
  const env = (import.meta as any).env || {};
  return (env.VITE_GA_MEASUREMENT_ID || '').trim();
}

export function initGoogleAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  const measurementId = getGaMeasurementId();
  if (!measurementId) return;

  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined' || !window.gtag || !getGaMeasurementId()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag || !getGaMeasurementId()) return;
  window.gtag('event', name, params || {});
}
