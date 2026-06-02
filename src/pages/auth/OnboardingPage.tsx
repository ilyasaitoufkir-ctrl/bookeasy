import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { createBusiness } from '../../services/firebase/businesses';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_CATEGORIES } from '../../types';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.displayName || '',
    category: 'Friseur',
    description: '',
    phone: '',
    address: '',
    city: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createBusiness(user.uid, { ...form, email: user.email || '' });
      toast.success('Einrichtung erstellt!');
      navigate('/dashboard');
    } catch {
      toast.error('Fehler beim Erstellen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-navy-700 text-white text-xl font-bold items-center justify-center mb-3">B</div>
          <h1 className="text-2xl font-bold text-navy-700">Einrichtung einrichten</h1>
          <p className="text-sm text-gray-500 mt-1">Nur noch ein paar Details – dauert 2 Minuten</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name der Einrichtung"
              value={form.name}
              onChange={set('name')}
              leftIcon={<Building2 size={16} />}
              placeholder="z.B. Friseur Max"
              required
            />
            <Select
              label="Kategorie"
              value={form.category}
              onChange={set('category')}
              options={BUSINESS_CATEGORIES.map(c => ({ value: c, label: c }))}
            />
            <Input
              label="Kurze Beschreibung"
              value={form.description}
              onChange={set('description')}
              leftIcon={<Tag size={16} />}
              placeholder="z.B. Ihr Friseur im Herzen von München"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Telefon"
                value={form.phone}
                onChange={set('phone')}
                leftIcon={<Phone size={16} />}
                placeholder="+49 89 123456"
              />
              <Input
                label="Stadt"
                value={form.city}
                onChange={set('city')}
                leftIcon={<MapPin size={16} />}
                placeholder="München"
                required
              />
            </div>
            <Input
              label="Adresse"
              value={form.address}
              onChange={set('address')}
              leftIcon={<MapPin size={16} />}
              placeholder="Musterstraße 1"
            />
            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Einrichtung erstellen
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
