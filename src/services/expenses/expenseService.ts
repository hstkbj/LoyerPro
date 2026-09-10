import { getSupabase } from '../supabase/client';
import type { Expense } from '../../types';

const STORAGE_KEY = 'loyerpro_data_expenses';

function getLocalExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalExpenses(items: Expense[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const expenseService = {
  async getMyExpenses(userId?: string): Promise<Expense[]> {
    const supabase = getSupabase();
    if (supabase) {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }
      if (!uid) return [];

      const { data, error } = await supabase
        .from('expenses')
        .select('*, property:properties(*)')
        .eq('user_id', uid)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return (data || []) as Expense[];
    }

    const items = getLocalExpenses();
    return userId ? items.filter(e => e.user_id === userId) : items;
  },

  async getOwnerExpenses(userId: string): Promise<Expense[]> {
    return this.getMyExpenses(userId);
  },

  async createExpense(expense: Partial<Expense> & { amount: number; description: string; expense_date: string }): Promise<Expense> {
    const supabase = getSupabase();
    let uid = expense.user_id;

    if (supabase) {
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id || '00000000-0000-0000-0000-000000000000';
      }

      const payload = {
        category: 'Travaux & Réparations',
        ...expense,
        user_id: uid,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(payload)
        .select('*, property:properties(*)')
        .single();

      if (error) throw error;
      return data as Expense;
    }

    const items = getLocalExpenses();
    const newExpense: Expense = {
      category: 'Travaux & Réparations',
      ...expense,
      user_id: uid || 'local_user',
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    items.unshift(newExpense);
    saveLocalExpenses(items);
    return newExpense;
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select('*, property:properties(*)')
        .single();

      if (error) throw error;
      return data as Expense;
    }

    const items = getLocalExpenses();
    const idx = items.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Dépense non trouvée');
    const updated = { ...items[idx], ...updates };
    items[idx] = updated;
    saveLocalExpenses(items);
    return updated;
  },

  async deleteExpense(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const items = getLocalExpenses().filter(e => e.id !== id);
    saveLocalExpenses(items);
  },
};
