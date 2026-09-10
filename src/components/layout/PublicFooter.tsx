import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Globe, Mail, CheckCircle2 } from 'lucide-react';
import { useGeo } from '../../contexts/GeoContext';

export function PublicFooter() {
  const { currentCountry, currentCurrency } = useGeo();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">
                Loyer<span className="text-emerald-600">Pro</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Plateforme internationale de recherche de logements, de chambres vérifiées et de gestion locative automatisée pour locataires, propriétaires bailleurs et cabinets immobiliers.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Propriétaires & Agences certifiés par CNI/RCCM</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Portail Locataires
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/properties?roomCategory=chambre_seule" className="hover:text-slate-900 transition-colors">
                  Chambres individuelles & Meublées
                </Link>
              </li>
              <li>
                <Link to="/properties?roomCategory=colocation" className="hover:text-slate-900 transition-colors">
                  Colocations & Chambres partagées
                </Link>
              </li>
              <li>
                <Link to="/properties?type=Studio" className="hover:text-slate-900 transition-colors">
                  Studios autonomes
                </Link>
              </li>
              <li>
                <Link to="/properties?type=Appartement" className="hover:text-slate-900 transition-colors">
                  Appartements & Villas
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-slate-900 transition-colors">
                  Guide & Sécurité du locataire
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Bailleurs & Agences
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/auth/register" className="hover:text-slate-900 transition-colors">
                  Créer un compte Propriétaire
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="hover:text-slate-900 transition-colors">
                  Créer un compte Agence Immobilière
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-slate-900 transition-colors">
                  Tarifs & Abonnements ({currentCurrency})
                </Link>
              </li>
              <li>
                <Link to="/about#verification" className="hover:text-slate-900 transition-colors">
                  Processus de vérification d'identité
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Quittances légales instantanées</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Présence & Devises
            </h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Disponible en Afrique de l'Ouest, Afrique Centrale, France, Maghreb, Amérique du Nord et à l'international.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Région active : {currentCountry.flag} {currentCountry.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>support@loyerpro.com</span>
              </div>
              <div className="pt-2 flex flex-wrap gap-1 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">FCFA (XOF/XAF)</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">EUR (€)</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">USD ($)</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">MAD</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">CAD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LoyerPro. Tous droits réservés. Gestion locative & portail certifié.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-900 transition-colors">
              À propos
            </Link>
            <Link to="/properties" className="hover:text-slate-900 transition-colors">
              Annonces
            </Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">
              Tarifs
            </Link>
            <Link to="/contact" className="hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
