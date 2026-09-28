-- ==============================================================================
-- LoyerPro - Migration 0006 : Sécurisation des abonnements payants
-- ------------------------------------------------------------------------------
-- FAILLE CORRIGÉE (critique) : depuis la migration 0002, la policy RLS sur
-- "subscriptions" et "transactions" était `FOR ALL ... WITH CHECK (auth.uid() =
-- user_id)`. Concrètement, N'IMPORTE QUEL utilisateur connecté pouvait, depuis
-- la console de son navigateur, exécuter :
--
--   supabase.from('subscriptions').insert({
--     user_id: monId, plan_id: 'agency', status: 'active',
--     amount: 45000, transaction_id: 'FAUX', payment_gateway: 'fedapay'
--   })
--
-- ...et s'octroyer le forfait "Agence Business" gratuitement, sans jamais
-- payer via FedaPay. Le frontend (subscriptionService.createOrUpgradeSubscription)
-- faisait exactement cet insert direct pour TOUS les forfaits, payants inclus.
--
-- CORRECTION : un utilisateur ne peut désormais s'auto-attribuer QUE le forfait
-- gratuit (amount = 0, plan_id = 'free', transaction_id NULL) depuis le client.
-- Toute activation d'un forfait payant doit passer par le serveur (clé
-- service_role, qui contourne RLS) APRÈS vérification réelle du paiement
-- auprès de l'API FedaPay (voir server/app.ts : activatePaidSubscriptionFromTransaction,
-- appelée par le webhook /api/fedapay/webhook ET par /api/fedapay/verify-transaction/:id).
-- Un utilisateur ne peut plus non plus modifier ou supprimer une ligne
-- d'abonnement/transaction existante ; seul le SuperAdmin (interface
-- SuperAdmin) ou le serveur (service_role) le peuvent.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SUBSCRIPTIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Les utilisateurs et le superadmin gèrent les abonnements" ON public.subscriptions;

-- Lecture : déjà correcte (0001), on la recrée pour être explicite/idempotente.
DROP POLICY IF EXISTS "Les utilisateurs voient leurs abonnements" ON public.subscriptions;
CREATE POLICY "Les utilisateurs voient leurs abonnements"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_superadmin());

-- Un utilisateur peut créer UNIQUEMENT une ligne "free" pour lui-même
-- (choix explicite du forfait gratuit depuis Paramètres > Abonnement).
-- Le SuperAdmin peut créer n'importe quelle ligne (gestion manuelle).
CREATE POLICY "Choix du forfait gratuit par l'utilisateur"
  ON public.subscriptions FOR INSERT
  WITH CHECK (
    public.is_superadmin()
    OR (
      auth.uid() = user_id
      AND plan_id = 'free'
      AND amount = 0
      AND transaction_id IS NULL
    )
  );

-- UPDATE / DELETE réservés au SuperAdmin (et au serveur via service_role, qui
-- contourne RLS de toute façon). Un utilisateur ne doit jamais pouvoir
-- modifier le plan ou le statut de son propre abonnement lui-même.
CREATE POLICY "Le superadmin gère tous les abonnements"
  ON public.subscriptions FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY "Le superadmin supprime des abonnements"
  ON public.subscriptions FOR DELETE
  USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- 2. TRANSACTIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Les utilisateurs et le superadmin gèrent les transactions" ON public.transactions;

DROP POLICY IF EXISTS "Les utilisateurs voient leurs transactions" ON public.transactions;
CREATE POLICY "Les utilisateurs voient leurs transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_superadmin());

-- Plus AUCUNE écriture cliente sur "transactions" : chaque transaction
-- FedaPay est créée exclusivement par le serveur (service_role) après
-- vérification réelle auprès de l'API FedaPay. Seul le SuperAdmin garde un
-- accès d'écriture manuel (correction, remboursement consigné, etc.).
CREATE POLICY "Le superadmin gère les transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (public.is_superadmin());

CREATE POLICY "Le superadmin modifie les transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY "Le superadmin supprime des transactions"
  ON public.transactions FOR DELETE
  USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- 3. IDEMPOTENCE : empêcher qu'un même paiement FedaPay ne soit compté deux
--    fois si le webhook est relivré (FedaPay retente jusqu'à 9 fois) ET que
--    /api/fedapay/verify-transaction/:id traite la même transaction.
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_fedapay_transaction_id
  ON public.transactions (fedapay_transaction_id)
  WHERE fedapay_transaction_id IS NOT NULL;

-- ==============================================================================
-- FIN — Après cette migration, testez qu'un compte non-superadmin ne peut PLUS
-- faire :  supabase.from('subscriptions').insert({ plan_id: 'agency', ... })
-- (doit échouer avec une erreur RLS "new row violates row-level security policy").
-- ==============================================================================
