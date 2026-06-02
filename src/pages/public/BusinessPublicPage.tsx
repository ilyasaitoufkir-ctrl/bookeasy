import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addDays, startOfDay, format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  MapPin, Phone, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, User, CalendarPlus, Home, Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { getBusinessBySlug, getServices, getEmployees } from '../../services/firebase/businesses';
import { getBookingsByBusiness, getBlockedTimes, createBooking } from '../../services/firebase/bookings';
import { getAvailableTimeSlots, formatTime, formatDate } from '../../utils/calendar';
import { formatPrice, formatDuration } from '../../utils/helpers';
import type { Business, Service, Employee, Booking, BlockedTime as BlockedTimeType, TimeSlot } from '../../types';
import toast from 'react-hot-toast';

type Step = 'service' | 'employee' | 'datetime' | 'details' | 'confirmed';

function downloadICS(booking: { title: string; start: Date; end: Date; location: string; description: string }) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BookEasy//DE',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(booking.start)}`, `DTEND:${fmt(booking.end)}`,
    `SUMMARY:${booking.title}`, `LOCATION:${booking.location}`, `DESCRIPTION:${booking.description}`,
    `UID:bookeasy-${Date.now()}@bookeasy.app`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'termin.ics'; a.click();
  URL.revokeObjectURL(url);
}

const STEP_LABELS: Record<Exclude<Step, 'confirmed'>, string> = {
  service:  'Service',
  employee: 'Stylistin',
  datetime: 'Termin',
  details:  'Kontakt',
};

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

  const [details, setDetails] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });

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

  const accentColor = business?.primaryColor || '#c9a99a';
  const availableEmployees = selectedService
    ? employees.filter(e => !e.services.length || e.services.includes(selectedService.id))
    : employees;
  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

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
      toast.error('Fehler beim Buchen. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-2xl bg-rose-gradient shadow-rose flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles size={20} className="text-white" />
          </div>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-display text-xl text-mauve-700 mb-4">Studio nicht gefunden</p>
          <Button onClick={() => navigate('/search')}>Zur Suche</Button>
        </div>
      </div>
    );
  }

  // ── CONFIRMED ─────────────────────────────────────────────────────────────
  if (step === 'confirmed' && confirmedBooking) {
    const fullName = `${details.firstName} ${details.lastName}`.trim();
    return (
      <div className="min-h-screen bg-beauty-gradient">
        {/* Top accent line */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />

        <div className="max-w-lg mx-auto px-4 py-16">
          {/* Success */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-rose mx-auto mb-5">
              <CheckCircle2 size={40} className="text-rose-400" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-mauve-900 mb-2">
              Ihr Termin ist gebucht! ✅
            </h1>
            <p className="text-mauve-400">
              Bestätigung geht an <span className="text-mauve-700 font-medium">{details.email}</span>
            </p>
          </div>

          {/* Booking card */}
          <div className="glass-rose rounded-3xl shadow-rose-lg border border-white/60 p-6 mb-5 animate-scale-in">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-cream-300/60">
              {business.logo
                ? <img src={business.logo} alt={business.name} className="h-11 w-11 rounded-2xl object-cover" />
                : <div className="h-11 w-11 rounded-2xl bg-rose-gradient shadow-rose flex items-center justify-center text-white font-bold"
                       style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)` }}>
                    {business.name[0]}
                  </div>
              }
              <div>
                <p className="font-display font-semibold text-mauve-900">{business.name}</p>
                {business.address && <p className="text-xs text-mauve-400">{business.address}, {business.city}</p>}
              </div>
            </div>

            <div className="space-y-0 divide-y divide-cream-200/60">
              {[
                { label: 'Service',      value: selectedService?.name },
                { label: 'Stylistin',    value: selectedEmployee?.name || 'Nach Verfügbarkeit' },
                { label: 'Datum',        value: formatDate(confirmedBooking.startTime, 'EEEE, dd. MMMM yyyy') },
                { label: 'Uhrzeit',      value: `${formatTime(confirmedBooking.startTime)} – ${formatTime(confirmedBooking.endTime)} Uhr` },
                { label: 'Name',         value: fullName },
                { label: 'Gesamtpreis', value: formatPrice(confirmedBooking.servicePrice) },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-3 text-sm">
                  <span className="text-mauve-400">{row.label}</span>
                  <span className="font-medium text-mauve-900 text-right max-w-[55%]">{row.value}</span>
                </div>
              ))}
            </div>

            {details.notes && (
              <div className="mt-4 pt-4 border-t border-cream-200/60 text-sm text-mauve-500">
                <span className="font-medium">Anmerkung: </span>{details.notes}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => downloadICS({
                title:       `${selectedService?.name} bei ${business.name}`,
                start:       confirmedBooking.startTime,
                end:         confirmedBooking.endTime,
                location:    [business.address, business.city].filter(Boolean).join(', '),
                description: `Termin bei ${business.name}. Stylistin: ${selectedEmployee?.name || 'Nach Verfügbarkeit'}`,
              })}
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            >
              <CalendarPlus size={18} />
              Termin in Kalender speichern
            </Button>

            <Button
              className="w-full"
              variant="ghost"
              size="lg"
              onClick={() => {
                setStep('service');
                setSelectedService(null);
                setSelectedEmployee(null);
                setSelectedSlot(null);
                setDetails({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
                setConfirmedBooking(null);
              }}
            >
              <Home size={16} /> Neuen Termin buchen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── WIZARD ─────────────────────────────────────────────────────────────
  const WIZARD_STEPS: Exclude<Step, 'confirmed'>[] = ['service', 'employee', 'datetime', 'details'];
  const stepIdx = WIZARD_STEPS.indexOf(step as Exclude<Step, 'confirmed'>);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Business hero header */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${accentColor}22, ${accentColor}08)` }}>
        <div className="absolute inset-0 opacity-30"
             style={{ background: `radial-gradient(ellipse at top right, ${accentColor}40, transparent 60%)` }} />
        <div className="relative max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            {business.logo
              ? <img src={business.logo} alt={business.name} className="h-16 w-16 rounded-2xl object-cover shadow-rose" />
              : <div className="h-16 w-16 rounded-2xl shadow-rose flex items-center justify-center text-white text-2xl font-bold font-serif"
                     style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}>
                  {business.name[0]}
                </div>
            }
            <div className="pt-0.5">
              <h1 className="font-display text-2xl font-semibold text-mauve-900">{business.name}</h1>
              <p className="text-sm text-mauve-400 mt-0.5">{business.category}</p>
              {business.description && <p className="text-sm text-mauve-500 mt-1 max-w-xs leading-relaxed">{business.description}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-mauve-400">
                {business.city  && <span className="flex items-center gap-1"><MapPin size={11} />{business.city}</span>}
                {business.phone && <span className="flex items-center gap-1"><Phone  size={11} />{business.phone}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Step progress */}
        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="h-1.5 w-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: i <= stepIdx ? accentColor : '#e8c4b4',
                    opacity: i < stepIdx ? 0.5 : 1,
                  }}
                />
                <span className={`text-xs transition-colors ${i === stepIdx ? 'text-rose-600 font-medium' : 'text-mauve-300'}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <div className="w-2 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Service ── */}
        {step === 'service' && (
          <div className="animate-fade-up">
            <h2 className="font-display text-xl font-semibold text-mauve-900 mb-5">Service wählen</h2>
            {services.length === 0
              ? <p className="text-center py-12 text-mauve-300 text-sm">Noch keine Services verfügbar.</p>
              : (
                <div className="space-y-3">
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s);
                        setStep(availableEmployees.length > 1 ? 'employee' : 'datetime');
                      }}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border border-cream-200 hover:border-rose-300 hover:shadow-rose transition-all duration-200 text-left group"
                    >
                      <div className="h-4 w-4 rounded-full flex-shrink-0 ring-2 ring-cream-200 group-hover:ring-rose-200 transition-all"
                           style={{ backgroundColor: s.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-mauve-900">{s.name}</p>
                        {s.description && <p className="text-xs text-mauve-400 mt-0.5 truncate">{s.description}</p>}
                        <span className="flex items-center gap-1 text-xs text-mauve-400 mt-1">
                          <Clock size={10} /> {formatDuration(s.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold" style={{ color: accentColor }}>{formatPrice(s.price)}</span>
                        <ChevronRight size={16} className="text-rose-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── STEP 2: Employee ── */}
        {step === 'employee' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-mauve-400 hover:text-mauve-700 mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-display text-xl font-semibold text-mauve-900 mb-5">Stylistin wählen</h2>
            <div className="space-y-3">
              <button
                onClick={() => { setSelectedEmployee(null); setStep('datetime'); }}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border border-cream-200 hover:border-rose-300 hover:shadow-rose transition-all text-left group"
              >
                <div className="h-11 w-11 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0 group-hover:bg-cream-300 transition-colors">
                  <User size={18} className="text-mauve-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-mauve-900">Kein Vorzug</p>
                  <p className="text-xs text-mauve-400">Erste verfügbare Stylistin</p>
                </div>
                <ChevronRight size={16} className="text-rose-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
              {availableEmployees.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setSelectedEmployee(e); setStep('datetime'); }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border border-cream-200 hover:border-rose-300 hover:shadow-rose transition-all text-left group"
                >
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
                  >
                    {e.name[0].toUpperCase()}
                  </div>
                  <p className="font-medium text-mauve-900 flex-1">{e.name}</p>
                  <ChevronRight size={16} className="text-rose-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: Date & time ── */}
        {step === 'datetime' && (
          <div className="animate-fade-up">
            <button
              onClick={() => setStep(availableEmployees.length > 1 ? 'employee' : 'service')}
              className="flex items-center gap-1 text-sm text-mauve-400 hover:text-mauve-700 mb-5 transition-colors"
            >
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-display text-xl font-semibold text-mauve-900 mb-5">Datum & Uhrzeit</h2>

            {/* Date strip */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-hide">
              {days.map(day => {
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className="flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 min-w-[52px]"
                    style={isSelected
                      ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: 'white', boxShadow: `0 4px 12px ${accentColor}50` }
                      : { backgroundColor: 'white', color: '#8b6f6f', border: '1px solid #ead8cf' }
                    }
                  >
                    <span className="text-xs uppercase font-medium opacity-80">{format(day, 'EEE', { locale: de })}</span>
                    <span className="font-bold text-lg leading-tight">{format(day, 'd')}</span>
                    <span className="text-xs opacity-70">{format(day, 'MMM', { locale: de })}</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {slots.filter(s => s.available).length === 0 ? (
              <div className="bg-white rounded-3xl border border-cream-200 p-10 text-center text-mauve-300 text-sm">
                Keine freien Zeiten an diesem Tag
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {slots.filter(s => s.available).map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className="py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                    style={selectedSlot === slot
                      ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: 'white', boxShadow: `0 4px 12px ${accentColor}40` }
                      : { backgroundColor: 'white', color: '#8b6f6f', border: '1px solid #ead8cf' }
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
                onClick={() => setStep('details')}
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 8px 24px ${accentColor}40` }}
              >
                Weiter – {formatTime(selectedSlot.startTime)} Uhr
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        )}

        {/* ── STEP 4: Contact details ── */}
        {step === 'details' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('datetime')} className="flex items-center gap-1 text-sm text-mauve-400 hover:text-mauve-700 mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-display text-xl font-semibold text-mauve-900 mb-5">Ihre Kontaktdaten</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Vorname *" value={details.firstName} onChange={e => setDetails(d => ({ ...d, firstName: e.target.value }))} placeholder="Sofia" autoComplete="given-name" />
                <Input label="Nachname *" value={details.lastName}  onChange={e => setDetails(d => ({ ...d, lastName:  e.target.value }))} placeholder="Müller"  autoComplete="family-name" />
              </div>
              <Input label="E-Mail *" type="email" value={details.email} onChange={e => setDetails(d => ({ ...d, email: e.target.value }))} placeholder="sofia@example.de" autoComplete="email" />
              <Input label="Telefon"  type="tel"   value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} placeholder="+49 89 123456"   autoComplete="tel" />
              <Textarea label="Anmerkung (optional)" value={details.notes} onChange={e => setDetails(d => ({ ...d, notes: e.target.value }))} placeholder="Besondere Wünsche..." className="h-20" />

              {/* Summary card */}
              <div className="glass-rose rounded-3xl border border-white/60 shadow-rose p-5 space-y-0 divide-y divide-cream-200/60">
                <p className="text-xs font-medium text-rose-400 uppercase tracking-wider pb-3">Ihre Buchung</p>
                {[
                  { label: 'Service',   value: selectedService?.name },
                  { label: 'Stylistin', value: selectedEmployee?.name || 'Nach Verfügbarkeit' },
                  { label: 'Datum',     value: formatDate(selectedSlot!.startTime, 'EEEE, dd. MMMM yyyy') },
                  { label: 'Uhrzeit',   value: `${formatTime(selectedSlot!.startTime)} – ${formatTime(selectedSlot!.endTime)} Uhr` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2.5 text-sm">
                    <span className="text-mauve-400">{row.label}</span>
                    <span className="font-medium text-mauve-900">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-bold">
                  <span className="text-mauve-700">Gesamt</span>
                  <span style={{ color: accentColor }}>{formatPrice(selectedService?.price || 0)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="xl"
                loading={saving}
                disabled={!details.firstName || !details.lastName || !details.email}
                onClick={handleBook}
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 8px 24px ${accentColor}40` }}
              >
                <Sparkles size={18} />
                Jetzt buchen
              </Button>

              <p className="text-xs text-center text-mauve-300">
                Kein Konto nötig · Bestätigung per E-Mail
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
