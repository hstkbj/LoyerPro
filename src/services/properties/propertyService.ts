import { getSupabase } from '../supabase/client';
import type { Property } from '../../types';

const STORAGE_KEY = 'loyerpro_data_properties';

/**
 * IMPORTANT : il n'y a plus de "biens fictifs" pré-remplis ici. Tant que
 * Supabase n'est pas configuré, cette liste locale démarre VIDE : elle ne
 * sert que de secours pur (mode démo hors-ligne, avant configuration de la
 * base). Dès que Supabase est configuré, ce fichier ne l'utilise plus JAMAIS
 * — ni en cas d'erreur, ni en cas de résultat vide — pour ne plus jamais
 * afficher de fausses annonces à la place des vraies données.
 */
function getLocalProperties(): Property[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalProperties(items: Property[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

/**
 * La base de données n'a QUE la colonne `published` (booléen). Le
 * formulaire front (PropertyFormPage) envoie en revanche un champ
 * `is_published`, qui n'existe pas dans la table `properties`. Envoyé tel
 * quel à Supabase/PostgREST, ce champ inconnu fait échouer l'insertion ou
 * la mise à jour ("Could not find the 'is_published' column..."), ce qui
 * était la cause du bug "le bien créé n'apparaît pas dans la base".
 * On neutralise ça ici, une fois pour toutes, avant tout insert/update.
 */
function toDbRow(property: Record<string, any>): Record<string, any> {
  const { is_published, ...rest } = property;
  const published = property.published ?? is_published ?? true;
  return { ...rest, published };
}

function applyClientFilters(items: Property[], filters?: {
  country?: string;
  city?: string;
  type?: string;
  roomCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  search?: string;
  chargesIncludedOnly?: boolean;
  verifiedOnly?: boolean;
}): Property[] {
  let results = items;
  if (!filters) return results;

  if (filters.country && filters.country !== 'International (Tous pays)' && filters.country !== 'GLOBAL') {
    results = results.filter(p => p.country?.toLowerCase() === filters.country!.toLowerCase());
  }
  if (filters.city && filters.city !== 'Toutes les villes') {
    results = results.filter(p => p.city?.toLowerCase() === filters.city!.toLowerCase());
  }
  if (filters.type) {
    results = results.filter(p => p.type?.toLowerCase() === filters.type!.toLowerCase());
  }
  if (filters.roomCategory) {
    results = results.filter(p => p.room_category === filters.roomCategory);
  }
  if (filters.chargesIncludedOnly) {
    results = results.filter(p => p.charges_included);
  }
  if (filters.verifiedOnly) {
    results = results.filter(p => p.owner_verified || p.owner?.is_verified);
  }
  if (filters.minPrice) {
    results = results.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice) {
    results = results.filter(p => p.price <= filters.maxPrice!);
  }
  if (filters.bedrooms) {
    results = results.filter(p => p.bedrooms >= filters.bedrooms!);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(
      p =>
        p.title.toLowerCase().includes(s) ||
        (p.city && p.city.toLowerCase().includes(s)) ||
        (p.neighborhood && p.neighborhood.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s)) ||
        (p.address && p.address.toLowerCase().includes(s))
    );
  }
  return results;
}

export const propertyService = {
  // Liste publique des biens publiés (portail public / recherche)
  async getPublishedProperties(filters?: Parameters<typeof applyClientFilters>[1]): Promise<Property[]> {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase
        .from('properties')
        .select('*, profiles:user_id(full_name, agency_name, phone, role, verification_status)')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (filters?.country && filters.country !== 'International (Tous pays)' && filters.country !== 'GLOBAL') {
        query = query.eq('country', filters.country);
      }
      if (filters?.city && filters.city !== 'Toutes les villes') {
        query = query.eq('city', filters.city);
      }
      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.minPrice) query = query.gte('price', filters.minPrice);
      if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters?.bedrooms) query = query.gte('bedrooms', filters.bedrooms);

      const { data, error } = await query;
      if (error) {
        // On ne bascule JAMAIS sur des données fictives : en cas d'erreur,
        // on journalise et on retourne une liste vide, ce qui est honnête.
        console.error('[propertyService] getPublishedProperties error:', error.message);
        return [];
      }

      let results = (data || []) as Property[];
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        results = results.filter(
          p =>
            p.title.toLowerCase().includes(s) ||
            (p.city && p.city.toLowerCase().includes(s)) ||
            (p.neighborhood && p.neighborhood.toLowerCase().includes(s)) ||
            (p.description && p.description.toLowerCase().includes(s))
        );
      }
      return results; // même si vide : c'est la réalité de la base.
    }

    // Supabase non configuré : mode démo hors-ligne uniquement (liste vide par défaut).
    const items = getLocalProperties().filter(p => p.published);
    return applyClientFilters(items, filters);
  },

  async getPropertyBySlug(slugOrId: string): Promise<Property | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles:user_id(full_name, agency_name, phone, role, verification_status)')
        .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
        .maybeSingle();

      if (error) {
        console.error('[propertyService] getPropertyBySlug error:', error.message);
        return null;
      }
      return (data as Property) || null;
    }

    const items = getLocalProperties();
    return items.find(p => p.slug === slugOrId || p.id === slugOrId) || null;
  },

  async getPropertyById(id: string): Promise<Property | null> {
    return this.getPropertyBySlug(id);
  },

  // Biens du propriétaire connecté
  async getMyProperties(userId?: string): Promise<Property[]> {
    const supabase = getSupabase();
    if (supabase) {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }
      if (!uid) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[propertyService] getMyProperties error:', error.message);
        throw error; // ici on remonte l'erreur : le propriétaire doit savoir que ça a échoué.
      }
      return (data || []) as Property[];
    }

    const items = getLocalProperties();
    return userId ? items.filter(p => p.user_id === userId) : items;
  },

  async getOwnerProperties(userId: string): Promise<Property[]> {
    return this.getMyProperties(userId);
  },

  // SuperAdmin : tous les biens
  async getAllProperties(): Promise<Property[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles:user_id(full_name, agency_name, phone, role)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[propertyService] getAllProperties error:', error.message);
        throw error;
      }
      return (data || []) as Property[];
    }
    return getLocalProperties();
  },

  // Création d'un bien
  async createProperty(property: Partial<Property> & { title: string; price: number; city: string }): Promise<Property> {
    const supabase = getSupabase();

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = property.user_id || user?.id;
      if (!uid) throw new Error('Utilisateur non authentifié : impossible de créer le bien.');

      const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

      const payload = toDbRow({
        type: 'Chambre seule',
        bedrooms: 1,
        bathrooms: 1,
        surface: 20,
        amenities: [],
        photos: [],
        status: 'available',
        ...property,
        slug,
        user_id: uid,
      });

      const { data, error } = await supabase
        .from('properties')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('[propertyService] createProperty error:', error.message);
        // On NE sauvegarde PLUS jamais silencieusement en local en cas
        // d'échec : l'utilisateur doit voir l'erreur réelle (limite de
        // plan atteinte, colonne invalide, session expirée, etc.)
        throw new Error(
          error.message?.includes('Limite de votre plan')
            ? error.message
            : `Échec de l'enregistrement du bien en base de données : ${error.message}`
        );
      }
      return data as Property;
    }

    // Supabase non configuré : mode démo hors-ligne uniquement.
    const items = getLocalProperties();
    const { is_published, ...rest } = property as any;
    const isPub = property.published ?? is_published ?? true;
    const newProperty: Property = {
      type: 'Chambre seule',
      bedrooms: 1,
      bathrooms: 1,
      surface: 20,
      amenities: [],
      photos: property.photos && property.photos.length > 0 ? property.photos : [],
      status: 'available',
      ...rest,
      published: isPub,
      slug: property.slug || property.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
      user_id: property.user_id || 'local_user',
      id: 'prop_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.unshift(newProperty);
    saveLocalProperties(items);
    return newProperty;
  },

  // Mise à jour d'un bien
  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const supabase = getSupabase();
    if (supabase) {
      const payload = toDbRow({ ...updates, updated_at: new Date().toISOString() });

      const { data, error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[propertyService] updateProperty error:', error.message);
        throw new Error(`Échec de la mise à jour du bien : ${error.message}`);
      }
      return data as Property;
    }

    const items = getLocalProperties();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Bien non trouvé');

    const { is_published, ...rest } = updates as any;
    const updated = {
      ...items[idx],
      ...rest,
      published: updates.published ?? is_published ?? items[idx].published,
      updated_at: new Date().toISOString(),
    };
    items[idx] = updated;
    saveLocalProperties(items);
    return updated;
  },

  // Suppression d'un bien
  async deleteProperty(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
        console.error('[propertyService] deleteProperty error:', error.message);
        throw new Error(`Échec de la suppression du bien : ${error.message}`);
      }
      return;
    }

    const items = getLocalProperties().filter(p => p.id !== id);
    saveLocalProperties(items);
  },

  // Basculer la publication
  async togglePublish(id: string, currentPublished: boolean): Promise<Property> {
    return this.updateProperty(id, { published: !currentPublished });
  },
};
