import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../../services/payments/paymentService';
import { contractService } from '../../../services/contracts/contractService';
import type { Contract, PaymentMethod } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function PaymentFormPage() {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Form
  const [contractId, setContractId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN Mobile Money');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending' | 'late'>('completed');

  useEffect(() => {
    async function loadContracts() {
      try {
        const list = await contractService.getMyContracts();
        const active = list.filter((c) => c.status === 'active');
        setContracts(active);
        if (active.length > 0) {
          setContractId(active[0].id);
          setAmount(String(active[0].rent_amount));
        }
      } catch (err) {
        console.error('Error loading contracts:', err);
      } finally {
        setFetching(false);
      }
    }
    loadContracts();
  }, []);

  const handleContractChange = (newId: string) => {
    setContractId(newId);
    const selected = contracts.find((c) => c.id === newId);
    if (selected) {
      setAmount(String(selected.rent_amount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !amount || !paymentDate || !month) {
      setError('Veuillez renseigner le contrat, le montant, la date et le mois.');
      return;
    }

    const selectedContract = contracts.find((c) => c.id === contractId);
    if (!selectedContract) return;

    setLoading(true);
    setError('');

    try {
      await paymentService.createPayment({
        contract_id: contractId,
        property_id: selectedContract.property_id,
        tenant_id: selectedContract.tenant_id,
        amount: Number(amount),
        payment_date: paymentDate,
        month,
        payment_method: paymentMethod,
        reference: reference.trim() || undefined,
        status,
      });

      navigate('/dashboard/payments');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du loyer.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-xs text-slate-500">
        Chargement des contrats actifs...
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-900">Aucun contrat actif</h2>
        <p className="text-xs text-slate-500">
          Pour enregistrer un encaissement de loyer, vous devez au préalable avoir un contrat de bail actif liant un bien à un locataire.
        </p>
        <Button onClick={() => navigate('/dashboard/contracts/create')} variant="primary">
          Créer un contrat de bail
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/payments')}
          className="p-1 text-slate-400 hover:text-slate-900 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Encaisser un Loyer
          </h1>
          <p className="text-xs text-slate-500">
            Enregistrez le règlement d'un locataire et éditez automatiquement sa quittance.
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
              Contrat / Bien & Locataire <span className="text-rose-500">*</span>
            </label>
            <select
              value={contractId}
              onChange={(e) => handleContractChange(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.property?.title} — Locataire: {c.tenant?.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Input
              label="Montant encaissé (FCFA)"
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Mois concerné <span className="text-rose-500">*</span>
              </label>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date d'encaissement"
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Mode de paiement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Moov Money">Moov Money</option>
                <option value="Espèces">Espèces</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
          </div>

          <Input
            label="Référence de transaction / N° Reçu"
            placeholder="ex. ID Transaction MoMo 839201948 ou N° chèque"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            helperText="Recommandé pour la traçabilité en cas de contestation"
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Statut du paiement
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-800">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                />
                <span>Encaissé / Confirmé</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-800">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                />
                <span>En attente de virement / chèque</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard/payments')}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            Valider le paiement & Émettre la quittance
          </Button>
        </div>
      </form>
    </div>
  );
}
