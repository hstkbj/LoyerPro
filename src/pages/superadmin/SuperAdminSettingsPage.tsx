import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { SupabaseConfigModal } from '../../components/ui/SupabaseConfigModal';
import { Database, ShieldCheck, Key, Code2 } from 'lucide-react';

export function SuperAdminSettingsPage() {
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Configuration Système & Base de Données
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Paramètres d'intégration Supabase PostgreSQL, passerelle FedaPay et sécurité.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Database className="h-4 w-4 text-emerald-600" />
            <span>Base Supabase PostgreSQL & Stockage Photos</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setConfigModalOpen(true)}>
            Modifier les clés de connexion
          </Button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          L'application lit et écrit en temps réel sur Supabase (Auth, PostgreSQL avec RLS, et Bucket de stockage pour les photos de biens).
        </p>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
          <p><strong>Bucket de photos :</strong> <code className="bg-white px-1.5 py-0.5 rounded border text-slate-900">property-photos</code> (accès public activé)</p>
          <p><strong>Politiques RLS :</strong> Activées sur toutes les tables (profiles, properties, tenants, contracts, payments, expenses, visits, inquiries, subscriptions)</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          <Key className="h-4 w-4 text-amber-600" />
          <span>Passerelle de Paiement FedaPay (MTN & Moov Mobile Money)</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Les souscriptions aux forfaits Pro et Agence transitent par l'API FedaPay via le proxy serveur sécurisé Node/Express (<code className="bg-slate-100 px-1 py-0.5 rounded">server.ts</code>). La clé secrète ne parvient jamais au navigateur client.
        </p>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
          <p><strong>Variables d'environnement requises sur le serveur :</strong></p>
          <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-slate-600">
            <li><code className="bg-white px-1 py-0.5 rounded border">FEDAPAY_SECRET_KEY</code> (Clé secrète FedaPay)</li>
            <li><code className="bg-white px-1 py-0.5 rounded border">FEDAPAY_ENVIRONMENT</code> (sandbox ou live)</li>
          </ul>
        </div>
      </div>

      <SupabaseConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} />
    </div>
  );
}
