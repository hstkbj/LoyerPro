import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../services/supabase/client';
import type { Property } from '../../types';
import { formatFCFA } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { Building, Globe, EyeOff } from 'lucide-react';

export function SuperAdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data } = await supabase.from('properties').select('*, owner:profiles(full_name, email, phone)').order('created_at', { ascending: false });
          if (data) setProperties(data as any[]);
        }
      } catch (err) {
        console.error('Error loading properties:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Tous les Biens de la Plateforme
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Supervision des logements créés et de leur publication sur le portail public.
        </p>
      </div>

      {loading ? (
        <div className="h-48 rounded-xl bg-slate-200 animate-pulse" />
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Aucun bien enregistré dans la base de données.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Bien</th>
                <th className="px-4 py-3">Bailleur</th>
                <th className="px-4 py-3">Ville / Zone</th>
                <th className="px-4 py-3">Loyer</th>
                <th className="px-4 py-3">Portail Public</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{p.title}</div>
                    <div className="text-[10px] text-slate-400">{p.type}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{p.owner?.full_name || 'Bailleur'}</div>
                    <div className="text-[10px] text-slate-400">{p.owner?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.neighborhood ? `${p.neighborhood}, ` : ''}{p.city}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {formatFCFA(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.is_published ? 'success' : 'default'}>
                      {p.is_published ? 'En ligne' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === 'available' ? 'success' : 'warning'}>
                      {p.status === 'available' ? 'Disponible' : p.status === 'rented' ? 'Loué' : 'Travaux'}
                    </Badge>
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
