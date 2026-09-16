import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useAuth } from '../../contexts/AuthContext';
import { getSupabaseConfig, clearCustomSupabaseConfig, checkSupabaseHealth } from '../../services/supabase/client';
import { Database, CheckCircle, AlertCircle, Copy, Check, RefreshCw, Activity } from 'lucide-react';

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
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(currentConfig.url || '');
      setKey(currentConfig.anonKey || '');
      setTestResult(null);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Si l'utilisateur a modifié les champs dans le formulaire, on teste avec ceux-ci
    const testUrl = url.trim();
    const testKey = key.trim();

    if (!testUrl || !testKey) {
      setTesting(false);
      setTestResult({
        tested: true,
        connected: false,
        error: 'Veuillez saisir une URL et une clé anonyme valides avant de tester.',
      });
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const start = Date.now();

      const res = await fetch(`${testUrl}/rest/v1/?apikey=${testKey}`, {
        method: 'GET',
        headers: {
          apikey: testKey,
          Authorization: `Bearer ${testKey}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latency = Date.now() - start;
      if (res.ok || res.status === 200 || res.status === 401 || res.status === 404) {
        setTestResult({
          tested: true,
          connected: true,
          latencyMs: latency,
        });
      } else {
        setTestResult({
          tested: true,
          connected: false,
          error: `Réponse HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        connected: false,
        error: err?.name === 'AbortError'
          ? 'Délai d\'attente dépassé (4.5s) : le serveur ne répond pas.'
          : `Échec réseau ou DNS : l'hôte "${testUrl}" est introuvable ou inaccessible.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    configureSupabase(url.trim(), key.trim());
    onClose();
  };

  const handleReset = () => {
    clearCustomSupabaseConfig();
    setUrl('');
    setKey('');
    setTestResult(null);
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
        <div className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs ${
          currentConfig.isConfigured 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {currentConfig.isConfigured ? (
            <>
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">Paramètres Supabase renseignés</p>
                <p className="text-emerald-700 mt-0.5 leading-relaxed">
                  URL active : <code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded text-emerald-900">{currentConfig.url}</code>
                </p>
                <p className="text-slate-600 mt-1">
                  Cliquez sur « Tester la connexion » ci-dessous pour vérifier l'accessibilité en temps réel de votre instance.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Mode Local Actif</p>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Vous pouvez gérer vos biens et contrats directement. Pour synchroniser avec votre base de données PostgreSQL en ligne, collez vos identifiants Supabase ci-dessous.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Test result banner */}
        {testResult && (
          <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            testResult.connected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {testResult.connected ? (
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                {testResult.connected
                  ? `Connexion établie avec succès (${testResult.latencyMs} ms)`
                  : 'Impossible de joindre cette instance Supabase'}
              </p>
              {testResult.error && (
                <p className="mt-0.5 text-rose-700 leading-relaxed font-mono text-[11px]">
                  {testResult.error}
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="URL du projet Supabase"
            placeholder="https://votre-projet.supabase.co"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setTestResult(null);
            }}
            helperText="Disponible dans Supabase > Project Settings > API"
          />
          <Input
            label="Clé publique anonyme (anon / public key)"
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setTestResult(null);
            }}
            helperText="La clé anonyme sécurisée pour les requêtes du navigateur"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || !url.trim()}
                className="text-xs gap-1.5"
              >
                {testing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Activity className="h-3.5 w-3.5 text-slate-600" />
                )}
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-rose-600 hover:bg-rose-50"
              >
                Réinitialiser
              </Button>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Fermer
              </Button>
              <Button type="submit" variant="primary" size="sm">
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
