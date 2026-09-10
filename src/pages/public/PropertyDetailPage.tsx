import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/properties/propertyService';
import type { Property } from '../../types';
import { useGeo } from '../../contexts/GeoContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VisitRequestModal } from '../../components/public/VisitRequestModal';
import { InquiryModal } from '../../components/public/InquiryModal';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  MessageSquare,
  Share2,
  ArrowLeft,
  Building,
  Check,
  ShieldCheck,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Info,
} from 'lucide-react';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useGeo();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Modals
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const found = await propertyService.getPropertyById(id);
        setProperty(found);
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-96 rounded-2xl bg-slate-200 animate-pulse mb-6" />
        <div className="h-8 w-1/2 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="h-4 w-1/4 rounded bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Bien ou chambre introuvable</h2>
        <p className="text-xs text-slate-500">
          Cette annonce n'est plus disponible ou a été archivée par son gestionnaire.
        </p>
        <Button onClick={() => navigate('/properties')} variant="primary" size="md">
          Voir les logements disponibles
        </Button>
      </div>
    );
  }

  const photos = property.photos || [];
  const currentPhoto = photos.length > 0 ? photos[selectedPhotoIndex] : null;

  const handleShareWhatsApp = () => {
    const text = `Découvrez cette annonce : ${property.title} (${property.city}) pour ${formatPrice(property.price, property.currency)}/mois sur LoyerPro : ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isVerified = property.owner_verified || property.owner?.is_verified || property.owner?.verification_status === 'verified';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/properties"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Retour aux chambres & logements
        </Link>
      </div>

      {/* Main Grid: Gallery & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={property.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                  <Building className="h-16 w-16 mb-2 stroke-1" />
                  <span className="text-xs">Aucune photo pour ce logement</span>
                </div>
              )}

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge variant="default" className="bg-white/95 text-slate-900 shadow-sm font-bold text-xs">
                  {property.type}
                </Badge>
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Bailleur Certifié CNI</span>
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4">
                <Badge
                  variant={property.status === 'available' ? 'success' : 'warning'}
                  className="shadow-sm font-bold text-xs"
                >
                  {property.status === 'available' ? 'Disponible' : property.status === 'rented' ? 'Loué' : 'En travaux'}
                </Badge>
              </div>

              {property.charges_included && (
                <div className="absolute bottom-3 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 text-white backdrop-blur-xs">
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    Charges comprises dans le loyer
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative h-18 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedPhotoIndex === idx ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Vue ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key characteristics */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {property.address ? `${property.address}, ` : ''}
                {property.neighborhood ? `${property.neighborhood}, ` : ''}
                {property.city}
                {property.country ? ` · ${property.country}` : ''}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {property.title}
            </h1>

            {/* Key specs pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-700">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 font-semibold">
                  <Bed className="h-4 w-4 text-slate-500" />
                  <span>{property.bedrooms} Chambre{property.bedrooms > 1 ? 's' : ''}</span>
                </div>
              )}
              {property.bathroom_type ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 font-semibold">
                  <Bath className="h-4 w-4 text-slate-500" />
                  <span>{property.bathroom_type === 'private' ? 'Salle d’eau privée' : 'Salle d’eau partagée'}</span>
                </div>
              ) : property.bathrooms > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 font-semibold">
                  <Bath className="h-4 w-4 text-slate-500" />
                  <span>{property.bathrooms} Salle{property.bathrooms > 1 ? 's' : ''} d'eau</span>
                </div>
              ) : null}
              {property.surface && property.surface > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 font-semibold">
                  <Maximize2 className="h-4 w-4 text-slate-500" />
                  <span>{property.surface} m²</span>
                </div>
              )}
              {property.deposit_months && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  <span>Caution : {property.deposit_months} mois</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pb-6 border-b border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Description détaillée
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {property.description || 'Aucune description détaillée communiquée pour ce logement.'}
            </p>
          </div>

          {/* Spécifications Chambre & Commodités Logement */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Détails & Commodités du logement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {property.kitchen_type && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Cuisine :</span>
                  <span className="font-semibold text-slate-800">
                    {property.kitchen_type === 'private' ? 'Cuisine privée / kitchenette' : property.kitchen_type === 'shared' ? 'Cuisine partagée' : 'Pas de cuisine'}
                  </span>
                </div>
              )}
              {property.water_source && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5 text-blue-500" />
                    Alimentation Eau :
                  </span>
                  <span className="font-semibold text-slate-800">{property.water_source}</span>
                </div>
              )}
              {property.electricity_meter && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Compteur électricité :
                  </span>
                  <span className="font-semibold text-slate-800">{property.electricity_meter}</span>
                </div>
              )}
              {property.wifi_speed && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5 text-indigo-500" />
                    Connexion Internet :
                  </span>
                  <span className="font-semibold text-slate-800">{property.wifi_speed}</span>
                </div>
              )}
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                {property.amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conditions de bail (Caution, Avance, etc.) */}
          {property.conditions && (
            <div className="space-y-2 pb-6 border-b border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Conditions de bail & modalités d'entrée
              </h2>
              <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                {property.conditions}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price Card & Contact CTAs */}
        <div className="space-y-4">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs text-slate-500 block font-semibold uppercase tracking-wider">
                Loyer mensuel
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {formatPrice(property.price, property.currency)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {property.charges_included ? '✓ Charges comprises' : 'Charges eau/électricité au compteur'}
              </span>
            </div>

            {/* Actions Buttons */}
            <div className="space-y-2.5">
              <Button
                onClick={() => setVisitModalOpen(true)}
                variant="primary"
                size="lg"
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Demander une visite
              </Button>

              <Button
                onClick={() => setInquiryModalOpen(true)}
                variant="outline"
                size="lg"
                className="w-full justify-center text-xs font-semibold"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Poser une question au bailleur
              </Button>

              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
              >
                <Share2 className="h-4 w-4 text-emerald-600" />
                Partager cette chambre sur WhatsApp
              </button>
            </div>

            {/* Landlord / Agency Info & Verification Badge */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    {property.owner?.agency_name || property.owner?.full_name || 'Bailleur vérifié'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Identité et documents de propriété validés par l'équipe conformité LoyerPro.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>Aucun frais de visite n'est exigible avant signature d'un bail en règle.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VisitRequestModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        property={property}
      />

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        property={property}
      />
    </div>
  );
}
