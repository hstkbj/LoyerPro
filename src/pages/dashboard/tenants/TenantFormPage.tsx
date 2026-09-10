import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantService } from '../../../services/tenants/tenantService';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function TenantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const found = await tenantService.getTenantById(id);
        if (found) {
          setFullName(found.full_name);
          setPhone(found.phone);
          setEmail(found.email || '');
          setProfession(found.profession || '');
          setIdCardNumber(found.id_card_number || '');
          setEmergencyName(found.emergency_contact_name || '');
          setEmergencyPhone(found.emergency_contact_phone || '');
          setNotes(found.notes || '');
          setStatus(found.status);
        }
      } catch (err) {
        console.error('Error fetching tenant:', err);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError('Le nom complet et le numéro de téléphone sont obligatoires.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        profession: profession.trim() || undefined,
        id_card_number: idCardNumber.trim() || undefined,
        emergency_contact_name: emergencyName.trim() || undefined,
        emergency_contact_phone: emergencyPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      };

      if (isEditing && id) {
        await tenantService.updateTenant(id, payload);
      } else {
        await tenantService.createTenant(payload);
      }

      navigate('/dashboard/tenants');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-xs text-slate-500">
        Chargement du locataire...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/tenants')}
          className="p-1 text-slate-400 hover:text-slate-900 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEditing ? 'Modifier le locataire' : 'Nouveau locataire'}
          </h1>
          <p className="text-xs text-slate-500">
            Fiche individuelle du locataire et références de contact.
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
          <Input
            label="Nom & Prénoms complets"
            required
            placeholder="ex. Kodjo Mawuna"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Numéro de Téléphone (WhatsApp)"
              required
              type="tel"
              placeholder="ex. +229 97 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Email (facultatif)"
              type="email"
              placeholder="kodjo@exemple.bj"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Profession / Entreprise"
              placeholder="ex. Ingénieur télécom chez MTN"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
            <Input
              label="N° CIP / Carte d'identité / Passeport"
              placeholder="ex. CIP 1234567890123"
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Input
              label="Personne à contacter en cas d'urgence"
              placeholder="ex. Clarisse Mawuna (Épouse)"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />
            <Input
              label="Tél d'urgence"
              type="tel"
              placeholder="ex. +229 95 00 00 00"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Notes internes / Remarques
            </label>
            <textarea
              rows={3}
              placeholder="Informations utiles pour le bailleur..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard/tenants')}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            {isEditing ? 'Enregistrer les modifications' : 'Créer le dossier locataire'}
          </Button>
        </div>
      </form>
    </div>
  );
}
