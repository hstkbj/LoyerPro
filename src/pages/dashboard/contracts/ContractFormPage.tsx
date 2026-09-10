import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../../../services/contracts/contractService';
import { propertyService } from '../../../services/properties/propertyService';
import { tenantService } from '../../../services/tenants/tenantService';
import type { Property, Tenant } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function ContractFormPage() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Form fields
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [terms, setTerms] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [props, tens] = await Promise.all([
          propertyService.getMyProperties(),
          tenantService.getMyTenants(),
        ]);
        setProperties(props);
        setTenants(tens);

        if (props.length > 0) {
          setPropertyId(props[0].id);
          setRentAmount(String(props[0].price));
          setDepositAmount(String(props[0].price * 3)); // 3 months caution standard
        }
        if (tens.length > 0) {
          setTenantId(tens[0].id);
        }
      } catch (err) {
        console.error('Error loading options:', err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const handlePropertyChange = (newPropId: string) => {
    setPropertyId(newPropId);
    const selected = properties.find((p) => p.id === newPropId);
    if (selected) {
      setRentAmount(String(selected.price));
      setDepositAmount(String(selected.price * 3));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !tenantId || !startDate || !rentAmount) {
      setError('Veuillez sélectionner un bien, un locataire, une date de prise d\'effet et le loyer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await contractService.createContract({
        property_id: propertyId,
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate || undefined,
        rent_amount: Number(rentAmount),
        deposit_amount: Number(depositAmount) || 0,
        payment_due_day: Number(dueDay) || 5,
        terms: terms.trim() || undefined,
        status: 'active',
      });

      // Update property status to rented
      await propertyService.updateProperty(propertyId, { status: 'rented' });

      navigate('/dashboard/contracts');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du contrat.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-xs text-slate-500">
        Chargement des biens et locataires...
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-900">Aucun bien disponible</h2>
        <p className="text-xs text-slate-500">
          Vous devez d'abord créer au moins un bien immobilier avant de pouvoir établir un contrat de bail.
        </p>
        <Button onClick={() => navigate('/dashboard/properties/create')} variant="primary">
          Créer un bien
        </Button>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-900">Aucun locataire enregistré</h2>
        <p className="text-xs text-slate-500">
          Vous devez d'abord créer le dossier d'un locataire avant de lui attribuer un contrat.
        </p>
        <Button onClick={() => navigate('/dashboard/tenants/create')} variant="primary">
          Créer un locataire
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/contracts')}
          className="p-1 text-slate-400 hover:text-slate-900 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Nouveau Contrat de Bail
          </h1>
          <p className="text-xs text-slate-500">
            Associez un bien à un locataire avec les conditions financières.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Bien à louer <span className="text-rose-500">*</span>
              </label>
              <select
                value={propertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Locataire bénéficiaire <span className="text-rose-500">*</span>
              </label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Input
              label="Montant du loyer mensuel (FCFA)"
              type="number"
              required
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
            <Input
              label="Montant de la caution (FCFA)"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Date de début"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Date de fin (facultative)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              helperText="Laisser vide pour bail à durée indéterminée"
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Jour d'échéance mensuelle
              </label>
              <select
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="1">Le 1er du mois</option>
                <option value="5">Le 5 du mois</option>
                <option value="10">Le 10 du mois</option>
                <option value="15">Le 15 du mois</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Clauses particulières ou conditions d'état des lieux
            </label>
            <textarea
              rows={3}
              placeholder="ex. Les frais d'électricité SBEE et d'eau SONEB sont à la charge exclusive du locataire..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard/contracts')}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            Établir et activer le contrat
          </Button>
        </div>
      </form>
    </div>
  );
}
