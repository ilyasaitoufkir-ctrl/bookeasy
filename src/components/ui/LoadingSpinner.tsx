import { cn } from '../../utils/helpers';

export function LoadingSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg className={cn('animate-spin text-rose-400', sizes[size])} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <div className="text-center">
        <div className="h-12 w-12 rounded-2xl bg-rose-gradient shadow-rose flex items-center justify-center mx-auto mb-5">
          <span className="text-white font-bold text-lg font-serif">B</span>
        </div>
        <LoadingSpinner size="md" />
        <p className="mt-3 text-sm text-mauve-300 font-light">Lädt…</p>
      </div>
    </div>
  );
}
