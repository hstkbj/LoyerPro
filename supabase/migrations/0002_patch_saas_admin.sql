-- ==============================================================================
-- LoyerPro - Migration 0002 : Patch SaaS / SuperAdmin
-- - Comble les colonnes utilisées par le frontend mais absentes du schéma initial
-- - Ajoute la gestion des plans (prix, options) par le superadmin
-- - Ajoute les paramètres du site (email, Google Analytics) éditables par le superadmin
-- - Ajoute la table de journalisation des emails envoyés
-- - Ajoute une limite automatique du nombre de biens selon le plan actif
-- À exécuter après 0001_init_schema.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES : colonnes de vérification / pays utilisées par AuthContext.tsx
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Bénin',
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ------------------------------------------------------------------------------
-- 2. PROPERTIES : colonnes utilisées par PropertyFormPage / propertyService.ts
-- ------------------------------------------------------------------------------
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Bénin',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS room_category TEXT,
  ADD COLUMN IF NOT EXISTS deposit_months NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS charges_included BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS utilities_included TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bathroom_type TEXT,
  ADD COLUMN IF NOT EXISTS kitchen_type TEXT,
  ADD COLUMN IF NOT EXISTS owner_verified BOOLEAN DEFAULT FALSE;

-- ------------------------------------------------------------------------------
-- 3. CONTRACTS / TENANTS / EXPENSES : colonnes optionnelles utilisées côté UI
-- ------------------------------------------------------------------------------
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS payment_due_day INTEGER,
  ADD COLUMN IF NOT EXISTS terms TEXT;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS provider_name TEXT;

-- Élargir les CHECK constraints pour couvrir les valeurs utilisées dans src/types.ts
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('received', 'pending', 'unpaid', 'completed', 'late'));

ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_status_check;
ALTER TABLE public.visits ADD CONSTRAINT visits_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected', 'rescheduled', 'confirmed', 'completed', 'cancelled'));

-- ------------------------------------------------------------------------------
-- 4. SUBSCRIPTION_PLANS : le superadmin doit pouvoir tout piloter (prix, options)
-- ------------------------------------------------------------------------------
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_tenants INTEGER,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- Seules les lectures étaient autorisées : on ajoute l'écriture réservée au superadmin
DROP POLICY IF EXISTS "Le superadmin gère les plans d'abonnement" ON public.subscription_plans;
CREATE POLICY "Le superadmin gère les plans d'abonnement"
  ON public.subscription_plans FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Le superadmin doit pouvoir créer/mettre à jour des abonnements pour n'importe quel utilisateur
DROP POLICY IF EXISTS "Les utilisateurs et le superadmin gèrent les abonnements" ON public.subscriptions;
CREATE POLICY "Les utilisateurs et le superadmin gèrent les abonnements"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id OR public.is_superadmin())
  WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

DROP POLICY IF EXISTS "Les utilisateurs et le superadmin gèrent les transactions" ON public.transactions;
CREATE POLICY "Les utilisateurs et le superadmin gèrent les transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id OR public.is_superadmin())
  WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

-- Le superadmin doit pouvoir suspendre / modifier n'importe quel profil (déjà couvert par
-- is_superadmin() dans les policies UPDATE/SELECT de 0001, on ajoute juste le DELETE)
DROP POLICY IF EXISTS "Le superadmin peut supprimer un profil" ON public.profiles;
CREATE POLICY "Le superadmin peut supprimer un profil"
  ON public.profiles FOR DELETE
  USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- 5. SITE_SETTINGS : paramètres globaux éditables par le superadmin
--    (email d'expédition, clé Google Analytics, mode maintenance, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tous peuvent lire les paramètres publics du site" ON public.site_settings;
CREATE POLICY "Tous peuvent lire les paramètres publics du site"
  ON public.site_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Le superadmin gère les paramètres du site" ON public.site_settings;
CREATE POLICY "Le superadmin gère les paramètres du site"
  ON public.site_settings FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

INSERT INTO public.site_settings (key, value) VALUES
  ('branding', '{"site_name": "LoyerPro", "contact_email": "contact@loyerpro.bj", "contact_phone": "+229 00 00 00 00"}'::jsonb),
  ('analytics', '{"ga_measurement_id": "", "ga_property_id": ""}'::jsonb),
  ('email', '{"from_name": "LoyerPro", "from_email": "no-reply@loyerpro.bj"}'::jsonb),
  ('maintenance', '{"enabled": false, "message": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. EMAIL_LOGS : traçabilité des emails envoyés par le serveur (server.ts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'simulated', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Le superadmin consulte le journal des emails" ON public.email_logs;
CREATE POLICY "Le superadmin consulte le journal des emails"
  ON public.email_logs FOR SELECT
  USING (public.is_superadmin());

-- L'insertion se fait uniquement via le serveur avec la clé service_role
-- (qui contourne RLS), donc aucune policy INSERT n'est nécessaire côté client.

-- ------------------------------------------------------------------------------
-- 7. LIMITE AUTOMATIQUE DU NOMBRE DE BIENS SELON LE PLAN ACTIF
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_property_plan_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  plan_limit INTEGER;
BEGIN
  IF public.is_superadmin() THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(sp.max_properties, 2) INTO plan_limit
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.user_id = NEW.user_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF plan_limit IS NULL THEN
    plan_limit := 2; -- plan gratuit par défaut si aucun abonnement actif trouvé
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM public.properties
  WHERE user_id = NEW.user_id;

  IF current_count >= plan_limit THEN
    RAISE EXCEPTION 'Limite de votre plan atteinte (% biens maximum). Passez à un plan supérieur pour ajouter plus de biens.', plan_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_property_plan_limit ON public.properties;
CREATE TRIGGER trg_enforce_property_plan_limit
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.enforce_property_plan_limit();

-- ------------------------------------------------------------------------------
-- 8. INDEX UTILES POUR LES TABLEAUX DE BORD SUPERADMIN
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON public.properties(published);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
