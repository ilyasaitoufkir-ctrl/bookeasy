import { useEffect, useState } from 'react';
import { addDays, startOfDay, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight, CheckCircle2, User, CalendarPlus, Home, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getServices, getEmployees } from '../../services/firebase/businesses';
import { getBookingsByBusiness, getBlockedTimes, createBooking } from '../../services/firebase/bookings';
import { getAvailableTimeSlots, formatTime, formatDate } from '../../utils/calendar';
import { formatPrice, formatDuration } from '../../utils/helpers';
import type { Business, Service, Employee, Booking, BlockedTime as BT, TimeSlot } from '../../types';
import toast from 'react-hot-toast';
import { sendBookingConfirmation } from '../../services/sendEmail';

type Step = 'service' | 'employee' | 'datetime' | 'details' | 'confirmed';

function downloadICS(b: { title: string; start: Date; end: Date; location: string; description: string }) {
  const p = (n: number) => String(n).padStart(2, '0');
  const f = (d: Date) => `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//BookEasy//DE','BEGIN:VEVENT',
    `DTSTART:${f(b.start)}`,`DTEND:${f(b.end)}`,`SUMMARY:${b.title}`,`LOCATION:${b.location}`,
    `DESCRIPTION:${b.description}`,`UID:bookeasy-${Date.now()}@bookeasy.app`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: 'termin.ics' }).click();
  URL.revokeObjectURL(url);
}

const STEP_LABELS = { service: 'Service', employee: 'Stylistin', datetime: 'Termin', details: 'Kontakt' };

export default function KosmetikBooking({ business }: { business: Business }) {
  const accent = business.primaryColor || '#c9a99a';

  const [services,  setServices]  = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [blocked,   setBlocked]   = useState<BT[]>([]);
  const [loading,   setLoading]   = useState(true);

  const [step, setStep] = useState<Step>('service');
  const [selSvc,  setSelSvc]  = useState<Service  | null>(null);
  const [selEmp,  setSelEmp]  = useState<Employee | null>(null);
  const [selDate, setSelDate] = useState(new Date());
  const [selSlot, setSelSlot] = useState<TimeSlot | null>(null);
  const [slots,   setSlots]   = useState<TimeSlot[]>([]);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [details, setDetails] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });

  useEffect(() => {
    Promise.all([
      getServices(business.id).then(s => setServices(s.filter(x => x.isActive))),
      getEmployees(business.id).then(e => setEmployees(e.filter(x => x.isActive))),
      getBookingsByBusiness(business.id).then(setBookings),
      getBlockedTimes(business.id).then(setBlocked),
    ]).finally(() => setLoading(false));
  }, [business.id]);

  useEffect(() => {
    if (!selSvc) return;
    setSlots(getAvailableTimeSlots(selDate, selSvc.duration, business.openingHours, bookings, blocked, selEmp || undefined));
    setSelSlot(null);
  }, [selSvc, selEmp, selDate, business.openingHours, bookings, blocked]);

  const availEmps = selSvc ? employees.filter(e => !e.services.length || e.services.includes(selSvc.id)) : employees;
  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  async function handleBook() {
    if (!selSvc || !selSlot) return;
    setSaving(true);
    try {
      const booking = await createBooking({
        businessId: business.id,
        customerName: `${details.firstName} ${details.lastName}`.trim(),
        customerEmail: details.email, customerPhone: details.phone,
        serviceId: selSvc.id, serviceName: selSvc.name,
        serviceDuration: selSvc.duration, servicePrice: selSvc.price,
        employeeId: selEmp?.id, employeeName: selEmp?.name,
        startTime: selSlot.startTime, endTime: selSlot.endTime,
        status: 'pending', paymentMethod: 'onsite', paymentStatus: 'pending',
        totalAmount: selSvc.price, notes: details.notes,
      });
      setConfirmed(booking); setStep('confirmed');
      sendBookingConfirmation(booking, business);
    } catch { toast.error('Fehler beim Buchen. Bitte erneut versuchen.'); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (step === 'confirmed' && confirmed) {
    return (
      <div className="min-h-screen bg-beauty-gradient">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-rose mx-auto mb-5">
              <CheckCircle2 size={40} className="text-rose-400" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-mauve-900 mb-2">Ihr Termin ist gebucht! ✅</h1>
            <p className="text-mauve-400">Bestätigung geht an <span className="text-mauve-700 font-medium">{details.email}</span></p>
          </div>
          <div className="glass-rose rounded-3xl shadow-rose-lg border border-white/60 p-6 mb-5 animate-scale-in">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-cream-300/60">
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
                {business.name[0]}
              </div>
              <div>
                <p className="font-serif font-semibold text-mauve-900">{business.name}</p>
                {business.address && <p className="text-xs text-mauve-400">{business.address}, {business.city}</p>}
              </div>
            </div>
            <div className="divide-y divide-cream-200/60">
              {[
                { l: 'Service',     v: selSvc?.name },
                { l: 'Stylistin',   v: selEmp?.name || 'Nach Verfügbarkeit' },
                { l: 'Datum',       v: formatDate(confirmed.startTime, 'EEEE, dd. MMMM yyyy') },
                { l: 'Uhrzeit',     v: `${formatTime(confirmed.startTime)} – ${formatTime(confirmed.endTime)} Uhr` },
                { l: 'Name',        v: `${details.firstName} ${details.lastName}` },
                { l: 'Gesamtpreis', v: formatPrice(confirmed.servicePrice) },
              ].map(r => (
                <div key={r.l} className="flex justify-between py-3 text-sm">
                  <span className="text-mauve-400">{r.l}</span>
                  <span className="font-medium text-mauve-900 text-right max-w-[55%]">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Button className="w-full" size="lg"
              onClick={() => downloadICS({ title: `${selSvc?.name} bei ${business.name}`, start: confirmed.startTime, end: confirmed.endTime, location: [business.address, business.city].filter(Boolean).join(', '), description: `Termin bei ${business.name}` })}
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
              <CalendarPlus size={18} /> Termin in Kalender speichern
            </Button>
            <Button className="w-full" variant="ghost" size="lg"
              onClick={() => { setStep('service'); setSelSvc(null); setSelEmp(null); setSelSlot(null); setConfirmed(null); setDetails({ firstName: '', lastName: '', email: '', phone: '', notes: '' }); }}>
              <Home size={16} /> Neuen Termin buchen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const STEPS: Exclude<Step, 'confirmed'>[] = ['service', 'employee', 'datetime', 'details'];
  const stepIdx = STEPS.indexOf(step as Exclude<Step, 'confirmed'>);

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${accent}22, ${accent}08)` }}>
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at top right, ${accent}40, transparent 60%)` }} />
        <div className="relative max-w-2xl mx-auto px-4 py-8 flex items-start gap-4">
          {business.logo
            ? <img src={business.logo} alt={business.name} className="h-16 w-16 rounded-2xl object-cover shadow-rose" />
            : <div className="h-16 w-16 rounded-2xl shadow-rose flex items-center justify-center text-white text-2xl font-bold font-serif"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>{business.name[0]}</div>
          }
          <div className="pt-0.5">
            <h1 className="font-serif text-2xl font-semibold text-mauve-900">{business.name}</h1>
            <p className="text-sm text-mauve-400 mt-0.5">{business.category}</p>
            {business.description && <p className="text-sm text-mauve-500 mt-1 max-w-xs leading-relaxed">{business.description}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-mauve-400">
              {business.city  && <span className="flex items-center gap-1"><MapPin size={11} />{business.city}</span>}
              {business.phone && <span className="flex items-center gap-1"><Phone  size={11} />{business.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="h-1.5 w-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: i <= stepIdx ? accent : '#e8c4b4', opacity: i < stepIdx ? 0.5 : 1 }} />
                <span className={`text-xs transition-colors ${i === stepIdx ? 'text-rose-600 font-medium' : 'text-mauve-300'}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="w-2 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {step === 'service' && (
          <div className="animate-fade-up">
            <h2 className="font-serif text-xl font-semibold text-mauve-900 mb-5">Service wählen</h2>
            {services.length === 0
              ? <p className="text-center py-12 text-mauve-300 text-sm">Noch keine Services verfügbar.</p>
              : (
                <div className="space-y-3">
                  {services.map(s => (
                    <button key={s.id}
                      onClick={() => { setSelSvc(s); setStep(availEmps.length > 1 ? 'employee' : 'datetime'); }}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border border-cream-200 hover:border-rose-300 hover:shadow-rose transition-all text-left group">
                      <div className="h-4 w-4 rounded-full flex-shrink-0 ring-2 ring-cream-200 group-hover:ring-rose-200 transition-all" style={{ backgroundColor: s.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-mauve-900">{s.name}</p>
                        {s.description && <p className="text-xs text-mauve-400 mt-0.5 truncate">{s.description}</p>}
                        <span className="flex items-center gap-1 text-xs text-mauve-400 mt-1"><Clock size={10} /> {formatDuration(s.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold" style={{ color: accent }}>{formatPrice(s.price)}</span>
                        <ChevronRight size={16} className="text-rose-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {step === 'employee' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-mauve-400 hover:text-mauve-700 mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-semibold text-mauve-900 mb-5">Stylistin wählen</h2>
            <div className="space-y-3">
              <button onClick={() => { setSelEmp(null); setStep('datetime'); }}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border border-cream-200 hover:border-rose-300 hover:shadow-rose transition-all text-left group">
                <div className="h-11 w-11 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0"><User size={18} className="text-mauve-400" /></div>
                <div className="flex-1"><p className="font-medium text-mauve-900">Kein Vorzug</p><p className="text-xs text-mauve-400">Erste verfügbare Stylistin</p></div>
                <ChevronRight size={16} className="text-rose-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
              {availEmps.map(e => (
                <button key={e.id} onClick={() => { setSelEmp(e); setStep('datetime'); }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border border-cream-200 hover:border-rose-300 hover:shadow-rose transition-all text-left group">
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>{e.name[0].toUpperCase()}</div>
                  <p className="font-medium text-mauve-900 flex-1">{e.name}</p>
                  <ChevronRight size={16} className="text-rose-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'datetime' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep(availEmps.length > 1 ? 'employee' : 'service')}
              className="flex items-center gap-1 text-sm text-mauve-400 hover:text-mauve-700 mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-semibold text-mauve-900 mb-5">Datum & Uhrzeit</h2>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-hide">
              {days.map(day => {
                const isSel = format(day, 'yyyy-MM-dd') === format(selDate, 'yyyy-MM-dd');
                return (
                  <button key={day.toISOString()} onClick={() => setSelDate(day)}
                    className="flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 min-w-[52px]"
                    style={isSel
                      ? { background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: 'white', boxShadow: `0 4px 12px ${accent}50` }
                      : { backgroundColor: 'white', color: '#8b6f6f', border: '1px solid #ead8cf' }}>
                    <span className="text-xs uppercase font-medium opacity-80">{format(day, 'EEE', { locale: de })}</span>
                    <span className="font-bold text-lg leading-tight">{format(day, 'd')}</span>
                    <span className="text-xs opacity-70">{format(day, 'MMM', { locale: de })}</span>
                  </button>
                );
              })}
            </div>
            {slots.filter(s => s.available).length === 0
              ? <div className="bg-white rounded-3xl border border-cream-200 p-10 text-center text-mauve-300 text-sm">Keine freien Zeiten an diesem Tag</div>
              : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {slots.filter(s => s.available).map((slot, i) => (
                    <button key={i} onClick={() => setSelSlot(slot)}
                      className="py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                      style={selSlot === slot
                        ? { background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: 'white', boxShadow: `0 4px 12px ${accent}40` }
                        : { backgroundColor: 'white', color: '#8b6f6f', border: '1px solid #ead8cf' }}>
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                </div>
              )
            }
            {selSlot && (
              <Button className="w-full mt-6" size="lg" onClick={() => setStep('details')}
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 8px 24px ${accent}40` }}>
                Weiter – {formatTime(selSlot.startTime)} Uhr <ChevronRight size={18} />
              </Button>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('datetime')} className="flex items-center gap-1 text-sm text-mauve-400 hover:text-mauve-700 mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-semibold text-mauve-900 mb-5">Ihre Kontaktdaten</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Vorname *" value={details.firstName} onChange={e => setDetails(d => ({ ...d, firstName: e.target.value }))} placeholder="Sofia" />
                <Input label="Nachname *" value={details.lastName} onChange={e => setDetails(d => ({ ...d, lastName: e.target.value }))} placeholder="Müller" />
              </div>
              <Input label="E-Mail *" type="email" value={details.email} onChange={e => setDetails(d => ({ ...d, email: e.target.value }))} placeholder="sofia@example.de" />
              <Input label="Telefon" type="tel" value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} placeholder="+49 89 123456" />
              <Textarea label="Anmerkung" value={details.notes} onChange={e => setDetails(d => ({ ...d, notes: e.target.value }))} placeholder="Besondere Wünsche..." className="h-20" />
              <div className="glass-rose rounded-3xl border border-white/60 shadow-rose p-5 divide-y divide-cream-200/60">
                <p className="text-xs font-medium text-rose-400 uppercase tracking-wider pb-3">Ihre Buchung</p>
                {[
                  { l: 'Service',   v: selSvc?.name },
                  { l: 'Stylistin', v: selEmp?.name || 'Nach Verfügbarkeit' },
                  { l: 'Datum',     v: selSlot ? formatDate(selSlot.startTime, 'EEEE, dd. MMMM yyyy') : '' },
                  { l: 'Uhrzeit',   v: selSlot ? `${formatTime(selSlot.startTime)} – ${formatTime(selSlot.endTime)} Uhr` : '' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between py-2.5 text-sm">
                    <span className="text-mauve-400">{r.l}</span>
                    <span className="font-medium text-mauve-900">{r.v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-bold">
                  <span className="text-mauve-700">Gesamt</span>
                  <span style={{ color: accent }}>{formatPrice(selSvc?.price || 0)}</span>
                </div>
              </div>
              <Button className="w-full" size="xl" loading={saving}
                disabled={!details.firstName || !details.lastName || !details.email} onClick={handleBook}
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 8px 24px ${accent}40` }}>
                <Sparkles size={18} /> Jetzt buchen
              </Button>
              <p className="text-xs text-center text-mauve-300">Kein Konto nötig · Bestätigung per E-Mail</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
