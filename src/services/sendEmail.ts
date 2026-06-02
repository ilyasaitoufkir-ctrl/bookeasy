import type { Booking, Business } from '../types';

export async function sendBookingConfirmation(booking: Booking, business: Business): Promise<void> {
  try {
    await fetch('/api/send-booking-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'confirmation',
        booking: {
          customerName:  booking.customerName,
          customerEmail: booking.customerEmail,
          serviceName:   booking.serviceName,
          startTime:     booking.startTime.toISOString(),
          endTime:       booking.endTime.toISOString(),
          employeeName:  booking.employeeName,
          servicePrice:  booking.servicePrice,
          notes:         booking.notes,
        },
        business: {
          name:         business.name,
          address:      business.address,
          city:         business.city,
          phone:        business.phone,
          primaryColor: business.primaryColor,
        },
      }),
    });
  } catch {
    // Non-critical — booking is already saved, email failure shouldn't break the flow
  }
}
