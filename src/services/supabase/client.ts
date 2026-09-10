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
