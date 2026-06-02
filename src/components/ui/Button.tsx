import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

const variants = {
  primary:   'bg-rose-gradient text-white shadow-rose hover:shadow-rose-lg hover:-translate-y-px active:translate-y-0',
  secondary: 'bg-cream-200 text-mauve-700 hover:bg-cream-300 active:bg-cream-400',
  outline:   'border border-rose-400 text-rose-700 hover:bg-rose-50 active:bg-rose-100',
  ghost:     'text-mauve-600 hover:bg-cream-200 active:bg-cream-300',
  danger:    'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  gold:      'bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-rose hover:shadow-rose-lg hover:-translate-y-px',
};

const sizes = {
  sm:  'px-3.5 py-1.5 text-xs rounded-full',
  md:  'px-5 py-2.5 text-sm rounded-full',
  lg:  'px-7 py-3 text-sm rounded-full',
  xl:  'px-9 py-4 text-base rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
