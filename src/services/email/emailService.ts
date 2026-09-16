// LoyerPro - Service d'envoi d'emails transactionnels
// Le client n'envoie jamais d'email directement (pas de secrets SMTP côté
// navigateur) : il appelle l'API serveur /api/email/send qui gère le SMTP
// (voir server.ts). Si le SMTP n'est pas configuré, le serveur simule
// l'envoi et journalise dans la table email_logs — l'application continue
// de fonctionner normalement dans tous les cas.

export type EmailTemplate =
  | 'welcome'
  | 'account_verified'
  | 'account_rejected'
  | 'subscription_confirmed'
  | 'new_inquiry'
  | 'new_visit_request';

interface SendEmailResult {
  sent: boolean;
  simulated?: boolean;
  notice?: string;
  error?: string;
}

async function sendEmail(to: string | undefined | null, template: EmailTemplate, params: Record<string, any>): Promise<SendEmailResult> {
  if (!to) return { sent: false, error: 'Destinataire manquant' };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, template, params }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      return {
        sent: false,
        simulated: true,
        notice: `Le serveur d'email a répondu en mode texte/HTML (HTTP ${res.status}). Envoi simulé.`,
        error: res.ok ? undefined : `HTTP ${res.status}: ${text.slice(0, 120)}`,
      };
    }

    const data = await res.json();
    if (!res.ok) return { sent: false, error: data?.error || 'Erreur inconnue' };
    return data as SendEmailResult;
  } catch (err: any) {
    // Ne jamais bloquer un flux métier (inscription, paiement...) si l'email échoue
    const msg = err?.name === 'AbortError'
      ? "Délai d'attente dépassé (6s) pour l'API d'email"
      : err?.message || 'Erreur réseau';
    console.warn('[emailService] Notice envoi email:', msg);
    return { sent: false, simulated: true, error: msg };
  }
}

export const emailService = {
  sendWelcome(to: string, params: { fullName: string; role: string; planName?: string }) {
    return sendEmail(to, 'welcome', params);
  },
  sendAccountVerified(to: string, params: { fullName: string }) {
    return sendEmail(to, 'account_verified', params);
  },
  sendAccountRejected(to: string, params: { fullName: string; reason?: string }) {
    return sendEmail(to, 'account_rejected', params);
  },
  sendSubscriptionConfirmed(to: string, params: { fullName: string; planName: string; amount: number; currency: string; interval: string; transactionId?: string }) {
    return sendEmail(to, 'subscription_confirmed', params);
  },
  sendNewInquiry(to: string, params: { ownerName: string; propertyTitle: string; visitorName: string; visitorPhone: string; message: string }) {
    return sendEmail(to, 'new_inquiry', params);
  },
  sendNewVisitRequest(to: string, params: { ownerName: string; propertyTitle: string; visitorName: string; visitorPhone: string; preferredDate: string; preferredTime: string }) {
    return sendEmail(to, 'new_visit_request', params);
  },
};
