import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Power, PowerOff, Star } from 'lucide-react';
import { planService } from '../../services/plans/planService';
import type { SubscriptionPlan } from '../../types';
import { formatFCFA } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const EMPTY_FORM = {
  id: '',
  name: '',
  price: 0,
  currency: 'XOF',
  interval: 'month' as 'month' | 'year',
  max_properties: 5,
  max_tenants: undefined as number | undefined,
  description: '',
  featuresText: '',
  is_featured: false,
  trial_days: 0,
  sort_order: 0,
};

export function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await planService.getAllPlans(true);
      setPlans(data);
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditingId(plan.id);
    setForm({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency || 'XOF',
      interval: plan.interval,
      max_properties: plan.max_properties,
      max_tenants: plan.max_tenants,
      description: plan.description,
      featuresText: (plan.features || []).join('\n'),
      is_featured: !!plan.is_featured,
      trial_days: plan.trial_days || 0,
      sort_order: plan.sort_order || 0,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Le nom du plan est requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price) || 0,
        currency: form.currency,
        interval: form.interval,
        max_properties: Number(form.max_properties) || 1,
        max_tenants: form.max_tenants ? Number(form.max_tenants) : undefined,
        description: form.description,
        features: form.featuresText.split('\n').map(f => f.trim()).filter(Boolean),
        is_featured: form.is_featured,
        trial_days: Number(form.trial_days) || 0,
        sort_order: Number(form.sort_order) || 0,
      };

      if (editingId) {
        await planService.updatePlan(editingId, payload);
      } else {
        await planService.createPlan({ ...payload, id: form.id || undefined } as any);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement du plan.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: SubscriptionPlan) {
    try {
      if (plan.is_active === false) await planService.activatePlan(plan.id);
      else await planService.deactivatePlan(plan.id);
      await load();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(plan: SubscriptionPlan) {
    if (!confirm(`Supprimer définitivement le plan "${plan.name}" ? Les abonnés existants ne seront pas affectés mais devront être migrés manuellement.`)) return;
    try {
      await planService.deletePlan(plan.id);
      await load();
    } catch (err: any) {
      alert(err.message || 'Suppression impossible (des abonnements y sont peut-être encore rattachés).');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Plans & Tarifs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Créez, modifiez ou désactivez les plans d'abonnement proposés aux propriétaires et agences.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" /> Nouveau plan
        </Button>
      </div>

      {loading ? (
        <div className="h-48 rounded-xl bg-slate-200 animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                    {plan.is_featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{plan.id}</p>
                </div>
                <Badge variant={plan.is_active === false ? 'default' : 'success'}>
                  {plan.is_active === false ? 'Inactif' : 'Actif'}
                </Badge>
              </div>

              <div className="text-2xl font-bold text-slate-900">
                {formatFCFA(plan.price)}
                <span className="text-xs font-normal text-slate-500"> / {plan.interval === 'year' ? 'an' : 'mois'}</span>
              </div>

              <p className="text-xs text-slate-600">{plan.description}</p>

              <ul className="text-xs text-slate-600 space-y-1 flex-1">
                {(plan.features || []).slice(0, 5).map((f, i) => (
                  <li key={i} className="flex gap-1.5"><span>•</span><span>{f}</span></li>
                ))}
              </ul>

              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                Max biens : <strong>{plan.max_properties >= 9999 ? 'Illimité' : plan.max_properties}</strong>
                {plan.trial_days ? <> · Essai : <strong>{plan.trial_days}j</strong></> : null}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(plan)}>
                  {plan.is_active === false ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(plan)}>
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Modifier le plan' : 'Nouveau plan'} maxWidth="lg">
        <div className="space-y-4">
          {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom du plan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Identifiant (slug)" placeholder="auto-généré" value={form.id} disabled={!!editingId} onChange={e => setForm({ ...form, id: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Prix" type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            <div className="w-full space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Devise</label>
              <select className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option value="XOF">XOF (FCFA)</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="w-full space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Période</label>
              <select className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value as 'month' | 'year' })}>
                <option value="month">Mensuel</option>
                <option value="year">Annuel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Biens maximum" type="number" min={1} value={form.max_properties} onChange={e => setForm({ ...form, max_properties: Number(e.target.value) })} helperText="9999 = illimité" />
            <Input label="Locataires max (option)" type="number" min={0} value={form.max_tenants ?? ''} onChange={e => setForm({ ...form, max_tenants: e.target.value ? Number(e.target.value) : undefined })} />
            <Input label="Essai gratuit (jours)" type="number" min={0} value={form.trial_days} onChange={e => setForm({ ...form, trial_days: Number(e.target.value) })} />
          </div>

          <div className="w-full space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Description</label>
            <textarea
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm min-h-[60px]"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="w-full space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Fonctionnalités incluses (une par ligne)</label>
            <textarea
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm min-h-[110px] font-mono"
              value={form.featuresText}
              onChange={e => setForm({ ...form, featuresText: e.target.value })}
              placeholder={'Publication sur le portail public\nRapports financiers\nSupport prioritaire'}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
            Mettre en avant ce plan (badge "Populaire" sur la page tarifs)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} isLoading={saving}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
