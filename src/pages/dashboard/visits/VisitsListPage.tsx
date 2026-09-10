import React, { useState, useEffect } from 'react';
import { visitService } from '../../../services/visits/visitService';
import type { VisitRequest } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  Building,
  CheckCircle,
  XCircle,
  MessageCircle,
} from 'lucide-react';

export function VisitsListPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const list = await visitService.getMyVisitRequests();
      setVisits(list);
    } catch (err) {
      console.error('Error loading visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await visitService.updateVisitStatus(id, status);
      await loadVisits();
    } catch (err) {
      console.error('Error updating visit status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Demandes de Visite
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rendez-vous demandés par les visiteurs du site public sur vos biens disponibles.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucune demande de visite enregistrée"
          description="Dès qu'un visiteur souhaite voir l'un de vos biens publiés sur le portail public, sa demande avec créneau souhaité et numéro de téléphone s'affichera ici."
        />
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{visit.visitor_name}</span>
                  <Badge
                    variant={
                      visit.status === 'confirmed'
                        ? 'success'
                        : visit.status === 'pending'
                        ? 'warning'
                        : visit.status === 'completed'
                        ? 'info'
                        : 'default'
                    }
                  >
                    {visit.status === 'pending'
                      ? 'À confirmer'
                      : visit.status === 'confirmed'
                      ? 'Visite confirmée'
                      : visit.status === 'completed'
                      ? 'Visite effectuée'
                      : 'Annulée'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    {visit.property?.title || 'Bien'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {visit.preferred_date} à {visit.preferred_time || '10:00'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {visit.visitor_phone}
                  </span>
                  {visit.visitor_email && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {visit.visitor_email}
                    </span>
                  )}
                </div>

                {visit.message && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-2xl">
                    « {visit.message} »
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://wa.me/${visit.visitor_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${visit.visitor_name}, suite à votre demande de visite pour ${visit.property?.title || 'le logement'} sur LoyerPro...`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>

                {visit.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateStatus(visit.id, 'confirmed')}
                      className="text-xs h-8 bg-slate-900"
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Confirmer
                    </Button>
                    <button
                      onClick={() => handleUpdateStatus(visit.id, 'cancelled')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      title="Refuser"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                )}

                {visit.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(visit.id, 'completed')}
                    className="text-xs h-8 text-emerald-700 border-emerald-200"
                  >
                    Marquer effectuée
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
