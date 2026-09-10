import React, { useState, useEffect } from 'react';
import { inquiryService } from '../../../services/inquiries/inquiryService';
import type { Inquiry } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  MessageSquare,
  Building,
  Phone,
  Mail,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';

export function InquiriesListPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const list = await inquiryService.getMyInquiries();
      setInquiries(list);
    } catch (err) {
      console.error('Error loading inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleToggleReplied = async (id: string, current: boolean) => {
    try {
      await inquiryService.updateInquiryStatus(id, !current);
      await loadInquiries();
    } catch (err) {
      console.error('Error updating inquiry status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Demandes de Renseignements
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Questions posées par les visiteurs sur vos biens publiés.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucune question de prospect enregistrée"
          description="Les questions envoyées depuis les fiches de vos biens publiés apparaîtront ici avec les coordonnées directes des demandeurs."
        />
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{inq.visitor_name}</span>
                  <Badge variant={inq.is_replied ? 'success' : 'warning'}>
                    {inq.is_replied ? 'Répondu' : 'Non répondu'}
                  </Badge>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {new Date(inq.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    {inq.property?.title || 'Bien'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {inq.visitor_phone}
                  </span>
                  {inq.visitor_email && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {inq.visitor_email}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  {inq.message}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 sm:pt-1">
                <a
                  href={`https://wa.me/${inq.visitor_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${inq.visitor_name}, suite à votre message concernant ${inq.property?.title || 'le bien'} sur LoyerPro...`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Répondre par WhatsApp</span>
                </a>

                <button
                  onClick={() => handleToggleReplied(inq.id, inq.is_replied)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    inq.is_replied
                      ? 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {inq.is_replied ? 'Marquer non répondu' : 'Marquer comme répondu'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
