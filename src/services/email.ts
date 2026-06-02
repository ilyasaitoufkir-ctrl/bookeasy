import type { Booking, Business } from '../types';
import { formatDate, formatTime } from '../utils/calendar';

// In production: call Firebase Cloud Functions to send via Resend
// These functions define the email payloads

export function getBookingConfirmationEmail(booking: Booking, business: Business) {
  return {
    to: booking.customerEmail,
    subject: `Buchungsbestätigung – ${business.name}`,
    html: `
      <h2>Dein Termin ist bestätigt! 🎉</h2>
      <p>Hallo ${booking.customerName},</p>
      <p>dein Termin bei <strong>${business.name}</strong> wurde bestätigt.</p>
      <table>
        <tr><td><strong>Service:</strong></td><td>${booking.serviceName}</td></tr>
        <tr><td><strong>Datum:</strong></td><td>${formatDate(booking.startTime, 'EEEE, dd. MMMM yyyy')}</td></tr>
        <tr><td><strong>Uhrzeit:</strong></td><td>${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}</td></tr>
        ${booking.employeeName ? `<tr><td><strong>Mitarbeiter:</strong></td><td>${booking.employeeName}</td></tr>` : ''}
      </table>
      <p><a href="${import.meta.env.VITE_APP_URL}/my-bookings">Termin verwalten</a></p>
    `,
  };
}

export function getBookingReminderEmail(booking: Booking, business: Business) {
  return {
    to: booking.customerEmail,
    subject: `Erinnerung: Dein Termin morgen bei ${business.name}`,
    html: `
      <h2>Terminerinnerung 📅</h2>
      <p>Morgen um ${formatTime(booking.startTime)} Uhr hast du einen Termin bei <strong>${business.name}</strong>.</p>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
    `,
  };
}

export function getCancellationEmail(booking: Booking, business: Business, cancelledBy: 'customer' | 'business') {
  return {
    to: cancelledBy === 'customer' ? business.email : booking.customerEmail,
    subject: `Termin abgesagt – ${business.name}`,
    html: `
      <h2>Termin abgesagt</h2>
      <p>Der Termin am ${formatDate(booking.startTime)} um ${formatTime(booking.startTime)} wurde abgesagt.</p>
    `,
  };
}
