import React, { useState } from 'react';
import { useGeo } from '../../contexts/GeoContext';
import { MapPin, Globe, Check, X, Coins } from 'lucide-react';
import { Button } from '../ui/Button';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationSelectorModal({ isOpen, onClose }: LocationSelectorModalProps) {
  const {
    currentCountry,
    currentCity,
    currentCurrency,
    availableCountries,
    setCountry,
    setCity,
    setCurrency,
    isLocalizedOnly,
    setIsLocalizedOnly,
  } = useGeo();

  const [selectedCountryCode, setSelectedCountryCode] = useState(currentCountry.code);
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);

  if (!isOpen) return null;

  const targetCountry = availableCountries.find(c => c.code === selectedCountryCode) || currentCountry;

  const handleApply = () => {
    setCountry(selectedCountryCode);
    setCity(selectedCity);
    setCurrency(selectedCurrency);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Localisation & Devise</h3>
              <p className="text-xs text-slate-500">Adaptez les annonces et les tarifs à votre région</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Localized filtering toggle */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Afficher uniquement les chambres de ma localité</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Filtre automatiquement le catalogue sur {targetCountry.name} ({selectedCity || 'Toutes les villes'})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLocalizedOnly(!isLocalizedOnly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isLocalizedOnly ? 'bg-slate-900' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isLocalizedOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 1. Country Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              1. Choisissez votre Pays
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableCountries.map((c) => {
                const isSelected = c.code === selectedCountryCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountryCode(c.code);
                      setSelectedCity(c.cities[0] || 'Toutes');
                      setSelectedCurrency(c.currency);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="truncate flex-1">{c.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. City Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              2. Ville Principale
            </label>
            <div className="flex flex-wrap gap-1.5">
              {targetCountry.cities.map((cty) => {
                const isSelected = selectedCity === cty;
                return (
                  <button
                    key={cty}
                    type="button"
                    onClick={() => setSelectedCity(cty)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {cty}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Currency Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-slate-500" />
              <span>3. Devise d'affichage des loyers & abonnements</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { code: 'XOF', label: 'FCFA (UEMOA)' },
                { code: 'XAF', label: 'FCFA (CEMAC)' },
                { code: 'EUR', label: '€ (Euros)' },
                { code: 'USD', label: '$ (Dollars)' },
                { code: 'MAD', label: 'DH (Dirham)' },
                { code: 'CAD', label: '$CA (Canada)' },
              ].map((cur) => (
                <button
                  key={cur.code}
                  type="button"
                  onClick={() => setSelectedCurrency(cur.code)}
                  className={`p-2 rounded-lg border text-center text-xs font-medium transition-colors ${
                    selectedCurrency === cur.code
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">{cur.code}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Appliquer la sélection
          </Button>
        </div>
      </div>
    </div>
  );
}
