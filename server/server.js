import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5001;

// Supabase Admin Client (SERVICE_ROLE key - solo lato server)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Middleware
// NOTA: il webhook Stripe richiede il body RAW (prima di express.json)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SHOP: Crea sessione Stripe Checkout
// POST /api/stripe/create-checkout
// Body: { items: [{ stripe_price_id, quantity }], customerEmail }
app.post('/api/stripe/create-checkout', async (req, res) => {
  try {
    const { items, customerEmail } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: items.map((item) => ({
        price: item.stripe_price_id,
        quantity: item.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/#/shop?order=success`,
      cancel_url:  `${process.env.CLIENT_URL}/#/shop?order=cancelled`,
      shipping_address_collection: {
        allowed_countries: ['IT', 'DE', 'FR', 'ES', 'GB', 'US'],
      },
      metadata: { customerEmail },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Checkout]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// SHOP: Webhook Stripe (aggiorna stato ordine)
app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await supabase
        .from('orders')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id);
      console.log(`[Webhook] Order paid: ${session.id}`);
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object;
      await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id);
      break;
    }
    default:
      console.log(`[Webhook] Unhandled event: ${event.type}`);
  }
  res.json({ received: true });
});

// ADMIN: Lista iscritti alla newsletter
// GET /api/admin/subscribers  (richiede header x-admin-secret)
app.get('/api/admin/subscribers', async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: data.length, subscribers: data });
});

// Start
app.listen(PORT, () => {
  console.log(`\nAlbasax Server running on port ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'connected' : 'missing SUPABASE_URL'}`);
  console.log(`Stripe:   ${process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing STRIPE_SECRET_KEY'}\n`);
});
