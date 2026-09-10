import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  Lock,
  FileCheck,
  Sparkles,
  ArrowRight,
  Globe,
  Award,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useGeo } from '../../contexts/GeoContext';

export function AboutPage() {
  const { currentCountry, currentCurrency } = useGeo();

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section with High-End Architecture Imagery */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt="Architecture moderne"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-1.5 text-xs text-slate-300 backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>La plateforme immobilière de référence internationale</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Transparence, Sécurité & Sérénité <br className="hidden sm:inline" />
            pour l'immobilier locatif
          </h1>

          <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            LoyerPro réinvente l'expérience de la location en Afrique et dans le monde :
            des chambres et logements vérifiés pour les locataires, et un outil tout-en-un certifié pour les propriétaires et cabinets de gestion.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link to="/properties">
              <Button size="lg" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Explorer les chambres & logements
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline-white" className="font-semibold">
                Espace Propriétaire & Agence
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Notre Mission & Vision */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Notre Mission
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Mettre fin aux arnaques et simplifier chaque bail
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Trop souvent, chercher une chambre ou un appartement est un parcours du combattant : faux démarcheurs, photos trompeuses, cautions exigées sans reçu, ou litiges sans fin lors des fins de bail.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Pour les propriétaires et les agences, le recouvrement manuel des loyers, la gestion des impayés et la rédaction des quittances représentent des heures de stress répétitif.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  100% Vérifié
                </div>
                <p className="text-xs text-slate-500">
                  Chaque bailleur soumet sa pièce d'identité ou son registre de commerce avant de certifier ses biens.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Quittances avec QR code
                </div>
                <p className="text-xs text-slate-500">
                  Des reçus de paiement conformes générés en 1 clic et téléchargeables au format PDF.
                </p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-4/3">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
              alt="Intérieur moderne de chambre et studio"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Portail multi-pays</div>
                <div className="text-base font-bold">Actif en Afrique de l'Ouest, Centrale, France et International</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Les Trois Espaces Dédiés : Locataires, Propriétaires, Agences */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Une plateforme pensée pour chaque acteur
            </h2>
            <p className="text-sm text-slate-600">
              Que vous cherchiez une chambre pour vos études ou gériez un parc de 50 appartements, l'outil s'adapte à votre réalité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Locataires */}
            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pour les Locataires</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trouvez la chambre idéale (chambre seule, chambre-salon, colocation meublée ou studio) dans votre ville.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Détails transparents : caution, charges (eau, électricité, Wi-Fi) incluses ou non.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Bailleurs certifiés avec badge de vérification d'identité.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Prise de rendez-vous de visite en direct et contact WhatsApp certifié.</span>
                  </li>
                </ul>
              </div>
              <Link to="/properties">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Chercher une chambre disponible
                </Button>
              </Link>
            </div>

            {/* 2. Propriétaires Bailleurs */}
            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pour les Propriétaires</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sécurisez vos revenus locatifs et suivez vos encaissements sans paperasse ni litiges.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Publication d'annonces vérifiées avec galerie photos haute définition.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Génération de quittances conformes avec signature numérique et montant en toutes lettres.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Suivi des retards de paiement, des cautions et des charges d'entretien.</span>
                  </li>
                </ul>
              </div>
              <Link to="/auth/register">
                <Button variant="primary" size="sm" className="w-full text-xs font-semibold">
                  Créer un compte Propriétaire
                </Button>
              </Link>
            </div>

            {/* 3. Agences & Gestionnaires */}
            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pour les Cabinets & Agences</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilotez votre portefeuille immobilier multi-bailleurs avec reporting financier et validation juridique.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Gestion groupée de centaines de lots, studios, chambres et villas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Badge officiel « Agence Certifiée » affiché sur toutes vos annonces.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Export comptable instantané (CSV / Balance des loyers) pour vos bilans.</span>
                  </li>
                </ul>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Découvrir les offres Agences
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Processus de Vérification d'Identité Strict */}
      <section id="verification" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3.5 py-1 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Garantie Zéro Faux Profil</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Comment fonctionne la validation des propriétaires et agences ?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Pour protéger les locataires contre les fausses annonces et garantir la sécurité financière des transactions, chaque propriétaire bailleur et agence immobilière passe par un audit documentaire systématique :
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dépôt des pièces d'identité officielles</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Carte Nationale d'Identité, Passeport en cours de validité, et justificatif de domicile ou d'activité professionnelle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Accréditation commerciale pour les agences</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Registre du Commerce et du Crédit Mobilier (RCCM / Kbis), numéro d'identification fiscale et mandat de gestion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Attribution du Badge « Certifié LoyerPro »</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Une fois validé par nos modérateurs, le compte et ses biens affichent le badge vert de confiance visible par tous les candidats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Chiffres Clés & Portée Internationale */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">10+</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Pays couverts</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">100%</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Quittances vérifiées</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">24h</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Délai moyen de validation</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">6</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Devises prises en charge</div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Questions Fréquentes */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Questions Fréquentes</h2>
          <p className="text-xs sm:text-sm text-slate-500">Tout ce que vous devez savoir pour démarrer</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              La recherche et la prise de contact pour les locataires sont-elles gratuites ?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Oui, à 100%. Les locataires peuvent parcourir l'ensemble des annonces disponibles, filtrer par type de chambre, budget et commodités, et envoyer des demandes de visite gratuitement.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              Quels documents dois-je fournir pour valider mon compte propriétaire ?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Une copie lisible recto-verso de votre pièce d'identité (CNI ou Passeport). Pour les agences immobilières, le RCCM ou numéro d'enregistrement fiscal officiel est également obligatoire.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              Dans quelles devises s'effectuent les paiements ?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              LoyerPro adapte automatiquement les prix selon votre pays de résidence : en Francs CFA (XOF / XAF) pour l'Afrique de l'Ouest et Centrale, en Euros (€) pour l'Europe, en Dollars ($) pour l'Amérique du Nord, ou en Dirhams (DH) pour le Maghreb.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Final */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Prêt à transformer votre gestion locative ?
          </h3>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300">
            Rejoignez des centaines de bailleurs et locataires qui profitent d'un habitat plus transparent et sécurisé.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/properties">
              <Button size="lg" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Trouver une chambre
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline-white" className="font-semibold">
                S'enregistrer comme Bailleur
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
