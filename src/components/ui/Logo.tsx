import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  /** Texte clair, pour fond sombre. */
  light?: boolean;
  showText?: boolean;
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="LoyerPro" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#lp-g)" />
      <path d="M32 13 L50 28 V49 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 V28 Z" fill="#fff" />
      <path d="M27 51 V35 a5 5 0 0 1 10 0 V51 Z" fill="#0f766e" />
    </svg>
  );
}

export function Logo({ className, light = false, showText = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9 shrink-0" />
      {showText && (
        <span className={cn('font-display text-xl font-bold tracking-tight', light ? 'text-white' : 'text-slate-900')}>
          Loyer<span className={light ? 'text-brand-300' : 'text-brand-600'}>Pro</span>
        </span>
      )}
    </span>
  );
}
