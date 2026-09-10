import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CountryConfig,
  SUPPORTED_COUNTRIES,
  detectUserCountry,
  formatCurrencyAmount,
  getPricingForCurrency,
  PlanLocalizedPricing,
} from '../services/currency/currencyService';

interface GeoContextType {
  currentCountry: CountryConfig;
  currentCity: string;
  currentCurrency: string;
  isAutoDetected: boolean;
  isLocalizedOnly: boolean;
  availableCountries: CountryConfig[];
  availableCities: string[];
  setCountry: (countryCode: string) => void;
  setCity: (cityName: string) => void;
  setCurrency: (currency: string) => void;
  setIsLocalizedOnly: (val: boolean) => void;
  formatPrice: (amount: number, overrideCurrency?: string) => string;
  pricingPlans: PlanLocalizedPricing;
}

const GeoContext = createContext<GeoContextType | undefined>(undefined);

const STORAGE_COUNTRY = 'loyerpro_selected_country';
const STORAGE_CITY = 'loyerpro_selected_city';
const STORAGE_CURRENCY = 'loyerpro_selected_currency';
const STORAGE_LOCALIZED = 'loyerpro_localized_only';

export const GeoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCountry, setCurrentCountryState] = useState<CountryConfig>(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem(STORAGE_COUNTRY);
      if (savedCode) {
        const found = SUPPORTED_COUNTRIES.find(c => c.code === savedCode);
        if (found) return found;
      }
    }
    return detectUserCountry();
  });

  const [currentCity, setCurrentCityState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CITY);
      if (saved) return saved;
    }
    return currentCountry.cities[0] || '';
  });

  const [currentCurrency, setCurrentCurrencyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CURRENCY);
      if (saved) return saved;
    }
    return currentCountry.currency;
  });

  const [isLocalizedOnly, setIsLocalizedOnlyState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LOCALIZED);
      if (saved !== null) return saved === 'true';
    }
    return true; // Default to true: show available rooms in visitor's location first!
  });

  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);

  // When country changes, update city and currency if not customized
  const setCountry = (countryCode: string) => {
    const found = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    if (!found) return;

    setCurrentCountryState(found);
    setIsAutoDetected(false);
    localStorage.setItem(STORAGE_COUNTRY, found.code);

    // Update city to first city of new country
    const newCity = found.cities[0] || '';
    setCurrentCityState(newCity);
    localStorage.setItem(STORAGE_CITY, newCity);

    // Update currency to match country
    setCurrentCurrencyState(found.currency);
    localStorage.setItem(STORAGE_CURRENCY, found.currency);
  };

  const setCity = (cityName: string) => {
    setCurrentCityState(cityName);
    setIsAutoDetected(false);
    localStorage.setItem(STORAGE_CITY, cityName);
  };

  const setCurrency = (curr: string) => {
    setCurrentCurrencyState(curr);
    localStorage.setItem(STORAGE_CURRENCY, curr);
  };

  const setIsLocalizedOnly = (val: boolean) => {
    setIsLocalizedOnlyState(val);
    localStorage.setItem(STORAGE_LOCALIZED, String(val));
  };

  const formatPrice = (amount: number, overrideCurrency?: string) => {
    return formatCurrencyAmount(amount, overrideCurrency || currentCurrency);
  };

  const pricingPlans = useMemo(() => {
    return getPricingForCurrency(currentCurrency);
  }, [currentCurrency]);

  const value = useMemo(() => ({
    currentCountry,
    currentCity,
    currentCurrency,
    isAutoDetected,
    isLocalizedOnly,
    availableCountries: SUPPORTED_COUNTRIES,
    availableCities: currentCountry.cities,
    setCountry,
    setCity,
    setCurrency,
    setIsLocalizedOnly,
    formatPrice,
    pricingPlans,
  }), [currentCountry, currentCity, currentCurrency, isAutoDetected, isLocalizedOnly, pricingPlans]);

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
};

export function useGeo() {
  const context = useContext(GeoContext);
  if (!context) {
    throw new Error('useGeo must be used within a GeoProvider');
  }
  return context;
}
