-- ==============================================================================
-- LoyerPro - Migration 0004 : Correction de l'inscription
-- ------------------------------------------------------------------------------
-- BUG CORRIGÉ : la fonction handle_new_user() (déclenchée à chaque inscription)
-- n'a jamais été mise à jour après l'ajout des colonnes "country" et
-- "verification_status" (migration 0002). Résultat concret pour TOUS les
-- comptes créés jusqu'ici :
--   - country était toujours 'Bénin', peu importe le pays choisi dans le
--     formulaire d'inscription.
--   - verification_status était toujours 'unverified', même si
--     l'utilisateur avait bien joint une pièce d'identité pour vérification.
--   - Les documents de vérification (verification_documents) n'étaient
--     jamais enregistrés du tout.
-- La seule chose qui corrigeait ça après coup était un appel côté client
-- (profiles.upsert), qui échoue silencieusement tant que l'email n'est pas
-- confirmé (RLS bloque l'écriture sans session active) : c'est exactement
-- le cas actuellement puisque la confirmation d'email est activée.
--
-- Cette migration corrige le trigger pour que TOUT (pays, statut de
-- vérification, documents) soit enregistré correctement dès l'inscription,
-- indépendamment de la confirmation d'email.
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

  -- Attribuer automatiquement le plan Free par défaut (si pas déjà fait)
  INSERT INTO public.subscriptions (user_id, plan_id, status, amount, payment_gateway)
  SELECT NEW.id, 'free', 'active', 0, 'system'
  WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Le trigger existant sur auth.users pointe déjà vers cette fonction
-- (CREATE OR REPLACE la met à jour sans rien avoir à recréer).

-- ==============================================================================
-- FIN — Les comptes DÉJÀ créés avant cette migration ont toujours
-- country='Bénin' / verification_status='unverified' en base. S'il y a des
-- comptes réels à corriger manuellement, utilisez par exemple :
--   UPDATE public.profiles SET country = 'Côte d''Ivoire' WHERE email = '...';
-- ==============================================================================
