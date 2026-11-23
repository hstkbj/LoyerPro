// Validation de formulaires : fonctions pures, sans dépendance.
// Chaque validateur renvoie un message d'erreur en français, ou '' si la valeur est valide.

export type Errors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function required(value: string | undefined | null, label = 'Ce champ'): string {
  return (value ?? '').toString().trim() ? '' : `${label} est obligatoire.`;
}

export function email(value: string): string {
  const v = value.trim();
  if (!v) return "L'adresse e-mail est obligatoire.";
  if (v.length > 254 || !EMAIL_RE.test(v)) return "Saisissez une adresse e-mail valide (ex. nom@exemple.com).";
  return '';
}

// Accepte les formats internationaux : +229 97 00 00 00, 0022997000000, 97000000...
export function phone(value: string, optional = false): string {
  const v = value.trim();
  if (!v) return optional ? '' : 'Le numéro de téléphone est obligatoire.';
  if (!/^[+0-9\s().-]+$/.test(v)) return 'Le numéro ne doit contenir que des chiffres, espaces, + ou -.';
  const digits = v.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return 'Saisissez un numéro valide (8 à 15 chiffres).';
  return '';
}

export function minLength(value: string, min: number, label = 'Ce champ'): string {
  return value.trim().length >= min ? '' : `${label} doit contenir au moins ${min} caractères.`;
}

export function maxLength(value: string, max: number, label = 'Ce champ'): string {
  return value.length <= max ? '' : `${label} ne doit pas dépasser ${max} caractères.`;
}

export function fullName(value: string): string {
  const v = value.trim();
  if (!v) return 'Le nom complet est obligatoire.';
  if (v.length < 2) return 'Le nom est trop court.';
  if (v.length > 100) return 'Le nom est trop long.';
  return '';
}

export function password(value: string): string {
  if (!value) return 'Le mot de passe est obligatoire.';
  if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return 'Utilisez au moins une lettre et un chiffre.';
  return '';
}

export function positiveNumber(value: string | number, label = 'Ce montant'): string {
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (value === '' || Number.isNaN(n)) return `${label} est obligatoire.`;
  if (n <= 0) return `${label} doit être supérieur à 0.`;
  return '';
}

export function futureOrToday(value: string, label = 'La date'): string {
  if (!value) return `${label} est obligatoire.`;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return `${label} est invalide.`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today ? '' : `${label} ne peut pas être dans le passé.`;
}

// Retourne true si aucun champ n'a d'erreur.
export function isValid(errors: Errors): boolean {
  return Object.values(errors).every((e) => !e);
}

// Supprime les clés vides pour n'afficher que les vraies erreurs.
export function compact<T extends string>(errors: Errors<T>): Errors<T> {
  const out: Errors<T> = {};
  (Object.keys(errors) as T[]).forEach((k) => {
    if (errors[k]) out[k] = errors[k];
  });
  return out;
}
