import { useState, useMemo } from 'react';
import { addDays, subDays, format, isSameDay, startOfWeek, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useBusiness } from '../../hooks/useBusiness';
import { useBusinessBookings } from '../../hooks/useBookings';
import { updateBookingStatus } from '../../services/firebase/bookings';
import { formatTime } from '../../utils/calendar';
import { statusColors, statusLabels, formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const { business, loading: bizLoading } = useBusiness();
  const { bookings, setBookings, loading } = useBusinessBookings(business?.id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayBookings = useMemo(() =>
    bookings.filter(b => isSameDay(b.startTime, selectedDate)).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [bookings, selectedDate]
  );

  const confirm = async (id: string) => {
    await updateBookingStatus(id, 'confirmed');
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    toast.success('Bestätigt');
  };
  const cancel = async (id: string) => {
    await updateBookingStatus(id, 'cancelled');
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    toast.success('Abgesagt');
  };

  if (bizLoading || loading) return <Layout><LoadingSpinner className="py-20" size="lg" /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'day' ? 'week' : 'day')}>
              {viewMode === 'day' ? 'Wochenansicht' : 'Tagesansicht'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Heute</Button>
          </div>
        </div>

        {/* Week strip */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate(d => subDays(d, 7))} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map(day => {
              const count = bookings.filter(b => isSameDay(b.startTime, day) && b.status !== 'cancelled').length;
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all text-sm ${
                    isSameDay(day, selectedDate)
                      ? 'bg-navy-700 text-white'
                      : isToday(day)
                        ? 'bg-navy-50 text-navy-700 font-semibold'
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-xs uppercase">{format(day, 'EEE', { locale: de })}</span>
                  <span className="font-bold text-base">{format(day, 'd')}</span>
                  {count > 0 && (
                    <span className={`h-1.5 w-1.5 rounded-full mt-0.5 ${isSameDay(day, selectedDate) ? 'bg-sky-300' : 'bg-navy-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={() => setSelectedDate(d => addDays(d, 7))} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day detail */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })} · {dayBookings.length} Termine
          </h2>

          {dayBookings.length === 0 ? (
            <Card>
              <div className="py-16 text-center text-gray-400 text-sm">
                Keine Termine an diesem Tag
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {dayBookings.map(b => (
                <Card key={b.id}>
                  <div className="p-4 flex items-center gap-4">
                    <div className="text-center w-16 flex-shrink-0">
                      <p className="text-xl font-bold text-navy-700">{formatTime(b.startTime)}</p>
                      <p className="text-xs text-gray-400">{formatTime(b.endTime)}</p>
                    </div>
                    <div className="h-10 w-1 rounded-full" style={{ backgroundColor: '#1e3a5f', opacity: 0.3 }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{b.customerName}</p>
                      <p className="text-sm text-gray-500">{b.serviceName}{b.employeeName ? ` · ${b.employeeName}` : ''}</p>
                      <p className="text-xs text-gray-400">{b.customerEmail} · {b.customerPhone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold text-sm text-navy-700">{formatPrice(b.servicePrice)}</p>
                      <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex flex-col gap-1">
                        <button onClick={() => confirm(b.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600">
                          <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => cancel(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
