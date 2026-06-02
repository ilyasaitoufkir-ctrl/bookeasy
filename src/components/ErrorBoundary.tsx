import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props  { children: ReactNode }
interface State  { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[BookEasy] Unhandled error:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isFirebaseAuth = error.message.includes('Firebase') || error.message.includes('auth');
    const isConfigError  = error.message.includes('API key') || error.message.includes('apiKey') || error.message.includes('projectId');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {isConfigError ? 'Firebase nicht konfiguriert' : 'Etwas ist schiefgelaufen'}
          </h1>

          {isConfigError || isFirebaseAuth ? (
            <div className="text-left mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Die Firebase Environment Variables fehlen. Bitte in Vercel eintragen:
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-xs font-mono space-y-1 text-gray-700 border border-gray-200">
                {[
                  'VITE_FIREBASE_API_KEY',
                  'VITE_FIREBASE_AUTH_DOMAIN',
                  'VITE_FIREBASE_PROJECT_ID',
                  'VITE_FIREBASE_STORAGE_BUCKET',
                  'VITE_FIREBASE_MESSAGING_SENDER_ID',
                  'VITE_FIREBASE_APP_ID',
                ].map(k => <div key={k} className="text-blue-700">{k}</div>)}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Vercel → Dein Projekt → Settings → Environment Variables
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2 mb-4 text-left bg-gray-50 rounded-xl p-3 font-mono break-all">
              {error.message}
            </p>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-2.5 rounded-xl bg-navy-700 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }
}
