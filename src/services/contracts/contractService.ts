import { getSupabase } from '../supabase/client';
import type { Contract } from '../../types';

const STORAGE_KEY = 'loyerpro_data_contracts';

function getLocalContracts(): Contract[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalContracts(items: Contract[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const contractService = {
  async getMyContracts(userId?: string): Promise<Contract[]> {
    const supabase = getSupabase();
    if (supabase) {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }
      if (!uid) return [];

      const { data, error } = await supabase
        .from('contracts')
        .select('*, property:properties(*), tenant:tenants(*)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Contract[];
    }

    const items = getLocalContracts();
    return userId ? items.filter(c => c.user_id === userId) : items;
  },

  async getOwnerContracts(userId: string): Promise<Contract[]> {
    return this.getMyContracts(userId);
  },

  async createContract(contract: Partial<Contract> & { property_id: string; tenant_id: string; rent_amount: number; start_date: string }): Promise<Contract> {
    const supabase = getSupabase();
    let uid = contract.user_id;

    if (supabase) {
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id || '00000000-0000-0000-0000-000000000000';
      }

      const payload = {
        deposit_amount: 0,
        status: 'active' as const,
        ...contract,
        user_id: uid,
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert(payload)
        .select('*, property:properties(*), tenant:tenants(*)')
        .single();

      if (error) throw error;
      return data as Contract;
    }

    const items = getLocalContracts();
    const newContract: Contract = {
      deposit_amount: 0,
      status: 'active',
      ...contract,
      user_id: uid || 'local_user',
      id: 'ctr_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    items.unshift(newContract);
    saveLocalContracts(items);
    return newContract;
  },

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select('*, property:properties(*), tenant:tenants(*)')
        .single();

      if (error) throw error;
      return data as Contract;
    }

    const items = getLocalContracts();
    const idx = items.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Contrat non trouvé');
    const updated = { ...items[idx], ...updates };
    items[idx] = updated;
    saveLocalContracts(items);
    return updated;
  },

  async terminateContract(id: string): Promise<Contract> {
    return this.updateContract(id, { status: 'terminated' });
  },

  async deleteContract(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('contracts').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const items = getLocalContracts().filter(c => c.id !== id);
    saveLocalContracts(items);
  },
};
