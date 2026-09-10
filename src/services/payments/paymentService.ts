import { getSupabase } from '../supabase/client';
import type { Payment } from '../../types';

const STORAGE_KEY = 'loyerpro_data_payments';

function getLocalPayments(): Payment[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalPayments(items: Payment[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const paymentService = {
  async getMyPayments(userId?: string): Promise<Payment[]> {
    const supabase = getSupabase();
    if (supabase) {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }
      if (!uid) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('*, property:properties(*), tenant:tenants(*)')
        .eq('user_id', uid)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return (data || []) as Payment[];
    }

    const items = getLocalPayments();
    return userId ? items.filter(p => p.user_id === userId) : items;
  },

  async getOwnerPayments(userId: string): Promise<Payment[]> {
    return this.getMyPayments(userId);
  },

  async createPayment(payment: Partial<Payment> & { amount: number; payment_date: string; month: string }): Promise<Payment> {
    const supabase = getSupabase();
    let uid = payment.user_id;

    if (supabase) {
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id || '00000000-0000-0000-0000-000000000000';
      }

      const payload = {
        payment_method: 'MTN Mobile Money',
        status: 'completed',
        ...payment,
        user_id: uid,
      };

      const { data, error } = await supabase
        .from('payments')
        .insert(payload)
        .select('*, property:properties(*), tenant:tenants(*)')
        .single();

      if (error) throw error;
      return data as Payment;
    }

    const items = getLocalPayments();
    const newPayment: Payment = {
      payment_method: 'MTN Mobile Money',
      status: 'completed',
      ...payment,
      user_id: uid || 'local_user',
      id: 'pay_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    items.unshift(newPayment);
    saveLocalPayments(items);
    return newPayment;
  },

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select('*, property:properties(*), tenant:tenants(*)')
        .single();

      if (error) throw error;
      return data as Payment;
    }

    const items = getLocalPayments();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Paiement non trouvé');
    const updated = { ...items[idx], ...updates };
    items[idx] = updated;
    saveLocalPayments(items);
    return updated;
  },

  async deletePayment(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const items = getLocalPayments().filter(p => p.id !== id);
    saveLocalPayments(items);
  },
};
