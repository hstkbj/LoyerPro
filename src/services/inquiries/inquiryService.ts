import { getSupabase } from '../supabase/client';
import { emailService } from '../email/emailService';
import type { Inquiry } from '../../types';

const STORAGE_KEY = 'loyerpro_data_inquiries';

function getLocalInquiries(): Inquiry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalInquiries(items: Inquiry[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export const inquiryService = {
  // Public question submission
  async submitInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status'>): Promise<Inquiry> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({ ...inquiry, status: 'new' })
        .select('*, property:properties(*)')
        .single();

      if (error) throw error;

      // Notifie le propriétaire/l'agence par email - non bloquant
      supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', inquiry.owner_id)
        .single()
        .then(
          ({ data: owner }) => {
            if (owner?.email) {
              emailService.sendNewInquiry(owner.email, {
                ownerName: owner.full_name,
                propertyTitle: (data as any)?.property?.title || 'votre bien',
                visitorName: inquiry.visitor_name,
                visitorPhone: inquiry.visitor_phone,
                message: inquiry.message,
              }).catch(() => {});
            }
          },
          () => {}
        );

      return data as Inquiry;
    }

    const items = getLocalInquiries();
    const newInquiry: Inquiry = {
      ...inquiry,
      id: 'inq_' + Math.random().toString(36).substring(2, 9),
      status: 'new',
      is_replied: false,
      created_at: new Date().toISOString(),
    };
    items.unshift(newInquiry);
    saveLocalInquiries(items);
    return newInquiry;
  },

  async getMyInquiries(ownerId?: string): Promise<Inquiry[]> {
    const supabase = getSupabase();
    if (supabase) {
      let oid = ownerId;
      if (!oid) {
        const { data: { user } } = await supabase.auth.getUser();
        oid = user?.id;
      }
      if (!oid) return [];

      const { data, error } = await supabase
        .from('inquiries')
        .select('*, property:properties(*)')
        .eq('owner_id', oid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Inquiry[];
    }

    const items = getLocalInquiries();
    return ownerId ? items.filter(i => i.owner_id === ownerId) : items;
  },

  // Owner views inquiries
  async getOwnerInquiries(ownerId: string): Promise<Inquiry[]> {
    return this.getMyInquiries(ownerId);
  },

  // Update status: boolean (replied or not) or 'new' | 'in_progress' | 'resolved'
  async updateInquiryStatus(id: string, statusOrReplied: boolean | string): Promise<Inquiry> {
    const isReplied = typeof statusOrReplied === 'boolean' ? statusOrReplied : statusOrReplied === 'resolved';
    const statusVal = typeof statusOrReplied === 'string' ? statusOrReplied : isReplied ? 'resolved' : 'new';

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .update({ status: statusVal })
        .eq('id', id)
        .select('*, property:properties(*)')
        .single();

      if (error) throw error;
      return { ...(data as Inquiry), is_replied: isReplied };
    }

    const items = getLocalInquiries();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Demande non trouvée');
    const updated: Inquiry = {
      ...items[idx],
      status: statusVal as any,
      is_replied: isReplied,
    };
    items[idx] = updated;
    saveLocalInquiries(items);
    return updated;
  },
};
