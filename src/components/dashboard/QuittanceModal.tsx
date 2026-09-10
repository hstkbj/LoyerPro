import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Payment } from '../../types';
import { formatFCFA } from '../../lib/utils';
import { Printer, Download, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface QuittanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function QuittanceModal({ isOpen, onClose, payment }: QuittanceModalProps) {
  const { profile } = useAuth();
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quittance de Loyer & Reçu"
      description="Document officiel attestant de l'encaissement du loyer"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Printable Area */}
        <div id="printable-quittance" className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 space-y-6 text-xs text-slate-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block">
                RÉPUBLIQUE DU BÉNIN
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-1">
                QUITTANCE DE LOYER
              </h2>
              <p className="text-[11px] text-slate-500">
                N° Quittance : QUIT-{payment.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>RÉGLÉ</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Date : {payment.payment_date}
              </p>
            </div>
          </div>

          {/* Parties: Bailleur & Locataire */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Bailleur / Agence
              </span>
              <p className="font-bold text-slate-900">{profile?.agency_name || profile?.full_name || 'Le Propriétaire'}</p>
              <p className="text-slate-600">{profile?.phone}</p>
              <p className="text-slate-600">{profile?.email}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Locataire
              </span>
              <p className="font-bold text-slate-900">{payment.tenant?.full_name || 'Locataire'}</p>
              <p className="text-slate-600">Tél : {payment.tenant?.phone}</p>
              <p className="text-slate-600">Bien : {payment.property?.title || 'Logement loué'}</p>
            </div>
          </div>

          {/* Details Table */}
          <div>
            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Désignation</th>
                  <th className="px-3 py-2 text-left">Période concernée</th>
                  <th className="px-3 py-2 text-left">Mode de règlement</th>
                  <th className="px-3 py-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    Loyer mensuel principal
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    Mois de {payment.month}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {payment.payment_method} {payment.reference ? `(Réf: ${payment.reference})` : ''}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                    {formatFCFA(payment.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right text-slate-700">
                    Total reçu :
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-emerald-800">
                    {formatFCFA(payment.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal statement */}
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            Je soussigné, {profile?.agency_name || profile?.full_name || 'le bailleur'}, certifie avoir reçu de Monsieur / Madame {payment.tenant?.full_name} la somme de <strong className="font-semibold text-slate-800">{formatFCFA(payment.amount)}</strong> au titre du loyer pour la période susmentionnée, sous réserve de tous droits et actions.
          </p>

          {/* Signatures */}
          <div className="pt-4 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400">Généré via LoyerPro SaaS Bénin</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-900">Signature & Visa du Bailleur</p>
              <div className="h-14 w-32 border-b border-dashed border-slate-400 ml-auto mt-2 flex items-center justify-center text-[10px] text-slate-400 italic">
                Acquitté
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <Printer className="mr-1.5 h-4 w-4" />
            Imprimer la quittance
          </Button>
        </div>
      </div>
    </Modal>
  );
}
