import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useBusiness } from '../../hooks/useBusiness';
import { getEmployees, saveEmployee, deleteEmployee, getServices } from '../../services/firebase/businesses';
import { getInitials } from '../../utils/helpers';
import type { Employee, Service } from '../../types';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const { business, loading: bizLoading } = useBusiness();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<Partial<Employee>>({ name: '', email: '', services: [], isActive: true });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (!business) return;
    Promise.all([
      getEmployees(business.id).then(setEmployees),
      getServices(business.id).then(setServices),
    ]).finally(() => setLoading(false));
  }, [business]);

  const openNew  = () => { setEditing({ name: '', email: '', services: [], isActive: true }); setModal(true); };
  const openEdit = (e: Employee) => { setEditing({ ...e }); setModal(true); };

  const toggleService = (sid: string) => {
    setEditing(f => ({
      ...f,
      services: f.services?.includes(sid) ? f.services.filter(s => s !== sid) : [...(f.services || []), sid],
    }));
  };

  const handleSave = async () => {
    if (!business || !editing.name) return;
    setSaving(true);
    try {
      const saved = await saveEmployee({ ...editing, businessId: business.id } as Employee & { businessId: string });
      setEmployees(es => {
        const idx = es.findIndex(e => e.id === saved.id);
        return idx >= 0 ? es.map(e => e.id === saved.id ? saved : e) : [...es, saved];
      });
      setModal(false);
      toast.success('Mitarbeiter gespeichert');
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEmployee(id);
    setEmployees(es => es.filter(e => e.id !== id));
    toast.success('Mitarbeiter deaktiviert');
  };

  if (bizLoading || loading) return <Layout><LoadingSpinner className="py-20" size="lg" /></Layout>;

  const activeEmployees = employees.filter(e => e.isActive);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mitarbeiter</h1>
            {business?.plan === 'free' && (
              <p className="text-xs text-amber-600 mt-0.5">Kostenlos: max. 1 Mitarbeiter</p>
            )}
          </div>
          <Button onClick={openNew} disabled={business?.plan === 'free' && activeEmployees.length >= 1}>
            <Plus size={16} /> Mitarbeiter hinzufügen
          </Button>
        </div>

        {activeEmployees.length === 0 ? (
          <EmptyState
            icon={<User size={40} />}
            title="Noch keine Mitarbeiter"
            description="Füge Mitarbeiter hinzu, damit Kunden gezielt bei ihnen buchen können."
            action={{ label: 'Ersten Mitarbeiter hinzufügen', onClick: openNew }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEmployees.map(e => (
              <Card key={e.id} className="group">
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-semibold text-sm">
                        {getInitials(e.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{e.name}</p>
                        <p className="text-xs text-gray-500">{e.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-navy-50 text-gray-400 hover:text-navy-700">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {e.services.map(sid => {
                      const svc = services.find(s => s.id === sid);
                      return svc ? (
                        <span key={sid} className="text-xs px-2 py-0.5 rounded-full bg-navy-50 text-navy-700">{svc.name}</span>
                      ) : null;
                    })}
                    {e.services.length === 0 && <span className="text-xs text-gray-400">Keine Dienste zugewiesen</span>}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing.id ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}>
        <div className="p-6 space-y-4">
          <Input
            label="Name *"
            value={editing.name || ''}
            onChange={e => setEditing(f => ({ ...f, name: e.target.value }))}
            placeholder="Max Mustermann"
          />
          <Input
            label="E-Mail"
            type="email"
            value={editing.email || ''}
            onChange={e => setEditing(f => ({ ...f, email: e.target.value }))}
            placeholder="max@example.de"
          />
          {services.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Zugewiesene Dienste</label>
              <div className="flex flex-wrap gap-2">
                {services.filter(s => s.isActive).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                      editing.services?.includes(s.id)
                        ? 'bg-navy-700 text-white border-navy-700'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Abbrechen</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>Speichern</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
