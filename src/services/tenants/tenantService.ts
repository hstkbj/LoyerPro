import { getSupabase } from '../supabase/client';
import type { Tenant } from '../../types';

const STORAGE_KEY = 'loyerpro_data_tenants';

function getLocalTenants(): Tenant[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalTenants(items: Tenant[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const tenantService = {
  async getMyTenants(userId?: string): Promise<Tenant[]> {
    const supabase = getSupabase();
    if (supabase) {
      let uid = userId;
      if (!uid) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          uid = user?.id;
        } catch (e) {
          // ignore
        }
      }
      if (!uid) return [];

      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[tenantService] getMyTenants notice:', error.message);
          const items = getLocalTenants();
          return items.filter(t => t.user_id === uid);
        }
        return (data || []) as Tenant[];
      } catch (err: any) {
        console.warn('[tenantService] getMyTenants network notice:', err?.message);
        const items = getLocalTenants();
        return items.filter(t => t.user_id === uid);
      }
    }

    const items = getLocalTenants();
    return userId ? items.filter(t => t.user_id === userId) : items;
  },

  async getOwnerTenants(userId: string): Promise<Tenant[]> {
    return this.getMyTenants(userId);
  },

  async getTenantById(id: string): Promise<Tenant | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          const items = getLocalTenants();
          return items.find(t => t.id === id) || null;
        }
        return data as Tenant;
      } catch (err: any) {
        console.warn('[tenantService] getTenantById network notice:', err?.message);
        const items = getLocalTenants();
        return items.find(t => t.id === id) || null;
      }
    }

    const items = getLocalTenants();
    return items.find(t => t.id === id) || null;
  },

  async createTenant(tenant: Partial<Tenant> & { full_name: string; phone: string }): Promise<Tenant> {
    const supabase = getSupabase();
    let uid = tenant.user_id;

    if (supabase) {
      if (!uid) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          uid = user?.id;
        } catch (e) {
          // ignore
        }
        if (!uid) uid = '00000000-0000-0000-0000-000000000000';
      }

      const payload = {
        ...tenant,
        user_id: uid,
      };

      try {
        const { data, error } = await supabase
          .from('tenants')
          .insert(payload)
          .select()
          .single();

        if (!error && data) return data as Tenant;
        console.warn('[tenantService] createTenant notice:', error?.message);
      } catch (err: any) {
        console.warn('[tenantService] createTenant network notice:', err?.message);
      }
    }

    const items = getLocalTenants();
    const newTenant: Tenant = {
      ...tenant,
      user_id: uid || 'local_user',
      id: 'ten_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    items.unshift(newTenant);
    saveLocalTenants(items);
    return newTenant;
  },

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tenant;
    }

    const items = getLocalTenants();
    const idx = items.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Locataire non trouvé');
    const updated = { ...items[idx], ...updates };
    items[idx] = updated;
    saveLocalTenants(items);
    return updated;
  },

  async deleteTenant(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const items = getLocalTenants().filter(t => t.id !== id);
    saveLocalTenants(items);
  },
};
