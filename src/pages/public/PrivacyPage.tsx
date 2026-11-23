import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout, type LegalSection } from '../../components/layout/LegalLayout';
import { LEGAL, SITE } from '../../lib/site';
import { resetConsent } from '../../lib/consent';

const sections: LegalSection[] = [
  {
    id: 'responsable',
    title: 'Qui est responsable de vos données ?',
    content: (
      <>
        <p>
          Le responsable du traitement est <strong>{LEGAL.companyName}</strong>
          {LEGAL.legalForm ? ` (${LEGAL.legalForm})` : ''}, {LEGAL.address}.
          {LEGAL.registration ? ` Immatriculation : ${LEGAL.registration}.` : ''}
        </p>
        <p>
          Pour toute question sur vos données, écrivez-nous à{' '}
          <a href={`mailto:${LEGAL.dpoEmail}`}>{LEGAL.dpoEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: 'donnees',
    title: 'Les données que nous collectons',
    content: (
      <>
        <p>Nous ne collectons que ce qui est nécessaire au fonctionnement du service :</p>
        <ul>
          <li><strong>Compte :</strong> nom, adresse e-mail, numéro de téléphone, mot de passe (stocké chiffré, jamais lisible par nous).</li>
          <li><strong>Vérification d'identité des bailleurs et agences :</strong> pièce d'identité (CNI, passeport) et, pour les agences, document d'immatriculation (RCCM). Ces documents ne sont visibles que par vous et par les administrateurs chargés de la vérification.</li>
          <li><strong>Gestion locative :</strong> biens, locataires, contrats, loyers, dépenses et quittances que vous saisissez dans votre espace.</li>
          <li><strong>Échanges :</strong> demandes de visite, demandes de renseignements et messages envoyés via le formulaire de contact.</li>
          <li><strong>Paiements :</strong> références et statut des transactions. Les numéros de carte ou de Mobile Money sont traités directement par notre prestataire de paiement et ne transitent jamais par nos serveurs.</li>
          <li><strong>Données techniques :</strong> pages consultées, type d'appareil et de navigateur, pays approximatif, uniquement via les outils de mesure d'audience décrits plus bas.</li>
        </ul>
        <p>
          Votre pays, ville et devise sont mémorisés dans votre navigateur pour personnaliser l'affichage. Nous ne
          vous géolocalisons pas par votre adresse IP ni par GPS.
        </p>
      </>
    ),
  },
  {
    id: 'finalites',
    title: 'Pourquoi nous les utilisons',
    content: (
      <ul>
        <li>Créer et sécuriser votre compte, et vous authentifier.</li>
        <li>Fournir le service : publier des annonces, gérer contrats, loyers et quittances, mettre en relation locataires et bailleurs.</li>
        <li>Vérifier l'identité des bailleurs et agences pour limiter les fraudes et les fausses annonces.</li>
        <li>Traiter les paiements d'abonnement et envoyer les e-mails liés à votre activité (confirmations, quittances, rappels).</li>
        <li>Répondre à vos demandes d'assistance.</li>
        <li>Mesurer l'audience et améliorer le site, avec votre accord pour les cookies non essentiels.</li>
        <li>Respecter nos obligations légales et prévenir les abus (protection anti-spam, journaux de sécurité).</li>
      </ul>
    ),
  },
  {
    id: 'bases',
    title: 'Sur quelle base légale',
    content: (
      <ul>
        <li><strong>Exécution du contrat</strong> pour la création du compte et la fourniture du service.</li>
        <li><strong>Consentement</strong> pour les cookies de mesure d'audience Google Analytics. Vous pouvez le retirer à tout moment.</li>
        <li><strong>Intérêt légitime</strong> pour la sécurité du site, la lutte contre la fraude et le spam.</li>
        <li><strong>Obligation légale</strong> pour la conservation de certaines pièces comptables.</li>
      </ul>
    ),
  },
  {
    id: 'destinataires',
    title: 'Qui reçoit vos données',
    content: (
      <>
        <p>Vos données ne sont jamais vendues. Elles sont partagées uniquement avec les prestataires techniques nécessaires :</p>
        <ul>
          <li><strong>Supabase</strong> : base de données, authentification et stockage des fichiers (serveurs en Europe, région Irlande).</li>
          <li><strong>Vercel</strong> : hébergement du site et mesure d'audience sans cookie.</li>
          <li><strong>FedaPay</strong> : paiement par Mobile Money et carte.</li>
          <li><strong>Google Analytics</strong> : mesure d'audience, uniquement si vous l'acceptez.</li>
          <li><strong>Fournisseur d'e-mails (SMTP)</strong> : envoi des messages transactionnels.</li>
        </ul>
        <p>
          Les coordonnées d'un bailleur sont visibles par les locataires qui le contactent via une annonce. Les
          informations de vos locataires ne sont visibles que par vous.
        </p>
        <p>
          Certains prestataires peuvent traiter des données en dehors de votre pays (notamment aux États-Unis). Dans ce cas, nous
          nous assurons qu'ils offrent des garanties appropriées de protection.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies et traceurs',
    content: (
      <>
        <ul>
          <li><strong>Strictement nécessaires :</strong> maintien de votre session de connexion et mémorisation de vos préférences (pays, devise, choix cookies). Ils ne demandent pas de consentement.</li>
          <li><strong>Mesure d'audience Google Analytics :</strong> déposés uniquement après votre accord via le bandeau.</li>
          <li><strong>Vercel Web Analytics et Speed Insights :</strong> statistiques agrégées et performances, sans cookie et sans suivi individuel.</li>
        </ul>
        <p>
          <button
            type="button"
            onClick={resetConsent}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Modifier mon choix sur les cookies
          </button>
        </p>
      </>
    ),
  },
  {
    id: 'conservation',
    title: 'Combien de temps nous les gardons',
    content: (
      <ul>
        <li>Données du compte : tant que le compte est actif, puis supprimées ou anonymisées dans un délai raisonnable après la clôture, sauf obligation légale.</li>
        <li>Documents d'identité : supprimés à la clôture du compte ou sur demande, sous réserve des obligations légales.</li>
        <li>Pièces comptables et transactions : conservées pendant la durée légale applicable.</li>
        <li>Messages de contact : conservés au maximum 3 ans après le dernier échange.</li>
        <li>Choix cookies : 12 mois dans votre navigateur.</li>
      </ul>
    ),
  },
  {
    id: 'droits',
    title: 'Vos droits',
    content: (
      <>
        <p>Vous pouvez à tout moment demander :</p>
        <ul>
          <li>l'accès à vos données et une copie ;</li>
          <li>leur rectification ou leur suppression ;</li>
          <li>la limitation ou l'opposition à certains traitements ;</li>
          <li>la portabilité de vos données ;</li>
          <li>le retrait de votre consentement, sans effet sur ce qui a été fait avant.</li>
        </ul>
        <p>
          Écrivez à <a href={`mailto:${LEGAL.dpoEmail}`}>{LEGAL.dpoEmail}</a> en précisant votre demande. Nous répondons
          dans un délai d'un mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir
          l'Autorité de protection des données personnelles (APDP) du Bénin, ou l'autorité de votre pays de résidence.
        </p>
      </>
    ),
  },
  {
    id: 'securite',
    title: 'Comment nous protégeons vos données',
    content: (
      <p>
        Les échanges avec le site sont chiffrés (HTTPS). Les accès à la base de données sont restreints par des règles
        de sécurité par utilisateur, les mots de passe sont chiffrés et les formulaires sont protégés contre le spam.
        Aucun système n'étant infaillible, nous vous invitons à utiliser un mot de passe unique et à nous signaler
        toute anomalie à <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    ),
  },
  {
    id: 'mineurs',
    title: 'Mineurs',
    content: (
      <p>
        Le service s'adresse aux personnes majeures. Nous ne collectons pas sciemment de données concernant des mineurs.
      </p>
    ),
  },
  {
    id: 'modifications',
    title: 'Modifications de cette politique',
    content: (
      <p>
        Nous pouvons mettre à jour cette politique. La date de dernière mise à jour figure en haut de la page ; en cas
        de changement important, nous vous en informerons. Voir aussi nos{' '}
        <Link to="/conditions-generales">conditions générales d'utilisation</Link>.
      </p>
    ),
  },
];

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Comment LoyerPro collecte, utilise et protège vos données personnelles, et comment exercer vos droits."
      path="/politique-de-confidentialite"
      sections={sections}
    />
  );
}
