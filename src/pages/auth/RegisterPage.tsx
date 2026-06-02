import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Building2 } from 'lucide-react';
import { AuthLayout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { registerUser } from '../../services/firebase/auth';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = (params.get('role') as UserRole) || 'customer';

  const [role, setRole]           = useState<UserRole>(defaultRole);
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) { toast.error('Passwörter stimmen nicht überein.'); return; }
    if (password.length < 6)    { toast.error('Passwort muss min. 6 Zeichen lang sein.'); return; }

    setLoading(true);
    try {
      await registerUser(email, password, name, role);
      toast.success('Konto erstellt! Bitte E-Mail bestätigen.');
      navigate(role === 'business' ? '/onboarding' : '/search');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      toast.error(code === 'auth/email-already-in-use' ? 'E-Mail bereits vergeben.' : 'Fehler beim Registrieren.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Konto erstellen</h2>
      <p className="text-sm text-gray-500 mb-6">Wähle dein Kontotyp</p>

      {/* Role selector */}
      <div className="flex gap-3 mb-6">
        {([
          { value: 'business' as UserRole, label: 'Einrichtung', icon: <Building2 size={18} />, desc: 'Ich biete Dienstleistungen an' },
          { value: 'customer' as UserRole, label: 'Kunde',        icon: <User size={18} />,      desc: 'Ich möchte Termine buchen' },
        ]).map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
              role === r.value
                ? 'border-navy-700 bg-navy-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`flex items-center gap-1.5 font-medium text-sm mb-0.5 ${role === r.value ? 'text-navy-700' : 'text-gray-700'}`}>
              {r.icon} {r.label}
            </div>
            <p className="text-xs text-gray-500">{r.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          leftIcon={role === 'business' ? <Building2 size={16} /> : <User size={16} />}
          placeholder={role === 'business' ? 'Friseur Max' : 'Max Mustermann'}
          required
        />
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
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          placeholder="Mindestens 6 Zeichen"
          required
        />
        <Input
          label="Passwort bestätigen"
          type="password"
          value={password2}
          onChange={e => setPassword2(e.target.value)}
          leftIcon={<Lock size={16} />}
          placeholder="Passwort wiederholen"
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {role === 'business' ? 'Einrichtung registrieren' : 'Konto erstellen'}
        </Button>
      </form>

      <p className="mt-4 text-xs text-center text-gray-400">
        Mit der Registrierung stimmst du unseren{' '}
        <a href="#" className="text-navy-600 hover:underline">AGB</a> und der{' '}
        <a href="#" className="text-navy-600 hover:underline">Datenschutzerklärung</a> zu.
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        Schon ein Konto?{' '}
        <Link to="/login" className="text-navy-700 font-medium hover:underline">Anmelden</Link>
      </p>
    </AuthLayout>
  );
}
