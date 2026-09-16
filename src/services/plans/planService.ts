import { getSupabase } from '../supabase/client';
import type { SubscriptionPlan } from '../../types';
import { DEFAULT_PLANS } from '../subscriptions/subscriptionService';

const STORAGE_KEY = 'loyerpro_data_plans';

function getLocalPlans(): SubscriptionPlan[] {
  if (typeof window === 'undefined') return DEFAULT_PLANS;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_PLANS;
}

function saveLocalPlans(items: SubscriptionPlan[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'plan_' + Math.random().toString(36).slice(2, 7);
}

// Service réservé au SuperAdmin : gestion complète des plans (prix, quotas, options...)
// La table subscription_plans est protégée par RLS : seule une session avec
// role = 'superadmin' peut écrire (voir migration 0002_patch_saas_admin.sql).
export const planService = {
  async getAllPlans(includeInactive = true): Promise<SubscriptionPlan[]> {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase.from('subscription_plans').select('*').order('sort_order', { ascending: true });
      if (!includeInactive) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (!error && data) return data as SubscriptionPlan[];
    }
    return getLocalPlans();
  },

  async createPlan(plan: Omit<SubscriptionPlan, 'id'> & { id?: string }): Promise<SubscriptionPlan> {
    const id = plan.id || slugifyId(plan.name);
    const supabase = getSupabase();
    const payload = { ...plan, id, is_active: plan.is_active ?? true };

    if (supabase) {
      const { data, error } = await supabase.from('subscription_plans').insert(payload).select().single();
      if (error) throw error;
      return data as SubscriptionPlan;
    }

    const items = getLocalPlans();
    const newPlan = payload as SubscriptionPlan;
    items.push(newPlan);
    saveLocalPlans(items);
    return newPlan;
  },

  async updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as SubscriptionPlan;
    }

    const items = getLocalPlans();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Plan introuvable');
    items[idx] = { ...items[idx], ...updates };
    saveLocalPlans(items);
    return items[idx];
  },

  // Désactive un plan plutôt que de le supprimer (les abonnements existants restent valides)
  async deactivatePlan(id: string): Promise<void> {
    await this.updatePlan(id, { is_active: false });
  },

  async activatePlan(id: string): Promise<void> {
    await this.updatePlan(id, { is_active: true });
  },

  async deletePlan(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const items = getLocalPlans().filter(p => p.id !== id);
    saveLocalPlans(items);
  },
};
