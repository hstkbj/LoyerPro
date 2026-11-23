import express from 'express';
import { createHmac, timingSafeEqual, randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { GoogleAuth } from 'google-auth-library';

// ------------------------------------------------------------------
// Supabase Admin client (service role) - used server-side only, NEVER
// expose SUPABASE_SERVICE_ROLE_KEY to the browser/client bundle.
// ------------------------------------------------------------------
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function logEmail(toEmail: string, subject: string, template: string, status: 'sent' | 'simulated' | 'failed', error?: string) {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  try {
    await admin.from('email_logs').insert({ to_email: toEmail, subject, template, status, error: error || null });
  } catch (e) {
    console.error('email_logs insert failed:', e);
  }
}

const EMAIL_TEMPLATES: Record<string, (p: any) => { subject: string; html: string }> = {
  welcome: (p) => ({
    subject: `Bienvenue sur LoyerPro`,
    html: `<p>Bonjour ${p.fullName},</p><p>Votre compte LoyerPro (${p.role === 'agency' ? 'Agence' : 'Propriétaire'}) a bien été créé.</p><p>Vous êtes actuellement sur le plan <strong>${p.planName || 'Starter Gratuit'}</strong>. Connectez-vous pour ajouter vos premiers biens.</p><p>— L'équipe LoyerPro</p>`,
  }),
  account_verified: (p) => ({
    subject: `Votre compte LoyerPro est vérifié`,
    html: `<p>Bonjour ${p.fullName},</p><p>Votre compte a été vérifié par notre équipe. Vos annonces peuvent désormais être publiées sur le portail public.</p><p>— L'équipe LoyerPro</p>`,
  }),
  account_rejected: (p) => ({
    subject: `Vérification de compte LoyerPro : action requise`,
    html: `<p>Bonjour ${p.fullName},</p><p>Votre demande de vérification n'a pas pu être validée.</p><p><strong>Motif :</strong> ${p.reason || 'Documents insuffisants ou illisibles.'}</p><p>Merci de soumettre à nouveau vos documents depuis votre espace.</p>`,
  }),
  subscription_confirmed: (p) => ({
    subject: `Abonnement LoyerPro activé : ${p.planName}`,
    html: `<p>Bonjour ${p.fullName},</p><p>Votre abonnement <strong>${p.planName}</strong> (${p.amount} ${p.currency}/${p.interval === 'year' ? 'an' : 'mois'}) est actif.</p><p>Référence transaction : ${p.transactionId || 'N/A'}</p><p>— L'équipe LoyerPro</p>`,
  }),
  new_inquiry: (p) => ({
    subject: `Nouvelle demande pour "${p.propertyTitle}"`,
    html: `<p>Bonjour ${p.ownerName},</p><p>${p.visitorName} (${p.visitorPhone}) a envoyé une demande concernant votre bien <strong>${p.propertyTitle}</strong> :</p><blockquote>${p.message}</blockquote><p>Connectez-vous à votre tableau de bord pour répondre.</p>`,
  }),
  new_visit_request: (p) => ({
    subject: `Nouvelle demande de visite pour "${p.propertyTitle}"`,
    html: `<p>Bonjour ${p.ownerName},</p><p>${p.visitorName} (${p.visitorPhone}) souhaite visiter <strong>${p.propertyTitle}</strong> le ${p.preferredDate} à ${p.preferredTime}.</p><p>Connectez-vous pour confirmer ou proposer un autre créneau.</p>`,
  }),
};

// ------------------------------------------------------------------
// Sécurité des endpoints publics : échappement HTML, validation, limitation
// de fréquence par IP. (La limitation est en mémoire : sur Vercel chaque
// instance serverless a son propre compteur, c'est donc un frein anti-abus
// « au mieux », pas une garantie stricte.)
// ------------------------------------------------------------------
function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]
  );
}

// Échappe récursivement toutes les valeurs texte avant injection dans un gabarit HTML.
function escapeParams(params: any, depth = 0): any {
  if (typeof params === 'string') return escapeHtml(params.slice(0, 2000));
  if (typeof params === 'number' || typeof params === 'boolean') return params;
  if (depth > 3 || params === null || typeof params !== 'object') return '';
  const out: any = Array.isArray(params) ? [] : {};
  for (const [k, v] of Object.entries(params).slice(0, 30)) out[k] = escapeParams(v, depth + 1);
  return out;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(req: express.Request): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : (fwd || '').split(',')[0];
  return (first || req.socket?.remoteAddress || 'unknown').trim();
}

const rateBuckets = new Map<string, number[]>();

function rateLimit(name: string, max: number, windowMs: number): express.RequestHandler {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${name}:${clientIp(req)}`;
    const recent = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: 'Trop de requêtes. Réessayez plus tard.' });
    }
    recent.push(now);
    rateBuckets.set(key, recent);
    if (rateBuckets.size > 5000) {
      for (const [k, v] of rateBuckets) if (!v.some((t) => now - t < windowMs)) rateBuckets.delete(k);
    }
    next();
  };
}

function newTicketId(): string {
  return 'LP-' + randomInt(100000, 1000000);
}

function getTransporter() {
  const host = (process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  // Ne pas tenter d'ouvrir de socket si les identifiants sont manquants ou des exemples .env
  if (
    !host || !user || !pass ||
    host.includes('votre-fournisseur') ||
    host.includes('example.com') ||
    user.includes('votre-utilisateur') ||
    pass.includes('votre-mot-de-passe')
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 3500, // 3.5s max pour ne JAMAIS dépasser la limite Vercel de 10s
    greetingTimeout: 3500,
    socketTimeout: 3500,
  });
}

// ------------------------------------------------------------------
// FedaPay : vérification de signature de webhook (X-FEDAPAY-SIGNATURE)
// Format de l'en-tête : "t=<timestamp>,s=<hmac_sha256_hex>"
// signature attendue = HMAC-SHA256(secret, `${timestamp}.${rawPayload}`)
// (même schéma que la librairie officielle "fedapay" côté Node/PHP).
// ------------------------------------------------------------------
function verifyFedaPayWebhookSignature(rawBody: string, header: string | undefined, secret: string, toleranceSec = 300): boolean {
  if (!header || typeof header !== 'string') return false;

  const parts = header.split(',').reduce(
    (acc, item) => {
      const [k, v] = item.split('=');
      if (k === 't') acc.timestamp = parseInt(v, 10);
      if (k === 's') acc.signatures.push(v);
      return acc;
    },
    { timestamp: -1, signatures: [] as string[] }
  );

  if (parts.timestamp === -1 || parts.signatures.length === 0) return false;

  const expected = createHmac('sha256', secret)
    .update(`${parts.timestamp}.${rawBody}`, 'utf8')
    .digest('hex');

  const matches = parts.signatures.some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  });

  if (!matches) return false;

  const age = Math.floor(Date.now() / 1000) - parts.timestamp;
  if (toleranceSec > 0 && age > toleranceSec) return false; // anti-rejeu

  return true;
}

// ------------------------------------------------------------------
// Active un abonnement payant en base UNIQUEMENT après vérification réelle
// du statut de la transaction auprès de l'API FedaPay (jamais sur la seule
// foi du navigateur ou du corps du webhook). Idempotent : si la transaction
// a déjà été traitée (contrainte unique sur fedapay_transaction_id), on ne
// double-active pas. Utilise la clé service_role (contourne RLS) : c'est le
// SEUL chemin autorisé à écrire une ligne "subscriptions"/"transactions"
// payante, RLS l'interdisant désormais depuis le client (migration 0006).
// ------------------------------------------------------------------
async function activatePaidSubscriptionFromTransaction(tx: any): Promise<{
  activated: boolean;
  alreadyProcessed?: boolean;
  reason?: string;
  subscription?: any;
}> {
  if (!tx || tx.status !== 'approved') {
    return { activated: false, reason: 'transaction_not_approved' };
  }

  const meta = tx.custom_metadata || {};
  const userId: string | undefined = meta.user_id;
  const planId: string | undefined = meta.plan_id;

  if (!userId || !planId) {
    console.error('[FedaPay] Transaction approuvée sans custom_metadata.user_id/plan_id exploitable :', tx.id);
    return { activated: false, reason: 'missing_metadata' };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn('[FedaPay] Supabase (service_role) non configuré : impossible d\'activer l\'abonnement automatiquement.');
    return { activated: false, reason: 'supabase_not_configured' };
  }

  // Idempotence : ce paiement a-t-il déjà été traité (webhook + fallback verify
  // appelés tous les deux, ou webhook relivré par FedaPay) ?
  const { data: existingTx } = await admin
    .from('transactions')
    .select('id')
    .eq('fedapay_transaction_id', String(tx.id))
    .maybeSingle();
  if (existingTx) {
    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('*, plan:plan_id(*)')
      .eq('transaction_id', String(tx.id))
      .maybeSingle();
    return { activated: true, alreadyProcessed: true, subscription: existingSub || undefined };
  }

  const { data: plan, error: planErr } = await admin
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .maybeSingle();

  if (planErr || !plan) {
    console.error('[FedaPay] Plan inconnu référencé par la transaction:', planId);
    return { activated: false, reason: 'unknown_plan' };
  }

  // Sécurité anti-fraude : le montant réellement débité par FedaPay doit
  // correspondre au prix du plan (toujours facturé en XOF, voir fedapayCheckout.ts).
  const expectedAmount = Math.round(Number(plan.price));
  const gotAmount = Math.round(Number(tx.amount));
  const gotCurrency = tx.currency?.iso || tx.currency || 'XOF';
  const expectedCurrency = plan.currency || 'XOF';

  if (gotAmount !== expectedAmount || gotCurrency !== expectedCurrency) {
    console.error('[FedaPay] Montant/devise de la transaction ne correspond pas au plan demandé :', {
      transactionId: tx.id, planId, expectedAmount, gotAmount, expectedCurrency, gotCurrency,
    });
    return { activated: false, reason: 'amount_mismatch' };
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const { data: subscription, error: subErr } = await admin
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      amount: plan.price,
      transaction_id: String(tx.id),
      payment_gateway: 'fedapay',
    })
    .select('*, plan:plan_id(*)')
    .single();

  if (subErr) {
    console.error('[FedaPay] Échec insertion subscription:', subErr.message);
    return { activated: false, reason: 'db_error_subscription' };
  }

  const { error: txErr } = await admin.from('transactions').insert({
    user_id: userId,
    subscription_id: subscription.id,
    fedapay_transaction_id: String(tx.id),
    amount: plan.price,
    currency: expectedCurrency,
    status: 'approved',
    payment_method: 'FedaPay Mobile Money',
  });
  if (txErr) {
    // La contrainte unique peut se déclencher en cas de course entre webhook
    // et vérification manuelle : ce n'est pas une erreur fonctionnelle.
    console.warn('[FedaPay] Insertion transaction (probable doublon idempotent):', txErr.message);
  }

  // Email de confirmation — non bloquant, ne doit jamais faire échouer l'activation.
  try {
    const { data: prof } = await admin.from('profiles').select('email, full_name').eq('id', userId).single();
    if (prof?.email) {
      const { subject, html } = EMAIL_TEMPLATES.subscription_confirmed({
        fullName: prof.full_name,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        transactionId: tx.id,
      });
      const transporter = getTransporter();
      const fromEmail = process.env.EMAIL_FROM || 'no-reply@loyerpro.bj';
      const fromName = process.env.EMAIL_FROM_NAME || 'LoyerPro';
      if (transporter) {
        await transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: prof.email, subject, html });
        await logEmail(prof.email, subject, 'subscription_confirmed', 'sent');
      } else {
        await logEmail(prof.email, subject, 'subscription_confirmed', 'simulated');
      }
    }
  } catch (emailErr: any) {
    console.warn('[FedaPay] Email de confirmation non envoyé:', emailErr?.message);
  }

  return { activated: true, subscription };
}

// Identifie l'utilisateur à partir du jeton de session Supabase envoyé par le navigateur.
async function getUserFromBearer(req: express.Request) {
  const admin = getSupabaseAdmin();
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!admin || !token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return { admin, user: data.user };
}

async function getGoogleAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) return null;

  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token?.token || null;
}

function simulatedAnalytics(days: number) {
  const series = Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d.toISOString().slice(0, 10), visitors: 20 + Math.round(Math.random() * 60) };
  });
  return {
    simulated: true,
    notice: 'Google Analytics non configuré (GA_PROPERTY_ID / GA_CLIENT_EMAIL / GA_PRIVATE_KEY). Données simulées affichées.',
    totals: {
      activeUsers: series.reduce((s, d) => s + d.visitors, 0),
      sessions: Math.round(series.reduce((s, d) => s + d.visitors, 0) * 1.4),
      newUsers: Math.round(series.reduce((s, d) => s + d.visitors, 0) * 0.6),
      avgSessionDurationSec: 96,
    },
    byDate: series,
    byCountry: [
      { country: 'Bénin', activeUsers: 420 },
      { country: "Côte d'Ivoire", activeUsers: 210 },
      { country: 'Togo', activeUsers: 130 },
      { country: 'Sénégal', activeUsers: 95 },
      { country: 'France', activeUsers: 60 },
    ],
  };
}

export function createApp() {
  const app = express();
  // On conserve le corps brut (rawBody) pour pouvoir vérifier la signature
  // X-FEDAPAY-SIGNATURE du webhook, qui doit être calculée sur le JSON exact
  // envoyé par FedaPay et non sur une re-sérialisation.
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      },
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'LoyerPro API Server',
      environment: process.env.NODE_ENV || 'development',
      time: new Date().toISOString(),
    });
  });

  function getFedaPayConfig() {
    const rawSecret = (process.env.FEDAPAY_SECRET_KEY || '').trim();
    const isConfigured = Boolean(
      rawSecret &&
      !rawSecret.includes('votre-cle') &&
      !rawSecret.includes('placeholder') &&
      rawSecret !== 'sk_live_or_sandbox_fedapay'
    );
    const isSandbox = rawSecret.includes('sandbox') || rawSecret.includes('test');
    const baseUrl = isSandbox ? 'https://sandbox-api.fedapay.com' : 'https://api.fedapay.com';
    return { secret: rawSecret, isConfigured, isSandbox, baseUrl };
  }

  app.post('/api/fedapay/create-transaction', async (req, res) => {
    try {
      const { amount, description, customer, callback_url } = req.body;
      const { secret, isConfigured, baseUrl } = getFedaPayConfig();

      if (!amount || !description) {
        return res.status(400).json({ error: 'Montant et description requis' });
      }

      if (!isConfigured) {
        return res.json({
          id: 'fedapay_tx_' + Date.now(),
          status: 'pending',
          amount: Number(amount),
          currency: 'XOF',
          token: 'token_sandbox_' + Math.random().toString(36).substring(2, 10),
          url: callback_url || '#',
          notice: 'Mode simulation FedaPay (Définissez FEDAPAY_SECRET_KEY pour la passerelle live)',
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5500);

      const response = await fetch(`${baseUrl}/v1/transactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          currency: { iso: 'XOF' },
          callback_url,
          customer: customer || {
            firstname: 'Client',
            lastname: 'LoyerPro',
            email: 'client@loyerpro.bj',
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error: any) {
      console.error('FedaPay transaction error:', error);
      return res.status(500).json({ error: error.message || 'Erreur serveur FedaPay' });
    }
  });

  app.get('/api/fedapay/verify-transaction/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { secret, isConfigured, baseUrl } = getFedaPayConfig();

      if (!isConfigured) {
        // Mode démo uniquement (aucune clé FedaPay réelle configurée). On ne
        // fait QUE renvoyer un statut simulé pour ne pas bloquer les tests
        // locaux : ceci n'active jamais un abonnement payant en base réelle,
        // puisque RLS interdit désormais tout insert direct côté client pour
        // un forfait payant (migration 0006) et qu'activatePaidSubscriptionFromTransaction
        // n'est appelée que plus bas, jamais dans cette branche.
        return res.json({
          id,
          status: 'approved',
          verified: true,
          approved: true,
          simulated: true,
          notice: "FEDAPAY_SECRET_KEY non configurée : mode simulation (aucun paiement réel vérifié, aucun abonnement activé en base).",
        });
      }

      // Timeout strict de 5.5s pour ne JAMAIS dépasser la limite de 10s des Serverless Functions Vercel
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5500);

      try {
        const response = await fetch(`${baseUrl}/v1/transactions/${id}`, {
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await response.json().catch(() => null);
        const tx = data?.['v1/transaction'] || data;

        if (!response.ok || !tx?.status) {
          return res.status(200).json({
            id,
            approved: false,
            pending: true,
            notice: "Impossible de confirmer la transaction pour le moment auprès de FedaPay. Réessayez dans quelques instants.",
          });
        }

        const isApproved = tx.status === 'approved';
        let activation: Awaited<ReturnType<typeof activatePaidSubscriptionFromTransaction>> | null = null;

        if (isApproved) {
          // ⚠️ On ne fait JAMAIS confiance à un statut envoyé par le
          // navigateur : on vient de relire la transaction directement
          // depuis l'API FedaPay avec la clé secrète serveur, c'est cette
          // valeur (tx.status) qui déclenche l'activation, pas celle reçue
          // du client. C'est ce même appel qui active réellement l'abonnement
          // en base (au cas où le webhook n'est pas configuré ou pas encore arrivé).
          activation = await activatePaidSubscriptionFromTransaction(tx);
        }

        return res.json({
          id,
          status: tx.status,
          verified: true,
          approved: isApproved,
          activated: activation?.activated || false,
          subscription: activation?.subscription,
          notice: isApproved
            ? undefined
            : `Statut FedaPay actuel : ${tx.status}. L'abonnement ne sera activé qu'après approbation.`,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        console.warn('[FedaPay] verify network/timeout warning:', fetchErr?.message);
        // ⚠️ FAIL-CLOSED (correction d'une faille) : auparavant, toute coupure
        // réseau ou timeout renvoyait `approved: true`, ce qui permettait de
        // valider un paiement jamais effectué en bloquant simplement cette
        // requête (mode avion, devtools, bloqueur...). On renvoie désormais un
        // statut "en attente" explicite : le webhook FedaPay confirmera
        // l'activation dès sa réception, et l'utilisateur peut réessayer.
        return res.status(200).json({
          id,
          approved: false,
          pending: true,
          notice: fetchErr?.name === 'AbortError'
            ? "Délai d'interrogation FedaPay dépassé. Si le paiement a bien été débité, il sera confirmé automatiquement d'ici quelques minutes (webhook FedaPay)."
            : "Contrôle réseau FedaPay indisponible pour le moment. Si le paiement a bien été débité, il sera confirmé automatiquement dès réception du webhook FedaPay.",
        });
      }
    } catch (error: any) {
      console.error('FedaPay verify error:', error);
      return res.status(200).json({
        id: req.params?.id,
        approved: false,
        pending: true,
        error: error.message || 'Erreur de vérification FedaPay',
      });
    }
  });

  // Abonnement courant de l'utilisateur connecté, lu côté serveur. Sert de
  // secours quand le navigateur n'arrive pas à joindre Supabase directement
  // (réseau mobile instable, coupures de connexion).
  app.get('/api/subscription/me', async (req, res) => {
    try {
      const auth = await getUserFromBearer(req);
      if (!auth) return res.status(401).json({ error: 'Session invalide ou expirée.' });
      const { data, error } = await auth.admin
        .from('subscriptions')
        .select('*, plan:plan_id(*)')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return res.status(500).json({ error: 'Lecture de l\'abonnement impossible.' });
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ subscription: data || null });
    } catch (e: any) {
      console.error('[subscription/me]', e?.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
  });

  app.post('/api/fedapay/webhook', async (req, res) => {
    try {
      const webhookSecret = (process.env.FEDAPAY_WEBHOOK_SECRET || '').trim();
      const sigHeader = req.headers['x-fedapay-signature'] as string | undefined;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body || {});

      if (webhookSecret) {
        const validSignature = verifyFedaPayWebhookSignature(rawBody, sigHeader, webhookSecret);
        if (!validSignature) {
          console.warn('[FedaPay webhook] Signature invalide ou absente : requête rejetée.');
          return res.status(400).json({ error: 'Signature invalide' });
        }
      } else {
        // Toléré pour ne jamais bloquer un environnement de démo/test sans
        // configuration complète, mais ce cas doit être corrigé avant la mise
        // en production (voir README : configurez FEDAPAY_WEBHOOK_SECRET).
        console.warn('[FedaPay webhook] FEDAPAY_WEBHOOK_SECRET non configurée : signature NON vérifiée (à corriger avant la mise en ligne).');
      }

      const event = req.body || {};
      const eventName: string = event?.name || event?.type || '';
      console.log('[FedaPay webhook] événement reçu:', eventName, event?.id);

      // Le format exact du payload peut varier ; on essaie plusieurs chemins
      // usuels pour retrouver l'identifiant de la transaction concernée.
      const txId =
        event?.entity?.id ??
        event?.data?.object?.id ??
        (event?.object === 'transaction' ? event?.id : undefined) ??
        event?.transaction_id;

      if (!eventName.startsWith('transaction.') || !txId) {
        return res.status(200).json({ received: true });
      }

      const { secret, isConfigured, baseUrl } = getFedaPayConfig();
      if (!isConfigured) {
        console.warn('[FedaPay webhook] FEDAPAY_SECRET_KEY non configurée : impossible de vérifier la transaction auprès de FedaPay.');
        return res.status(200).json({ received: true });
      }

      // ⚠️ On ne fait jamais confiance au statut présent dans le corps du
      // webhook lui-même : on relit toujours la transaction directement
      // depuis l'API FedaPay avec la clé secrète serveur avant d'activer quoi
      // que ce soit (recommandation officielle FedaPay).
      const txResponse = await fetch(`${baseUrl}/v1/transactions/${txId}`, {
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      });
      const txData = await txResponse.json().catch(() => null);
      const tx = txData?.['v1/transaction'] || txData;

      if (!txResponse.ok || !tx) {
        console.error('[FedaPay webhook] Impossible de récupérer la transaction', txId);
        return res.status(200).json({ received: true });
      }

      const result = await activatePaidSubscriptionFromTransaction(tx);
      console.log('[FedaPay webhook] résultat activation:', result);
      return res.status(200).json({ received: true, ...result });
    } catch (error: any) {
      console.error('[FedaPay webhook] erreur:', error);
      // On répond 200 pour éviter des retentatives FedaPay sur une erreur qui
      // ne remet pas en cause la validité de l'événement lui-même ; l'erreur
      // reste journalisée côté serveur pour investigation.
      return res.status(200).json({ received: true, error: error.message });
    }
  });

  app.post('/api/email/send', rateLimit('email', 20, 60 * 60 * 1000), async (req, res) => {
    try {
      const { to, template, params } = req.body || {};
      if (!to || typeof to !== 'string' || to.length > 254 || !EMAIL_PATTERN.test(to) || !template || !Object.prototype.hasOwnProperty.call(EMAIL_TEMPLATES, template)) {
        return res.status(400).json({ error: 'Paramètres "to" (e-mail valide) et "template" (valide) requis.' });
      }

      // Toutes les valeurs fournies par le client sont échappées : un visiteur ne peut pas injecter de HTML ou de liens.
      const { subject: rawSubject, html } = EMAIL_TEMPLATES[template](escapeParams(params || {}));
      const subject = rawSubject.replace(/[\r\n]+/g, ' ');
      const fromEmail = process.env.EMAIL_FROM || 'no-reply@loyerpro.bj';
      const fromName = process.env.EMAIL_FROM_NAME || 'LoyerPro';
      const transporter = getTransporter();

      if (!transporter) {
        console.log(`[EMAIL SIMULÉ] à ${to} — sujet: "${subject}" (configurez SMTP_HOST/SMTP_USER/SMTP_PASS pour un envoi réel)`);
        await logEmail(to, subject, template, 'simulated');
        return res.json({ sent: false, simulated: true, notice: 'SMTP non configuré : email simulé (voir logs serveur / email_logs).' });
      }

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to,
          subject,
          html,
        });

        await logEmail(to, subject, template, 'sent');
        return res.json({ sent: true, simulated: false });
      } catch (sendErr: any) {
        console.warn('SMTP sendMail error (fallback simulé):', sendErr?.message);
        await logEmail(to, subject, template, 'failed', sendErr?.message);
        return res.json({ sent: false, simulated: true, notice: 'Échec SMTP : ' + sendErr?.message });
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      await logEmail(req.body?.to || 'unknown', req.body?.template || 'unknown', req.body?.template || 'unknown', 'failed', error.message);
      return res.status(200).json({ sent: false, simulated: true, error: error.message || "Erreur lors de l'envoi de l'email" });
    }
  });

  // Formulaire de contact public : le destinataire est choisi par le serveur (jamais par le client).
  app.post('/api/contact', rateLimit('contact', 5, 60 * 60 * 1000), async (req, res) => {
    const b = req.body || {};

    // Piège anti-robot : un humain ne voit pas ce champ. On répond « succès » sans rien envoyer.
    if (typeof b.website_url === 'string' && b.website_url.trim() !== '') {
      return res.json({ ok: true, ticket: newTicketId() });
    }

    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
    const fullName = str(b.fullName);
    const email = str(b.email);
    const phone = str(b.phone);
    const subject = str(b.subject).replace(/[\r\n]+/g, ' ');
    const message = str(b.message);
    const country = str(b.country);
    const userType = ['locataire', 'proprietaire', 'agence', 'autre'].includes(b.userType) ? b.userType : 'autre';

    const fields: Record<string, string> = {};
    if (fullName.length < 2 || fullName.length > 100) fields.fullName = 'Nom invalide.';
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) fields.email = 'E-mail invalide.';
    const digits = phone.replace(/\D/g, '');
    if (!/^[+0-9\s().-]+$/.test(phone) || digits.length < 8 || digits.length > 15) fields.phone = 'Téléphone invalide.';
    if (subject.length < 3 || subject.length > 150) fields.subject = 'Objet invalide.';
    if (message.length < 10 || message.length > 3000) fields.message = 'Message invalide (10 à 3000 caractères).';
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: 'Certains champs sont invalides.', fields });
    }

    const transporter = getTransporter();
    const to = (process.env.CONTACT_TO_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || '').trim();
    if (!transporter || !to) {
      // On refuse plutôt que de faire croire à l'utilisateur que son message est parti.
      return res.status(503).json({ error: "L'envoi de messages est momentanément indisponible. Écrivez-nous directement par e-mail." });
    }

    const ticket = newTicketId();
    const fromEmail = process.env.EMAIL_FROM || 'no-reply@loyerpro.bj';
    const fromName = process.env.EMAIL_FROM_NAME || 'LoyerPro';
    const mailSubject = `[Contact ${ticket}] ${subject}`.slice(0, 200);
    const html =
      `<p><strong>Ticket ${ticket}</strong></p>` +
      `<p><strong>Nom :</strong> ${escapeHtml(fullName)}<br/>` +
      `<strong>E-mail :</strong> ${escapeHtml(email)}<br/>` +
      `<strong>Téléphone :</strong> ${escapeHtml(phone)}<br/>` +
      `<strong>Profil :</strong> ${escapeHtml(userType)}<br/>` +
      `<strong>Pays :</strong> ${escapeHtml(country || 'non précisé')}</p>` +
      `<p><strong>Objet :</strong> ${escapeHtml(subject)}</p>` +
      `<blockquote style="white-space:pre-wrap">${escapeHtml(message)}</blockquote>`;

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        replyTo: `"${fullName.replace(/["\r\n]/g, '')}" <${email}>`,
        subject: mailSubject,
        html,
        text: `Ticket ${ticket}\nNom: ${fullName}\nE-mail: ${email}\nTéléphone: ${phone}\nProfil: ${userType}\nPays: ${country}\n\nObjet: ${subject}\n\n${message}`,
      });
      await logEmail(to, mailSubject, 'contact', 'sent');
      return res.json({ ok: true, ticket });
    } catch (err: any) {
      console.warn('Contact sendMail error:', err?.message);
      await logEmail(to, mailSubject, 'contact', 'failed', err?.message);
      return res.status(502).json({ error: "Le message n'a pas pu être envoyé. Réessayez dans quelques instants." });
    }
  });

  app.get('/api/analytics/overview', async (req, res) => {
    try {
      const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
      const propertyId = process.env.GA_PROPERTY_ID;
      const accessToken = await getGoogleAccessToken();

      if (!propertyId || !accessToken) {
        return res.json(simulatedAnalytics(days));
      }

      const runReport = async (body: any) => {
        const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error(`GA4 API error ${r.status}: ${await r.text()}`);
        return r.json();
      };

      const dateRange = [{ startDate: `${days}daysAgo`, endDate: 'today' }];

      const [byDateReport, byCountryReport, totalsReport] = await Promise.all([
        runReport({ dateRanges: dateRange, dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
        runReport({ dateRanges: dateRange, dimensions: [{ name: 'country' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 10 }),
        runReport({ dateRanges: dateRange, metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'newUsers' }, { name: 'averageSessionDuration' }] }),
      ]);

      const byDate = (byDateReport.rows || []).map((r: any) => ({
        date: r.dimensionValues[0].value,
        visitors: Number(r.metricValues[0].value || 0),
      }));
      const byCountry = (byCountryReport.rows || []).map((r: any) => ({
        country: r.dimensionValues[0].value,
        activeUsers: Number(r.metricValues[0].value || 0),
      }));
      const totalsRow = totalsReport.rows?.[0]?.metricValues || [];
      const totals = {
        activeUsers: Number(totalsRow[0]?.value || 0),
        sessions: Number(totalsRow[1]?.value || 0),
        newUsers: Number(totalsRow[2]?.value || 0),
        avgSessionDurationSec: Math.round(Number(totalsRow[3]?.value || 0)),
      };

      return res.json({ simulated: false, totals, byDate, byCountry });
    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      return res.json({ ...simulatedAnalytics(30), error: error.message });
    }
  });

  return app;
}