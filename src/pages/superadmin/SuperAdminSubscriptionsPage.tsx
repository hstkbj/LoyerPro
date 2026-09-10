import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../services/supabase/client';
import { DEFAULT_PLANS } from '../../services/subscriptions/subscriptionService';
import { formatFCFA } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';

export function SuperAdminSubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data } = await supabase.from('subscriptions').select('*, user:profiles(full_name, email), plan:subscription_plans(name, price)').order('created_at', { ascending: false });
          if (data) setSubs(data);
        }
      } catch (err) {
        console.error('Error loading subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Abonnements & Forfaits Souscrits
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Suivi des forfaits souscrits par les propriétaires et cabinets.
        </p>
      </div>

      {loading ? (
        <div className="h-48 rounded-xl bg-slate-200 animate-pulse" />
      ) : subs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Aucun abonnement enregistré dans la base Supabase.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Forfait</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date de début</th>
                <th className="px-4 py-3">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div>{s.user?.full_name || 'Utilisateur'}</div>
                    <div className="text-[10px] text-slate-400">{s.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {s.plan?.name || s.plan_id}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === 'active' ? 'success' : 'warning'}>
                      {s.status === 'active' ? 'Actif' : s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.current_period_start || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.current_period_end || 'Indéterminée'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
