import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { useGeo } from '../../contexts/GeoContext';
import { Logo } from '../ui/Logo';
import { LEGAL, SITE, whatsappLink } from '../../lib/site';
import { resetConsent } from '../../lib/consent';

const linkClass = 'text-slate-400 transition-colors hover:text-white';

export function PublicFooter() {
  const { currentCurrency } = useGeo();
  const wa = whatsappLink('Bonjour, j’ai une question sur LoyerPro.');

  return (
    <footer className="bg-brand-950 text-sm text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Logo light />
            <p className="max-w-sm leading-relaxed text-slate-400">
              Trouvez un logement auprès de bailleurs vérifiés, ou gérez vos biens, contrats, loyers et quittances depuis un seul espace.
            </p>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-brand-200">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Identité des bailleurs vérifiée par notre équipe
            </p>
          </div>

          <nav aria-label="Locataires">
            <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-white">Locataires</h2>
            <ul className="space-y-2.5">
              <li><Link to="/properties?roomCategory=chambre_seule" className={linkClass}>Chambres meublées</Link></li>
              <li><Link to="/properties?roomCategory=colocation" className={linkClass}>Colocations</Link></li>
              <li><Link to="/properties?type=Studio" className={linkClass}>Studios</Link></li>
              <li><Link to="/properties?type=Appartement" className={linkClass}>Appartements et villas</Link></li>
              <li><Link to="/properties?verifiedOnly=true" className={linkClass}>Bailleurs vérifiés</Link></li>
            </ul>
          </nav>

          <nav aria-label="Bailleurs et agences">
            <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-white">Bailleurs et agences</h2>
            <ul className="space-y-2.5">
              <li><Link to="/register" className={linkClass}>Créer un compte</Link></li>
              <li><Link to="/pricing" className={linkClass}>Tarifs ({currentCurrency})</Link></li>
              <li><Link to="/about#verification" className={linkClass}>Vérification d'identité</Link></li>
              <li><Link to="/login" className={linkClass}>Connexion</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-white">Contact</h2>
            <ul className="space-y-2.5">
              <li>
                <a href={`mailto:${SITE.supportEmail}`} className={`${linkClass} inline-flex items-center gap-2`}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {SITE.supportEmail}
                </a>
              </li>
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                </li>
              )}
              <li><Link to="/contact" className={linkClass}>Formulaire de contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {LEGAL.companyName}. Tous droits réservés.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li><Link to="/conditions-generales" className={linkClass}>Conditions générales</Link></li>
            <li><Link to="/politique-de-confidentialite" className={linkClass}>Politique de confidentialité</Link></li>
            <li>
              <button type="button" onClick={resetConsent} className={linkClass}>
                Gérer les cookies
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
