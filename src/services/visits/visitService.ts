import { getSupabase } from '../supabase/client';
import type { VisitRequest, VisitStatus } from '../../types';

const STORAGE_KEY = 'loyerpro_data_visits';

function getLocalVisits(): VisitRequest[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalVisits(items: VisitRequest[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const visitService = {
  // Public user submits a request for a property
  async requestVisit(visit: Omit<VisitRequest, 'id' | 'created_at' | 'status'>): Promise<VisitRequest> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('visits')
        .insert({ ...visit, status: 'pending' })
        .select('*, property:properties(*)')
        .single();

      if (error) throw error;
      return data as VisitRequest;
    }

    const items = getLocalVisits();
    const newVisit: VisitRequest = {
      ...visit,
      id: 'vis_' + Math.random().toString(36).substring(2, 9),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    items.unshift(newVisit);
    saveLocalVisits(items);
    return newVisit;
  },

  async getMyVisitRequests(ownerId?: string): Promise<VisitRequest[]> {
    const supabase = getSupabase();
    if (supabase) {
      let oid = ownerId;
      if (!oid) {
        const { data: { user } } = await supabase.auth.getUser();
        oid = user?.id;
      }
      if (!oid) return [];

      const { data, error } = await supabase
        .from('visits')
        .select('*, property:properties(*)')
        .eq('owner_id', oid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as VisitRequest[];
    }

    const items = getLocalVisits();
    return ownerId ? items.filter(v => v.owner_id === ownerId) : items;
  },

  // Owner views their visits
  async getOwnerVisits(ownerId: string): Promise<VisitRequest[]> {
    return this.getMyVisitRequests(ownerId);
  },

  // SuperAdmin gets all visits
  async getAllVisits(): Promise<VisitRequest[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('visits')
        .select('*, property:properties(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as VisitRequest[];
    }
    return getLocalVisits();
  },

  // Owner responds: accept, reject, reschedule, confirmed, completed, cancelled
  async updateVisitStatus(
    id: string, 
    status: VisitStatus | string, 
    counterProposal?: string
  ): Promise<VisitRequest> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('visits')
        .update({ status, counter_proposal: counterProposal || null })
        .eq('id', id)
        .select('*, property:properties(*)')
        .single();

      if (error) throw error;
      return data as VisitRequest;
    }

    const items = getLocalVisits();
    const idx = items.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Demande de visite non trouvée');
    const updated: VisitRequest = {
      ...items[idx],
      status: status as VisitStatus,
      counter_proposal: counterProposal || items[idx].counter_proposal,
    };
    items[idx] = updated;
    saveLocalVisits(items);
    return updated;
  },
};
