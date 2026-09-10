import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useAuth } from '../../contexts/AuthContext';
import { getSupabaseConfig, clearCustomSupabaseConfig } from '../../services/supabase/client';
import { Database, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose }: SupabaseConfigModalProps) {
  const { configureSupabase } = useAuth();
  const currentConfig = getSupabaseConfig();

  const [url, setUrl] = useState(currentConfig.url || '');
  const [key, setKey] = useState(currentConfig.anonKey || '');
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    configureSupabase(url.trim(), key.trim());
    onClose();
  };

  const handleReset = () => {
    clearCustomSupabaseConfig();
    setUrl('');
    setKey('');
    configureSupabase('', '');
  };

  const handleCopySql = () => {
    const sqlScript = `-- Copiez ce script et collez-le dans Supabase SQL Editor
-- Schéma complet LoyerPro avec RLS et tables réelles :
-- profiles, properties, tenants, contracts, payments, expenses, visits, inquiries, subscriptions
-- Voir le fichier /supabase/schema.sql pour l'intégralité du script`;
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connexion Base de Données Supabase"
      description="Configurez votre projet Supabase réel (PostgreSQL, Auth & Stockage photos)"
      maxWidth="xl"
    >
      <div className="space-y-5 text-sm">
        {/* Connection status banner */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border text-xs ${
          currentConfig.isConfigured 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {currentConfig.isConfigured ? (
            <>
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Supabase connecté</p>
                <p className="text-emerald-700 mt-0.5">Toutes les opérations lisent et écrivent en temps réel dans votre base PostgreSQL.</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold">Mode Données Réelles Locales</p>
                <p className="text-amber-700 mt-0.5">Vous pouvez créer de vrais biens et locataires. Pour synchroniser avec Supabase en ligne, collez vos clés ci-dessous.</p>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="URL du projet Supabase"
            placeholder="https://votre-projet.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            helperText="Disponible dans Supabase > Project Settings > API"
          />
          <Input
            label="Clé publique anonyme (anon / public key)"
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            helperText="La clé anonyme sécurisée pour les requêtes du navigateur"
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Réinitialiser
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Fermer
              </Button>
              <Button type="submit" variant="primary">
                Enregistrer la connexion
              </Button>
            </div>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Database className="h-4 w-4" /> Script SQL d'initialisation Supabase
            </h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopySql}
              className="text-xs h-7"
            >
              {copied ? <Check className="h-3 w-3 mr-1 text-emerald-600" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? 'Copié !' : 'Copier SQL'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Le fichier complet avec toutes les tables et politiques RLS se trouve dans <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">/supabase/schema.sql</code>.
          </p>
          <button
            type="button"
            onClick={() => setShowSql(!showSql)}
            className="text-xs text-slate-700 underline hover:text-slate-900"
          >
            {showSql ? 'Masquer aperçu des instructions SQL' : 'Afficher les instructions SQL'}
          </button>
          {showSql && (
            <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono max-h-48 overflow-y-auto">
              <pre>{`1. Rendez-vous sur https://supabase.com
2. Ouvrez votre projet puis l'onglet "SQL Editor"
3. Collez et exécutez le script du fichier /supabase/schema.sql
4. Créez un bucket de stockage public nommé "property-photos"
5. Renseignez l'URL et la clé anonyme dans cette fenêtre`}</pre>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
