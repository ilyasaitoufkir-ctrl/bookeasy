import { type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'rose';
}

const variants = {
  default: 'bg-cream-200 text-mauve-700',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger:  'bg-red-50 text-red-600 border border-red-200',
  info:    'bg-blue-50 text-blue-700 border border-blue-200',
  rose:    'bg-rose-100 text-rose-700 border border-rose-200',
};

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  );
}
