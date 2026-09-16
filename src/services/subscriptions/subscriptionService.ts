import { getSupabase } from '../supabase/client';
import { emailService } from '../email/emailService';
import type { SubscriptionPlan, Subscription, Transaction } from '../../types';

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Starter Gratuit',
    price: 0,
    currency: 'XOF',
    interval: 'month',
    max_properties: 2,
    description: 'Pour démarrer la gestion de vos 2 premiers biens',
    features: [
      'Jusqu\'à 2 biens immobiliers',
      'Gestion des locataires & contrats',
      'Enregistrement des loyers & reçus',
      'Fiches biens et calculs de base',
      'Support standard par email',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Pro Mensuel',
    price: 15000,
    currency: 'XOF',
    interval: 'month',
    max_properties: 25,
    popular: true,
    description: 'Pour les propriétaires avec un patrimoine locatif actif',
    features: [
      'Jusqu\'à 25 biens immobiliers',
      'Publication sur le portail public',
      'Gestion avancée des impayés & alertes',
      'Réception des demandes de visite & contacts',
      'Rapports financiers & balance des dépenses',
      'Support prioritaire WhatsApp Bénin',
    ],
  },
  {
    id: 'agency',
    name: 'Agence Business',
    price: 45000,
    currency: 'XOF',
    interval: 'month',
    max_properties: 9999,
    description: 'Pour cabinets de gestion immobilière et syndics',
    features: [
      'Biens et mandats illimités',
      'Multi-utilisateurs & gestionnaires',
      'Portail agence & visibilité prioritaire',
      'Export comptable des loyers & commissions',
      'Intégration WhatsApp direct visiteurs',
      'Accompagnement & onboarding personnalisé',
    ],
  },
];

const STORAGE_KEY_SUBS = 'loyerpro_data_subscriptions';
const STORAGE_KEY_TX = 'loyerpro_data_transactions';

function getLocalSubs(): Subscription[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_SUBS);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalSubs(items: Subscription[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(items));
  }
}

function getLocalTx(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_TX);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalTx(items: Transaction[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(items));
  }
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data as SubscriptionPlan[];
        }
      } catch (e) {
        console.warn('[subscriptionService] getPlans notice:', e);
      }
    }
    return DEFAULT_PLANS;
  },

  async getMySubscription(userId?: string): Promise<Subscription | null> {
    const supabase = getSupabase();
    let uid = userId;
    if (!uid && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      } catch (e) {
        // ignore
      }
    }

    // Si Supabase est configuré mais qu'on n'a aucun utilisateur réel
    // (session absente/expirée), il ne faut PAS interroger la vraie base
    // avec un identifiant fictif ('local_user') : ça ne trouvera jamais
    // rien et ça masque le vrai problème (utilisateur non connecté).
    if (supabase && !uid) {
      const localSubs = getLocalSubs().filter(s => s.user_id === 'local_user');
      if (localSubs.length > 0) {
        const sub = localSubs[0];
        const plan = DEFAULT_PLANS.find(p => p.id === sub.plan_id) || DEFAULT_PLANS[0];
        return { ...sub, plan };
      }
      return null;
    }

    return this.getUserSubscription(uid || 'local_user');
  },

  async upgradeSubscription(
    planId: string,
    paymentMethod?: string,
    userId?: string,
    verifiedTransactionId?: string | number
  ): Promise<Subscription> {
    let uid = userId;
    if (!uid) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          uid = user?.id;
        } catch (e) {
          // ignore
        }
      }
    }
    // IMPORTANT : verifiedTransactionId doit provenir d'une transaction déjà
    // confirmée "approved" par /api/fedapay/verify-transaction/:id (voir
    // fedapayCheckout.ts). On ne doit plus jamais fabriquer un faux
    // identifiant ici : ça revenait à activer un abonnement payant sans
    // paiement réel.
    if (!verifiedTransactionId && planId !== 'free') {
      throw new Error("Un identifiant de transaction FedaPay vérifié est requis pour activer un forfait payant.");
    }
    return this.createOrUpgradeSubscription(
      uid || 'local_user',
      planId,
      verifiedTransactionId ? String(verifiedTransactionId) : undefined,
      paymentMethod || 'FedaPay Mobile Money'
    );
  },

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, plan:plan_id(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('[subscriptionService] getUserSubscription notice:', error.message);
          const localItems = getLocalSubs().filter(s => s.user_id === userId);
          if (localItems.length > 0) {
            const sub = localItems[0];
            const plan = DEFAULT_PLANS.find(p => p.id === sub.plan_id) || DEFAULT_PLANS[0];
            return { ...sub, plan };
          }
          return null;
        }
        return (data as Subscription) || null;
      } catch (err: any) {
        console.warn('[subscriptionService] getUserSubscription network notice:', err?.message);
        const localItems = getLocalSubs().filter(s => s.user_id === userId);
        if (localItems.length > 0) {
          const sub = localItems[0];
          const plan = DEFAULT_PLANS.find(p => p.id === sub.plan_id) || DEFAULT_PLANS[0];
          return { ...sub, plan };
        }
        return null;
      }
    }

    // Supabase non configuré : mode démo hors-ligne uniquement.
    const items = getLocalSubs().filter(s => s.user_id === userId);
    if (items.length > 0) {
      const sub = items[0];
      const plan = DEFAULT_PLANS.find(p => p.id === sub.plan_id) || DEFAULT_PLANS[0];
      return { ...sub, plan };
    }
    return null;
  },

  async createOrUpgradeSubscription(
    userId: string,
    planId: string,
    fedapayTransactionId?: string,
    paymentMethod?: string
  ): Promise<Subscription> {
    const plan = DEFAULT_PLANS.find(p => p.id === planId) || DEFAULT_PLANS[0];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          amount: plan.price,
          transaction_id: fedapayTransactionId || null,
          payment_gateway: 'fedapay',
        })
        .select('*, plan:plan_id(*)')
        .single();

      if (error) throw error;

      if (fedapayTransactionId) {
        await supabase.from('transactions').insert({
          user_id: userId,
          subscription_id: data.id,
          fedapay_transaction_id: fedapayTransactionId,
          amount: plan.price,
          currency: 'XOF',
          status: 'approved',
          payment_method: paymentMethod || 'FedaPay Mobile Money',
        });
      }

      // Email de confirmation d'abonnement - non bloquant
      supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()
        .then(
          ({ data: prof }) => {
            if (prof?.email) {
              emailService.sendSubscriptionConfirmed(prof.email, {
                fullName: prof.full_name,
                planName: plan.name,
                amount: plan.price,
                currency: plan.currency,
                interval: plan.interval,
                transactionId: fedapayTransactionId,
              }).catch(() => {});
            }
          },
          () => {}
        );

      return data as Subscription;
    }

    const items = getLocalSubs();
    const newSub: Subscription = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      plan_id: planId,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      amount: plan.price,
      transaction_id: fedapayTransactionId,
      payment_gateway: 'fedapay',
      plan,
      created_at: new Date().toISOString(),
    };
    items.unshift(newSub);
    saveLocalSubs(items);

    if (fedapayTransactionId) {
      const txs = getLocalTx();
      txs.unshift({
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        subscription_id: newSub.id,
        fedapay_transaction_id: fedapayTransactionId,
        amount: plan.price,
        currency: 'XOF',
        status: 'approved',
        payment_method: paymentMethod || 'FedaPay Mobile Money (MTN / Moov)',
        created_at: new Date().toISOString(),
      });
      saveLocalTx(txs);
    }

    return newSub;
  },

  async getAllSubscriptions(): Promise<Subscription[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, plan:plan_id(*), profiles:user_id(full_name, email, role)')
          .order('created_at', { ascending: false });

        if (!error && data) return data as Subscription[];
        if (error) console.warn('[subscriptionService] getAllSubscriptions notice:', error.message);
      } catch (err: any) {
        console.warn('[subscriptionService] getAllSubscriptions network notice:', err?.message);
      }
    }
    return getLocalSubs();
  },

  async getAllTransactions(): Promise<Transaction[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*, profiles:user_id(full_name, email)')
          .order('created_at', { ascending: false });

        if (!error && data) return data as Transaction[];
        if (error) console.warn('[subscriptionService] getAllTransactions notice:', error.message);
      } catch (err: any) {
        console.warn('[subscriptionService] getAllTransactions network notice:', err?.message);
      }
    }
    return getLocalTx();
  },
};
