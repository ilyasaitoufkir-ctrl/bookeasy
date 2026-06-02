import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Falsches Passwort');
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gold-gradient shadow-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-dark-900 font-bold text-xl font-serif">B</span>
          </div>
          <h1 className="text-white font-bold text-2xl font-serif">BookEasy Admin</h1>
          <p className="text-dark-300 text-sm mt-1">Passwort eingeben um fortzufahren</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-700 rounded-3xl p-8 border border-dark-600">
          <div className="mb-5">
            <label className="block text-dark-200 text-xs font-semibold uppercase tracking-widest mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="w-full bg-dark-800 border border-dark-500 rounded-2xl px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition"
              placeholder="••••••••"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gold-gradient text-dark-900 font-bold py-3 rounded-2xl hover:opacity-90 transition"
          >
            Einloggen
          </button>
        </form>
      </div>
    </div>
  );
}
