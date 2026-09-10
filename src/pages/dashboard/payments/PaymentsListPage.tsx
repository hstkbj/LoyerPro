import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../../services/payments/paymentService';
import type { Payment } from '../../../types';
import { formatFCFA } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { QuittanceModal } from '../../../components/dashboard/QuittanceModal';
import {
  CreditCard,
  Plus,
  Search,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export function PaymentsListPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPaymentForQuittance, setSelectedPaymentForQuittance] = useState<Payment | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const list = await paymentService.getMyPayments();
      setPayments(list);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce règlement de loyer ?')) return;
    try {
      await paymentService.deletePayment(id);
      await loadPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
    }
  };

  const filtered = payments.filter((p) => {
    const s = search.toLowerCase();
    const tenantName = p.tenant?.full_name?.toLowerCase() || '';
    const propTitle = p.property?.title?.toLowerCase() || '';
    const ref = p.reference?.toLowerCase() || '';
    return tenantName.includes(s) || propTitle.includes(s) || ref.includes(s) || p.month.includes(s);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Encaissements & Paiements de Loyers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique des loyers perçus par Mobile Money, virement ou espèces avec quittances imprimables.
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/payments/create')}
          variant="primary"
          size="md"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Encaisser un loyer
        </Button>
      </div>

      {/* Search */}
      {payments.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par locataire, bien, mois, référence Mobile Money..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement de loyer enregistré"
          description="Enregistrez les règlements perçus (par MTN MoMo, Moov Money, virement ou espèces) pour générer automatiquement les quittances officielles de vos locataires."
          actionLabel="Encaisser un loyer"
          onAction={() => navigate('/dashboard/payments/create')}
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Aucun paiement ne correspond à "{search}".
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
                <th className="px-4 py-3">Méthode / Réf</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Quittance & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-slate-600 font-medium">
                    {payment.payment_date}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">
                      {payment.tenant?.full_name || 'Locataire'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {payment.property?.title || 'Bien'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {payment.month}
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">
                    {formatFCFA(payment.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    <div>{payment.payment_method}</div>
                    {payment.reference && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {payment.reference}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={payment.status === 'completed' ? 'success' : 'warning'}
                    >
                      {payment.status === 'completed' ? 'Payé' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPaymentForQuittance(payment)}
                      className="text-xs h-7 text-slate-700"
                      title="Générer quittance officielle"
                    >
                      <FileText className="mr-1 h-3 w-3 text-slate-500" />
                      Quittance
                    </Button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quittance Modal */}
      <QuittanceModal
        isOpen={Boolean(selectedPaymentForQuittance)}
        onClose={() => setSelectedPaymentForQuittance(null)}
        payment={selectedPaymentForQuittance}
      />
    </div>
  );
}
