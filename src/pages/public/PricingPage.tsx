import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Check, ShieldCheck, CreditCard, Smartphone, HelpCircle, Globe, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGeo } from '../../contexts/GeoContext';
import { getPricingPlansList } from '../../services/currency/currencyService';
import { LocationSelectorModal } from '../../components/layout/LocationSelectorModal';

export function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentCountry, currentCurrency } = useGeo();
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const plans = getPricingPlansList(currentCurrency);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate(`/auth/register?plan=${planId}`);
    } else {
      navigate(`/dashboard/settings?tab=subscription&selectedPlan=${planId}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setLocationModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Devise calculée pour : <strong>{currentCountry.flag} {currentCountry.name}</strong></span>
            <span className="text-emerald-700 font-bold">({currentCurrency})</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Des forfaits transparents, adaptés à votre monnaie
        </h1>
        <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Gestion de chambres, appartements et immeubles sans coûts cachés. Choisissez la formule correspondant à votre portefeuille de biens.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isPro = plan.highlight;
          return (
            <div
              key={plan.id}
              className={`flex flex-col justify-between rounded-3xl p-6 sm:p-8 bg-white border transition-all ${
                isPro
                  ? 'border-slate-900 shadow-xl ring-2 ring-slate-900 relative'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {isPro && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                  Formule Recommandée
                </span>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px] leading-relaxed">{plan.description}</p>
                </div>

                <div className="pt-2 pb-5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {plan.formattedPrice}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-slate-500 font-medium">/ {plan.period}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-2 border border-emerald-200">
                    Capacité : {plan.max_properties > 1000 ? 'Biens & Chambres illimités' : `Jusqu'à ${plan.max_properties} logements`}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 text-xs text-slate-600">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={isPro ? 'primary' : 'outline'}
                  size="lg"
                  className={`w-full font-bold text-xs ${
                    isPro ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''
                  }`}
                >
                  {plan.price === 0 ? 'Commencer Gratuitement' : 'Choisir ce forfait'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Security & Methods */}
      <div className="rounded-2xl bg-slate-900 text-white p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            Moyens de paiement acceptés
          </div>
          <h4 className="text-base font-bold">Règlement direct dans votre monnaie ({currentCurrency})</h4>
          <p className="text-xs text-slate-400">
            {currentCurrency === 'XOF' || currentCurrency === 'XAF'
              ? 'Mobile Money (Wave, Orange Money, MTN MoMo, Moov Money) et Cartes Bancaires Visa / Mastercard.'
              : 'Cartes de crédit Visa, Mastercard, Apple Pay, Google Pay et virements bancaires internationaux.'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs font-semibold">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span>Mobile Money</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs font-semibold">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <span>Cartes CB</span>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
