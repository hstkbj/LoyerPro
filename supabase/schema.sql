-- ==============================================================================
-- LoyerPro - Schéma PostgreSQL & Row Level Security (RLS) pour Supabase
-- Cible : Bénin / Afrique Francophone (Devise : FCFA / XOF)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS (liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'agency', 'superadmin')),
  agency_name TEXT,
  city TEXT DEFAULT 'Cotonou',
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLE DES BIENS IMMOBILIERS
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  neighborhood TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  surface NUMERIC DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  conditions TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
  published BOOLEAN DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLE DES LOCATAIRES
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  id_card_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABLE DES CONTRATS DE LOCATION
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount NUMERIC NOT NULL CHECK (rent_amount >= 0),
  deposit_amount NUMERIC DEFAULT 0,
  payment_day INTEGER DEFAULT 5 CHECK (payment_day BETWEEN 1 AND 31),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'terminated')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABLE DES PAIEMENTS / LOYERS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  payment_date DATE NOT NULL,
  period_month TEXT NOT NULL, -- Format YYYY-MM
  payment_method TEXT NOT NULL CHECK (payment_method IN ('momo', 'flooz', 'virement', 'especes', 'cheque')),
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'pending', 'unpaid')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABLE DES DÉPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('reparation', 'entretien', 'eau', 'electricite', 'travaux', 'autre')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. TABLE DES DEMANDES DE VISITE
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visitor_email TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'rescheduled')),
  counter_proposal TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. TABLE DES DEMANDES DE RENSEIGNEMENTS
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visitor_email TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. PLANS D'ABONNEMENT
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'XOF',
  interval TEXT DEFAULT 'month',
  max_properties INTEGER NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE
);

-- Insérer les plans standard configurables
INSERT INTO public.subscription_plans (id, name, price, currency, interval, max_properties, description, features)
VALUES 
  ('free', 'Starter Gratuit', 0, 'XOF', 'month', 2, 'Pour tester la plateforme avec vos premiers biens', '["Jusqu''à 2 biens", "Gestion locataires & contrats", "Enregistrement des loyers", "Support standard"]'::jsonb),
  ('pro_monthly', 'Pro Mensuel', 15000, 'XOF', 'month', 25, 'Idéal pour les propriétaires avec un portefeuille grandissant', '["Jusqu''à 25 biens", "Publication sur le site public", "Gestion des impayés & alertes", "Suivi des visites & demandes", "Support prioritaire WhatsApp"]'::jsonb),
  ('agency', 'Agence Business', 45000, 'XOF', 'month', 9999, 'Solution complète pour les cabinets et agences immobilières', '["Biens illimités", "Multi-utilisateurs & gestionnaires", "Rapports financiers complets", "Page agence dédiée", "Assistance dédiée"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_properties = EXCLUDED.max_properties;

-- 11. ABONNEMENTS DES UTILISATEURS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  start_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  end_date TIMESTAMPTZ,
  amount NUMERIC NOT NULL,
  transaction_id TEXT,
  payment_gateway TEXT DEFAULT 'fedapay',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. TRANSACTIONS FEDAPAY
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  fedapay_transaction_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'canceled')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Fonction utilitaire pour vérifier si l'utilisateur est superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin' AND is_suspended = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES : PROFILES
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_superadmin());

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_superadmin());

CREATE POLICY "Création de profil lors de l'inscription"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- POLICIES : PROPERTIES
CREATE POLICY "Consultation publique des biens publiés"
  ON public.properties FOR SELECT
  USING (published = TRUE OR auth.uid() = user_id OR public.is_superadmin());

CREATE POLICY "Les propriétaires gèrent leurs propres biens"
  ON public.properties FOR ALL
  USING (auth.uid() = user_id OR public.is_superadmin())
  WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

-- POLICIES : TENANTS
CREATE POLICY "Les propriétaires gèrent leurs locataires"
  ON public.tenants FOR ALL
  USING (auth.uid() = user_id OR public.is_superadmin())
  WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

-- POLICIES : CONTRACTS
CREATE POLICY "Les propriétaires gèrent leurs contrats"
  ON public.contracts FOR ALL
  USING (auth.uid() = user_id OR public.is_superadmin())
  WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

-- POLICIES : PAYMENTS
CREATE POLICY "Les propriétaires gèrent leurs paiements"
  ON public.payments FOR ALL
  USING (auth.uid() = user_id OR public.is_superadmin())
  WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

-- POLICIES : EXPENSES
CREATE POLICY "Les propriétaires gèrent leurs dépenses"
  ON public.expenses FOR ALL
  USING (auth.uid() = user_id OR public.is_superadmin())
  WITH CHECK (auth.uid() = user_id OR public.is_superadmin());

-- POLICIES : VISITS
CREATE POLICY "Tout visiteur public peut soumettre une demande de visite"
  ON public.visits FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Les propriétaires consultent et traitent leurs visites"
  ON public.visits FOR SELECT
  USING (auth.uid() = owner_id OR public.is_superadmin());

CREATE POLICY "Les propriétaires mettent à jour leurs visites"
  ON public.visits FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_superadmin());

-- POLICIES : INQUIRIES
CREATE POLICY "Tout visiteur public peut soumettre une demande de renseignements"
  ON public.inquiries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Les propriétaires consultent leurs renseignements"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = owner_id OR public.is_superadmin());

CREATE POLICY "Les propriétaires mettent à jour leurs renseignements"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_superadmin());

-- POLICIES : SUBSCRIPTION PLANS
CREATE POLICY "Tous peuvent voir les plans d'abonnement"
  ON public.subscription_plans FOR SELECT
  USING (TRUE);

-- POLICIES : SUBSCRIPTIONS & TRANSACTIONS
CREATE POLICY "Les utilisateurs voient leurs abonnements"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_superadmin());

CREATE POLICY "Les utilisateurs voient leurs transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_superadmin());

-- ==============================================================================
-- TRIGGER POUR LA CRÉATION AUTOMATIQUE DE PROFIL LORS DU SIGNUP SUPABASE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, agency_name, city)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner'),
    NEW.raw_user_meta_data->>'agency_name',
    COALESCE(NEW.raw_user_meta_data->>'city', 'Cotonou')
  );
  
  -- Attribuer automatiquement le plan Free par défaut
  INSERT INTO public.subscriptions (user_id, plan_id, status, amount, payment_gateway)
  VALUES (NEW.id, 'free', 'active', 0, 'system');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
