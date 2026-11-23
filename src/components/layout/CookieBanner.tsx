import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { CONSENT_EVENT, getConsent, setConsent } from '../../lib/consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
    const onChange = () => setVisible(getConsent() === null);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Gestion des cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:flex-1">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-slate-600">
            Nous utilisons des cookies indispensables au fonctionnement du site (connexion) et, avec votre accord,
            des cookies de mesure d'audience pour l'améliorer.{' '}
            <Link to="/politique-de-confidentialite" className="font-semibold text-teal-700 underline underline-offset-2 hover:text-teal-800">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => setConsent(false)}
            className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:flex-none"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => setConsent(true)}
            className="flex-1 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 sm:flex-none"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
