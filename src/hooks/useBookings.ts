import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getBookingsByBusiness, getBookingsByCustomer } from '../services/firebase/bookings';
import type { Booking } from '../types';

export function useBusinessBookings(businessId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    getBookingsByBusiness(businessId)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [businessId]);

  return { bookings, setBookings, loading };
}

export function useCustomerBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getBookingsByCustomer(user.uid)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [user]);

  return { bookings, setBookings, loading };
}
