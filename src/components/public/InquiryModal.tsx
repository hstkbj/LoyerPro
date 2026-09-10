import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { inquiryService } from '../../services/inquiries/inquiryService';
import type { Property } from '../../types';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export function InquiryModal({ isOpen, onClose, property }: InquiryModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Veuillez renseigner votre nom, téléphone et votre message.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await inquiryService.submitInquiry({
        property_id: property.id,
        owner_id: property.user_id,
        visitor_name: name.trim(),
        visitor_phone: phone.trim(),
        visitor_email: email.trim() || undefined,
        message: message.trim(),
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Impossible d\'envoyer votre question. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError('');
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Demander des renseignements"
      description={`Bien : ${property.title} à ${property.city}`}
      maxWidth="md"
    >
      {success ? (
        <div className="py-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Message envoyé au bailleur
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Votre demande a été enregistrée avec succès. Le gestionnaire de ce bien vous répondra directement par appel ou WhatsApp au <strong>{phone}</strong>.
          </p>
          <div className="pt-3">
            <Button onClick={handleResetAndClose} variant="primary" className="w-full">
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="Votre Nom complet"
            required
            placeholder="ex. Michel Sognon"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Téléphone (WhatsApp)"
            required
            type="tel"
            placeholder="ex. +229 95 00 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Email (facultatif)"
            type="email"
            placeholder="michel@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Votre question ou demande <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Bonjour, je souhaiterais savoir si le bien est toujours libre et quel est le montant total de la caution..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleResetAndClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Envoyer la question
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
