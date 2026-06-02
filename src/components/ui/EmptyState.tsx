import { type ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-5 text-rose-300 opacity-60">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-mauve-700">{title}</h3>
      {description && <p className="mt-2 text-sm text-mauve-400 max-w-sm leading-relaxed">{description}</p>}
      {action && (
        <Button className="mt-7" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
