import { isFuture, isPast } from 'date-fns';
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCustomerBookings } from '../../hooks/useBookings';
import { updateBookingStatus } from '../../services/firebase/bookings';
import { formatDate, formatTime } from '../../utils/calendar';
import { statusColors, statusLabels, formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const { bookings, setBookings, loading } = useCustomerBookings();

  const cancel = async (id: string) => {
    if (!confirm('Termin wirklich absagen?')) return;
    await updateBookingStatus(id, 'cancelled');
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    toast.success('Termin abgesagt');
  };

  const upcoming = bookings.filter(b => isFuture(b.startTime) && b.status !== 'cancelled');
  const past     = bookings.filter(b => isPast(b.startTime) || b.status === 'cancelled');

  if (loading) return <Layout><LoadingSpinner className="py-20" size="lg" /></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Meine Termine</h1>

        {/* Upcoming */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bevorstehend</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar size={36} />}
              title="Keine bevorstehenden Termine"
              description="Buche deinen ersten Termin bei einer Einrichtung."
              action={{ label: 'Einrichtung suchen', onClick: () => window.location.href = '/search' }}
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <Card key={b.id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{b.businessId}</p>
                        <p className="font-medium text-navy-700">{b.serviceName}</p>
                        {b.employeeName && <p className="text-sm text-gray-500">bei {b.employeeName}</p>}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(b.startTime)}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(b.startTime)} – {formatTime(b.endTime)}</span>
                        </div>
                        <p className="text-sm font-semibold text-navy-700 mt-1">{formatPrice(b.servicePrice)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => cancel(b.id)}>
                            <XCircle size={14} /> Absagen
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Vergangen</h2>
            <div className="space-y-3">
              {past.map(b => (
                <Card key={b.id} className="opacity-70">
                  <CardBody>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-700">{b.serviceName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{formatDate(b.startTime)}</span>
                          <span>{formatTime(b.startTime)}</span>
                          <span>{formatPrice(b.servicePrice)}</span>
                        </div>
                      </div>
                      <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
