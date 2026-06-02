import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addMinutes, addDays, isBefore, startOfDay, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight, Check, User, Calendar, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { getBusinessBySlug, getServices, getEmployees } from '../../services/firebase/businesses';
import { getBookingsByBusiness, getBlockedTimes, createBooking } from '../../services/firebase/bookings';
import { getAvailableTimeSlots, formatTime, formatDate } from '../../utils/calendar';
import { formatPrice, formatDuration, DAY_NAMES } from '../../utils/helpers';
import type { Business, Service, Employee, Booking, TimeSlot } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

type Step = 'service' | 'employee' | 'datetime' | 'details' | 'confirm';

export default function BusinessPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [business,  setBusiness]  = useState<Business | null>(null);
  const [services,  setServices]  = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [blocked,   setBlocked]   = useState<ReturnType<typeof getBlockedTimes> extends Promise<infer T> ? T : never>([]);
  const [loading,   setLoading]   = useState(true);

  const [step,           setStep]           = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate,   setSelectedDate]   = useState(new Date());
  const [selectedSlot,   setSelectedSlot]   = useState<TimeSlot | null>(null);
  const [slots,          setSlots]          = useState<TimeSlot[]>([]);
  const [confirmModal,   setConfirmModal]   = useState(false);
  const [saving,         setSaving]         = useState(false);

  const [details, setDetails] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    notes: '',
    paymentMethod: 'onsite' as 'online' | 'onsite',
  });

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      getBusinessBySlug(slug).then(setBusiness),
    ]).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!business) return;
    Promise.all([
      getServices(business.id).then(s => setServices(s.filter(x => x.isActive))),
      getEmployees(business.id).then(e => setEmployees(e.filter(x => x.isActive))),
      getBookingsByBusiness(business.id).then(setBookings),
      getBlockedTimes(business.id).then(b => setBlocked(b as typeof blocked)),
    ]);
  }, [business]);

  useEffect(() => {
    if (!selectedService || !business) return;
    const emp = selectedEmployee || undefined;
    const newSlots = getAvailableTimeSlots(selectedDate, selectedService.duration, business.openingHours, bookings, blocked, emp);
    setSlots(newSlots);
    setSelectedSlot(null);
  }, [selectedService, selectedEmployee, selectedDate, business, bookings, blocked]);

  const handleBook = async () => {
    if (!business || !selectedService || !selectedSlot) return;
    if (!user) { navigate('/login'); return; }
    setSaving(true);
    try {
      await createBooking({
        businessId: business.id,
        customerId: user.uid,
        customerName: details.name,
        customerEmail: details.email,
        customerPhone: details.phone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        serviceDuration: selectedService.duration,
        servicePrice: selectedService.price,
        employeeId: selectedEmployee?.id,
        employeeName: selectedEmployee?.name,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        status: 'pending',
        paymentMethod: details.paymentMethod,
        paymentStatus: 'pending',
        totalAmount: selectedService.price,
        notes: details.notes,
      });
      setConfirmModal(true);
    } catch {
      toast.error('Fehler beim Buchen');
    } finally {
      setSaving(false);
    }
  };

  const availableEmployees = selectedService
    ? employees.filter(e => !e.services.length || e.services.includes(selectedService.id))
    : employees;

  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Einrichtung nicht gefunden</p>
          <Button className="mt-4" onClick={() => navigate('/search')}>Suche öffnen</Button>
        </div>
      </div>
    );
  }

  const accentColor = business.primaryColor || '#1e3a5f';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Business header */}
      <div style={{ backgroundColor: accentColor }} className="text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            {business.logo
              ? <img src={business.logo} alt={business.name} className="h-16 w-16 rounded-2xl object-cover" />
              : <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">{business.name[0]}</div>
            }
            <div>
              <h1 className="text-2xl font-bold">{business.name}</h1>
              <p className="text-white/80 text-sm mt-0.5">{business.category}</p>
              {business.description && <p className="text-white/70 text-sm mt-1 max-w-sm">{business.description}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/70">
                {business.city && <span className="flex items-center gap-1"><MapPin size={12} />{business.city}</span>}
                {business.phone && <span className="flex items-center gap-1"><Phone size={12} />{business.phone}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {(['service', 'employee', 'datetime', 'details'] as Step[]).map((s, i) => {
            const steps: Step[] = ['service', 'employee', 'datetime', 'details'];
            const idx = steps.indexOf(step);
            const isDone = steps.indexOf(s) < idx;
            const isCurrent = s === step;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`h-2 rounded-full flex-1 ${isDone || isCurrent ? '' : 'bg-gray-200'}`}
                     style={{ backgroundColor: isDone || isCurrent ? accentColor : undefined, opacity: isCurrent ? 1 : isDone ? 0.6 : undefined }} />
                {i < 3 && <div className="h-1 w-1 rounded-full bg-gray-300 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Select service */}
        {step === 'service' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Dienstleistung wählen</h2>
            <div className="space-y-2">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(availableEmployees.length > 1 ? 'employee' : 'datetime'); }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-navy-300 hover:shadow-card transition-all text-left"
                >
                  <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={11} /> {formatDuration(s.duration)}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-navy-700">{formatPrice(s.price)}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select employee */}
        {step === 'employee' && (
          <div>
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Mitarbeiter wählen</h2>
            <div className="space-y-2">
              <button
                onClick={() => { setSelectedEmployee(null); setStep('datetime'); }}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-navy-300 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Kein Vorzug</p>
                  <p className="text-xs text-gray-500">Erster verfügbarer Mitarbeiter</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 ml-auto" />
              </button>
              {availableEmployees.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setSelectedEmployee(e); setStep('datetime'); }}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-navy-300 transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-semibold text-sm">
                    {e.name[0]}
                  </div>
                  <p className="font-semibold text-gray-900 flex-1">{e.name}</p>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Date & time */}
        {step === 'datetime' && (
          <div>
            <button onClick={() => setStep(availableEmployees.length > 1 ? 'employee' : 'service')} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Datum & Uhrzeit</h2>
            {/* Date strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
              {days.map(day => {
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm transition-all ${
                      isSelected ? 'text-white' : 'bg-white border border-gray-100 text-gray-600 hover:border-navy-200'
                    }`}
                    style={isSelected ? { backgroundColor: accentColor } : {}}
                  >
                    <span className="text-xs uppercase">{format(day, 'EEE', { locale: de })}</span>
                    <span className="font-bold">{format(day, 'd')}</span>
                    <span className="text-xs">{format(day, 'MMM', { locale: de })}</span>
                  </button>
                );
              })}
            </div>
            {/* Time slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.filter(s => s.available).length === 0 ? (
                <div className="col-span-4 text-center py-8 text-gray-400 text-sm">Keine freien Zeiten an diesem Tag</div>
              ) : slots.filter(s => s.available).map((slot, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedSlot === slot
                      ? 'text-white border-transparent'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-navy-300'
                  }`}
                  style={selectedSlot === slot ? { backgroundColor: accentColor } : {}}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))}
            </div>
            {selectedSlot && (
              <Button className="w-full mt-6" style={{ backgroundColor: accentColor }} onClick={() => setStep('details')}>
                Weiter mit {formatTime(selectedSlot.startTime)} Uhr
              </Button>
            )}
          </div>
        )}

        {/* STEP 4: Details */}
        {step === 'details' && (
          <div>
            <button onClick={() => setStep('datetime')} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Deine Kontaktdaten</h2>
            <div className="space-y-4">
              <Input
                label="Name *"
                value={details.name}
                onChange={e => setDetails(d => ({ ...d, name: e.target.value }))}
                placeholder="Max Mustermann"
              />
              <Input
                label="E-Mail *"
                type="email"
                value={details.email}
                onChange={e => setDetails(d => ({ ...d, email: e.target.value }))}
                placeholder="max@example.de"
              />
              <Input
                label="Telefon"
                type="tel"
                value={details.phone}
                onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))}
                placeholder="+49 89 123456"
              />
              <Textarea
                label="Notiz (optional)"
                value={details.notes}
                onChange={e => setDetails(d => ({ ...d, notes: e.target.value }))}
                placeholder="Besondere Wünsche..."
              />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Bezahlung</label>
                <div className="flex gap-3">
                  {[
                    { value: 'online' as const, label: 'Online zahlen', icon: <CreditCard size={16} /> },
                    { value: 'onsite' as const, label: 'Vor Ort zahlen', icon: <Calendar size={16} /> },
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setDetails(d => ({ ...d, paymentMethod: p.value }))}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 text-sm transition-all ${
                        details.paymentMethod === p.value
                          ? 'border-navy-700 bg-navy-50 text-navy-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-gray-50 border-gray-200">
                <CardBody className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium">{selectedService?.name}</span></div>
                  {selectedEmployee && <div className="flex justify-between"><span className="text-gray-500">Mitarbeiter</span><span className="font-medium">{selectedEmployee.name}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Datum</span><span className="font-medium">{formatDate(selectedSlot!.startTime)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Uhrzeit</span><span className="font-medium">{formatTime(selectedSlot!.startTime)} – {formatTime(selectedSlot!.endTime)}</span></div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                    <span>Gesamt</span><span className="text-navy-700">{formatPrice(selectedService?.price || 0)}</span>
                  </div>
                </CardBody>
              </Card>

              <Button
                className="w-full"
                loading={saving}
                disabled={!details.name || !details.email}
                onClick={handleBook}
                style={{ backgroundColor: accentColor }}
              >
                Termin buchen
              </Button>
              {!user && (
                <p className="text-xs text-center text-gray-400">
                  Du wirst nach dem Buchen aufgefordert, dich anzumelden um deinen Termin zu verwalten.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      <Modal isOpen={confirmModal} onClose={() => { setConfirmModal(false); navigate('/my-bookings'); }} size="sm">
        <div className="p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Buchung erfolgreich!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Du hast einen Termin bei <strong>{business.name}</strong> gebucht.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Du erhältst eine Bestätigung an {details.email}
          </p>
          <Button className="w-full" onClick={() => { setConfirmModal(false); navigate('/my-bookings'); }}>
            Meine Termine ansehen
          </Button>
        </div>
      </Modal>
    </div>
  );
}
