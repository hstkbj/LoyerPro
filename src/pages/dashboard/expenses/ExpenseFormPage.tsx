import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../../../services/expenses/expenseService';
import { propertyService } from '../../../services/properties/propertyService';
import type { Property, ExpenseCategory } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'Travaux & Réparations',
  'Électricité & Eau',
  'Impôts & Foncier',
  'Frais d\'agence',
  'Entretien courant',
  'Autre',
];

export function ExpenseFormPage() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [propertyId, setPropertyId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Travaux & Réparations');
  const [description, setDescription] = useState('');
  const [providerName, setProviderName] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadProperties() {
      try {
        const list = await propertyService.getMyProperties();
        setProperties(list);
        if (list.length > 0) {
          setPropertyId(list[0].id);
        }
      } catch (err) {
        console.error('Error loading properties:', err);
      } finally {
        setFetching(false);
      }
    }
    loadProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !amount || !description.trim()) {
      setError('Veuillez sélectionner un bien, un montant et une description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await expenseService.createExpense({
        property_id: propertyId,
        amount: Number(amount),
        category,
        description: description.trim(),
        provider_name: providerName.trim() || undefined,
        expense_date: expenseDate,
      });

      navigate('/dashboard/expenses');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la dépense.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-xs text-slate-500">
        Chargement des biens...
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-900">Aucun bien enregistré</h2>
        <p className="text-xs text-slate-500">
          Ajoutez un bien avant de pouvoir lui imputer une dépense ou facture de travaux.
        </p>
        <Button onClick={() => navigate('/dashboard/properties/create')} variant="primary">
          Ajouter un bien
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/expenses')}
          className="p-1 text-slate-400 hover:text-slate-900 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Enregistrer une Dépense
          </h1>
          <p className="text-xs text-slate-500">
            Consignez les frais liés à l'entretien de vos biens.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Bien concerné <span className="text-rose-500">*</span>
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Input
              label="Montant de la dépense (FCFA)"
              type="number"
              required
              placeholder="ex. 35000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Catégorie de dépense
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date de la dépense"
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
            <Input
              label="Prestataire / Fournisseur / Artisan"
              placeholder="ex. Plombier Mensah, Quincaillerie Le Progrès"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description de la dépense <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="ex. Remplacement du robinet de la cuisine et vidange du siphon suite à fuite..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard/expenses')}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            Enregistrer la dépense
          </Button>
        </div>
      </form>
    </div>
  );
}
