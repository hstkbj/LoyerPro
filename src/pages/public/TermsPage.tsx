import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout, type LegalSection } from '../../components/layout/LegalLayout';
import { LEGAL, SITE } from '../../lib/site';

const sections: LegalSection[] = [
  {
    id: 'objet',
    title: 'Objet et acceptation',
    content: (
      <>
        <p>
          Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et l'utilisation du site{' '}
          <strong>{SITE.name}</strong> et de ses services, édités par <strong>{LEGAL.companyName}</strong>
          {LEGAL.legalForm ? ` (${LEGAL.legalForm})` : ''}, {LEGAL.address}.
        </p>
        <p>
          En naviguant sur le site ou en créant un compte, vous acceptez ces CGU. Si vous ne les acceptez pas, vous
          devez cesser d'utiliser le service.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'Description du service',
    content: (
      <>
        <p>LoyerPro est une plateforme qui propose :</p>
        <ul>
          <li>aux <strong>locataires</strong> : la recherche gratuite d'annonces de chambres, studios et appartements, et la possibilité de contacter les bailleurs ou de demander une visite ;</li>
          <li>aux <strong>propriétaires et agences</strong> : la publication d'annonces et un espace de gestion locative (biens, locataires, contrats, loyers, dépenses, quittances, rapports), selon le forfait choisi.</li>
        </ul>
        <p>
          LoyerPro est un intermédiaire technique. <strong>Nous ne sommes pas partie aux contrats de location</strong>{' '}
          conclus entre bailleurs et locataires, et nous n'agissons ni comme agent immobilier ni comme garant.
        </p>
      </>
    ),
  },
  {
    id: 'compte',
    title: 'Création et sécurité du compte',
    content: (
      <ul>
        <li>Vous devez être majeur et fournir des informations exactes, complètes et à jour.</li>
        <li>Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité réalisée depuis votre compte.</li>
        <li>Prévenez-nous sans délai en cas d'utilisation non autorisée de votre compte.</li>
        <li>Un seul compte par personne ou par agence.</li>
      </ul>
    ),
  },
  {
    id: 'verification',
    title: 'Vérification des bailleurs et agences',
    content: (
      <>
        <p>
          Pour publier des annonces, les bailleurs et agences peuvent être invités à fournir une pièce d'identité et,
          pour les agences, un document d'immatriculation. Le badge « vérifié » indique que ces documents ont été
          examinés par notre équipe à la date de vérification.
        </p>
        <p>
          Cette vérification réduit les risques mais ne constitue pas une garantie absolue sur la personne, le bien ou
          la transaction. Nous vous recommandons de <strong>visiter le logement avant tout paiement</strong> et de ne
          jamais verser d'argent à une personne que vous n'avez pas pu rencontrer ou identifier.
        </p>
      </>
    ),
  },
  {
    id: 'annonces',
    title: 'Règles pour les annonces',
    content: (
      <>
        <p>Les bailleurs et agences s'engagent à :</p>
        <ul>
          <li>ne publier que des biens qu'ils ont le droit de louer, avec des photos réelles et des informations exactes (prix, charges, localisation, disponibilité) ;</li>
          <li>retirer ou mettre à jour une annonce dès que le bien n'est plus disponible ;</li>
          <li>ne publier aucun contenu trompeur, discriminatoire, illégal ou portant atteinte aux droits de tiers.</li>
        </ul>
        <p>
          Nous pouvons suspendre ou supprimer toute annonce ou tout compte contrevenant à ces règles, sans préavis en
          cas de fraude avérée.
        </p>
      </>
    ),
  },
  {
    id: 'abonnements',
    title: 'Forfaits, prix et paiement',
    content: (
      <>
        <ul>
          <li>La recherche d'annonces est gratuite pour les locataires.</li>
          <li>Les forfaits destinés aux bailleurs et agences, leurs fonctionnalités et leurs prix sont présentés sur la page <Link to="/pricing">Tarifs</Link>. Les prix sont affichés dans la devise sélectionnée, à titre indicatif ; le montant exact est confirmé avant le paiement.</li>
          <li>Les paiements sont traités par notre prestataire FedaPay (Mobile Money, carte). Nous ne conservons pas vos données de paiement sensibles.</li>
          <li>Sauf mention contraire au moment de la souscription, un forfait payé est dû pour la période choisie. Les conditions de résiliation et de remboursement éventuel vous sont indiquées avant la validation de l'achat.</li>
        </ul>
        <p>Nous pouvons modifier nos tarifs ; toute modification s'applique à la période suivante et vous en serez informé.</p>
      </>
    ),
  },
  {
    id: 'obligations',
    title: 'Comportements interdits',
    content: (
      <ul>
        <li>Usurper l'identité d'une personne ou fournir de faux documents.</li>
        <li>Utiliser le service à des fins frauduleuses, notamment demander un paiement pour un bien inexistant.</li>
        <li>Envoyer des messages non sollicités en masse, ou utiliser des robots pour collecter des données ou saturer le service.</li>
        <li>Tenter d'accéder sans autorisation aux comptes, aux données ou aux systèmes, ou de les perturber.</li>
        <li>Copier ou réutiliser massivement les contenus du site sans autorisation écrite.</li>
      </ul>
    ),
  },
  {
    id: 'propriete',
    title: 'Propriété intellectuelle et contenus',
    content: (
      <>
        <p>
          La marque LoyerPro, le logo, le design et le code du site sont protégés. Vous ne pouvez pas les reproduire sans notre accord.
        </p>
        <p>
          Vous restez propriétaire des contenus que vous publiez (textes, photos). Vous nous accordez une licence
          non exclusive, limitée à la durée de votre compte, pour les afficher et les diffuser sur le service.
          Vous garantissez détenir les droits nécessaires sur ces contenus.
        </p>
      </>
    ),
  },
  {
    id: 'responsabilite',
    title: 'Responsabilité',
    content: (
      <>
        <p>
          Nous faisons de notre mieux pour assurer un service accessible et fiable, mais nous ne pouvons garantir une
          disponibilité continue ni l'absence d'erreur. Le service est fourni « en l'état ».
        </p>
        <p>
          Dans les limites permises par la loi, LoyerPro n'est pas responsable de l'exactitude des annonces publiées
          par des tiers, des relations contractuelles entre bailleurs et locataires, ni des dommages indirects (perte
          de revenus, d'opportunité ou de données). Rien dans ces CGU n'exclut une responsabilité qui ne peut l'être
          légalement.
        </p>
        <p>
          Les documents générés par la plateforme (contrats, quittances) sont des outils d'aide. Il vous appartient de
          vérifier qu'ils sont conformes à la réglementation applicable à votre situation.
        </p>
      </>
    ),
  },
  {
    id: 'donnees',
    title: 'Données personnelles',
    content: (
      <p>
        Le traitement de vos données est décrit dans notre{' '}
        <Link to="/politique-de-confidentialite">politique de confidentialité</Link>, qui fait partie intégrante des CGU.
      </p>
    ),
  },
  {
    id: 'resiliation',
    title: 'Suspension et résiliation',
    content: (
      <p>
        Vous pouvez fermer votre compte à tout moment depuis votre espace ou en nous écrivant. Nous pouvons suspendre
        ou clôturer un compte en cas de non-respect des CGU, de fraude ou d'impayé, après notification lorsque c'est
        possible.
      </p>
    ),
  },
  {
    id: 'droit',
    title: 'Droit applicable et litiges',
    content: (
      <>
        <p>
          Les CGU sont régies par le droit de la {LEGAL.country}. En cas de différend, nous vous invitons à nous contacter
          d'abord pour trouver une solution amiable. À défaut, les tribunaux compétents du Bénin seront saisis, sous
          réserve des règles impératives protégeant les consommateurs de votre pays de résidence.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Nous contacter',
    content: (
      <p>
        Pour toute question sur ces conditions : <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> ou via la{' '}
        <Link to="/contact">page contact</Link>.
      </p>
    ),
  },
];

export function TermsPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      intro="Les règles qui encadrent l'utilisation de LoyerPro par les locataires, les propriétaires et les agences."
      path="/conditions-generales"
      sections={sections}
    />
  );
}
