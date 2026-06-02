import { addMinutes, format, isSameDay, isWithinInterval, parseISO, setHours, setMinutes, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Booking, BlockedTime, Employee, OpeningHours, TimeSlot } from '../types';

export { de };

export function formatDate(date: Date, fmt = 'dd. MMMM yyyy'): string {
  return format(date, fmt, { locale: de });
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function getDayKey(date: Date): keyof OpeningHours {
  const days: (keyof OpeningHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export function getAvailableTimeSlots(
  date: Date,
  durationMinutes: number,
  openingHours: OpeningHours,
  bookings: Booking[],
  blockedTimes: BlockedTime[],
  employee?: Employee,
): TimeSlot[] {
  const dayKey = getDayKey(date);
  const hours = employee ? employee.workingHours[dayKey] : openingHours[dayKey];

  if (!hours.isOpen) return [];

  const [startH, startM] = hours.start.split(':').map(Number);
  const [endH, endM] = hours.end.split(':').map(Number);

  const dayStart = setMinutes(setHours(startOfDay(date), startH), startM);
  const dayEnd = setMinutes(setHours(startOfDay(date), endH), endM);

  const slots: TimeSlot[] = [];
  let current = dayStart;

  const dayBookings = bookings.filter(b =>
    isSameDay(b.startTime, date) &&
    b.status !== 'cancelled' &&
    (!employee || b.employeeId === employee.id)
  );

  const dayBlocked = blockedTimes.filter(b =>
    isSameDay(b.startTime, date) &&
    (!employee || !b.employeeId || b.employeeId === employee.id)
  );

  while (addMinutes(current, durationMinutes) <= dayEnd) {
    const slotEnd = addMinutes(current, durationMinutes);
    const isBooked = dayBookings.some(b =>
      isWithinInterval(current, { start: b.startTime, end: addMinutes(b.endTime, -1) }) ||
      isWithinInterval(addMinutes(slotEnd, -1), { start: b.startTime, end: addMinutes(b.endTime, -1) }) ||
      (current <= b.startTime && slotEnd >= b.endTime)
    );
    const isBlocked = dayBlocked.some(b =>
      isWithinInterval(current, { start: b.startTime, end: addMinutes(b.endTime, -1) }) ||
      isWithinInterval(addMinutes(slotEnd, -1), { start: b.startTime, end: addMinutes(b.endTime, -1) })
    );

    slots.push({ startTime: current, endTime: slotEnd, available: !isBooked && !isBlocked });
    current = addMinutes(current, 15);
  }

  return slots;
}
