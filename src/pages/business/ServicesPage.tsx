import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Clock, Euro } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useBusiness } from '../../hooks/useBusiness';
import { getServices, saveService, deleteService } from '../../services/firebase/businesses';
import { formatPrice, formatDuration } from '../../utils/helpers';
import type { Service } from '../../types';
import toast from 'react-hot-toast';

const COLORS = ['#1e3a5f', '#3068bc', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#047857', '#9333ea'];

const emptyService: Partial<Service> = {
  name: '', description: '', duration: 30, price: 2500, color: '#1e3a5f', isActive: true,
};

export default function ServicesPage() {
  const { business, loading: bizLoading } = useBusiness();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<Partial<Service>>(emptyService);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!business) return;
    getServices(business.id).then(setServices).finally(() => setLoading(false));
  }, [business]);

  const openNew  = () => { setEditing({ ...emptyService }); setModal(true); };
  const openEdit = (s: Service) => { setEditing({ ...s }); setModal(true); };

  const handleSave = async () => {
    if (!business || !editing.name) return;
    setSaving(true);
    try {
      const saved = await saveService({ ...editing, businessId: business.id } as Service & { businessId: string });
      setServices(ss => {
        const idx = ss.findIndex(s => s.id === saved.id);
        return idx >= 0 ? ss.map(s => s.id === saved.id ? saved : s) : [...ss, saved];
      });
      setModal(false);
      toast.success('Dienst gespeichert');
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteService(id);
    setServices(ss => ss.filter(s => s.id !== id));
    toast.success('Dienst deaktiviert');
  };

  if (bizLoading || loading) return <Layout><LoadingSpinner className="py-20" size="lg" /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dienstleistungen</h1>
          <Button onClick={openNew}><Plus size={16} /> Dienst hinzufügen</Button>
        </div>

        {services.filter(s => s.isActive).length === 0 ? (
          <EmptyState
            icon={<Clock size={40} />}
            title="Noch keine Dienste"
            description="Erstelle deine erste Dienstleistung, damit Kunden buchen können."
            action={{ label: 'Ersten Dienst erstellen', onClick: openNew }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.filter(s => s.isActive).map(s => (
              <Card key={s.id} className="group">
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-navy-50 text-gray-400 hover:text-navy-700">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {s.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600"><Clock size={14} /> {formatDuration(s.duration)}</span>
                    <span className="flex items-center gap-1 font-semibold text-navy-700"><Euro size={14} /> {formatPrice(s.price)}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing.id ? 'Dienst bearbeiten' : 'Neuer Dienst'}>
        <div className="p-6 space-y-4">
          <Input
            label="Name *"
            value={editing.name || ''}
            onChange={e => setEditing(f => ({ ...f, name: e.target.value }))}
            placeholder="z.B. Haarschnitt"
          />
          <Textarea
            label="Beschreibung"
            value={editing.description || ''}
            onChange={e => setEditing(f => ({ ...f, description: e.target.value }))}
            placeholder="Kurze Beschreibung..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Dauer"
              value={String(editing.duration || 30)}
              onChange={e => setEditing(f => ({ ...f, duration: Number(e.target.value) }))}
              options={[15,20,30,45,60,90,120].map(v => ({ value: String(v), label: formatDuration(v) }))}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Preis (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={((editing.price || 0) / 100).toFixed(2)}
                onChange={e => setEditing(f => ({ ...f, price: Math.round(parseFloat(e.target.value) * 100) }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Farbe</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditing(f => ({ ...f, color: c }))}
                  className={`h-7 w-7 rounded-full transition-transform ${editing.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Abbrechen</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>Speichern</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
