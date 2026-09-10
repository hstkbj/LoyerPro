import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useGeo } from '../../contexts/GeoContext';
import { LocationSelectorModal } from './LocationSelectorModal';

export function PublicNavbar() {
  const { user, isSuperAdmin } = useAuth();
  const { currentCountry, currentCity, currentCurrency } = useGeo();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                Loyer<span className="text-emerald-600">Pro</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mt-0.5">
                Portail International
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              Accueil
            </Link>
            <Link to="/properties" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <span>Chambres & Logements</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Dispos
              </span>
            </Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">
              À propos
            </Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">
              Tarifs
            </Link>
            <Link to="/contact" className="hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Country / Currency pill */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 transition-all shadow-2xs"
              title="Changer de pays, ville ou devise"
            >
              <span className="text-sm">{currentCountry.flag}</span>
              <span className="font-semibold text-slate-900 max-w-[110px] truncate">{currentCountry.name}</span>
              {currentCity && <span className="text-slate-400 hidden xl:inline">({currentCity})</span>}
              <span className="text-slate-300">|</span>
              <span className="font-bold text-emerald-700 text-[11px]">{currentCurrency}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {isSuperAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/superadmin/dashboard')}
                    className="border-amber-300 text-amber-800 bg-amber-50 text-xs"
                  >
                    SuperAdmin
                  </Button>
                )}
                <Button size="sm" variant="primary" onClick={() => navigate('/dashboard')} className="text-xs">
                  Mon Espace Gestion
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate('/auth/login')} className="text-xs">
                  Connexion
                </Button>
                <Button size="sm" variant="primary" onClick={() => navigate('/auth/register')} className="text-xs">
                  Espace Propriétaire & Agence
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border border-slate-200 bg-slate-50 text-slate-700"
            >
              <span>{currentCountry.flag}</span>
              <span className="text-[11px] text-emerald-700 font-bold">{currentCurrency}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 pt-3 pb-6 md:hidden space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-slate-900"
              >
                Accueil
              </Link>
              <Link
                to="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-slate-900 flex items-center justify-between"
              >
                <span>Chambres & Logements disponibles</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {currentCountry.name}
                </span>
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-slate-900"
              >
                À propos de LoyerPro
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-slate-900"
              >
                Tarifs & Abonnements
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-slate-900"
              >
                Contact & Support
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLocationModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <span>{currentCountry.flag}</span>
                  <span>{currentCountry.name} ({currentCity || 'Toutes'})</span>
                </span>
                <span className="text-emerald-700 font-bold">{currentCurrency}</span>
              </button>

              {user ? (
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  Mon Espace Gestion
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/auth/login');
                    }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/auth/register');
                    }}
                  >
                    Créer un compte Propriétaire / Agence
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
}
