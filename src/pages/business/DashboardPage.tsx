import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, TrendingUp, Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { isToday, isFuture } from 'date-fns';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { useBusiness } from '../../hooks/useBusiness';
import { useBusinessBookings } from '../../hooks/useBookings';
import { formatDate, formatTime } from '../../utils/calendar';
import { formatPrice, statusColors, statusLabels } from '../../utils/helpers';
import { updateBookingStatus } from '../../services/firebase/bookings';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { business, loading: bizLoading } = useBusiness();
  const { bookings, setBookings, loading: bookLoading } = useBusinessBookings(business?.id);

  const stats = useMemo(() => {
    const today = bookings.filter(b => isToday(b.startTime) && b.status !== 'cancelled');
    const upcoming = bookings.filter(b => isFuture(b.startTime) && b.status === 'confirmed');
    const thisMonth = bookings.filter(b => {
      const now = new Date();
      return b.startTime.getMonth() === now.getMonth() && b.startTime.getFullYear() === now.getFullYear() && b.status !== 'cancelled';
    });
    const revenue = thisMonth.reduce((s, b) => s + b.servicePrice, 0);
    return { today: today.length, upcoming: upcoming.length, thisMonth: thisMonth.length, revenue };
  }, [bookings]);

  const recentBookings = bookings.slice(0, 8);

  const confirm = async (id: string) => {
    await updateBookingStatus(id, 'confirmed');
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    toast.success('Termin bestätigt');
  };

  const cancel = async (id: string) => {
    await updateBookingStatus(id, 'cancelled');
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    toast.success('Termin abgesagt');
  };

  if (bizLoading || bookLoading) return <Layout><LoadingSpinner className="py-20" size="lg" /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Guten Tag{business ? `, ${business.name}` : ''}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Hier ist deine Übersicht</p>
          </div>
          {business && (
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm text-navy-700 hover:underline"
            >
              Buchungsseite ansehen <ArrowRight size={14} />
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Heute', value: stats.today,     icon: <Calendar size={20} />, color: 'text-blue-600',  bg: 'bg-blue-50' },
            { label: 'Demnächst', value: stats.upcoming, icon: <Clock size={20} />,     color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Diesen Monat', value: stats.thisMonth, icon: <TrendingUp size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Umsatz (Monat)', value: formatPrice(stats.revenue), icon: <TrendingUp size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(s => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Plan banner */}
        {business?.plan === 'free' && (
          <div className="bg-gradient-to-r from-navy-700 to-navy-600 text-white rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Du bist im kostenlosen Plan</p>
              <p className="text-sm text-navy-200 mt-0.5">
                {business.monthlyBookingCount}/50 Termine diesen Monat.{' '}
                Upgrade für unbegrenzte Termine.
              </p>
            </div>
            <Link to="/dashboard/settings">
              <Button variant="secondary" size="sm">Upgraden</Button>
            </Link>
          </div>
        )}

        {/* Recent bookings */}
        <Card>
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Aktuelle Termine</h2>
            <Link to="/dashboard/calendar" className="text-sm text-navy-700 hover:underline flex items-center gap-1">
              Alle <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">Noch keine Termine</div>
            ) : recentBookings.map(b => (
              <div key={b.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{b.customerName}</p>
                  <p className="text-xs text-gray-500">{b.serviceName}{b.employeeName ? ` · ${b.employeeName}` : ''}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-700">{formatDate(b.startTime, 'dd.MM.yyyy')}</p>
                  <p className="text-xs text-gray-500">{formatTime(b.startTime)}</p>
                </div>
                <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                {b.status === 'pending' && (
                  <div className="flex gap-1">
                    <button onClick={() => confirm(b.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600">
                      <CheckCircle2 size={16} />
                    </button>
                    <button onClick={() => cancel(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
