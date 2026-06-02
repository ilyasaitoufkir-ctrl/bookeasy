import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'BookEasy <noreply@bookeasy.app>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, booking, business } = req.body as {
    type: 'confirmation' | 'cancellation';
    booking: {
      customerName: string;
      customerEmail: string;
      serviceName: string;
      startTime: string;
      endTime: string;
      employeeName?: string;
      servicePrice: number;
      notes?: string;
    };
    business: {
      name: string;
      address?: string;
      city?: string;
      phone?: string;
      primaryColor?: string;
    };
  };

  if (!booking?.customerEmail || !business?.name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const color = business.primaryColor || '#c9a99a';
  const start = new Date(booking.startTime);
  const end   = new Date(booking.endTime);
  const fmt   = (d: Date) => d.toLocaleString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time  = (d: Date) => d.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const price = (c: number) => (c / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  const location = [business.address, business.city].filter(Boolean).join(', ');

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${color},${color}cc);padding:32px 32px 24px;text-align:center">
      <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:12px;padding:8px 12px;margin-bottom:12px">
        <span style="color:white;font-size:22px;font-weight:700">${business.name[0]}</span>
      </div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:600">${business.name}</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <div style="text-align:center;margin-bottom:28px">
        <div style="font-size:40px;margin-bottom:8px">✅</div>
        <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px">Ihr Termin ist bestätigt!</h2>
        <p style="margin:0;color:#666;font-size:14px">Hallo ${booking.customerName}, wir freuen uns auf Ihren Besuch.</p>
      </div>

      <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px">
        ${[
          ['Service',    booking.serviceName],
          ['Datum',      fmt(start)],
          ['Uhrzeit',    `${time(start)} – ${time(end)} Uhr`],
          booking.employeeName ? ['Mitarbeiter', booking.employeeName] : null,
          ['Preis',      price(booking.servicePrice)],
          location ? ['Adresse', location] : null,
        ].filter(Boolean).map(([l, v]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ebebeb">
            <span style="color:#888;font-size:13px">${l}</span>
            <span style="color:#1a1a1a;font-size:13px;font-weight:500;text-align:right;max-width:60%">${v}</span>
          </div>`).join('')}
      </div>

      ${booking.notes ? `<p style="background:#fff8f5;border-left:3px solid ${color};padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 24px;font-size:13px;color:#555"><strong>Anmerkung:</strong> ${booking.notes}</p>` : ''}

      ${business.phone ? `<p style="text-align:center;font-size:13px;color:#888;margin:0 0 24px">Fragen? Rufen Sie uns an: <a href="tel:${business.phone}" style="color:${color};text-decoration:none;font-weight:500">${business.phone}</a></p>` : ''}
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #ebebeb">
      <p style="margin:0;font-size:11px;color:#aaa">Diese E-Mail wurde automatisch versendet von <strong>BookEasy</strong>.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    if (type === 'confirmation') {
      await resend.emails.send({
        from: FROM,
        to: booking.customerEmail,
        subject: `✅ Buchungsbestätigung – ${business.name}`,
        html,
      });
    } else {
      await resend.emails.send({
        from: FROM,
        to: booking.customerEmail,
        subject: `Termin abgesagt – ${business.name}`,
        html: `<p>Ihr Termin am ${fmt(start)} wurde leider abgesagt. Bei Fragen wenden Sie sich an ${business.name}${business.phone ? ` (${business.phone})` : ''}.</p>`,
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Email konnte nicht gesendet werden' });
  }
}
