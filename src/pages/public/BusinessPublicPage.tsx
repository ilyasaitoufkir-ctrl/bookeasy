import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addDays, startOfDay, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight, CheckCircle2, User, CalendarPlus, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { getBusinessBySlug, getServices, getEmployees } from '../../services/firebase/businesses';
import { getBookingsByBusiness, getBlockedTimes, createBooking } from '../../services/firebase/bookings';
import { getAvailableTimeSlots, formatTime, formatDate } from '../../utils/calendar';
import { formatPrice, formatDuration } from '../../utils/helpers';
import type { Business, Service, Employee, Booking, BlockedTime as BlockedTimeType, TimeSlot } from '../../types';
import toast from 'react-hot-toast';

type Step = 'service' | 'employee' | 'datetime' | 'details' | 'confirmed';

function downloadICS(booking: {
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
}) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BookEasy//DE',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(booking.start)}`,
    `DTEND:${fmt(booking.end)}`,
    `SUMMARY:${booking.title}`,
    `LOCATION:${booking.location}`,
    `DESCRIPTION:${booking.description}`,
    `UID:bookeasy-${Date.now()}@bookeasy.app`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'termin.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BusinessPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [business,  setBusiness]  = useState<Business | null>(null);
  const [services,  setServices]  = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [blocked,   setBlocked]   = useState<BlockedTimeType[]>([]);
  const [loading,   setLoading]   = useState(true);

  const [step,             setStep]             = useState<Step>('service');
  const [selectedService,  setSelectedService]  = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate,     setSelectedDate]     = useState(new Date());
  const [selectedSlot,     setSelectedSlot]     = useState<TimeSlot | null>(null);
  const [slots,            setSlots]            = useState<TimeSlot[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [saving,           setSaving]           = useState(false);

  const [details, setDetails] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    phone:     '',
    notes:     '',
  });

  useEffect(() => {
    if (!slug) return;
    getBusinessBySlug(slug).then(setBusiness).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!business) return;
    Promise.all([
      getServices(business.id).then(s => setServices(s.filter(x => x.isActive))),
      getEmployees(business.id).then(e => setEmployees(e.filter(x => x.isActive))),
      getBookingsByBusiness(business.id).then(setBookings),
      getBlockedTimes(business.id).then(setBlocked),
    ]);
  }, [business]);

  useEffect(() => {
    if (!selectedService || !business) return;
    const newSlots = getAvailableTimeSlots(
      selectedDate, selectedService.duration,
      business.openingHours, bookings, blocked,
      selectedEmployee || undefined,
    );
    setSlots(newSlots);
    setSelectedSlot(null);
  }, [selectedService, selectedEmployee, selectedDate, business, bookings, blocked]);

  const availableEmployees = selectedService
    ? employees.filter(e => !e.services.length || e.services.includes(selectedService.id))
    : employees;

  const handleBook = async () => {
    if (!business || !selectedService || !selectedSlot) return;
    const fullName = `${details.firstName} ${details.lastName}`.trim();
    if (!fullName || !details.email) return;
    setSaving(true);
    try {
      const booking = await createBooking({
        businessId:      business.id,
        customerName:    fullName,
        customerEmail:   details.email,
        customerPhone:   details.phone,
        serviceId:       selectedService.id,
        serviceName:     selectedService.name,
        serviceDuration: selectedService.duration,
        servicePrice:    selectedService.price,
        employeeId:      selectedEmployee?.id,
        employeeName:    selectedEmployee?.name,
        startTime:       selectedSlot.startTime,
        endTime:         selectedSlot.endTime,
        status:          'pending',
        paymentMethod:   'onsite',
        paymentStatus:   'pending',
        totalAmount:     selectedService.price,
        notes:           details.notes,
      });
      setConfirmedBooking(booking);
      setStep('confirmed');
    } catch {
      toast.error('Fehler beim Buchen. Bitte versuche es erneut.');
    } finally {
      setSaving(false);
    }
  };

  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));
  const accentColor = business?.primaryColor || '#1e3a5f';

  // ── Loading ──────────────────────────────────────────────────────────────
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
          <Button className="mt-4" onClick={() => navigate('/search')}>Zur Suche</Button>
        </div>
      </div>
    );
  }

  // ── CONFIRMED PAGE ────────────────────────────────────────────────────────
  if (step === 'confirmed' && confirmedBooking) {
    const fullName = `${details.firstName} ${details.lastName}`.trim();
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Business brand strip */}
        <div style={{ backgroundColor: accentColor }} className="h-2 w-full" />

        <div className="max-w-lg mx-auto px-4 py-12">
          {/* Success icon */}
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle2 size={44} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Ihr Termin ist gebucht! ✅</h1>
            <p className="text-gray-500 mt-2">
              Eine Bestätigung wird an <strong>{details.email}</strong> gesendet.
            </p>
          </div>

          {/* Booking details card */}
          <Card className="mb-6">
            <CardBody className="space-y-0">
              <div className="flex items-center gap-3 mb-4">
                {business.logo
                  ? <img src={business.logo} alt={business.name} className="h-10 w-10 rounded-xl object-cover" />
                  : <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold"
                         style={{ backgroundColor: accentColor }}>{business.name[0]}</div>
                }
                <div>
                  <p className="font-semibold text-gray-900">{business.name}</p>
                  {business.address && <p className="text-xs text-gray-500">{business.address}, {business.city}</p>}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Dienstleistung', value: selectedService?.name },
                  { label: 'Mitarbeiter',    value: selectedEmployee?.name || 'Nach Verfügbarkeit' },
                  { label: 'Datum',          value: formatDate(confirmedBooking.startTime, 'EEEE, dd. MMMM yyyy') },
                  { label: 'Uhrzeit',        value: `${formatTime(confirmedBooking.startTime)} – ${formatTime(confirmedBooking.endTime)} Uhr` },
                  { label: 'Name',           value: fullName },
                  { label: 'Preis',          value: formatPrice(confirmedBooking.servicePrice) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2.5 text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>

              {details.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                  <span className="text-gray-500">Anmerkung: </span>
                  <span className="text-gray-700">{details.notes}</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() =>
                downloadICS({
                  title:       `${selectedService?.name} bei ${business.name}`,
                  start:       confirmedBooking.startTime,
                  end:         confirmedBooking.endTime,
                  location:    [business.address, business.city].filter(Boolean).join(', '),
                  description: `Termin bei ${business.name}. Mitarbeiter: ${selectedEmployee?.name || 'Nach Verfügbarkeit'}`,
                })
              }
            >
              <CalendarPlus size={18} />
              Termin in Kalender speichern
            </Button>

            <Button
              className="w-full"
              variant="ghost"
              size="lg"
              onClick={() => {
                // Reset to start a new booking
                setStep('service');
                setSelectedService(null);
                setSelectedEmployee(null);
                setSelectedSlot(null);
                setDetails({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
                setConfirmedBooking(null);
              }}
            >
              <Home size={16} />
              Zurück zur Buchungsseite
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── BOOKING WIZARD ────────────────────────────────────────────────────────
  const STEPS: Step[] = ['service', 'employee', 'datetime', 'details'];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Business header */}
      <div style={{ backgroundColor: accentColor }} className="text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            {business.logo
              ? <img src={business.logo} alt={business.name} className="h-16 w-16 rounded-2xl object-cover" />
              : <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {business.name[0]}
                </div>
            }
            <div>
              <h1 className="text-2xl font-bold">{business.name}</h1>
              <p className="text-white/80 text-sm mt-0.5">{business.category}</p>
              {business.description && (
                <p className="text-white/70 text-sm mt-1 max-w-sm">{business.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/70">
                {business.city  && <span className="flex items-center gap-1"><MapPin size={12} />{business.city}</span>}
                {business.phone && <span className="flex items-center gap-1"><Phone  size={12} />{business.phone}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i <= stepIdx ? accentColor : '#e5e7eb',
                opacity: i < stepIdx ? 0.5 : 1,
              }}
            />
          ))}
        </div>

        {/* ── STEP 1: Service ──────────────────────────────────────────── */}
        {step === 'service' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Dienstleistung wählen</h2>
            {services.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">Noch keine Dienste verfügbar.</p>
            ) : (
              <div className="space-y-2">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedService(s);
                      setStep(availableEmployees.length > 1 ? 'employee' : 'datetime');
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-opacity-60 hover:shadow-card transition-all text-left"
                    style={{ ['--tw-border-opacity' as string]: 1 }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor + '80')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
                  >
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                      <span className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock size={11} /> {formatDuration(s.duration)}
                      </span>
                    </div>
                    <span className="font-semibold" style={{ color: accentColor }}>{formatPrice(s.price)}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Employee ─────────────────────────────────────────── */}
        {step === 'employee' && (
          <div>
            <button
              onClick={() => setStep('service')}
              className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
            >
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Mitarbeiter wählen</h2>
            <div className="space-y-2">
              <button
                onClick={() => { setSelectedEmployee(null); setStep('datetime'); }}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-card transition-all text-left"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Kein Vorzug</p>
                  <p className="text-xs text-gray-500">Erster verfügbarer Mitarbeiter</p>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
              {availableEmployees.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setSelectedEmployee(e); setStep('datetime'); }}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-card transition-all text-left"
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    {e.name[0].toUpperCase()}
                  </div>
                  <p className="font-semibold text-gray-900 flex-1">{e.name}</p>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: Date & time ──────────────────────────────────────── */}
        {step === 'datetime' && (
          <div>
            <button
              onClick={() => setStep(availableEmployees.length > 1 ? 'employee' : 'service')}
              className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
            >
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Datum & Uhrzeit wählen</h2>

            {/* Date strip */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-hide">
              {days.map(day => {
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className="flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-xl text-sm transition-all"
                    style={
                      isSelected
                        ? { backgroundColor: accentColor, color: 'white' }
                        : { backgroundColor: 'white', color: '#4b5563', border: '1px solid #f3f4f6' }
                    }
                  >
                    <span className="text-xs uppercase font-medium">{format(day, 'EEE', { locale: de })}</span>
                    <span className="font-bold text-base leading-tight">{format(day, 'd')}</span>
                    <span className="text-xs">{format(day, 'MMM', { locale: de })}</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {slots.filter(s => s.available).length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                Keine freien Zeiten an diesem Tag
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.filter(s => s.available).map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className="py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                    style={
                      selectedSlot === slot
                        ? { backgroundColor: accentColor, color: 'white', borderColor: accentColor }
                        : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
                    }
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <Button
                className="w-full mt-6"
                size="lg"
                style={{ backgroundColor: accentColor }}
                onClick={() => setStep('details')}
              >
                Weiter – {formatTime(selectedSlot.startTime)} Uhr
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        )}

        {/* ── STEP 4: Contact details ──────────────────────────────────── */}
        {step === 'details' && (
          <div>
            <button
              onClick={() => setStep('datetime')}
              className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
            >
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ihre Kontaktdaten</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Vorname *"
                  value={details.firstName}
                  onChange={e => setDetails(d => ({ ...d, firstName: e.target.value }))}
                  placeholder="Max"
                  autoComplete="given-name"
                />
                <Input
                  label="Nachname *"
                  value={details.lastName}
                  onChange={e => setDetails(d => ({ ...d, lastName: e.target.value }))}
                  placeholder="Mustermann"
                  autoComplete="family-name"
                />
              </div>
              <Input
                label="E-Mail-Adresse *"
                type="email"
                value={details.email}
                onChange={e => setDetails(d => ({ ...d, email: e.target.value }))}
                placeholder="max@example.de"
                autoComplete="email"
              />
              <Input
                label="Telefonnummer"
                type="tel"
                value={details.phone}
                onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))}
                placeholder="+49 89 123456"
                autoComplete="tel"
              />
              <Textarea
                label="Nachricht / Anmerkung (optional)"
                value={details.notes}
                onChange={e => setDetails(d => ({ ...d, notes: e.target.value }))}
                placeholder="Besondere Wünsche oder Anmerkungen..."
                className="h-24"
              />

              {/* Summary */}
              <Card className="border-gray-200">
                <CardBody className="py-4 space-y-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ihre Buchung</p>
                  {[
                    { label: 'Dienstleistung', value: selectedService?.name },
                    { label: 'Mitarbeiter',    value: selectedEmployee?.name || 'Nach Verfügbarkeit' },
                    { label: 'Datum',          value: formatDate(selectedSlot!.startTime, 'EEEE, dd. MMMM yyyy') },
                    { label: 'Uhrzeit',        value: `${formatTime(selectedSlot!.startTime)} – ${formatTime(selectedSlot!.endTime)} Uhr` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-1.5 text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-medium text-gray-900">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 mt-2 border-t border-gray-100 text-sm font-bold">
                    <span>Gesamtpreis</span>
                    <span style={{ color: accentColor }}>{formatPrice(selectedService?.price || 0)}</span>
                  </div>
                </CardBody>
              </Card>

              <Button
                className="w-full"
                size="lg"
                loading={saving}
                disabled={!details.firstName || !details.lastName || !details.email}
                onClick={handleBook}
                style={{ backgroundColor: accentColor }}
              >
                Jetzt buchen
              </Button>

              <p className="text-xs text-center text-gray-400">
                Kein Konto nötig. Wir senden Ihnen eine Bestätigung per E-Mail.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
