-- ==============================================================================
-- LoyerPro - Migration 0003 : Corrections suite à la mise en production
-- Corrige des bugs réels rencontrés en prod (Vercel + Supabase) :
--   1) Les paiements ne s'enregistraient jamais car la contrainte
--      "payment_method" n'acceptait que ('momo','flooz','virement','especes',
--      'cheque') alors que le formulaire envoie 'MTN Mobile Money', etc.
--   2) Les dépenses ne s'enregistraient jamais car la contrainte "category"
--      n'acceptait que des codes courts alors que le formulaire envoie des
--      libellés français ('Travaux & Réparations', etc.)
--   3) L'upload de photos de biens tombait toujours en secours (image encodée
--      en base64 dans la colonne au lieu d'un vrai fichier) car le bucket de
--      stockage "property-photos" n'avait jamais été créé.
-- À exécuter après 0001_init_schema.sql et 0002_patch_saas_admin.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PAYMENTS : on supprime la contrainte trop stricte sur payment_method.
--    Le champ reste NOT NULL, mais n'importe quel libellé choisi côté
--    interface (actuel ou futur) pourra être enregistré sans casser l'appli.
-- ------------------------------------------------------------------------------
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;

-- ------------------------------------------------------------------------------
-- 2. EXPENSES : même correction pour la catégorie de dépense.
-- ------------------------------------------------------------------------------
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- ------------------------------------------------------------------------------
-- 3. STOCKAGE DES PHOTOS DE BIENS : création du bucket manquant + policies.
--    Sans ce bucket, storageService.ts bascule en secours sur un encodage
--    base64 stocké directement dans la colonne "photos" (fonctionne, mais
--    très inefficace et limité en taille). Ce bucket corrige ça proprement.
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Lecture publique des photos" ON storage.objects;
CREATE POLICY "Lecture publique des photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

DROP POLICY IF EXISTS "Les utilisateurs connectés uploadent des photos" ON storage.objects;
CREATE POLICY "Les utilisateurs connectés uploadent des photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Les utilisateurs connectés gèrent leurs photos" ON storage.objects;
CREATE POLICY "Les utilisateurs connectés gèrent leurs photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Les utilisateurs connectés suppriment leurs photos" ON storage.objects;
CREATE POLICY "Les utilisateurs connectés suppriment leurs photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-photos' AND auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 4. Sécurité : s'assurer qu'un utilisateur ne peut pas créer son propre
--    profil "superadmin" via l'inscription publique (la policy INSERT de
--    0001 vérifie déjà auth.uid() = id mais pas le rôle demandé).
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_self_promotion_to_superadmin()
RETURNS TRIGGER AS $$
BEGIN
  -- On laisse passer si l'appel vient de la clé service_role (scripts serveur,
  -- comme scripts/seedSuperAdmin.ts) ou d'un superadmin déjà authentifié.
  IF NEW.role = 'superadmin' AND auth.role() <> 'service_role' AND NOT public.is_superadmin() THEN
    NEW.role := 'owner';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_self_promotion ON public.profiles;
CREATE TRIGGER trg_prevent_self_promotion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_promotion_to_superadmin();

-- ==============================================================================
-- FIN — Après cette migration : recréez votre SuperAdmin avec
-- `npm run seed:superadmin` (ou scripts/seedSuperAdmin.ts), il passe par la
-- clé service_role qui contourne ce trigger de sécurité.
-- ==============================================================================
