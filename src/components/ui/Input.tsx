import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-mauve-600 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-2xl border border-cream-300 bg-white px-4 py-3 text-sm text-mauve-900',
              'placeholder:text-rose-300 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400',
              'disabled:bg-cream-100 disabled:text-mauve-400',
              error && 'border-red-300 focus:ring-red-300/40',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-mauve-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, className, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={inputId} className="text-xs font-medium text-mauve-600 uppercase tracking-wider">{label}</label>}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-2xl border border-cream-300 bg-white px-4 py-3 text-sm text-mauve-900',
            'focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400',
            error && 'border-red-300',
            className,
          )}
          {...props}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={inputId} className="text-xs font-medium text-mauve-600 uppercase tracking-wider">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-2xl border border-cream-300 bg-white px-4 py-3 text-sm text-mauve-900 resize-none',
            'placeholder:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400',
            error && 'border-red-300',
            className,
          )}
          rows={3}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
