import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../../../services/contracts/contractService';
import type { Contract } from '../../../types';
import { formatFCFA } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  FileText,
  Plus,
  Building,
  User,
  Calendar,
  DollarSign,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export function ContractsListPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const list = await contractService.getMyContracts();
      setContracts(list);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleTerminate = async (id: string) => {
    if (!window.confirm('Marquer ce contrat comme résilié / clôturé ? Le bien pourra être remis en location.')) return;
    try {
      await contractService.terminateContract(id);
      await loadContracts();
    } catch (err) {
      console.error('Error terminating contract:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer définitivement ce contrat ?')) return;
    try {
      await contractService.deleteContract(id);
      await loadContracts();
    } catch (err) {
      console.error('Error deleting contract:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Contrats de Location (Baux)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des baux liant vos biens à vos locataires, dates d'échéance et cautions versées.
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/contracts/create')}
          variant="primary"
          size="md"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nouveau contrat de bail
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Vous n'avez encore aucun contrat de bail"
          description="Associez l'un de vos biens à un locataire pour établir un contrat de bail officiel et commencer à enregistrer les encaissements de loyer."
          actionLabel="Créer un contrat"
          onAction={() => navigate('/dashboard/contracts/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{contract.property?.title || 'Bien'}</span>
                  </div>
                  <Badge variant={contract.status === 'active' ? 'success' : 'default'}>
                    {contract.status === 'active' ? 'Actif' : 'Clôturé'}
                  </Badge>
                </div>

                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Locataire : <strong className="text-slate-800">{contract.tenant?.full_name || 'Locataire'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Du {contract.start_date} {contract.end_date ? `au ${contract.end_date}` : '(Durée indéterminée)'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Loyer mensuel</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatFCFA(contract.rent_amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Échéance le {contract.payment_due_day} du mois
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Caution versée</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatFCFA(contract.deposit_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Réf: {contract.id.slice(0, 8)}
                </span>

                <div className="flex items-center gap-2">
                  {contract.status === 'active' && (
                    <button
                      onClick={() => handleTerminate(contract.id)}
                      className="px-2 py-1 rounded text-xs text-amber-700 hover:bg-amber-50"
                      title="Résilier"
                    >
                      Résilier
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(contract.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
