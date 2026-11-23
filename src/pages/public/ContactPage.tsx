import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { useGeo } from '../../contexts/GeoContext';
import { Input } from '../../components/ui/Input';
import { Honeypot } from '../../components/ui/Honeypot';
import { Seo } from '../../components/seo/Seo';
import { SITE, whatsappLink } from '../../lib/site';
import { HONEYPOT_FIELD, checkSpam, createSpamGuard, recordSubmission } from '../../lib/antiSpam';
import * as v from '../../lib/validation';

type UserType = 'locataire' | 'proprietaire' | 'agence' | 'autre';
type FieldName = 'fullName' | 'email' | 'phone' | 'subject' | 'message';

const USER_TYPES: { value: UserType; label: string }[] = [
  { value: 'locataire', label: 'Locataire' },
  { value: 'proprietaire', label: 'Bailleur' },
  { value: 'agence', label: 'Agence' },
  { value: 'autre', label: 'Autre' },
];

const MESSAGE_MAX = 3000;

export function ContactPage() {
  const { currentCountry, availableCountries } = useGeo();

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [userType, setUserType] = useState<UserType>('locataire');
  const [country, setCountry] = useState(currentCountry.name);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<v.Errors<FieldName>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [ticket, setTicket] = useState<string | null>(null);

  // Mesuré à l'affichage : un robot remplit le formulaire en quelques millisecondes.
  const guard = useMemo(() => createSpamGuard(), []);
  const wa = whatsappLink('Bonjour, j’ai une question sur LoyerPro.');

  const validate = (values = form): v.Errors<FieldName> =>
    v.compact<FieldName>({
      fullName: v.fullName(values.fullName),
      email: v.email(values.email),
      phone: v.phone(values.phone),
      subject: v.minLength(values.subject, 3, "L'objet") || v.maxLength(values.subject, 150, "L'objet"),
      message: v.minLength(values.message, 10, 'Le message') || v.maxLength(values.message, MESSAGE_MAX, 'Le message'),
    });

  const setField = (name: FieldName, value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) setErrors(validate(next));
  };

  const blurField = (name: FieldName) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const found = validate();
    setErrors(found);
    setTouched({ fullName: true, email: true, phone: true, subject: true, message: true });
    if (!v.isValid(found)) {
      const first = (Object.keys(found) as FieldName[])[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    const spam = checkSpam({ guard, honeypotValue: honeypot, formKey: 'contact' });
    if (!spam.ok) {
      if (spam.silent) {
        // Robot : on simule un succès sans rien envoyer.
        setTicket('LP-' + Math.floor(100000 + Math.random() * 900000));
      } else {
        setServerError(spam.message);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userType, country, [HONEYPOT_FIELD]: honeypot }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        recordSubmission('contact');
        setTicket(data.ticket);
        return;
      }
      if (res.status === 400 && data?.fields) {
        setErrors(data.fields);
        setServerError('Certains champs sont à corriger.');
        return;
      }
      setServerError(
        data?.error || `Le message n'a pas pu être envoyé. Écrivez-nous à ${SITE.supportEmail}.`
      );
    } catch {
      setServerError(`Connexion impossible. Vérifiez votre réseau ou écrivez-nous à ${SITE.supportEmail}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    setErrors({});
    setTouched({});
    setTicket(null);
    setServerError('');
  };

  return (
    <>
      <Seo
        title="Contact"
        description="Une question sur un logement, la vérification de votre compte bailleur ou la gestion de vos quittances ? Écrivez à l'équipe LoyerPro."
        path="/contact"
      />

      <section className="border-b border-slate-200 bg-sand-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">Contact</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-5xl">Comment pouvons-nous vous aider ?</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Une question sur une annonce, la vérification d'un compte bailleur ou vos quittances ? Écrivez-nous, nous
            vous répondons par e-mail.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          {ticket ? (
            <div className="py-8 text-center" role="status">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-slate-900">Message envoyé</h2>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                Merci, nous avons bien reçu votre demande. Référence :{' '}
                <strong className="font-mono text-slate-900">{ticket}</strong>. Nous vous répondrons à l'adresse que
                vous avez indiquée.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="relative space-y-5">
              <Honeypot value={honeypot} onChange={setHoneypot} />

              <fieldset>
                <legend className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">Vous êtes</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {USER_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 ${
                        userType === t.value
                          ? 'border-brand-700 bg-brand-700 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={t.value}
                        checked={userType === t.value}
                        onChange={() => setUserType(t.value)}
                        className="sr-only"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="contact-fullName"
                  name="fullName"
                  label="Nom et prénom"
                  autoComplete="name"
                  placeholder="Ex. Jean Kouassi"
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  onBlur={() => blurField('fullName')}
                  error={touched.fullName ? errors.fullName : undefined}
                  required
                />
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  label="Adresse e-mail"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="jean@exemple.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  onBlur={() => blurField('email')}
                  error={touched.email ? errors.email : undefined}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  label="Téléphone ou WhatsApp"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+229 97 00 00 00"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  onBlur={() => blurField('phone')}
                  error={touched.phone ? errors.phone : undefined}
                  required
                />
                <div className="space-y-1.5 text-left">
                  <label htmlFor="contact-country" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Pays de résidence
                  </label>
                  <select
                    id="contact-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
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
                id="contact-subject"
                name="subject"
                label="Objet"
                placeholder="Ex. Question sur la vérification de mon compte"
                value={form.subject}
                onChange={(e) => setField('subject', e.target.value)}
                onBlur={() => blurField('subject')}
                error={touched.subject ? errors.subject : undefined}
                maxLength={150}
                required
              />

              <div className="space-y-1.5 text-left">
                <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Votre message<span className="ml-1 text-rose-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  required
                  maxLength={MESSAGE_MAX}
                  placeholder="Décrivez votre question ou votre besoin…"
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                  onBlur={() => blurField('message')}
                  aria-invalid={touched.message && errors.message ? true : undefined}
                  aria-describedby="contact-message-help"
                  className={`w-full rounded-lg border bg-white p-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    touched.message && errors.message
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/20'
                  }`}
                />
                <div id="contact-message-help" className="flex justify-between text-xs">
                  {touched.message && errors.message ? (
                    <p role="alert" className="font-medium text-rose-600">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-slate-400">{form.message.length}/{MESSAGE_MAX}</span>
                </div>
              </div>

              {serverError && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
                </button>
                <p className="text-xs text-slate-500">
                  En envoyant ce formulaire, vous acceptez notre{' '}
                  <Link to="/politique-de-confidentialite" className="font-semibold text-brand-700 underline underline-offset-2">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-bold text-slate-900">Nous joindre directement</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <a href={`mailto:${SITE.supportEmail}`} className="flex items-center gap-3 font-semibold text-slate-800 hover:text-brand-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {SITE.supportEmail}
                </a>
              </li>
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-semibold text-slate-800 hover:text-brand-700">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    Écrire sur WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-3xl bg-sand-100 p-6">
            <h2 className="font-display text-xl font-bold text-slate-900">Avant de nous écrire</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-slate-900">Les locataires paient-ils des frais ?</dt>
                <dd className="mt-1 text-slate-600">Non. Chercher un logement et contacter un bailleur est gratuit.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Comment se vérifie un bailleur ?</dt>
                <dd className="mt-1 text-slate-600">
                  Il envoie une pièce d'identité à l'inscription, que notre équipe examine.{' '}
                  <Link to="/about#verification" className="font-semibold text-brand-700 underline underline-offset-2">En savoir plus</Link>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Quels moyens de paiement ?</dt>
                <dd className="mt-1 text-slate-600">Mobile Money et cartes bancaires pour les abonnements, via FedaPay.</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>
    </>
  );
}
