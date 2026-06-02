import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { signIn, resetPassword } from '../../services/firebase/auth';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Willkommen zurück!');
      // redirect based on role is handled by App.tsx effect
    } catch (err: unknown) {
      const msg = (err as { code?: string }).code;
      toast.error(msg === 'auth/invalid-credential' ? 'E-Mail oder Passwort falsch.' : 'Fehler beim Anmelden.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Passwort-Reset E-Mail gesendet!');
      setResetMode(false);
    } catch {
      toast.error('Fehler beim Senden der E-Mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {!resetMode ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Willkommen zurück</h2>
          <p className="text-sm text-gray-500 mb-6">Meld dich an um fortzufahren</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              placeholder="name@example.de"
              required
            />
            <Input
              label="Passwort"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              placeholder="••••••••"
              required
            />
            <div className="flex justify-end">
              <button type="button" onClick={() => setResetMode(true)} className="text-xs text-navy-600 hover:underline">
                Passwort vergessen?
              </button>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">Anmelden</Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Noch kein Konto?{' '}
            <Link to="/register" className="text-navy-700 font-medium hover:underline">Jetzt registrieren</Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Passwort zurücksetzen</h2>
          <p className="text-sm text-gray-500 mb-6">Gib deine E-Mail ein und wir senden dir einen Link.</p>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              placeholder="name@example.de"
              required
            />
            <Button type="submit" loading={loading} className="w-full">Link senden</Button>
          </form>
          <button onClick={() => setResetMode(false)} className="mt-4 text-sm text-navy-600 hover:underline w-full text-center">
            Zurück zum Login
          </button>
        </>
      )}
    </AuthLayout>
  );
}
