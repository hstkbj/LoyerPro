import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../../../services/expenses/expenseService';
import type { Expense } from '../../../types';
import { formatFCFA } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Receipt, Plus, Trash2, Building, Wrench } from 'lucide-react';

export function ExpensesListPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const list = await expenseService.getMyExpenses();
      setExpenses(list);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    try {
      await expenseService.deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dépenses & Travaux d'Entretien
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des charges déductibles, plomberie, électricité, réparations et impôts fonciers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {expenses.length > 0 && (
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Dépensé</span>
              <span className="text-base font-extrabold text-slate-900">{formatFCFA(totalExpenses)}</span>
            </div>
          )}
          <Button
            onClick={() => navigate('/dashboard/expenses/create')}
            variant="primary"
            size="md"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nouvelle dépense
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Vous n'avez encore enregistré aucune dépense"
          description="Consignez les réparations, factures d'entretien et charges pour connaître le rendement net réel de votre patrimoine immobilier."
          actionLabel="Enregistrer une dépense"
          onAction={() => navigate('/dashboard/expenses/create')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Bien concerné</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Description / Prestataire</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {expense.expense_date}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {expense.property?.title || 'Bien général'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      <Wrench className="h-3 w-3 text-slate-400" />
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{expense.description}</p>
                    {expense.provider_name && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Prestataire : {expense.provider_name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {formatFCFA(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
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
    </div>
  );
}
