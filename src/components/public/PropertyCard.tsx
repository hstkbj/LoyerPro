import React from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../../types';
import { useGeo } from '../../contexts/GeoContext';
import { MapPin, Bed, Bath, Maximize2, Building, ShieldCheck, Check, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface PropertyCardProps {
  property: Property;
  key?: React.Key;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { formatPrice } = useGeo();
  const hasPhoto = property.photos && property.photos.length > 0;
  const photoUrl = hasPhoto ? property.photos[0] : null;

  const isVerified = property.owner_verified || property.owner?.is_verified || property.owner?.verification_status === 'verified';

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-md transition-all">
      {/* Thumbnail */}
      <Link to={`/properties/${property.slug || property.id}`} className="relative block aspect-16/10 bg-slate-100 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={property.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 p-4">
            <Building className="h-10 w-10 mb-1 stroke-1" />
            <span className="text-xs">Photos à venir</span>
          </div>
        )}

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="default" className="bg-white/95 text-slate-900 backdrop-blur-xs font-bold text-[11px] shadow-2xs">
            {property.type}
          </Badge>
          {isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              <ShieldCheck className="h-3 w-3" />
              <span>Vérifié</span>
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge
            variant={property.status === 'available' ? 'success' : 'warning'}
            className="shadow-xs font-semibold text-[10px]"
          >
            {property.status === 'available' ? 'Disponible' : property.status === 'rented' ? 'Loué' : 'En travaux'}
          </Badge>
        </div>

        {property.charges_included && (
          <div className="absolute bottom-2.5 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/80 text-white backdrop-blur-xs">
              <Zap className="h-2.5 w-2.5 text-amber-300" />
              Charges comprises
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
              {property.country ? ` · ${property.country}` : ''}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/properties/${property.slug || property.id}`}
            className="block text-sm font-bold text-slate-900 line-clamp-1 hover:text-emerald-700 transition-colors"
          >
            {property.title}
          </Link>

          {/* Room Specs & Details */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1" title={`${property.bedrooms} chambre(s)`}>
                <Bed className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.bedrooms} ch.</span>
              </span>
            )}
            {property.bathroom_type ? (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.bathroom_type === 'private' ? 'SDB privée' : 'SDB partagée'}</span>
              </span>
            ) : property.bathrooms > 0 ? (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.bathrooms} sdb.</span>
              </span>
            ) : null}
            {property.surface && property.surface > 0 ? (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.surface} m²</span>
              </span>
            ) : null}
            {property.deposit_months && (
              <span className="ml-auto text-[11px] text-slate-400">
                Caution : {property.deposit_months} mois
              </span>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-none">
              Loyer mensuel
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>

          <Link
            to={`/properties/${property.slug || property.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white transition-colors"
          >
            Consulter
          </Link>
        </div>
      </div>
    </div>
  );
}
