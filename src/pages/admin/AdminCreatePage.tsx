import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBusiness, getBusinessById, updateBusiness, saveService, saveEmployee } from '../../services/firebase/businesses';
import type { Business, Service, Employee, TemplateId, OpeningHours } from '../../types';
import { TEMPLATES, TEMPLATE_LIST } from '../../config/templates';
import { slugify } from '../../utils/helpers';

type WizardStep = 'template' | 'info' | 'hours' | 'services' | 'employees' | 'done';

const DEFAULT_HOURS: OpeningHours = {
  monday:    { isOpen: true,  start: '09:00', end: '18:00' },
  tuesday:   { isOpen: true,  start: '09:00', end: '18:00' },
  wednesday: { isOpen: true,  start: '09:00', end: '18:00' },
  thursday:  { isOpen: true,  start: '09:00', end: '18:00' },
  friday:    { isOpen: true,  start: '09:00', end: '17:00' },
  saturday:  { isOpen: false, start: '10:00', end: '14:00' },
  sunday:    { isOpen: false, start: '10:00', end: '14:00' },
};

const DAY_LABELS: [keyof OpeningHours, string][] = [
  ['monday', 'Montag'], ['tuesday', 'Dienstag'], ['wednesday', 'Mittwoch'],
  ['thursday', 'Donnerstag'], ['friday', 'Freitag'], ['saturday', 'Samstag'], ['sunday', 'Sonntag'],
];

export default function AdminCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [step, setStep] = useState<WizardStep>('template');
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Form state
  const [template, setTemplate] = useState<TemplateId>('kosmetik');
  const [info, setInfo] = useState({
    name: '', description: '', phone: '', email: '', address: '', city: '', category: '',
  });
  const [hours, setHours] = useState<OpeningHours>(DEFAULT_HOURS);
  const [services, setServices] = useState<Partial<Service>[]>([
    { name: '', description: '', duration: 60, price: 5000, isActive: true },
  ]);
  const [employees, setEmployees] = useState<Partial<Employee>[]>([
    { name: '', email: '', isActive: true, services: [] },
  ]);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      navigate('/admin');
      return;
    }
    if (isEdit && id) {
      getBusinessById(id).then(b => {
        if (!b) return;
        setBusinessId(b.id);
        setTemplate(b.template || 'kosmetik');
        setInfo({
          name: b.name, description: b.description, phone: b.phone,
          email: b.email, address: b.address, city: b.city, category: b.category,
        });
        setHours(b.openingHours);
      });
    }
  }, [isEdit, id, navigate]);

  const tpl = TEMPLATES[template];

  async function handleSaveInfo() {
    setSaving(true);
    try {
      const tplConfig = TEMPLATES[template];
      if (isEdit && businessId) {
        await updateBusiness(businessId, {
          ...info,
          template,
          primaryColor: tplConfig.primaryColor,
          secondaryColor: tplConfig.secondaryColor,
          openingHours: hours,
          slug: slugify(info.name),
        });
        setStep('services');
      } else {
        const biz = await createBusiness('admin', {
          ...info,
          template,
          primaryColor: tplConfig.primaryColor,
          secondaryColor: tplConfig.secondaryColor,
          openingHours: hours,
          isActive: true,
          category: info.category || tplConfig.name,
        });
        setBusinessId(biz.id);
        setStep('services');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveServices() {
    if (!businessId) return;
    setSaving(true);
    try {
      await Promise.all(
        services
          .filter(s => s.name?.trim())
          .map(s => saveService({ ...s, businessId } as Service & { businessId: string }))
      );
      setStep('employees');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEmployees() {
    if (!businessId) return;
    setSaving(true);
    try {
      await Promise.all(
        employees
          .filter(e => e.name?.trim())
          .map(e => saveEmployee({ ...e, businessId, workingHours: hours } as Employee & { businessId: string }))
      );
      setStep('done');
    } finally {
      setSaving(false);
    }
  }

  const stepList: WizardStep[] = ['template', 'info', 'hours', 'services', 'employees', 'done'];
  const stepIdx = stepList.indexOf(step);

  const progressSteps = [
    { key: 'template', label: 'Template' },
    { key: 'info', label: 'Infos' },
    { key: 'hours', label: 'Öffnungszeiten' },
    { key: 'services', label: 'Services' },
    { key: 'employees', label: 'Mitarbeiter' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="border-b border-dark-700 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/admin/dashboard')} className="text-dark-400 hover:text-white transition text-sm">
          ← Dashboard
        </button>
        <span className="text-dark-600">|</span>
        <h1 className="font-semibold">{isEdit ? 'Business bearbeiten' : 'Neues Business erstellen'}</h1>
      </div>

      {/* Progress */}
      {step !== 'done' && (
        <div className="border-b border-dark-700 px-6 py-3">
          <div className="flex items-center gap-0 max-w-2xl">
            {progressSteps.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  i === stepIdx ? 'bg-gold-500 text-dark-900' :
                  i < stepIdx ? 'bg-dark-600 text-dark-200' : 'text-dark-500'
                }`}>
                  <span>{i + 1}</span>
                  <span>{s.label}</span>
                </div>
                {i < progressSteps.length - 1 && (
                  <div className={`h-px w-4 mx-1 ${i < stepIdx ? 'bg-dark-500' : 'bg-dark-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Step 1: Template */}
        {step === 'template' && (
          <div>
            <h2 className="text-xl font-bold mb-1 font-serif">Template auswählen</h2>
            <p className="text-dark-400 text-sm mb-6">Wähle den visuellen Stil für dieses Business</p>
            <div className="grid gap-4">
              {TEMPLATE_LIST.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`text-left p-5 rounded-2xl border transition flex items-center gap-4 ${
                    template === t.id
                      ? 'border-gold-500 bg-dark-700'
                      : 'border-dark-600 bg-dark-800 hover:border-dark-500'
                  }`}
                >
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: t.previewGradient }}>
                    {t.emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-dark-400 text-sm mt-0.5">{t.description}</div>
                  </div>
                  {template === t.id && <div className="ml-auto text-gold-400 text-lg">✓</div>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('info')}
              className="mt-6 w-full bg-gold-gradient text-dark-900 font-bold py-3 rounded-2xl hover:opacity-90 transition"
            >
              Weiter →
            </button>
          </div>
        )}

        {/* Step 2: Info */}
        {step === 'info' && (
          <div>
            <h2 className="text-xl font-bold mb-1 font-serif">Business-Informationen</h2>
            <p className="text-dark-400 text-sm mb-6">
              Template: <span style={{ color: tpl.primaryColor }}>{tpl.emoji} {tpl.name}</span>
            </p>
            <div className="space-y-4">
              {([
                ['name', 'Business-Name *', 'z.B. Salon Rosette'],
                ['description', 'Beschreibung', 'Kurze Beschreibung...'],
                ['phone', 'Telefon', '+49 ...'],
                ['email', 'E-Mail', 'info@salon.de'],
                ['address', 'Adresse', 'Musterstraße 1'],
                ['city', 'Stadt *', 'München'],
                ['category', 'Kategorie', 'z.B. Kosmetik & Beauty'],
              ] as [keyof typeof info, string, string][]).map(([field, label, placeholder]) => (
                <div key={field}>
                  <label className="block text-dark-300 text-xs font-semibold uppercase tracking-widest mb-1.5">{label}</label>
                  {field === 'description' ? (
                    <textarea
                      value={info[field]}
                      onChange={e => setInfo(s => ({ ...s, [field]: e.target.value }))}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full bg-dark-800 border border-dark-600 rounded-2xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 resize-none"
                    />
                  ) : (
                    <input
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      value={info[field]}
                      onChange={e => setInfo(s => ({ ...s, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-dark-800 border border-dark-600 rounded-2xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-gold-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('template')} className="flex-1 border border-dark-600 text-dark-300 py-3 rounded-2xl hover:border-dark-400 transition">
                ← Zurück
              </button>
              <button
                onClick={() => setStep('hours')}
                disabled={!info.name || !info.city}
                className="flex-1 bg-gold-gradient text-dark-900 font-bold py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40"
              >
                Weiter →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Hours */}
        {step === 'hours' && (
          <div>
            <h2 className="text-xl font-bold mb-1 font-serif">Öffnungszeiten</h2>
            <p className="text-dark-400 text-sm mb-6">Wann ist das Business geöffnet?</p>
            <div className="space-y-3">
              {DAY_LABELS.map(([day, label]) => (
                <div key={day} className="bg-dark-800 rounded-2xl px-4 py-3 flex items-center gap-4">
                  <div className="w-28 text-sm text-dark-300">{label}</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setHours(h => ({ ...h, [day]: { ...h[day], isOpen: !h[day].isOpen } }))}
                      className={`h-5 w-9 rounded-full transition relative ${hours[day].isOpen ? 'bg-gold-500' : 'bg-dark-600'}`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${hours[day].isOpen ? 'left-4' : 'left-0.5'}`} />
                    </div>
                    <span className={`text-xs ${hours[day].isOpen ? 'text-gold-400' : 'text-dark-500'}`}>
                      {hours[day].isOpen ? 'Geöffnet' : 'Geschlossen'}
                    </span>
                  </label>
                  {hours[day].isOpen && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="time"
                        value={hours[day].start}
                        onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], start: e.target.value } }))}
                        className="bg-dark-700 border border-dark-600 rounded-xl px-2 py-1 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                      <span className="text-dark-500 text-sm">–</span>
                      <input
                        type="time"
                        value={hours[day].end}
                        onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], end: e.target.value } }))}
                        className="bg-dark-700 border border-dark-600 rounded-xl px-2 py-1 text-white text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('info')} className="flex-1 border border-dark-600 text-dark-300 py-3 rounded-2xl hover:border-dark-400 transition">
                ← Zurück
              </button>
              <button
                onClick={handleSaveInfo}
                disabled={saving}
                className="flex-1 bg-gold-gradient text-dark-900 font-bold py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40"
              >
                {saving ? 'Speichern…' : 'Speichern & Weiter →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Services */}
        {step === 'services' && (
          <div>
            <h2 className="text-xl font-bold mb-1 font-serif">Services & Leistungen</h2>
            <p className="text-dark-400 text-sm mb-6">Welche Leistungen werden angeboten?</p>
            <div className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-dark-400 text-sm font-medium">Leistung {i + 1}</span>
                    {services.length > 1 && (
                      <button onClick={() => setServices(s => s.filter((_, j) => j !== i))} className="text-red-400 text-sm hover:text-red-300">
                        Entfernen
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        placeholder="Name *"
                        value={svc.name || ''}
                        onChange={e => setServices(s => s.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <input
                        placeholder="Dauer (Min)"
                        type="number"
                        value={svc.duration || ''}
                        onChange={e => setServices(s => s.map((x, j) => j === i ? { ...x, duration: Number(e.target.value) } : x))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <input
                        placeholder="Preis (Cent)"
                        type="number"
                        value={svc.price || ''}
                        onChange={e => setServices(s => s.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        placeholder="Beschreibung"
                        value={svc.description || ''}
                        onChange={e => setServices(s => s.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setServices(s => [...s, { name: '', description: '', duration: 60, price: 5000, isActive: true }])}
              className="mt-3 w-full border border-dashed border-dark-600 text-dark-400 py-2.5 rounded-2xl text-sm hover:border-dark-400 hover:text-dark-300 transition"
            >
              + Weitere Leistung
            </button>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('hours')} className="flex-1 border border-dark-600 text-dark-300 py-3 rounded-2xl hover:border-dark-400 transition">
                ← Zurück
              </button>
              <button
                onClick={handleSaveServices}
                disabled={saving}
                className="flex-1 bg-gold-gradient text-dark-900 font-bold py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40"
              >
                {saving ? 'Speichern…' : 'Speichern & Weiter →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Employees */}
        {step === 'employees' && (
          <div>
            <h2 className="text-xl font-bold mb-1 font-serif">Mitarbeiter</h2>
            <p className="text-dark-400 text-sm mb-6">Wer nimmt Buchungen entgegen?</p>
            <div className="space-y-4">
              {employees.map((emp, i) => (
                <div key={i} className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-dark-400 text-sm font-medium">Mitarbeiter {i + 1}</span>
                    {employees.length > 1 && (
                      <button onClick={() => setEmployees(s => s.filter((_, j) => j !== i))} className="text-red-400 text-sm hover:text-red-300">
                        Entfernen
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        placeholder="Name *"
                        value={emp.name || ''}
                        onChange={e => setEmployees(s => s.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <input
                        placeholder="E-Mail"
                        type="email"
                        value={emp.email || ''}
                        onChange={e => setEmployees(s => s.map((x, j) => j === i ? { ...x, email: e.target.value } : x))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEmployees(s => [...s, { name: '', email: '', isActive: true, services: [] }])}
              className="mt-3 w-full border border-dashed border-dark-600 text-dark-400 py-2.5 rounded-2xl text-sm hover:border-dark-400 hover:text-dark-300 transition"
            >
              + Weiteren Mitarbeiter
            </button>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('services')} className="flex-1 border border-dark-600 text-dark-300 py-3 rounded-2xl hover:border-dark-400 transition">
                ← Zurück
              </button>
              <button
                onClick={handleSaveEmployees}
                disabled={saving}
                className="flex-1 bg-gold-gradient text-dark-900 font-bold py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40"
              >
                {saving ? 'Speichern…' : 'Fertigstellen ✓'}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Done */}
        {step === 'done' && (
          <div className="text-center py-8">
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ background: TEMPLATES[template].previewGradient }}>
              {TEMPLATES[template].emoji}
            </div>
            <h2 className="text-2xl font-bold font-serif mb-2">Business erstellt! 🎉</h2>
            <p className="text-dark-400 mb-6">
              {info.name} ist jetzt live und buchbar.
            </p>
            <div className="bg-dark-800 rounded-2xl p-4 mb-6 inline-block">
              <p className="text-dark-400 text-xs mb-1">Buchungslink</p>
              <p className="text-gold-400 font-mono text-sm">/{slugify(info.name)}</p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={`/${slugify(info.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold-gradient text-dark-900 font-bold py-3 rounded-2xl hover:opacity-90 transition text-center"
              >
                Buchungsseite ansehen ↗
              </a>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="border border-dark-600 text-dark-300 py-3 rounded-2xl hover:border-dark-400 transition"
              >
                Zurück zum Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
