import React, { useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useAuth } from '../../contexts/AuthContext';

// Mesure d'audience Vercel (sans cookie) + performances réelles (Core Web Vitals).
// - Les zones privées (/dashboard, /superadmin) ne sont jamais envoyées.
// - Les visites du superadmin connecté sont ignorées pour ne pas fausser les chiffres.
// Les résultats se consultent dans Vercel → projet → Analytics, et depuis le lien
// affiché dans l'espace superadmin (Analytique).
const PRIVATE_PREFIXES = ['/dashboard', '/superadmin', '/login', '/register', '/auth', '/reset-password'];

function isPrivatePath(url: string): boolean {
  try {
    const { pathname } = new URL(url, window.location.origin);
    return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  } catch {
    return false;
  }
}

export function VercelInsights() {
  const { isSuperAdmin } = useAuth();
  const ignore = useRef(false);

  useEffect(() => {
    ignore.current = Boolean(isSuperAdmin);
  }, [isSuperAdmin]);

  return (
    <>
      <Analytics
        beforeSend={(event) => {
          if (ignore.current || isPrivatePath(event.url)) return null;
          return event;
        }}
      />
      <SpeedInsights
        beforeSend={(data) => {
          if (ignore.current || isPrivatePath(data.url)) return null;
          return data;
        }}
      />
    </>
  );
}
