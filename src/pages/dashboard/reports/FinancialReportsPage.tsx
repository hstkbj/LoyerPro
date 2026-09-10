import React, { useState, useEffect } from 'react';
import { paymentService } from '../../../services/payments/paymentService';
import { expenseService } from '../../../services/expenses/expenseService';
import { contractService } from '../../../services/contracts/contractService';
import type { Payment, Expense, Contract } from '../../../types';
import { formatFCFA } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
} from 'lucide-react';

export function FinancialReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, e, c] = await Promise.all([
          paymentService.getMyPayments(),
          expenseService.getMyExpenses(),
          contractService.getMyContracts(),
        ]);
        setPayments(p);
        setExpenses(e);
        setContracts(c);
      } catch (err) {
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics
  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  // Expected annual rent from active contracts
  const activeContracts = contracts.filter((c) => c.status === 'active');
  const monthlyExpected = activeContracts.reduce((sum, c) => sum + Number(c.rent_amount || 0), 0);

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const handleExportCSV = () => {
    const rows = [
      ['Type', 'Date', 'Description / Bien', 'Mois / Categorie', 'Montant (FCFA)'],
      ...payments.map((p) => [
        'Paiement Loyer',
        p.payment_date,
        `Bien: ${p.property?.title || ''} (Locataire: ${p.tenant?.full_name || ''})`,
        p.month,
        String(p.amount),
      ]),
      ...expenses.map((e) => [
        'Depense',
        e.expense_date,
        e.description,
        e.category,
        `-${e.amount}`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bilan_financier_loyerpro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Rapports & Bilan Financier
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rendement locatif net réel calculé à partir de vos encaissements et charges réelles.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          disabled={payments.length === 0 && expenses.length === 0}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Exporter en CSV
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenues */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Loyers Encaissés
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatFCFA(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            {payments.filter((p) => p.status === 'completed').length} quittance(s) validée(s)
          </p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Charges & Travaux
            </span>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatFCFA(totalExpenses)}
          </div>
          <p className="text-[11px] text-slate-400">
            {expenses.length} facture(s) consignée(s)
          </p>
        </div>

        {/* Net Income */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Revenu Net Réel
            </span>
            <DollarSign className="h-4 w-4 text-slate-900" />
          </div>
          <div className={`text-2xl font-extrabold ${netIncome >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {formatFCFA(netIncome)}
          </div>
          <p className="text-[11px] text-slate-400">
            Résultat net d'exploitation
          </p>
        </div>
      </div>

      {/* Category breakdown and details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expenses by Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Répartition des dépenses par catégorie
          </h2>

          {Object.keys(expensesByCategory).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aucune dépense enregistrée pour le moment.
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(expensesByCategory).map(([cat, rawAmt]) => {
                const amt = Number(rawAmt) || 0;
                const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>{cat}</span>
                      <span className="font-bold text-slate-900">{formatFCFA(amt)} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Portefeuille Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Capacité d'encaissement du portefeuille
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Loyers mensuels attendus (baux actifs)</span>
              <span className="font-bold text-slate-900">{formatFCFA(monthlyExpected)} / mois</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Projection annuelle brute</span>
              <span className="font-bold text-slate-900">{formatFCFA(monthlyExpected * 12)} / an</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Ratio de dépenses (Charges / Revenus)</span>
              <span className="font-bold text-slate-900">
                {totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
