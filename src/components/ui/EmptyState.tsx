import React from 'react';
import { LucideIcon, PlusCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 mb-4">
        {Icon ? <Icon className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="max-w-md text-sm text-slate-500 mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary" size="md">
            <PlusCircle className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
