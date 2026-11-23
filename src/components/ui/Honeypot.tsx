import React from 'react';
import { HONEYPOT_FIELD } from '../../lib/antiSpam';

interface HoneypotProps {
  value: string;
  onChange: (value: string) => void;
}

// Champ invisible pour les humains (hors écran, ignoré par les lecteurs d'écran
// et l'auto-remplissage). Un robot qui remplit tous les champs le révélera.
export function Honeypot({ value, onChange }: HoneypotProps) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
      <label htmlFor={HONEYPOT_FIELD}>Ne pas remplir ce champ</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
