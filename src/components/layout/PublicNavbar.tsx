import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGeo } from '../../contexts/GeoContext';
import { LocationSelectorModal } from './LocationSelectorModal';
import { Logo } from '../ui/Logo';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { to: '/properties', label: 'Logements' },
  { to: '/pricing', label: 'Tarifs' },
  { to: '/about', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
];

export function PublicNavbar() {
  const { user, isSuperAdmin } = useAuth();
  const { currentCountry, currentCity, currentCurrency } = useGeo();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Ferme le menu mobile à chaque changement de page
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Verrouille le défilement derrière le menu mobile ouvert
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'text-brand-800 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    );

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Aller au contenu
      </a>

      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md transition-shadow',
          scrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="LoyerPro, retour à l'accueil" className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              aria-label={`Pays : ${currentCountry.name}, devise ${currentCurrency}. Modifier`}
            >
              <span aria-hidden="true">{currentCountry.flag}</span>
              <span className="max-w-[90px] truncate">{currentCity || currentCountry.name}</span>
              <span className="font-bold text-brand-700">{currentCurrency}</span>
            </button>

            {user ? (
              <>
                {isSuperAdmin && (
                  <Link
                    to="/superadmin/dashboard"
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    SuperAdmin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Mon espace
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Publier mon bien
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="menu-mobile"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div id="menu-mobile" className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-slate-200 bg-white px-4 pb-8 pt-4 md:hidden">
            <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3.5 text-base font-semibold',
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-800 hover:bg-slate-50'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setLocationOpen(true);
              }}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {currentCountry.flag} {currentCountry.name}
                {currentCity ? ` · ${currentCity}` : ''}
              </span>
              <span className="font-bold text-brand-700">{currentCurrency}</span>
            </button>

            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <Link to="/dashboard" className="rounded-xl bg-brand-700 px-4 py-3.5 text-center text-base font-semibold text-white">
                    Mon espace
                  </Link>
                  {isSuperAdmin && (
                    <Link to="/superadmin/dashboard" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 text-center text-base font-semibold text-amber-800">
                      SuperAdmin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/register" className="rounded-xl bg-brand-700 px-4 py-3.5 text-center text-base font-semibold text-white">
                    Publier mon bien
                  </Link>
                  <Link to="/login" className="rounded-xl border border-slate-300 px-4 py-3.5 text-center text-base font-semibold text-slate-800">
                    Connexion
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <LocationSelectorModal isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
