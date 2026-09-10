import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../services/supabase/client';
import { formatFCFA } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { DollarSign } from 'lucide-react';

export function SuperAdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data } = await supabase.from('payments').select('*, property:properties(title), tenant:tenants(full_name)').order('created_at', { ascending: false });
          if (data) setPayments(data);
        }
      } catch (err) {
        console.error('Error loading payments:', err);
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
          Transactions & Flux Financiers
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Journal global des loyers enregistrés et transactions Mobile Money.
        </p>
      </div>

      {loading ? (
        <div className="h-48 rounded-xl bg-slate-200 animate-pulse" />
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Aucun paiement dans la base de données.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Locataire & Bien</th>
                <th className="px-4 py-3">Mois</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Méthode & Réf</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-slate-600">{p.payment_date}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div>{p.tenant?.full_name || 'Locataire'}</div>
                    <div className="text-[10px] text-slate-400">{p.property?.title}</div>
                  </td>
                  <td className="px-4 py-3">{p.month}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatFCFA(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{p.payment_method}</div>
                    {p.reference && <div className="text-[10px] text-slate-400 font-mono">{p.reference}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>
                      {p.status === 'completed' ? 'Payé' : p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
