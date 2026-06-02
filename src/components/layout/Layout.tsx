import { type ReactNode } from 'react';
import { Header } from './Header';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-navy-700 text-white text-xl font-bold mb-3">
            B
          </div>
          <h1 className="text-2xl font-bold text-navy-700">BookEasy</h1>
          <p className="text-sm text-gray-500 mt-1">Termine leicht gemacht</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
