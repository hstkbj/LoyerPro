import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../services/supabase/client';
import type { UserProfile, VerificationDocument } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  ExternalLink,
} from 'lucide-react';

export function SuperAdminUsersPage() {
  const { adminVerifyUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'unverified'>('all');
  const [selectedDocUser, setSelectedDocUser] = useState<UserProfile | null>(null);

  const loadUsers = async () => {
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data as UserProfile[]);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    await adminVerifyUser(userId, 'verified');
    await loadUsers();
    if (selectedDocUser?.id === userId) {
      setSelectedDocUser(null);
    }
  };

  const handleReject = async (userId: string) => {
    await adminVerifyUser(userId, 'rejected');
    await loadUsers();
    if (selectedDocUser?.id === userId) {
      setSelectedDocUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.agency_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'pending') return u.verification_status === 'pending';
    if (filterStatus === 'verified') return u.verification_status === 'verified';
    if (filterStatus === 'unverified') return !u.verification_status || u.verification_status === 'unverified';

    return true;
  });

  const pendingCount = users.filter((u) => u.verification_status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Audit & Validation des Bailleurs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Contrôle des pièces d'identité (CNI, Passeport, RCCM) et attribution du badge Certifié LoyerPro.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
            <Clock className="h-4 w-4 animate-spin" />
            <span>{pendingCount} dossier(s) en attente d'audit</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({users.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === 'pending' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>En attente</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'verified' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Certifiés ({users.filter((u) => u.verification_status === 'verified').length})
          </button>
          <button
            onClick={() => setFilterStatus('unverified')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'unverified' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Non vérifiés
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher nom, agence, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-48 rounded-xl bg-slate-200 animate-pulse" />
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          Aucun utilisateur trouvé pour ce filtre.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Bailleur / Agence</th>
                <th className="px-4 py-3.5">Contact & Pays</th>
                <th className="px-4 py-3.5">Statut Conformité</th>
                <th className="px-4 py-3.5">Pièces Jointes</th>
                <th className="px-4 py-3.5 text-right">Actions d'audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const docsCount = u.verification_documents?.length || 0;
                const status = u.verification_status || 'unverified';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div>{u.full_name || 'Sans nom'}</div>
                      {u.agency_name && (
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3" />
                          <span>{u.agency_name}</span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {u.role === 'agency' ? 'Agence Immobilière' : 'Propriétaire Individuel'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-500">{u.phone}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {u.city ? `${u.city}, ` : ''}{u.country || 'International'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {status === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Certifié
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          Audit Requis
                        </span>
                      )}
                      {status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                          Rejeté
                        </span>
                      )}
                      {status === 'unverified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          Non vérifié
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {docsCount > 0 ? (
                        <button
                          onClick={() => setSelectedDocUser(u)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                          <span>{docsCount} document(s)</span>
                          <Eye className="h-3 w-3 text-slate-400" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Aucune pièce</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {status !== 'verified' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApprove(u.id)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 py-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Valider
                        </Button>
                      )}
                      {status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(u.id)}
                          className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 py-1"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Refuser
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal to view submitted verification documents */}
      {selectedDocUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Dossier de conformité : {selectedDocUser.full_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDocUser.agency_name ? `Agence: ${selectedDocUser.agency_name} • ` : ''}
                  Email: {selectedDocUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedDocUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pièces jointes fournies ({selectedDocUser.verification_documents?.length || 0})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedDocUser.verification_documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase">
                        {doc.document_type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Preview if image or link */}
                    {doc.file_url.startsWith('data:image') ? (
                      <div className="aspect-4/3 rounded-lg overflow-hidden border border-slate-300 bg-white">
                        <img
                          src={doc.file_url}
                          alt={doc.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center p-3 text-center">
                        <FileText className="h-8 w-8 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-700 truncate max-w-full">
                          {doc.name}
                        </span>
                      </div>
                    )}

                    <div className="pt-1">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ouvrir le fichier en plein écran
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(selectedDocUser.id)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
              >
                Rejeter les pièces
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(selectedDocUser.id)}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Valider et Activer le Badge Certifié
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
