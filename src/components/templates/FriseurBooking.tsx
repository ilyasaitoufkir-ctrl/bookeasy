import { useEffect, useState } from 'react';
import { addDays, startOfDay, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight, CheckCircle2, User, CalendarPlus, Home, Scissors } from 'lucide-react';
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

const GOLD = '#d4a843';
const GOLD_LIGHT = '#f0c55a';

export default function FriseurBooking({ business }: { business: Business }) {
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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
          <Scissors size={20} className="text-dark-900" />
        </div>
        <LoadingSpinner size="md" className="text-gold-500" />
      </div>
    </div>
  );

  if (step === 'confirmed' && confirmed) {
    return (
      <div className="min-h-screen bg-dark-gradient">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }} />
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 mx-auto mb-5" style={{ borderColor: GOLD, background: 'rgba(212,168,67,0.1)' }}>
              <CheckCircle2 size={40} style={{ color: GOLD }} />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2">Termin bestätigt! ✓</h1>
            <p className="text-dark-400">Bestätigung geht an <span className="text-white font-medium">{details.email}</span></p>
          </div>
          <div className="bg-dark-800 rounded-3xl border p-6 mb-5 animate-scale-in" style={{ borderColor: `${GOLD}40` }}>
            <div className="flex items-center gap-3 mb-5 pb-5 border-b" style={{ borderColor: `${GOLD}20` }}>
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center text-dark-900 font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
                {business.name[0]}
              </div>
              <div>
                <p className="font-serif font-semibold text-white">{business.name}</p>
                {business.address && <p className="text-xs text-dark-400">{business.address}, {business.city}</p>}
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: `${GOLD}15` }}>
              {[
                { l: 'Service',     v: selSvc?.name },
                { l: 'Barber',      v: selEmp?.name || 'Nach Verfügbarkeit' },
                { l: 'Datum',       v: formatDate(confirmed.startTime, 'EEEE, dd. MMMM yyyy') },
                { l: 'Uhrzeit',     v: `${formatTime(confirmed.startTime)} – ${formatTime(confirmed.endTime)} Uhr` },
                { l: 'Name',        v: `${details.firstName} ${details.lastName}` },
                { l: 'Gesamtpreis', v: formatPrice(confirmed.servicePrice) },
              ].map(r => (
                <div key={r.l} className="flex justify-between py-3 text-sm">
                  <span className="text-dark-400">{r.l}</span>
                  <span className="font-medium text-white text-right max-w-[55%]">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full py-4 rounded-2xl font-bold text-dark-900 hover:opacity-90 transition flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
              onClick={() => downloadICS({ title: `${selSvc?.name} bei ${business.name}`, start: confirmed.startTime, end: confirmed.endTime, location: [business.address, business.city].filter(Boolean).join(', '), description: `Termin bei ${business.name}` })}>
              <CalendarPlus size={18} /> In Kalender eintragen
            </button>
            <button className="w-full py-4 rounded-2xl font-medium text-dark-300 border border-dark-600 hover:border-dark-500 transition flex items-center justify-center gap-2"
              onClick={() => { setStep('service'); setSelSvc(null); setSelEmp(null); setSelSlot(null); setConfirmed(null); setDetails({ firstName: '', lastName: '', email: '', phone: '', notes: '' }); }}>
              <Home size={16} /> Neuen Termin buchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const STEPS: Exclude<Step, 'confirmed'>[] = ['service', 'employee', 'datetime', 'details'];
  const stepIdx = STEPS.indexOf(step as Exclude<Step, 'confirmed'>);
  const stepNames = { service: 'Service', employee: 'Barber', datetime: 'Termin', details: 'Kontakt' };

  return (
    <div className="min-h-screen bg-dark-gradient text-white">
      {/* Gold top accent */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }} />

      {/* Header */}
      <div className="border-b border-dark-700/50 px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-start gap-4">
          {business.logo
            ? <img src={business.logo} alt={business.name} className="h-14 w-14 rounded-2xl object-cover" />
            : <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-dark-900 text-xl font-bold font-serif flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>{business.name[0]}</div>
          }
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">{business.name}</h1>
            <p className="text-dark-400 text-sm mt-0.5">{business.category}</p>
            {business.description && <p className="text-dark-400 text-sm mt-1 max-w-xs">{business.description}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-dark-500">
              {business.city  && <span className="flex items-center gap-1"><MapPin size={11} />{business.city}</span>}
              {business.phone && <span className="flex items-center gap-1"><Phone  size={11} />{business.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="h-0.5 w-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: i <= stepIdx ? GOLD : '#333' }} />
                <span className={`text-xs transition-colors ${i === stepIdx ? 'font-semibold' : 'text-dark-500'}`}
                  style={i === stepIdx ? { color: GOLD } : {}}>
                  {stepNames[s]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {step === 'service' && (
          <div className="animate-fade-up">
            <h2 className="font-serif text-xl font-bold mb-5">Service wählen</h2>
            {services.length === 0
              ? <p className="text-center py-12 text-dark-500 text-sm">Noch keine Services verfügbar.</p>
              : (
                <div className="space-y-2">
                  {services.map(s => (
                    <button key={s.id}
                      onClick={() => { setSelSvc(s); setStep(availEmps.length > 1 ? 'employee' : 'datetime'); }}
                      className="w-full flex items-center gap-4 p-4 bg-dark-800 rounded-2xl border border-dark-700 hover:border-dark-500 transition-all text-left group">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white group-hover:text-gold-300 transition">{s.name}</p>
                        {s.description && <p className="text-xs text-dark-500 mt-0.5 truncate">{s.description}</p>}
                        <span className="flex items-center gap-1 text-xs text-dark-500 mt-1"><Clock size={10} /> {formatDuration(s.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color: GOLD }}>{formatPrice(s.price)}</span>
                        <ChevronRight size={16} className="text-dark-600 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
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
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-dark-400 hover:text-white mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-bold mb-5">Barber wählen</h2>
            <div className="space-y-2">
              <button onClick={() => { setSelEmp(null); setStep('datetime'); }}
                className="w-full flex items-center gap-4 p-4 bg-dark-800 rounded-2xl border border-dark-700 hover:border-dark-500 transition-all text-left group">
                <div className="h-11 w-11 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0"><User size={18} className="text-dark-400" /></div>
                <div className="flex-1"><p className="font-semibold text-white">Kein Vorzug</p><p className="text-xs text-dark-500">Erster verfügbarer Barber</p></div>
                <ChevronRight size={16} className="text-dark-600 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
              </button>
              {availEmps.map(e => (
                <button key={e.id} onClick={() => { setSelEmp(e); setStep('datetime'); }}
                  className="w-full flex items-center gap-4 p-4 bg-dark-800 rounded-2xl border border-dark-700 hover:border-dark-500 transition-all text-left group">
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-dark-900 font-bold text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>{e.name[0].toUpperCase()}</div>
                  <p className="font-semibold text-white flex-1">{e.name}</p>
                  <ChevronRight size={16} className="text-dark-600 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'datetime' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep(availEmps.length > 1 ? 'employee' : 'service')}
              className="flex items-center gap-1 text-sm text-dark-400 hover:text-white mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-bold mb-5">Datum & Uhrzeit</h2>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-hide">
              {days.map(day => {
                const isSel = format(day, 'yyyy-MM-dd') === format(selDate, 'yyyy-MM-dd');
                return (
                  <button key={day.toISOString()} onClick={() => setSelDate(day)}
                    className="flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 min-w-[52px]"
                    style={isSel
                      ? { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#111111', boxShadow: `0 4px 12px ${GOLD}50` }
                      : { backgroundColor: '#1c1c1c', color: '#9e9e9e', border: '1px solid #333' }}>
                    <span className="text-xs uppercase font-medium opacity-80">{format(day, 'EEE', { locale: de })}</span>
                    <span className="font-bold text-lg leading-tight">{format(day, 'd')}</span>
                    <span className="text-xs opacity-70">{format(day, 'MMM', { locale: de })}</span>
                  </button>
                );
              })}
            </div>
            {slots.filter(s => s.available).length === 0
              ? <div className="bg-dark-800 rounded-3xl border border-dark-700 p-10 text-center text-dark-500 text-sm">Keine freien Zeiten an diesem Tag</div>
              : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.filter(s => s.available).map((slot, i) => (
                    <button key={i} onClick={() => setSelSlot(slot)}
                      className="py-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={selSlot === slot
                        ? { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#111111', boxShadow: `0 4px 12px ${GOLD}40` }
                        : { backgroundColor: '#1c1c1c', color: '#c2c2c2', border: '1px solid #333' }}>
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                </div>
              )
            }
            {selSlot && (
              <button className="w-full mt-6 py-4 rounded-2xl font-bold text-dark-900 hover:opacity-90 transition flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, boxShadow: `0 8px 24px ${GOLD}40` }}
                onClick={() => setStep('details')}>
                Weiter – {formatTime(selSlot.startTime)} Uhr <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('datetime')} className="flex items-center gap-1 text-sm text-dark-400 hover:text-white mb-5 transition-colors">
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-bold mb-5">Kontaktdaten</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([['firstName', 'Vorname *', 'Max'], ['lastName', 'Nachname *', 'Müller']] as const).map(([f, l, p]) => (
                  <div key={f}>
                    <label className="block text-dark-400 text-xs font-semibold uppercase tracking-widest mb-1.5">{l}</label>
                    <input value={details[f]} onChange={e => setDetails(d => ({ ...d, [f]: e.target.value }))} placeholder={p}
                      className="w-full bg-dark-800 border border-dark-600 rounded-2xl px-4 py-3 text-white placeholder-dark-600 focus:outline-none focus:border-gold-500 transition" />
                  </div>
                ))}
              </div>
              {([['email', 'E-Mail *', 'email', 'max@example.de'], ['phone', 'Telefon', 'tel', '+49 89 123456']] as const).map(([f, l, t, p]) => (
                <div key={f}>
                  <label className="block text-dark-400 text-xs font-semibold uppercase tracking-widest mb-1.5">{l}</label>
                  <input type={t} value={details[f]} onChange={e => setDetails(d => ({ ...d, [f]: e.target.value }))} placeholder={p}
                    className="w-full bg-dark-800 border border-dark-600 rounded-2xl px-4 py-3 text-white placeholder-dark-600 focus:outline-none focus:border-gold-500 transition" />
                </div>
              ))}
              <div>
                <label className="block text-dark-400 text-xs font-semibold uppercase tracking-widest mb-1.5">Anmerkung</label>
                <textarea value={details.notes} onChange={e => setDetails(d => ({ ...d, notes: e.target.value }))} placeholder="Besondere Wünsche..." rows={3}
                  className="w-full bg-dark-800 border border-dark-600 rounded-2xl px-4 py-3 text-white placeholder-dark-600 focus:outline-none focus:border-gold-500 resize-none" />
              </div>

              {/* Summary */}
              <div className="bg-dark-800 rounded-3xl border p-5" style={{ borderColor: `${GOLD}30` }}>
                <p className="text-xs font-semibold uppercase tracking-widest pb-3 mb-3 border-b" style={{ color: GOLD, borderColor: `${GOLD}20` }}>Ihre Buchung</p>
                <div className="divide-y" style={{ borderColor: `${GOLD}10` }}>
                  {[
                    { l: 'Service', v: selSvc?.name },
                    { l: 'Barber',  v: selEmp?.name || 'Nach Verfügbarkeit' },
                    { l: 'Datum',   v: selSlot ? formatDate(selSlot.startTime, 'EEEE, dd. MMMM yyyy') : '' },
                    { l: 'Uhrzeit', v: selSlot ? `${formatTime(selSlot.startTime)} – ${formatTime(selSlot.endTime)} Uhr` : '' },
                  ].map(r => (
                    <div key={r.l} className="flex justify-between py-2.5 text-sm">
                      <span className="text-dark-400">{r.l}</span>
                      <span className="font-medium text-white">{r.v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 text-sm font-bold">
                    <span className="text-dark-300">Gesamt</span>
                    <span style={{ color: GOLD }}>{formatPrice(selSvc?.price || 0)}</span>
                  </div>
                </div>
              </div>

              <button
                className="w-full py-4 rounded-2xl font-bold text-dark-900 hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, boxShadow: `0 8px 24px ${GOLD}40` }}
                disabled={!details.firstName || !details.lastName || !details.email || saving}
                onClick={handleBook}>
                {saving ? 'Buchen…' : <><Scissors size={18} /> Jetzt buchen</>}
              </button>
              <p className="text-xs text-center text-dark-600">Kein Konto nötig · Bestätigung per E-Mail</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
