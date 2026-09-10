import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../../services/properties/propertyService';
import type { Property } from '../../../types';
import { formatFCFA } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Home,
  Plus,
  Search,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Globe,
  EyeOff,
  Building,
} from 'lucide-react';

export function PropertiesListPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadProperties = async () => {
    setLoading(true);
    try {
      const list = await propertyService.getMyProperties();
      setProperties(list);
    } catch (err) {
      console.error('Error fetching user properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleTogglePublish = async (prop: Property) => {
    try {
      await propertyService.updateProperty(prop.id, {
        is_published: !prop.is_published,
      });
      await loadProperties();
    } catch (err) {
      console.error('Error toggling publication:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous certain de vouloir supprimer ce bien ?')) return;
    try {
      await propertyService.deleteProperty(id);
      await loadProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      (p.neighborhood && p.neighborhood.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mes Biens Immobiliers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos appartements, villas, studios et locaux commerciaux.
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/properties/create')}
          variant="primary"
          size="md"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Ajouter un bien
        </Button>
      </div>

      {/* Filter Toolbar */}
      {properties.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, ville, quartier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-slate-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 px-3 text-xs focus:outline-none focus:border-slate-900 bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="rented">Loué</option>
            <option value="maintenance">En travaux</option>
          </select>
        </div>
      )}

      {/* Property List or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Vous n'avez encore aucun bien"
          description="Commencez par ajouter votre premier bien pour le gérer, éditer des baux et le publier sur le site public."
          actionLabel="Ajouter un bien"
          onAction={() => navigate('/dashboard/properties/create')}
        />
      ) : filteredProperties.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Aucun bien ne correspond à votre recherche "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => {
            const hasPhoto = property.photos && property.photos.length > 0;
            return (
              <div
                key={property.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-16/9 bg-slate-100">
                  {hasPhoto ? (
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                      <Building className="h-8 w-8 mb-1 stroke-1" />
                      <span className="text-[10px]">Pas de photo</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="default" className="bg-white/90 text-slate-800 text-[10px]">
                      {property.type}
                    </Badge>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge
                      variant={property.status === 'available' ? 'success' : 'warning'}
                      className="text-[10px]"
                    >
                      {property.status === 'available' ? 'Disponible' : property.status === 'rented' ? 'Loué' : 'En travaux'}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="truncate">
                        {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="mt-2 text-base font-extrabold text-slate-900">
                      {formatFCFA(property.price)} <span className="text-xs font-normal text-slate-500">/ mois</span>
                    </div>
                  </div>

                  {/* Publication status & Action bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleTogglePublish(property)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        property.is_published
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={property.is_published ? 'Cliquez pour dépublier' : 'Cliquez pour publier'}
                    >
                      {property.is_published ? (
                        <>
                          <Globe className="h-3 w-3" />
                          <span>Publié</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Brouillon</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      {property.is_published && (
                        <Link
                          to={`/properties/${property.slug || property.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                          title="Aperçu public"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <button
                        onClick={() => navigate(`/dashboard/properties/${property.id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded"
                        title="Modifier"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
