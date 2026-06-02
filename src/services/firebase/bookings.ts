import {
  collection, doc, setDoc, getDocs, updateDoc,
  query, where, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Booking, BlockedTime, BookingStatus } from '../../types';

function convertBooking(data: Record<string, unknown>): Booking {
  return {
    ...(data as Booking),
    startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime as string),
    endTime:   data.endTime   instanceof Timestamp ? data.endTime.toDate()   : new Date(data.endTime   as string),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt as string),
  };
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'customerId'> & { customerId?: string }): Promise<Booking> {
  const id = doc(collection(db, 'bookings')).id;
  const data = { ...booking, id, createdAt: serverTimestamp() };
  await setDoc(doc(db, 'bookings', id), data);
  return { ...booking, id, createdAt: new Date() };
}

export async function getBookingsByBusiness(businessId: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('businessId', '==', businessId),
    orderBy('startTime', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => convertBooking(d.data()));
}

export async function getBookingsByCustomer(customerId: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('customerId', '==', customerId),
    orderBy('startTime', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => convertBooking(d.data()));
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  await updateDoc(doc(db, 'bookings', id), { status });
}

export async function getBlockedTimes(businessId: string): Promise<BlockedTime[]> {
  const q = query(collection(db, 'blockedTimes'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
      endTime:   data.endTime   instanceof Timestamp ? data.endTime.toDate()   : new Date(data.endTime),
    } as BlockedTime;
  });
}

export async function saveBlockedTime(blocked: Omit<BlockedTime, 'id'>): Promise<BlockedTime> {
  const id = doc(collection(db, 'blockedTimes')).id;
  const data = { ...blocked, id };
  await setDoc(doc(db, 'blockedTimes', id), data);
  return { ...data };
}

export async function deleteBlockedTime(id: string): Promise<void> {
  const ref = doc(db, 'blockedTimes', id);
  await updateDoc(ref, { deleted: true });
}
