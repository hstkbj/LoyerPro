import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { getSupabase, getSupabaseConfig, setCustomSupabaseConfig } from '../services/supabase/client';
import type { Profile, UserRole, VerificationDocument, VerificationStatus } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  role: UserRole;
  isSuperAdmin: boolean;
  isAgency: boolean;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  loading: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    agencyName?: string;
    country?: string;
    city?: string;
    verificationDocuments?: VerificationDocument[];
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  submitVerificationDocuments: (documents: VerificationDocument[]) => Promise<{ error?: string }>;
  adminVerifyUser: (userId: string, status: VerificationStatus, reason?: string) => Promise<{ error?: string }>;
  configureSupabase: (url: string, key: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Check Supabase configuration and initial session
  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      const config = getSupabaseConfig();
      setIsSupabaseConfigured(config.isConfigured);

      const supabase = getSupabase();

      if (supabase && config.isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            // Fetch profile
            const { data: prof, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (prof && !error) {
              setProfile(prof as Profile);
            } else {
              // fallback profile from metadata
              const newProf: Profile = {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
                phone: session.user.user_metadata?.phone || '',
                role: (session.user.user_metadata?.role as UserRole) || 'owner',
                agency_name: session.user.user_metadata?.agency_name,
                city: session.user.user_metadata?.city || 'Cotonou',
              };
              setProfile(newProf);
            }
          } else {
            setUser(null);
            setProfile(null);
          }

          // Listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              setUser({ id: session.user.id, email: session.user.email || '' });
              const { data: prof } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              if (prof) setProfile(prof as Profile);
            } else {
              setUser(null);
              setProfile(null);
            }
          });

          setLoading(false);
          return () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Supabase Auth init error:', err);
          setLoading(false);
        }
      } else {
        // Fallback local session for development / first launch before Supabase connection
        const localUserStr = localStorage.getItem('loyerpro_local_user');
        const localProfStr = localStorage.getItem('loyerpro_local_profile');
        if (localUserStr && localProfStr) {
          try {
            setUser(JSON.parse(localUserStr));
            setProfile(JSON.parse(localProfStr));
          } catch {
            localStorage.removeItem('loyerpro_local_user');
            localStorage.removeItem('loyerpro_local_profile');
          }
        }
        setLoading(false);
      }
    }

    initAuth();
  }, [isSupabaseConfigured]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (prof) setProfile(prof as Profile);
      }
      return {};
    } else {
      // Local auth storage
      const usersStr = localStorage.getItem('loyerpro_registered_users') || '[]';
      const users = JSON.parse(usersStr) as Array<{ id: string; email: string; password: string; profile: Profile }>;
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) {
        return { error: "Email ou mot de passe incorrect (ou compte non trouvé)." };
      }
      const u = { id: found.id, email: found.email };
      setUser(u);
      setProfile(found.profile);
      localStorage.setItem('loyerpro_local_user', JSON.stringify(u));
      localStorage.setItem('loyerpro_local_profile', JSON.stringify(found.profile));
      return {};
    }
  };

  const signUp = async (params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    agencyName?: string;
    country?: string;
    city?: string;
    verificationDocuments?: VerificationDocument[];
  }): Promise<{ error?: string }> => {
    const status: VerificationStatus = params.verificationDocuments && params.verificationDocuments.length > 0 
      ? 'pending' 
      : 'unverified';

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            phone: params.phone,
            role: params.role,
            agency_name: params.agencyName || null,
            country: params.country || 'Côte d’Ivoire',
            city: params.city || 'Abidjan',
            verification_status: status,
          },
        },
      });
      if (error) return { error: error.message };
      if (data.user) {
        const newProf: Profile = {
          id: data.user.id,
          email: params.email,
          full_name: params.fullName,
          phone: params.phone,
          role: params.role,
          agency_name: params.agencyName,
          country: params.country || "Côte d'Ivoire",
          city: params.city || 'Abidjan',
          verification_status: status,
          verification_documents: params.verificationDocuments || [],
        };
        // Ensure profile row exists
        await supabase.from('profiles').upsert(newProf);
        setUser({ id: data.user.id, email: params.email });
        setProfile(newProf);
      }
      return {};
    } else {
      // Local fallback
      const usersStr = localStorage.getItem('loyerpro_registered_users') || '[]';
      const users = JSON.parse(usersStr) as Array<{ id: string; email: string; password: string; profile: Profile }>;
      if (users.some(u => u.email.toLowerCase() === params.email.toLowerCase())) {
        return { error: "Un compte avec cette adresse email existe déjà." };
      }
      const newId = 'user_' + Math.random().toString(36).substring(2, 9);
      const newProf: Profile = {
        id: newId,
        email: params.email,
        full_name: params.fullName,
        phone: params.phone,
        role: params.role,
        agency_name: params.agencyName,
        country: params.country || "Côte d'Ivoire",
        city: params.city || 'Abidjan',
        verification_status: status,
        verification_documents: params.verificationDocuments || [],
      };
      users.push({ id: newId, email: params.email, password: params.password, profile: newProf });
      localStorage.setItem('loyerpro_registered_users', JSON.stringify(users));

      const u = { id: newId, email: params.email };
      setUser(u);
      setProfile(newProf);
      localStorage.setItem('loyerpro_local_user', JSON.stringify(u));
      localStorage.setItem('loyerpro_local_profile', JSON.stringify(newProf));
      return {};
    }
  };

  const submitVerificationDocuments = async (documents: VerificationDocument[]): Promise<{ error?: string }> => {
    if (!profile) return { error: 'Non connecté' };
    const currentDocs = profile.verification_documents || [];
    const updatedDocs = [...currentDocs, ...documents];
    const updates: Partial<Profile> = {
      verification_documents: updatedDocs,
      verification_status: 'pending',
    };
    return updateProfile(updates);
  };

  const adminVerifyUser = async (userId: string, status: VerificationStatus, reason?: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    const verifiedAt = status === 'verified' ? new Date().toISOString() : undefined;

    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: status,
          verified_at: verifiedAt,
          rejection_reason: reason || null,
        })
        .eq('id', userId);
      if (error) return { error: error.message };
    }

    // Update local users list if present
    const usersStr = localStorage.getItem('loyerpro_registered_users');
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr) as Array<{ id: string; email: string; password: string; profile: Profile }>;
        const idx = users.findIndex(u => u.id === userId || u.profile.id === userId);
        if (idx !== -1) {
          users[idx].profile.verification_status = status;
          if (verifiedAt) users[idx].profile.verified_at = verifiedAt;
          if (reason) users[idx].profile.rejection_reason = reason;
          localStorage.setItem('loyerpro_registered_users', JSON.stringify(users));
        }
      } catch (e) {
        console.error('Error updating local registered users:', e);
      }
    }

    if (profile && profile.id === userId) {
      const updated: Profile = {
        ...profile,
        verification_status: status,
        verified_at: verifiedAt,
        rejection_reason: reason,
      };
      setProfile(updated);
      localStorage.setItem('loyerpro_local_profile', JSON.stringify(updated));
    }

    return {};
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('loyerpro_local_user');
    localStorage.removeItem('loyerpro_local_profile');
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error?: string }> => {
    if (!profile) return { error: "Non connecté" };
    const updated = { ...profile, ...updates };
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
      if (error) return { error: error.message };
    } else {
      localStorage.setItem('loyerpro_local_profile', JSON.stringify(updated));
    }
    setProfile(updated);
    return {};
  };

  const configureSupabase = (url: string, key: string) => {
    setCustomSupabaseConfig(url, key);
    const config = getSupabaseConfig();
    setIsSupabaseConfigured(config.isConfigured);
  };

  const role: UserRole = profile?.role || 'owner';
  const isSuperAdmin = role === 'superadmin';
  const isAgency = role === 'agency';
  const verificationStatus: VerificationStatus = profile?.verification_status || 'unverified';
  const isVerified = verificationStatus === 'verified';

  const value = useMemo(() => ({
    user,
    profile,
    role,
    isSuperAdmin,
    isAgency,
    isVerified,
    verificationStatus,
    loading,
    isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    updateProfile,
    submitVerificationDocuments,
    adminVerifyUser,
    configureSupabase,
  }), [user, profile, role, isSuperAdmin, isAgency, isVerified, verificationStatus, loading, isSupabaseConfigured]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
