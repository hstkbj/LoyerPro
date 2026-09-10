import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../../services/tenants/tenantService';
import type { Tenant } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  MessageCircle,
} from 'lucide-react';

export function TenantsListPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadTenants = async () => {
    setLoading(true);
    try {
      const list = await tenantService.getMyTenants();
      setTenants(list);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer définitivement ce dossier locataire ?')) return;
    try {
      await tenantService.deleteTenant(id);
      await loadTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const s = search.toLowerCase();
    return (
      t.full_name.toLowerCase().includes(s) ||
      t.phone.toLowerCase().includes(s) ||
      (t.email && t.email.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Locataires</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dossiers des locataires, coordonnées et suivi des pièces justificatives.
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/tenants/create')}
          variant="primary"
          size="md"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nouveau locataire
        </Button>
      </div>

      {/* Search Toolbar */}
      {tenants.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email..."
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
            <div key={i} className="h-20 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Vous n'avez encore aucun locataire"
          description="Enregistrez les coordonnées de vos locataires pour pouvoir créer des contrats de bail et délivrer des quittances de loyer."
          actionLabel="Ajouter un locataire"
          onAction={() => navigate('/dashboard/tenants/create')}
        />
      ) : filteredTenants.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Aucun locataire ne correspond à "{search}".
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Locataire</th>
                <th className="px-4 py-3">Coordonnées</th>
                <th className="px-4 py-3">Profession / Pièce</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{tenant.full_name}</div>
                    {tenant.emergency_contact_name && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Urgence : {tenant.emergency_contact_name} ({tenant.emergency_contact_phone})
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{tenant.phone}</span>
                      <a
                        href={`https://wa.me/${tenant.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 ml-1"
                        title="Ouvrir WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    {tenant.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{tenant.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-800">{tenant.profession || 'Non renseignée'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {tenant.id_card_number ? `Pièce : ${tenant.id_card_number}` : 'Sans pièce'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={tenant.status === 'active' ? 'success' : 'default'}>
                      {tenant.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => navigate(`/dashboard/tenants/${tenant.id}/edit`)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 rounded"
                      title="Modifier"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id)}
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
