# LoyerPro

Plateforme SaaS de gestion locative (Bénin / Afrique francophone) : propriétaires et
agences gèrent leurs biens, locataires, contrats, paiements et dépenses ; un portail
public permet aux visiteurs de découvrir les biens publiés, demander une visite ou
poser une question ; un espace **SuperAdmin** pilote l'ensemble du site (utilisateurs,
validation des comptes, plans d'abonnement, transactions, analytique d'audience).

## Sommaire

1. [Stack technique](#stack-technique)
2. [Fonctionnement sans configuration (mode démo)](#fonctionnement-sans-configuration-mode-démo)
3. [Déploiement pas à pas](#déploiement-pas-à-pas)
4. [Variables d'environnement](#variables-denvironnement)
5. [Base de données Supabase (migrations)](#base-de-données-supabase-migrations)
6. [Créer le premier compte SuperAdmin](#créer-le-premier-compte-superadmin)
7. [Emails transactionnels](#emails-transactionnels)
8. [Google Analytics (visites, graphiques, pays)](#google-analytics-visites-graphiques-pays)
9. [Paiements FedaPay](#paiements-fedapay)
10. [Gestion des plans par le SuperAdmin](#gestion-des-plans-par-le-superadmin)
11. [Lancer le projet en local](#lancer-le-projet-en-local)
12. [Ce qu'il reste à faire avant une mise en ligne commerciale](#ce-quil-reste-à-faire-avant-une-mise-en-ligne-commerciale)

---

## Stack technique

- **Frontend** : React 19 + Vite 6 + React Router 7 + Tailwind CSS 4
- **Backend léger** : Express (dans `server.ts`), sert le frontend et expose des routes
  `/api/*` (FedaPay, emails, Google Analytics) qui nécessitent des secrets serveur.
- **Base de données / Auth / Storage** : Supabase (PostgreSQL + Row Level Security)
- **Paiement** : FedaPay (Mobile Money Bénin/UEMOA)
- **Emails** : SMTP générique via `nodemailer` (Gmail, Brevo, SendGrid, Mailgun, Resend SMTP...)
- **Analytique** : Google Analytics 4 (gtag.js côté client + GA4 Data API côté serveur)

## Fonctionnement sans configuration (mode démo)

L'application est conçue pour **ne jamais planter** si une variable d'environnement
manque :

- Sans `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` : les données sont stockées dans le
  `localStorage` du navigateur (mode démo local).
- Sans `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` : les emails sont **simulés** (affichés dans
  les logs serveur et journalisés dans `email_logs` si Supabase est configuré).
- Sans `FEDAPAY_SECRET_KEY` : les paiements sont simulés (transaction "sandbox").
- Sans `GA_PROPERTY_ID`/`GA_CLIENT_EMAIL`/`GA_PRIVATE_KEY` : le tableau de bord
  Analytique du SuperAdmin affiche des données simulées avec un bandeau d'avertissement.

**Pour une mise en ligne réelle, configurez toutes les variables ci-dessous.**

## Déploiement pas à pas

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com) (région Europe
   ou proche de vos utilisateurs).
2. **Exécuter les migrations SQL** dans l'ordre (voir [section dédiée](#base-de-données-supabase-migrations)).
3. **Récupérer les clés Supabase** : `Project Settings → API` → copier `Project URL`,
   `anon public key` et `service_role key` (⚠️ secrète, jamais côté client).
4. **Configurer les variables d'environnement** sur votre hébergeur (voir tableau
   ci-dessous) — Vercel, Render, Railway, ou VPS classique.
5. **Construire et démarrer** :
   ```bash
   npm install
   npm run build
   npm start
   ```
6. **Créer le premier SuperAdmin** (vous) :
   ```bash
   npm run seed:superadmin
   ```
7. **Connectez-vous** sur `/login` avec l'email/mot de passe du SuperAdmin : vous serez
   automatiquement redirigé vers `/superadmin/dashboard`.
8. Depuis `/superadmin/plans`, définissez vos plans, prix et options réels avant
   d'annoncer publiquement le lancement.

## Variables d'environnement

Copiez `.env.example` en `.env` et complétez :

| Variable | Requis pour | Description |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Base de données | Clés publiques Supabase (frontend) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Seed superadmin, emails, admin | Clés **serveur uniquement**, jamais exposées au navigateur |
| `VITE_FEDAPAY_PUBLIC_KEY` / `FEDAPAY_SECRET_KEY` | Paiements | Passerelle Mobile Money Bénin/UEMOA |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Emails | Identifiants SMTP de votre fournisseur |
| `EMAIL_FROM` / `EMAIL_FROM_NAME` | Emails | Adresse et nom d'expéditeur |
| `VITE_GA_MEASUREMENT_ID` | Analytics (client) | ID de mesure GA4 (`G-XXXXXXX`) |
| `GA_PROPERTY_ID` / `GA_CLIENT_EMAIL` / `GA_PRIVATE_KEY` | Analytics (serveur) | Compte de service Google avec accès "Viewer" sur la propriété GA4 |
| `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` / `SUPERADMIN_FULL_NAME` | Seed | Identifiants du tout premier compte SuperAdmin |
| `APP_URL` | Général | URL publique du site déployé |

## Base de données Supabase (migrations)

Les fichiers SQL se trouvent dans `supabase/migrations/`, à exécuter **dans l'ordre**
via `Supabase Studio → SQL Editor` (copier-coller le contenu de chaque fichier) ou via
la CLI Supabase (`supabase db push`) :

1. **`0001_init_schema.sql`** — Schéma de base : profils, biens, locataires, contrats,
   paiements, dépenses, visites, demandes, plans d'abonnement, abonnements,
   transactions, policies RLS et trigger de création automatique de profil.
2. **`0002_patch_saas_admin.sql`** — Correctifs et ajouts nécessaires pour un
   fonctionnement 100% opérationnel :
   - Colonnes manquantes utilisées par le frontend (`verification_status`, `country`,
     `room_category`, `deposit_months`, etc.) — **sans cette migration, la création
     de biens et la vérification de compte échoueront en base réelle**.
   - Droits d'écriture du SuperAdmin sur `subscription_plans` (prix, options).
   - Table `site_settings` (paramètres globaux éditables par le SuperAdmin).
   - Table `email_logs` (journal des emails envoyés/simulés).
   - Trigger `enforce_property_plan_limit` : bloque la création d'un bien au-delà du
     quota du plan actif de l'utilisateur.
   - Index de performance pour les tableaux de bord SuperAdmin.

> ⚠️ Exécutez toujours `0001` avant `0002`. Les deux scripts sont idempotents
> (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`...) : vous pouvez les relancer sans risque.

## Créer le premier compte SuperAdmin

Le SuperAdmin ne peut pas s'inscrire depuis le formulaire public (par sécurité). Il est
créé via un script serveur qui utilise la clé `service_role` :

```bash
# Dans votre .env (ou en variables d'environnement d'hébergement) :
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPERADMIN_EMAIL=moi@example.com
SUPERADMIN_PASSWORD="MotDePasseTresSolide!"
SUPERADMIN_FULL_NAME="Mon Nom"

npm run seed:superadmin
```

Le script (`scripts/seedSuperAdmin.ts`) :
- crée le compte Auth Supabase s'il n'existe pas (email pré-confirmé),
- ou réutilise le compte existant et met à jour son mot de passe,
- force son profil applicatif en `role = 'superadmin'`, `verification_status =
  'verified'`,
- lui attribue un abonnement "agency" actif (accès illimité en interne).

Vous pouvez relancer ce script à tout moment pour réinitialiser le mot de passe du
SuperAdmin ou pour en promouvoir un second (relancez avec un autre `SUPERADMIN_EMAIL`).

## Emails transactionnels

Tous les emails passent par `POST /api/email/send` (voir `server.ts`), qui utilise
`nodemailer` avec vos identifiants SMTP. Emails actuellement déclenchés :

| Événement | Déclencheur dans le code |
|---|---|
| Bienvenue à l'inscription | `AuthContext.signUp` |
| Compte vérifié | `AuthContext.adminVerifyUser` (statut `verified`) |
| Compte rejeté (+ motif) | `AuthContext.adminVerifyUser` (statut `rejected`) |
| Abonnement confirmé | `subscriptionService.createOrUpgradeSubscription` |
| Nouvelle demande de renseignements | `inquiryService.submitInquiry` → email au propriétaire |
| Nouvelle demande de visite | `visitService.requestVisit` → email au propriétaire |

Sans configuration SMTP, ces emails sont simulés et journalisés (table `email_logs`,
visible uniquement par le SuperAdmin) — aucun flux métier n'est bloqué.

**Fournisseurs SMTP courants** : Brevo (ex-Sendinblue, gratuit jusqu'à 300 emails/jour),
SendGrid, Mailgun, Amazon SES, ou Resend (via son relais SMTP).

## Google Analytics (visites, graphiques, pays)

Deux étapes distinctes :

1. **Suivi des visites (frontend)** : créez une propriété GA4 sur
   [analytics.google.com](https://analytics.google.com), récupérez l'ID de mesure
   (`G-XXXXXXX`) et renseignez `VITE_GA_MEASUREMENT_ID`. Le script `gtag.js` se charge
   automatiquement (`src/lib/gtag.ts`) et envoie un `page_view` à chaque changement de
   route.
2. **Tableau de bord SuperAdmin (backend)** : pour afficher les graphiques et la
   répartition par pays dans `/superadmin/analytics`, créez un compte de service
   Google Cloud :
   - Activez l'**Analytics Data API** dans Google Cloud Console.
   - Créez un compte de service, téléchargez sa clé JSON.
   - Dans GA4 → `Admin → Gestion des accès à la propriété`, ajoutez l'email du compte
     de service avec le rôle **Lecteur (Viewer)**.
   - Renseignez `GA_PROPERTY_ID` (identifiant numérique de la propriété GA4),
     `GA_CLIENT_EMAIL` et `GA_PRIVATE_KEY` (depuis la clé JSON téléchargée).

Sans ces variables serveur, la page Analytique reste utilisable avec des données
simulées et un bandeau d'avertissement explicite.

## Paiements FedaPay

Déjà intégré (`server.ts` + `src/services/subscriptions`). Renseignez
`VITE_FEDAPAY_PUBLIC_KEY` et `FEDAPAY_SECRET_KEY` depuis votre tableau de bord
[FedaPay](https://fedapay.com). Configurez l'URL de webhook
`https://votre-domaine.com/api/fedapay/webhook` dans FedaPay pour la confirmation
automatique des paiements.

## Gestion des plans par le SuperAdmin

Depuis `/superadmin/plans`, le SuperAdmin peut :
- créer, modifier, activer/désactiver ou supprimer un plan,
- fixer le prix (toujours saisi en XOF, converti automatiquement dans la devise locale
  du visiteur sur la page tarifs publique),
- définir le quota de biens (`max_properties`, un trigger PostgreSQL bloque la création
  au-delà du quota), un quota de locataires optionnel, une période d'essai,
- lister les fonctionnalités incluses (une par ligne), affichées telles quelles sur la
  page tarifs publique et dans les cartes plan.

La page publique `/pricing` charge désormais ces plans en direct depuis la base — toute
modification du SuperAdmin est immédiatement visible par les visiteurs.

## Lancer le projet en local

```bash
npm install
cp .env.example .env   # puis complétez vos clés
npm run dev             # http://localhost:3000
```

En développement, `npm run dev` lance `server.ts` (Express + Vite en mode middleware) :
le frontend et les routes `/api/*` sont servis sur le même port.

## Ce qu'il reste à faire avant une mise en ligne commerciale

Cette base est fonctionnelle de bout en bout (Supabase, SuperAdmin, plans, emails,
Google Analytics, paiements FedaPay), mais quelques points méritent votre attention
avant d'encaisser vos premiers clients :

1. **Webhook FedaPay → activation automatique de l'abonnement** : le endpoint
   `/api/fedapay/webhook` accuse actuellement réception sans mettre à jour la table
   `subscriptions`. À connecter à `subscriptionService.createOrUpgradeSubscription`
   (avec vérification de signature FedaPay) pour une activation sans intervention
   manuelle.
2. **Stockage des fichiers (photos de biens, documents de vérification)** : le bucket
   Supabase Storage n'est pas créé par les migrations SQL fournies. Créez un bucket
   `properties` (public) et un bucket `verification-documents` (privé) dans
   `Supabase Studio → Storage`, avec des policies adaptées.
3. **Emails transactionnels Supabase Auth** (confirmation d'inscription, réinitialisation
   de mot de passe) : personnalisez leurs templates dans `Supabase Studio →
   Authentication → Email Templates` pour qu'ils soient en français et à l'image de
   LoyerPro.
4. **Nom de domaine + SSL** : configurez votre domaine chez votre hébergeur (Vercel,
   Render, VPS + Caddy/Nginx) et ajoutez-le aux URLs autorisées dans Supabase
   (`Authentication → URL Configuration`).
5. **Conformité RGPD/local** : bannière de consentement cookies si vous ciblez des
   visiteurs européens (Google Analytics dépose des cookies), mentions légales, CGU/CGV.
6. **Sauvegardes** : activez les sauvegardes automatiques quotidiennes dans
   `Supabase Studio → Database → Backups` (disponible à partir du plan payant Supabase).
7. **Tests de charge / monitoring** : ajoutez un outil de suivi d'erreurs (Sentry) et
   configurez des alertes sur les échecs de paiement ou d'envoi d'email
   (`email_logs.status = 'failed'`).
8. **Rôles multi-utilisateurs pour les agences** : le schéma actuel lie chaque bien à un
   seul `user_id`. Pour un vrai multi-gestionnaire par agence (mentionné dans le plan
   "Agence Business"), il faudra une table `agency_members` et adapter les policies RLS.
