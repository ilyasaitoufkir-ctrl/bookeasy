import { useEffect, useState, useRef } from 'react';
import { Upload, Globe, CreditCard, Clock } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useBusiness } from '../../hooks/useBusiness';
import { updateBusiness, uploadBusinessLogo } from '../../services/firebase/businesses';
import { useTheme } from '../../context/ThemeContext';
import { BUSINESS_CATEGORIES, DAY_NAMES, PLAN_LIMITS, type OpeningHours } from '../../types';

import toast from 'react-hot-toast';

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

export default function SettingsPage() {
  const { business, setBusiness, loading } = useBusiness();
  const { setTheme } = useTheme();
  const [form, setForm]     = useState<Partial<typeof business>>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (business) setForm({ ...business });
  }, [business]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    try {
      await updateBusiness(business.id, form as typeof business);
      setBusiness({ ...business, ...form } as typeof business);
      setTheme(form.primaryColor || '#1e3a5f', form.secondaryColor || '#3068bc', form.name || 'BookEasy', form.logo);
      toast.success('Einstellungen gespeichert');
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!business || !e.target.files?.[0]) return;
    try {
      const url = await uploadBusinessLogo(business.id, e.target.files[0]);
      set('logo', url);
      toast.success('Logo hochgeladen');
    } catch {
      toast.error('Fehler beim Hochladen');
    }
  };

  const setHours = (day: keyof OpeningHours, field: string, value: unknown) => {
    set('openingHours', {
      ...(form.openingHours || business?.openingHours),
      [day]: { ...(form.openingHours?.[day] || business?.openingHours?.[day]), [field]: value },
    });
  };

  if (loading) return <Layout><LoadingSpinner className="py-20" size="lg" /></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>

        {/* Profil */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Profil</h2></CardHeader>
          <CardBody className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-navy-100 flex items-center justify-center overflow-hidden">
                {form.logo
                  ? <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
                  : <span className="text-navy-700 font-bold text-xl">{(form.name || 'B')[0]}</span>
                }
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload size={14} /> Logo hochladen
                </Button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG oder SVG · max. 2 MB</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
            <Input label="Name" value={form.name || ''} onChange={e => set('name', e.target.value)} />
            <Select
              label="Kategorie"
              value={form.category || ''}
              onChange={e => set('category', e.target.value)}
              options={BUSINESS_CATEGORIES.map(c => ({ value: c, label: c }))}
            />
            <Textarea
              label="Beschreibung"
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Kurze Beschreibung deiner Einrichtung..."
              className="h-20"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Telefon" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
              <Input label="Stadt" value={form.city || ''} onChange={e => set('city', e.target.value)} />
            </div>
            <Input label="Adresse" value={form.address || ''} onChange={e => set('address', e.target.value)} />
          </CardBody>
        </Card>

        {/* White Label */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-navy-600" />
              <h2 className="font-semibold text-gray-900">Branding & White Label</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Deine Buchungs-URL</p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-sm">
                <Globe size={14} className="text-gray-400" />
                <span className="text-gray-500">bookeasy.app/</span>
                <span className="font-medium text-navy-700">{business?.slug}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Hauptfarbe</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor || '#1e3a5f'}
                    onChange={e => set('primaryColor', e.target.value)}
                    className="h-10 w-10 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-sm text-gray-500 font-mono">{form.primaryColor || '#1e3a5f'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Akzentfarbe</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.secondaryColor || '#3068bc'}
                    onChange={e => set('secondaryColor', e.target.value)}
                    className="h-10 w-10 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-sm text-gray-500 font-mono">{form.secondaryColor || '#3068bc'}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Öffnungszeiten */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-navy-600" />
              <h2 className="font-semibold text-gray-900">Öffnungszeiten</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {(Object.keys(DAY_NAMES) as (keyof OpeningHours)[]).map(day => {
              const hours = form.openingHours?.[day] || business?.openingHours?.[day];
              if (!hours) return null;
              return (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-700">{DAY_NAMES[day]}</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={e => setHours(day, 'isOpen', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-navy-700" />
                  </label>
                  {hours.isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={hours.start}
                        onChange={e => setHours(day, 'start', e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-navy-500"
                      >
                        {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-gray-400 text-sm">–</span>
                      <select
                        value={hours.end}
                        onChange={e => setHours(day, 'end', e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-navy-500"
                      >
                        {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 flex-1">Geschlossen</span>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-navy-600" />
              <h2 className="font-semibold text-gray-900">Tarif</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900 capitalize">{business?.plan || 'free'}</p>
                <p className="text-sm text-gray-500">
                  {business?.plan === 'free'
                    ? `${business.monthlyBookingCount}/50 Termine diesen Monat`
                    : 'Unbegrenzte Termine'
                  }
                </p>
              </div>
              {business?.plan === 'free' && (
                <Button size="sm">Upgraden</Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['free', 'basic', 'pro'] as const).map(plan => {
                const limits = PLAN_LIMITS[plan];
                const isCurrent = business?.plan === plan;
                return (
                  <div key={plan} className={`rounded-xl p-3 border text-center ${isCurrent ? 'border-navy-700 bg-navy-50' : 'border-gray-100'}`}>
                    <p className="font-semibold text-sm capitalize text-gray-900">{plan}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {limits.price === 0 ? 'Gratis' : `${limits.price}€/mo`}
                    </p>
                    {isCurrent && <p className="text-xs text-navy-700 font-medium mt-1">Aktuell</p>}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Button loading={saving} onClick={handleSave} size="lg" className="w-full sm:w-auto">
          Einstellungen speichern
        </Button>
      </div>
    </Layout>
  );
}
