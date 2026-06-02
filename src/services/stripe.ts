import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export async function createPaymentIntent(amount: number, currency = 'eur'): Promise<{ clientSecret: string }> {
  // In production: call your Firebase Cloud Function or backend endpoint
  // POST /api/create-payment-intent { amount, currency }
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency }),
  });
  return response.json();
}

export const PLAN_PRICE_IDS = {
  basic: 'price_basic_29eur',
  pro:   'price_pro_59eur',
};
