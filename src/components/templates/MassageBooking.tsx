import { useEffect, useState } from 'react';
import { addDays, startOfDay, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight, CheckCircle2, User, CalendarPlus, Home, Leaf } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getServices, getEmployees } from '../../services/firebase/businesses';
import { getBookingsByBusiness, getBlockedTimes, createBooking } from '../../services/firebase/bookings';
import { getAvailableTimeSlots, formatTime, formatDate } from '../../utils/calendar';
import { formatPrice, formatDuration } from '../../utils/helpers';
import type { Business, Service, Employee, Booking, BlockedTime as BT, TimeSlot } from '../../types';
import toast from 'react-hot-toast';

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

const SAGE = '#5b8c5a';
const SAGE_LIGHT = '#8ab07f';
const TEXT = '#2e4a2e';
const BG = '#f5f0e8';

export default function MassageBooking({ business }: { business: Business }) {
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
    } catch { toast.error('Fehler beim Buchen. Bitte erneut versuchen.'); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
      <div className="text-center">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})` }}>
          <Leaf size={20} className="text-white" />
        </div>
        <LoadingSpinner size="md" className="text-sage-600" />
      </div>
    </div>
  );

  if (step === 'confirmed' && confirmed) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BG }}>
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${SAGE}, ${SAGE_LIGHT})` }} />
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg mx-auto mb-5" style={{ boxShadow: `0 8px 24px ${SAGE}30` }}>
              <CheckCircle2 size={40} style={{ color: SAGE }} />
            </div>
            <h1 className="font-serif text-3xl font-semibold mb-2" style={{ color: TEXT }}>Ihr Termin ist gebucht! ✓</h1>
            <p style={{ color: `${TEXT}88` }}>Bestätigung geht an <span style={{ color: TEXT }} className="font-medium">{details.email}</span></p>
          </div>
          <div className="bg-white rounded-3xl p-6 mb-5 animate-scale-in" style={{ boxShadow: `0 8px 32px ${SAGE}20`, border: `1px solid ${SAGE}20` }}>
            <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: `1px solid ${SAGE}20` }}>
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})` }}>
                {business.name[0]}
              </div>
              <div>
                <p className="font-serif font-semibold" style={{ color: TEXT }}>{business.name}</p>
                {business.address && <p className="text-xs" style={{ color: `${TEXT}66` }}>{business.address}, {business.city}</p>}
              </div>
            </div>
            <div>
              {[
                { l: 'Behandlung', v: selSvc?.name },
                { l: 'Therapeutin', v: selEmp?.name || 'Nach Verfügbarkeit' },
                { l: 'Datum',       v: formatDate(confirmed.startTime, 'EEEE, dd. MMMM yyyy') },
                { l: 'Uhrzeit',     v: `${formatTime(confirmed.startTime)} – ${formatTime(confirmed.endTime)} Uhr` },
                { l: 'Name',        v: `${details.firstName} ${details.lastName}` },
                { l: 'Preis',       v: formatPrice(confirmed.servicePrice) },
              ].map(r => (
                <div key={r.l} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: `1px solid ${SAGE}10` }}>
                  <span style={{ color: `${TEXT}77` }}>{r.l}</span>
                  <span className="font-medium text-right max-w-[55%]" style={{ color: TEXT }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full py-4 rounded-2xl font-semibold text-white hover:opacity-90 transition flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})`, boxShadow: `0 8px 24px ${SAGE}40` }}
              onClick={() => downloadICS({ title: `${selSvc?.name} bei ${business.name}`, start: confirmed.startTime, end: confirmed.endTime, location: [business.address, business.city].filter(Boolean).join(', '), description: `Termin bei ${business.name}` })}>
              <CalendarPlus size={18} /> In Kalender eintragen
            </button>
            <button className="w-full py-4 rounded-2xl font-medium border-2 hover:opacity-80 transition flex items-center justify-center gap-2"
              style={{ borderColor: `${SAGE}40`, color: TEXT, backgroundColor: 'white' }}
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
  const stepNames = { service: 'Behandlung', employee: 'Therapeutin', datetime: 'Termin', details: 'Kontakt' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${SAGE}, ${SAGE_LIGHT})` }} />

      {/* Header */}
      <div className="px-4 py-6 border-b" style={{ backgroundColor: 'white', borderColor: `${SAGE}20` }}>
        <div className="max-w-2xl mx-auto flex items-start gap-4">
          {business.logo
            ? <img src={business.logo} alt={business.name} className="h-14 w-14 rounded-2xl object-cover" />
            : <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold font-serif flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})` }}>{business.name[0]}</div>
          }
          <div>
            <h1 className="font-serif text-2xl font-semibold" style={{ color: TEXT }}>{business.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: `${TEXT}77` }}>{business.category}</p>
            {business.description && <p className="text-sm mt-1 max-w-xs leading-relaxed" style={{ color: `${TEXT}88` }}>{business.description}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: `${TEXT}66` }}>
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
                <div className="h-1 w-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: i <= stepIdx ? SAGE : `${SAGE}25` }} />
                <span className={`text-xs transition-colors ${i === stepIdx ? 'font-semibold' : ''}`}
                  style={i === stepIdx ? { color: SAGE } : { color: `${TEXT}55` }}>
                  {stepNames[s]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {step === 'service' && (
          <div className="animate-fade-up">
            <h2 className="font-serif text-xl font-semibold mb-5" style={{ color: TEXT }}>Behandlung wählen</h2>
            {services.length === 0
              ? <p className="text-center py-12 text-sm" style={{ color: `${TEXT}66` }}>Noch keine Behandlungen verfügbar.</p>
              : (
                <div className="space-y-3">
                  {services.map(s => (
                    <button key={s.id}
                      onClick={() => { setSelSvc(s); setStep(availEmps.length > 1 ? 'employee' : 'datetime'); }}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border-2 transition-all text-left group hover:shadow-md"
                      style={{ borderColor: `${SAGE}20` }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = `${SAGE}50`)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = `${SAGE}20`)}>
                      <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${SAGE}15` }}>
                        <Leaf size={16} style={{ color: SAGE }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold" style={{ color: TEXT }}>{s.name}</p>
                        {s.description && <p className="text-xs mt-0.5 truncate" style={{ color: `${TEXT}66` }}>{s.description}</p>}
                        <span className="flex items-center gap-1 text-xs mt-1" style={{ color: `${TEXT}55` }}><Clock size={10} /> {formatDuration(s.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color: SAGE }}>{formatPrice(s.price)}</span>
                        <ChevronRight size={16} style={{ color: `${SAGE}60` }} />
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
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm mb-5 transition-colors"
              style={{ color: `${TEXT}77` }}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-semibold mb-5" style={{ color: TEXT }}>Therapeutin wählen</h2>
            <div className="space-y-3">
              <button onClick={() => { setSelEmp(null); setStep('datetime'); }}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border-2 transition-all text-left hover:shadow-md"
                style={{ borderColor: `${SAGE}20` }}>
                <div className="h-11 w-11 rounded-full bg-white border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: `${SAGE}30` }}><User size={18} style={{ color: SAGE_LIGHT }} /></div>
                <div className="flex-1"><p className="font-semibold" style={{ color: TEXT }}>Kein Vorzug</p><p className="text-xs" style={{ color: `${TEXT}66` }}>Erste verfügbare Therapeutin</p></div>
                <ChevronRight size={16} style={{ color: `${SAGE}60` }} />
              </button>
              {availEmps.map(e => (
                <button key={e.id} onClick={() => { setSelEmp(e); setStep('datetime'); }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-3xl border-2 transition-all text-left hover:shadow-md"
                  style={{ borderColor: `${SAGE}20` }}>
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})` }}>{e.name[0].toUpperCase()}</div>
                  <p className="font-semibold flex-1" style={{ color: TEXT }}>{e.name}</p>
                  <ChevronRight size={16} style={{ color: `${SAGE}60` }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'datetime' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep(availEmps.length > 1 ? 'employee' : 'service')} className="flex items-center gap-1 text-sm mb-5 transition-colors"
              style={{ color: `${TEXT}77` }}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-semibold mb-5" style={{ color: TEXT }}>Datum & Uhrzeit</h2>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-hide">
              {days.map(day => {
                const isSel = format(day, 'yyyy-MM-dd') === format(selDate, 'yyyy-MM-dd');
                return (
                  <button key={day.toISOString()} onClick={() => setSelDate(day)}
                    className="flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 min-w-[52px]"
                    style={isSel
                      ? { background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})`, color: 'white', boxShadow: `0 4px 12px ${SAGE}40` }
                      : { backgroundColor: 'white', color: TEXT, border: `1px solid ${SAGE}25` }}>
                    <span className="text-xs uppercase font-medium opacity-80">{format(day, 'EEE', { locale: de })}</span>
                    <span className="font-bold text-lg leading-tight">{format(day, 'd')}</span>
                    <span className="text-xs opacity-70">{format(day, 'MMM', { locale: de })}</span>
                  </button>
                );
              })}
            </div>
            {slots.filter(s => s.available).length === 0
              ? <div className="bg-white rounded-3xl border-2 p-10 text-center text-sm" style={{ borderColor: `${SAGE}20`, color: `${TEXT}55` }}>Keine freien Zeiten an diesem Tag</div>
              : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {slots.filter(s => s.available).map((slot, i) => (
                    <button key={i} onClick={() => setSelSlot(slot)}
                      className="py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                      style={selSlot === slot
                        ? { background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})`, color: 'white', boxShadow: `0 4px 12px ${SAGE}40` }
                        : { backgroundColor: 'white', color: TEXT, border: `1px solid ${SAGE}25` }}>
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                </div>
              )
            }
            {selSlot && (
              <button className="w-full mt-6 py-4 rounded-2xl font-semibold text-white hover:opacity-90 transition flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})`, boxShadow: `0 8px 24px ${SAGE}40` }}
                onClick={() => setStep('details')}>
                Weiter – {formatTime(selSlot.startTime)} Uhr <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="animate-fade-up">
            <button onClick={() => setStep('datetime')} className="flex items-center gap-1 text-sm mb-5 transition-colors"
              style={{ color: `${TEXT}77` }}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <h2 className="font-serif text-xl font-semibold mb-5" style={{ color: TEXT }}>Ihre Kontaktdaten</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([['firstName', 'Vorname *', 'Lisa'], ['lastName', 'Nachname *', 'Schmidt']] as const).map(([f, l, p]) => (
                  <div key={f}>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${TEXT}77` }}>{l}</label>
                    <input value={details[f]} onChange={e => setDetails(d => ({ ...d, [f]: e.target.value }))} placeholder={p}
                      className="w-full bg-white rounded-2xl px-4 py-3 focus:outline-none transition"
                      style={{ border: `1px solid ${SAGE}30`, color: TEXT }}
                      onFocus={e => (e.target.style.borderColor = SAGE)}
                      onBlur={e => (e.target.style.borderColor = `${SAGE}30`)} />
                  </div>
                ))}
              </div>
              {([['email', 'E-Mail *', 'email', 'lisa@example.de'], ['phone', 'Telefon', 'tel', '+49 89 123456']] as const).map(([f, l, t, p]) => (
                <div key={f}>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${TEXT}77` }}>{l}</label>
                  <input type={t} value={details[f]} onChange={e => setDetails(d => ({ ...d, [f]: e.target.value }))} placeholder={p}
                    className="w-full bg-white rounded-2xl px-4 py-3 focus:outline-none transition"
                    style={{ border: `1px solid ${SAGE}30`, color: TEXT }}
                    onFocus={e => (e.target.style.borderColor = SAGE)}
                    onBlur={e => (e.target.style.borderColor = `${SAGE}30`)} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${TEXT}77` }}>Anmerkung</label>
                <textarea value={details.notes} onChange={e => setDetails(d => ({ ...d, notes: e.target.value }))} placeholder="Besondere Wünsche oder gesundheitliche Hinweise…" rows={3}
                  className="w-full bg-white rounded-2xl px-4 py-3 focus:outline-none resize-none transition"
                  style={{ border: `1px solid ${SAGE}30`, color: TEXT }} />
              </div>

              {/* Summary */}
              <div className="bg-white rounded-3xl p-5 border-2" style={{ borderColor: `${SAGE}20` }}>
                <p className="text-xs font-semibold uppercase tracking-widest pb-3 mb-3" style={{ color: SAGE, borderBottom: `1px solid ${SAGE}20` }}>Ihre Buchung</p>
                {[
                  { l: 'Behandlung',  v: selSvc?.name },
                  { l: 'Therapeutin', v: selEmp?.name || 'Nach Verfügbarkeit' },
                  { l: 'Datum',       v: selSlot ? formatDate(selSlot.startTime, 'EEEE, dd. MMMM yyyy') : '' },
                  { l: 'Uhrzeit',     v: selSlot ? `${formatTime(selSlot.startTime)} – ${formatTime(selSlot.endTime)} Uhr` : '' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: `1px solid ${SAGE}10` }}>
                    <span style={{ color: `${TEXT}77` }}>{r.l}</span>
                    <span className="font-medium" style={{ color: TEXT }}>{r.v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-bold">
                  <span style={{ color: TEXT }}>Gesamt</span>
                  <span style={{ color: SAGE }}>{formatPrice(selSvc?.price || 0)}</span>
                </div>
              </div>

              <button
                className="w-full py-4 rounded-2xl font-semibold text-white hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_LIGHT})`, boxShadow: `0 8px 24px ${SAGE}40` }}
                disabled={!details.firstName || !details.lastName || !details.email || saving}
                onClick={handleBook}>
                {saving ? 'Buchen…' : <><Leaf size={18} /> Jetzt buchen</>}
              </button>
              <p className="text-xs text-center" style={{ color: `${TEXT}55` }}>Kein Konto nötig · Bestätigung per E-Mail</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
