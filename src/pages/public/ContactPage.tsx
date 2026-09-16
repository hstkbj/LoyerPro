import React, { useState } from 'react';
import { useGeo } from '../../contexts/GeoContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
  HelpCircle,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export function ContactPage() {
  const { currentCountry, currentCurrency, availableCountries } = useGeo();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'locataire' | 'proprietaire' | 'agence' | 'autre'>('locataire');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [country, setCountry] = useState(currentCountry.name);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = 'LP-' + Math.floor(100000 + Math.random() * 900000);
      setSubmittedTicket(ticketId);
    }, 800);
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    setSubmittedTicket(null);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Header */}
      <section className="bg-slate-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Assistance & Support Client
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Une question sur un logement, la certification de votre compte bailleur ou la gestion de vos quittances ?
            Notre équipe vous répond rapidement 7j/7.
          </p>
        </div>
      </section>

      {/* 2. Direct Channels (WhatsApp, Email, Telephones) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Messagerie Directe
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Assistance WhatsApp</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Échangez en direct avec nos conseillers pour toute question urgente ou vérification de dossier.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/2250700000000?text=Bonjour%20LoyerPro,%20je%20souhaite%20des%20informations"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Discuter sur WhatsApp</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Email Support */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Courrier Électronique
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">support@loyerpro.com</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Pour vos demandes de partenariats institutionnels, facturation ou questions contractuelles.
                </p>
              </div>
            </div>
            <a
              href="mailto:support@loyerpro.com"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              <span>Envoyer un email</span>
              <Mail className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Horaires & SLA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Disponibilité & SLA
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">7j/7 de 08h à 20h</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Délai moyen de réponse : moins de 2 heures. Audit des pièces d'identité validé sous 24h ouvrées.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Équipe de modération active</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Form & FAQ Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            {submittedTicket ? (
              <div className="py-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Message envoyé avec succès !</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Votre demande a bien été enregistrée sous le ticket référence{' '}
                  <strong className="font-mono text-slate-900">{submittedTicket}</strong>. Un conseiller vous répondra
                  par email ou WhatsApp sous 2 heures.
                </p>
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={handleReset} className="font-bold">
                    Envoyer un autre message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Envoyez-nous un message</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Remplissez ce formulaire et notre équipe prendra directement contact avec vous.
                  </p>
                </div>

                {/* Profile Type Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Vous êtes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setUserType('locataire')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                        userType === 'locataire'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Locataire
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('proprietaire')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                        userType === 'proprietaire'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Bailleur
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('agence')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                        userType === 'agence'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Agence
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('autre')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                        userType === 'autre'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Partenaire
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nom & Prénom"
                    placeholder="Ex: Jean Kouassi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />

                  <Input
                    label="Adresse Email"
                    type="email"
                    placeholder="jean@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Numéro WhatsApp / Téléphone"
                    placeholder="+225 07 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Pays de résidence
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      {availableCountries.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Objet de votre demande"
                  placeholder="Ex: Demande de renseignement sur une colocation, aide à la vérification CNI..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Votre Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Précisez ici votre question ou votre besoin..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto font-bold bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer ma demande
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right FAQ & Presence: 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* FAQ Accordion-like cards */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Questions fréquentes</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <h4 className="font-bold text-slate-900">
                    Comment se passe la vérification d'identité (CNI) ?
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Les propriétaires téléversent leur CNI ou passeport lors de l'inscription. Notre équipe de conformité vérifie
                    les documents sous 24h avant d'attribuer le badge vert de confiance.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <h4 className="font-bold text-slate-900">
                    Les locataires paient-ils des frais d'agence ?
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    La consultation des annonces et la prise de contact directe avec les bailleurs sont 100% gratuites pour les locataires.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <h4 className="font-bold text-slate-900">
                    Quels moyens de paiement sont acceptés ?
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Mobile Money (Wave, Orange Money, MTN, Moov) dans la zone FCFA, ainsi que cartes bancaires (Visa, Mastercard) et virements à l'international.
                  </p>
                </div>
              </div>
            </div>

            {/* Regional Hubs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-slate-700" />
                <h3 className="font-extrabold text-slate-900 text-sm">Pôles & Représentations</h3>
              </div>
              <p className="text-xs text-slate-500">
                Nos équipes locales coordonnent les audits documentaires dans chaque capitale :
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block">🇨🇮 Abidjan</span>
                  <span className="text-[11px] text-slate-500">Cocody & Plateau</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block">🇸🇳 Dakar</span>
                  <span className="text-[11px] text-slate-500">Almadies & Plateau</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block">🇧🇯 Cotonou</span>
                  <span className="text-[11px] text-slate-500">Haie Vive & Cadjèhoun</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block">🇨🇲 Douala</span>
                  <span className="text-[11px] text-slate-500">Bonanjo & Akwa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
