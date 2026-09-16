-- ==============================================================================
-- LoyerPro - Migration 0005 : Blocage d'accès tant qu'aucun forfait n'est choisi
-- ------------------------------------------------------------------------------
-- Jusqu'ici, handle_new_user() attribuait automatiquement un abonnement
-- "free" actif à chaque inscription. Résultat : impossible de bloquer
-- l'accès au tableau de bord tant que l'utilisateur n'a pas choisi/payé un
-- forfait, puisque tout le monde en avait déjà un par défaut.
--
-- Cette migration retire cette attribution automatique : un nouveau compte
-- n'a désormais AUCUNE ligne dans "subscriptions" tant qu'il n'a pas
-- explicitement cliqué sur un forfait (même le gratuit) depuis
-- Paramètres > Abonnement. Le frontend (App.tsx) bloque l'accès aux pages
-- du tableau de bord jusque-là et redirige vers cette page.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, phone, role, agency_name,
    country, city, verification_status, verification_documents
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner'),
    NEW.raw_user_meta_data->>'agency_name',
    COALESCE(NEW.raw_user_meta_data->>'country', 'Bénin'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Cotonou'),
    COALESCE(NEW.raw_user_meta_data->>'verification_status', 'unverified'),
    COALESCE(NEW.raw_user_meta_data->'verification_documents', '[]'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    country = EXCLUDED.country,
    verification_status = EXCLUDED.verification_status,
    verification_documents = EXCLUDED.verification_documents;

  -- Attribution automatique du plan "free" supprimée volontairement :
  -- l'utilisateur doit désormais choisir explicitement un forfait (même
  -- gratuit) depuis Paramètres > Abonnement avant d'accéder au tableau de
  -- bord propriétaire/agence.

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note pour les comptes de test déjà créés avant cette migration : ils ont
-- déjà une ligne "free" dans subscriptions et ne seront donc pas bloqués.
-- Pour forcer un compte existant à repasser par le choix de forfait :
--   DELETE FROM public.subscriptions WHERE user_id = '<uuid-du-compte>';
-- ==============================================================================
