import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve keys from environment or localStorage for user convenience
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('loyerpro_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('loyerpro_supabase_key') || '' : '';

  const url = (storedUrl || envUrl).trim();
  const anonKey = (storedKey || envKey).trim();

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') && 
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

export function setCustomSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('loyerpro_supabase_url', url.trim());
    localStorage.setItem('loyerpro_supabase_key', key.trim());
    supabaseInstance = null; // reset client
  }
}

export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('loyerpro_supabase_url');
    localStorage.removeItem('loyerpro_supabase_key');
    supabaseInstance = null;
  }
}

export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
  url?: string;
}> {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      connected: false,
      error: 'Supabase n\'est pas encore configuré (URL ou clé manquante).',
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${url}/rest/v1/?apikey=${anonKey}`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok || res.status === 200 || res.status === 401 || res.status === 404) {
      return {
        connected: true,
        latencyMs: Date.now() - start,
        url,
      };
    }
    return {
      connected: false,
      error: `Réponse HTTP ${res.status}: ${res.statusText}`,
      url,
    };
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    return {
      connected: false,
      error: isTimeout
        ? 'Délai d\'attente dépassé (4s) : le serveur Supabase ne répond pas.'
        : `Serveur introuvable ou injoignable (${err?.message || 'Erreur réseau/DNS'}).`,
      url,
    };
  }
}

