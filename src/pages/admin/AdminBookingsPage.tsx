import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBusinesses } from '../../services/firebase/businesses';
import { getBookingsByBusiness, updateBookingStatus } from '../../services/firebase/bookings';
import type { Business, Booking } from '../../types';
import { TEMPLATES } from '../../config/templates';
import { formatPrice } from '../../utils/helpers';
import { formatDate, formatTime } from '../../utils/calendar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { statusColors, statusLabels } from '../../utils/helpers';

type Filter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface BookingWithBusiness extends Booking {
  businessName: string;
  businessTemplate: string;
}

export default function AdminBookingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingWithBusiness[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      navigate('/admin');
      return;
    }
    loadAll();
  }, [navigate]);

  async function loadAll() {
    const businesses = await getAllBusinesses();
    const allBookings: BookingWithBusiness[] = [];
    await Promise.all(
      businesses.map(async (b: Business) => {
        const bks = await getBookingsByBusiness(b.id);
        bks.forEach(bk => allBookings.push({
          ...bk,
          businessName: b.name,
          businessTemplate: b.template || 'kosmetik',
        }));
      })
    );
    allBookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    setBookings(allBookings);
    setLoading(false);
  }

  async function changeStatus(bookingId: string, status: Booking['status']) {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    await updateBookingStatus(bookingId, status);
  }

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.customerName.toLowerCase().includes(q) ||
             b.customerEmail.toLowerCase().includes(q) ||
             b.serviceName.toLowerCase().includes(q) ||
             b.businessName.toLowerCase().includes(q);
    }
    return true;
  });

  const counts: Record<string, number> = { all: bookings.length };
  bookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="text-dark-400 hover:text-white transition text-sm">
            ← Dashboard
          </button>
          <span className="text-dark-600">|</span>
          <h1 className="font-semibold">Alle Buchungen</h1>
        </div>
        <span className="text-dark-400 text-sm">{filtered.length} von {bookings.length}</span>
      </div>

      {/* Filters */}
      <div className="border-b border-dark-700 px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === f ? 'bg-gold-500 text-dark-900' : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Alle' : statusLabels[f]}
              <span className="ml-1 opacity-60">({counts[f] || 0})</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Suchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto bg-dark-800 border border-dark-600 rounded-xl px-3 py-1.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-gold-500 w-52"
        />
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-dark-500">
            <p className="text-3xl mb-3">📅</p>
            <p>Keine Buchungen gefunden</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(booking => {
              const tpl = TEMPLATES[booking.businessTemplate as keyof typeof TEMPLATES] || TEMPLATES.kosmetik;
              return (
                <div
                  key={booking.id}
                  className="bg-dark-800 rounded-2xl border border-dark-700 p-4 flex flex-wrap items-center gap-4 hover:border-dark-600 transition"
                >
                  {/* Template badge */}
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: tpl.previewGradient }}>
                    {tpl.emoji}
                  </div>

                  {/* Customer + service */}
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-medium text-white text-sm">{booking.customerName}</p>
                    <p className="text-dark-400 text-xs mt-0.5">{booking.serviceName} · {booking.businessName}</p>
                  </div>

                  {/* Date/time */}
                  <div className="text-sm text-center">
                    <p className="text-white">{formatDate(booking.startTime, 'dd.MM.yyyy')}</p>
                    <p className="text-dark-400 text-xs">{formatTime(booking.startTime)} Uhr</p>
                  </div>

                  {/* Price */}
                  <div className="text-sm font-semibold" style={{ color: '#d4a843' }}>
                    {formatPrice(booking.servicePrice)}
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[booking.status]}`}>
                    {statusLabels[booking.status]}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => changeStatus(booking.id, 'confirmed')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-green-900 text-green-300 hover:bg-green-800 transition"
                      >
                        Bestätigen
                      </button>
                    )}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => changeStatus(booking.id, 'cancelled')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-dark-700 text-dark-400 hover:bg-red-900 hover:text-red-300 transition"
                      >
                        Absagen
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => changeStatus(booking.id, 'completed')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-dark-700 text-dark-400 hover:bg-dark-600 transition"
                      >
                        Abgeschlossen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
