// Protection anti-spam côté navigateur, en trois couches :
//  1. Honeypot : un champ caché que seuls les robots remplissent.
//  2. Délai minimum : un humain met plus de quelques secondes à remplir un formulaire.
//  3. Limitation de fréquence par formulaire (stockée dans localStorage).
// Le serveur applique en plus sa propre limitation par IP (voir server/app.ts).

export const HONEYPOT_FIELD = 'website_url';
const MIN_FILL_MS = 2500;

export interface SpamGuard {
  /** À appeler à l'affichage du formulaire. */
  startedAt: number;
}

export function createSpamGuard(): SpamGuard {
  return { startedAt: Date.now() };
}

export interface SpamCheckInput {
  guard: SpamGuard;
  honeypotValue: string;
  formKey: string;
  maxPerWindow?: number;
  windowMs?: number;
}

export interface SpamCheckResult {
  ok: boolean;
  /** Message affiché à l'utilisateur. Vide quand le blocage doit rester silencieux (robot). */
  message: string;
  /** true si l'envoi doit sembler réussi sans rien envoyer (robot détecté). */
  silent: boolean;
}

function readTimestamps(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function writeTimestamps(key: string, values: number[]) {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // stockage indisponible (navigation privée...) : on n'empêche pas l'envoi
  }
}

export function checkSpam({ guard, honeypotValue, formKey, maxPerWindow = 3, windowMs = 10 * 60 * 1000 }: SpamCheckInput): SpamCheckResult {
  if (honeypotValue.trim() !== '') {
    return { ok: false, message: '', silent: true };
  }

  if (Date.now() - guard.startedAt < MIN_FILL_MS) {
    return { ok: false, message: 'Veuillez patienter quelques secondes avant d\'envoyer le formulaire.', silent: false };
  }

  const storageKey = `loyerpro_form_${formKey}`;
  const now = Date.now();
  const recent = readTimestamps(storageKey).filter((t) => now - t < windowMs);
  if (recent.length >= maxPerWindow) {
    const waitMin = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 60000));
    return {
      ok: false,
      message: `Trop d'envois en peu de temps. Réessayez dans ${waitMin} minute${waitMin > 1 ? 's' : ''}.`,
      silent: false,
    };
  }

  return { ok: true, message: '', silent: false };
}

export function recordSubmission(formKey: string, windowMs = 10 * 60 * 1000) {
  const storageKey = `loyerpro_form_${formKey}`;
  const now = Date.now();
  const recent = readTimestamps(storageKey).filter((t) => now - t < windowMs);
  recent.push(now);
  writeTimestamps(storageKey, recent);
}
