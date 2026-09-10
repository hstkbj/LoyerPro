import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { visitService } from '../../services/visits/visitService';
import type { Property } from '../../types';
import { Calendar, CheckCircle2 } from 'lucide-react';

interface VisitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export function VisitRequestModal({ isOpen, onClose, property }: VisitRequestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) {
      setError('Veuillez renseigner votre nom, téléphone et la date souhaitée.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await visitService.requestVisit({
        property_id: property.id,
        owner_id: property.user_id,
        visitor_name: name.trim(),
        visitor_phone: phone.trim(),
        visitor_email: email.trim() || undefined,
        preferred_date: date,
        preferred_time: time,
        message: message.trim() || undefined,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Impossible d\'enregistrer votre demande. Réessayez.');
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
    setDate('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Planifier une visite"
      description={`Pour le bien : ${property.title} (${property.city})`}
      maxWidth="md"
    >
      {success ? (
        <div className="py-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Demande de visite transmise
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Votre demande a été envoyée au propriétaire. Il examinera votre créneau du <strong className="font-semibold">{date} à {time}</strong> et vous contactera au <strong>{phone}</strong>.
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
            placeholder="ex. Jean Dossou"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Numéro de Téléphone (WhatsApp de préférence)"
            required
            type="tel"
            placeholder="ex. +229 97 00 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            helperText="Le bailleur vous contactera sur ce numéro"
          />

          <Input
            label="Email (facultatif)"
            type="email"
            placeholder="jean.dossou@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date souhaitée"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Heure souhaitée
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="09:00">09h00</option>
                <option value="10:00">10h00</option>
                <option value="11:30">11h30</option>
                <option value="14:00">14h00</option>
                <option value="15:30">15h30</option>
                <option value="17:00">17h00</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Message / Précisions (facultatif)
            </label>
            <textarea
              rows={3}
              placeholder="Questions sur l'accessibilité, l'électricité ou vos disponibilités..."
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
              <Calendar className="mr-1.5 h-4 w-4" />
              Envoyer la demande
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
