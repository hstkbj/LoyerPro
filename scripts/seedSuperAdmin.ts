/**
 * LoyerPro - Seeder du premier compte SuperAdmin
 * ------------------------------------------------------------------
 * Crée (ou promeut) le compte SuperAdmin qui gère le site : plans,
 * abonnements, validation des comptes propriétaires/agences, etc.
 *
 * Utilise la clé SUPABASE_SERVICE_ROLE_KEY (jamais exposée au client)
 * pour créer l'utilisateur directement via l'API Admin Auth de Supabase,
 * puis force son rôle "superadmin" dans public.profiles.
 *
 * Usage :
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   SUPERADMIN_EMAIL=moi@example.com \
 *   SUPERADMIN_PASSWORD="MotDePasseTresSolide!" \
 *   SUPERADMIN_FULL_NAME="Admin LoyerPro" \
 *   npm run seed:superadmin
 *
 * Ces mêmes variables peuvent aussi être définies dans un fichier .env
 * (le script charge automatiquement dotenv).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const fullName = process.env.SUPERADMIN_FULL_NAME || 'Super Admin';
  const phone = process.env.SUPERADMIN_PHONE || '+229 00 00 00 00';

  if (!url || !serviceKey) {
    console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.example).');
    process.exit(1);
  }
  if (!email || !password) {
    console.error('❌ SUPERADMIN_EMAIL et SUPERADMIN_PASSWORD sont requis.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('❌ SUPERADMIN_PASSWORD doit contenir au moins 8 caractères.');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`→ Recherche d'un utilisateur existant pour ${email}...`);

  // 1. Chercher un utilisateur Auth existant avec cet email
  let userId: string | null = null;
  {
    let page = 1;
    const perPage = 200;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const found = data.users.find((u: { id: string; email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
      if (found) {
        userId = found.id;
        break;
      }
      if (data.users.length < perPage) break;
      page += 1;
    }
  }

  // 2. Créer l'utilisateur s'il n'existe pas encore
  if (!userId) {
    console.log('→ Aucun compte trouvé, création du compte Auth...');
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // pas besoin de vérifier l'email pour le tout premier admin
      user_metadata: {
        full_name: fullName,
        phone,
        role: 'superadmin',
      },
    });
    if (error) throw error;
    userId = data.user?.id || null;
    if (!userId) throw new Error("Échec de la création de l'utilisateur Auth.");
    console.log(`✔ Compte Auth créé : ${userId}`);
  } else {
    console.log(`✔ Compte Auth existant réutilisé : ${userId}`);
    // Met à jour le mot de passe si fourni, pratique pour réinitialiser en local
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  }

  // 3. Créer / mettre à jour le profil applicatif avec le rôle superadmin
  console.log('→ Mise à jour du profil (role = superadmin, vérifié, actif)...');
  const { error: upsertError } = await admin.from('profiles').upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      phone,
      role: 'superadmin',
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      is_suspended: false,
    },
    { onConflict: 'id' }
  );
  if (upsertError) throw upsertError;

  // 4. S'assurer qu'il a un abonnement "agency" actif (accès illimité en interne)
  const { data: existingSub } = await admin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingSub) {
    await admin.from('subscriptions').insert({
      user_id: userId,
      plan_id: 'agency',
      status: 'active',
      amount: 0,
      payment_gateway: 'system',
    });
  }

  console.log('\n✅ SuperAdmin prêt !');
  console.log(`   Email    : ${email}`);
  console.log(`   Rôle     : superadmin`);
  console.log(`   Connexion: /login puis redirection automatique vers /superadmin/dashboard`);
}

main().catch(err => {
  console.error('❌ Erreur lors du seed du SuperAdmin :', err.message || err);
  process.exit(1);
});
