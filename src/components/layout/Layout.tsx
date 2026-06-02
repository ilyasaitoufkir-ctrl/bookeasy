import { type ReactNode } from 'react';
import { Header } from './Header';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed top-20 left-10 h-48 w-48 blob bg-rose-200/40 blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-10 h-64 w-64 blob bg-cream-300/60 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-2xl bg-rose-gradient shadow-rose flex items-center justify-center">
              <span className="text-white text-xl font-serif font-bold">B</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-mauve-900">BookEasy</h1>
            <p className="text-sm text-mauve-400 tracking-wide">Termine leicht gemacht</p>
          </div>
        </div>
        <div className="glass rounded-3xl shadow-rose-lg border border-white/60 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
