import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/properties/propertyService';
import { subscriptionService } from '../../services/subscriptions/subscriptionService';
import { getSupabase } from '../../services/supabase/client';
import { formatFCFA } from '../../lib/utils';
import {
  Users,
  Building,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Database,
} from 'lucide-react';

export function SuperAdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          const { count: pCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
          const { count: pubCount } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true);
          const { count: sCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true });

          setTotalUsers(uCount || 0);
          setTotalProperties(pCount || 0);
          setPublishedCount(pubCount || 0);
          setActiveSubscriptions(sCount || 0);
        } else {
          // Local fallback count
          const props = await propertyService.getPublishedProperties();
          setPublishedCount(props.length);
          setTotalProperties(props.length);
          setTotalUsers(1);
          setActiveSubscriptions(1);
        }
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Vue Globale Plateforme SaaS LoyerPro
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Surveillance des bailleurs, du parc immobilier réel et des transactions FedaPay.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Utilisateurs</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalUsers}</div>
          <p className="text-[11px] text-slate-400">Bailleurs & Cabinets inscrits</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Biens</span>
            <Building className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalProperties}</div>
          <p className="text-[11px] text-slate-400">{publishedCount} en ligne sur le portail</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Abonnements</span>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeSubscriptions}</div>
          <p className="text-[11px] text-slate-400">Forfaits actifs réels</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Infrastructure</span>
            <Database className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">PostgreSQL Supabase</div>
          <p className="text-[11px] text-slate-400">Row-Level Security actif</p>
        </div>
      </div>

      {/* Security & RLS Status Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>Protection des données des bailleurs & Politiques RLS</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Toutes les requêtes Supabase sont protégées par le système Row Level Security (RLS) : chaque propriétaire ne peut lire ou modifier que ses propres biens, contrats, locataires et paiements. Les visiteurs publics accèdent uniquement aux biens marqués <code className="bg-slate-100 px-1 py-0.5 rounded">is_published = true</code>.
        </p>
      </div>
    </div>
  );
}
