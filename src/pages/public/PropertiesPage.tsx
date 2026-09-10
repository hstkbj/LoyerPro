import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService } from '../../services/properties/propertyService';
import type { Property } from '../../types';
import { PropertyCard } from '../../components/public/PropertyCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useGeo } from '../../contexts/GeoContext';
import { LocationSelectorModal } from '../../components/layout/LocationSelectorModal';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Home,
  ShieldCheck,
  MapPin,
  Bed,
  Bath,
  Zap,
} from 'lucide-react';

export function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentCountry, currentCity, currentCurrency, availableCountries, isLocalizedOnly, setIsLocalizedOnly } = useGeo();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Filters state initialized from URL search params or geo context
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || (isLocalizedOnly ? currentCountry.name : ''));
  const [city, setCity] = useState(searchParams.get('city') || (isLocalizedOnly ? currentCity : ''));
  const [type, setType] = useState(searchParams.get('type') || '');
  const [roomCategory, setRoomCategory] = useState(searchParams.get('roomCategory') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verifiedOnly') === 'true');
  const [chargesIncluded, setChargesIncluded] = useState(false);

  useEffect(() => {
    if (isLocalizedOnly && !searchParams.get('country')) {
      setSelectedCountry(currentCountry.name);
    }
  }, [currentCountry.name, isLocalizedOnly]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const list = await propertyService.getPublishedProperties({
        search: search.trim() || undefined,
        country: selectedCountry || undefined,
        city: city || undefined,
        type: type || undefined,
        roomCategory: roomCategory || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        verifiedOnly: verifiedOnly || undefined,
      });

      let filtered = list;
      if (chargesIncluded) {
        filtered = filtered.filter(p => p.charges_included);
      }
      setProperties(filtered);
    } catch (err) {
      console.error('Error fetching published properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedCountry, city, type, roomCategory, minPrice, maxPrice, verifiedOnly, chargesIncluded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCountry('');
    setCity('');
    setType('');
    setRoomCategory('');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setChargesIncluded(false);
    setSearchParams({});
  };

  const activeCountryObj = availableCountries.find(c => c.name === selectedCountry || c.code === selectedCountry);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Localized Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Chambres & Logements disponibles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Découvrez des annonces vérifiées avec caution claire, charges et photos réelles.
          </p>
        </div>

        {/* Geo status pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocationModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs"
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Localité : <strong>{currentCountry.flag} {currentCountry.name}</strong> ({currentCity || 'Toutes'})</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">{currentCurrency}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par quartier, standing, mot-clé (ex: Cocody, Almadies, Bastos, climatisé)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Rechercher
          </Button>
          {(search || selectedCountry || city || type || roomCategory || minPrice || maxPrice || verifiedOnly || chargesIncluded) && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetFilters}
              title="Réinitialiser"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </form>

        {/* Detailed filters */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Country */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pays</label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setCity('');
              }}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 font-medium"
            >
              <option value="">Tous les pays</option>
              {availableCountries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ville</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 font-medium"
            >
              <option value="">Toutes les villes</option>
              {activeCountryObj ? (
                activeCountryObj.cities.map((cty) => (
                  <option key={cty} value={cty}>
                    {cty}
                  </option>
                ))
              ) : (
                <>
                  <option value="Abidjan">Abidjan</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Cotonou">Cotonou</option>
                  <option value="Paris">Paris</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Montréal">Montréal</option>
                </>
              )}
            </select>
          </div>

          {/* Type / Room Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Type de Logement</label>
            <select
              value={roomCategory || type}
              onChange={(e) => {
                const val = e.target.value;
                if (['chambre_seule', 'chambre_salon', 'studio', 'colocation'].includes(val)) {
                  setRoomCategory(val);
                  setType('');
                } else {
                  setType(val);
                  setRoomCategory('');
                }
              }}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 font-medium"
            >
              <option value="">Tous les types</option>
              <option value="chambre_seule">Chambre individuelle</option>
              <option value="chambre_salon">Chambre & Salon</option>
              <option value="studio">Studio meublé / autonome</option>
              <option value="colocation">Colocation</option>
              <option value="Appartement">Appartement</option>
              <option value="Villa">Villa / Maison</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Loyer min ({currentCurrency})</label>
            <input
              type="number"
              placeholder="Ex: 50"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Loyer max ({currentCurrency})</label>
            <input
              type="number"
              placeholder="Ex: 500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col justify-end space-y-1.5 pt-1">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Bailleur vérifié CNI
              </span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={chargesIncluded}
                onChange={(e) => setChargesIncluded(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Charges comprises
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {properties.length} logement{properties.length > 1 ? 's' : ''} disponible{properties.length > 1 ? 's' : ''}
          {selectedCountry ? ` dans ${selectedCountry}` : ''}
        </span>
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Home}
          title="Aucun logement ne correspond à ces critères"
          description="Modifiez vos critères ou cliquez sur 'Tous les pays' pour élargir votre recherche de chambres et logements."
          actionLabel="Réinitialiser les filtres"
          onAction={handleResetFilters}
        />
      )}

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
