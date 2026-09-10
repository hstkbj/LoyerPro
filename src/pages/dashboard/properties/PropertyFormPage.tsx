import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService } from '../../../services/properties/propertyService';
import { storageService } from '../../../services/storage/storageService';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import type { PropertyType, PropertyStatus } from '../../../types';
import { ArrowLeft, UploadCloud, X, Plus } from 'lucide-react';

const COMMON_AMENITIES = [
  'Eau courante (SONEB)',
  'Compteur SBEE individuel',
  'Gardiennage / Sécurité',
  'Climatisation installée',
  'Garage / Parking',
  'Balcon / Terrasse',
  'Cuisine moderne',
  'Placards de rangement',
  'Groupe électrogène',
  'Forage d\'eau',
];

export function PropertyFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PropertyType>('Appartement');
  const [status, setStatus] = useState<PropertyStatus>('available');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('1');
  const [surface, setSurface] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState('3 mois de caution + 3 mois d\'avance');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);

  // Uploading state
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      if (!id) return;
      try {
        const found = await propertyService.getPropertyById(id);
        if (found) {
          setTitle(found.title);
          setType(found.type);
          setStatus(found.status);
          setPrice(String(found.price));
          setCity(found.city);
          setNeighborhood(found.neighborhood || '');
          setAddress(found.address || '');
          setBedrooms(String(found.bedrooms));
          setBathrooms(String(found.bathrooms));
          setSurface(found.surface ? String(found.surface) : '');
          setDescription(found.description || '');
          setConditions(found.conditions || '');
          setAmenities(found.amenities || []);
          setPhotos(found.photos || []);
          setIsPublished(found.is_published);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
      } finally {
        setFetching(false);
      }
    }
    loadExisting();
  }, [id]);

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await storageService.uploadPropertyPhoto(file);
        uploadedUrls.push(url);
      }
      setPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Erreur lors du chargement des photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !city.trim()) {
      setError('Veuillez renseigner au moins le titre, le prix et la ville.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        type,
        status,
        price: Number(price),
        city: city.trim(),
        neighborhood: neighborhood.trim() || undefined,
        address: address.trim() || undefined,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        surface: surface ? Number(surface) : undefined,
        description: description.trim() || undefined,
        conditions: conditions.trim() || undefined,
        amenities,
        photos,
        is_published: isPublished,
      };

      if (isEditing && id) {
        await propertyService.updateProperty(id, payload);
      } else {
        await propertyService.createProperty(payload);
      }

      navigate('/dashboard/properties');
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-xs text-slate-500">
        Chargement des données du bien...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/properties')}
          className="p-1 text-slate-400 hover:text-slate-900 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEditing ? 'Modifier le bien' : 'Ajouter un nouveau bien'}
          </h1>
          <p className="text-xs text-slate-500">
            Renseignez les caractéristiques réelles de votre logement ou local.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            1. Informations Principales
          </h3>

          <Input
            label="Titre de l'annonce / Désignation"
            required
            placeholder="ex. Bel appartement 3 pièces meublé à Cadjehoun"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Type de bien <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="Appartement">Appartement</option>
                <option value="Villa">Villa</option>
                <option value="Maison">Maison</option>
                <option value="Studio">Studio</option>
                <option value="Chambre & Salon">Chambre & Salon</option>
                <option value="Bureau / Commerce">Bureau / Commerce</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Statut actuel
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="available">Disponible</option>
                <option value="rented">Déjà Loué</option>
                <option value="maintenance">En travaux / Rénovation</option>
              </select>
            </div>

            <Input
              label="Loyer mensuel (FCFA)"
              type="number"
              required
              placeholder="ex. 120000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Location & Specs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            2. Localisation & Spécifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Ville <span className="text-rose-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="Cotonou">Cotonou</option>
                <option value="Abomey-Calavi">Abomey-Calavi</option>
                <option value="Porto-Novo">Porto-Novo</option>
                <option value="Ouidah">Ouidah</option>
                <option value="Parakou">Parakou</option>
                <option value="Bohicon">Bohicon</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <Input
              label="Quartier / Repère"
              placeholder="ex. Haie Vive, Tankpè, Akpakpa, Arconville"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </div>

          <Input
            label="Adresse précise / Indication d'accès"
            placeholder="ex. Rue 241, 3ème von après la pharmacie"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Chambres"
              type="number"
              min="0"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
            <Input
              label="Salles d'eau"
              type="number"
              min="0"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
            <Input
              label="Surface (m²)"
              type="number"
              placeholder="ex. 85"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
            />
          </div>
        </div>

        {/* Photos Upload */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            3. Photos du bien
          </h3>

          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50 transition-colors">
            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
            <label className="cursor-pointer text-xs font-semibold text-slate-900 hover:underline">
              <span>{uploading ? 'Chargement en cours...' : 'Sélectionner des photos'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP jusqu'à 5 Mo</p>
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-16/10 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100"
                    title="Supprimer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Amenities & Conditions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            4. Équipements & Modalités de bail
          </h3>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Commodités disponibles
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {COMMON_AMENITIES.map((amenity) => {
                const checked = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center justify-between transition-colors ${
                      checked
                        ? 'border-slate-900 bg-slate-900 text-white font-medium'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{amenity}</span>
                    {checked && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description complète du bien
            </label>
            <textarea
              rows={4}
              placeholder="Décrivez l'état des lieux, la luminosité, la proximité avec les axes principaux ou écoles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <Input
            label="Conditions financières (Caution & Avance)"
            placeholder="ex. 3 mois de caution + 3 mois d'avance de loyer"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
          />

          {/* Portal publication toggle */}
          <div className="pt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Publier sur le site public LoyerPro
              </p>
              <p className="text-[11px] text-slate-500">
                Le bien sera visible par les visiteurs recherchant un logement et génèrera des demandes de visite.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard/properties')}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            {isEditing ? 'Mettre à jour le bien' : 'Créer et enregistrer le bien'}
          </Button>
        </div>
      </form>
    </div>
  );
}
