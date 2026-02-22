import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Stripe from 'stripe';
import { Resend } from 'resend';
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

// Resend (email sending)
const resend = new Resend(process.env.RESEND_API_KEY || '');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Genera token HMAC sicuro per unsubscribe link
function generateUnsubscribeToken(subscriberId) {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SECRET || 'fallback-secret')
    .update(subscriberId)
    .digest('hex');
}

// Template HTML email newsletter
function buildEmailTemplate({ subject, html, previewText, name, unsubscribeUrl }) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${subject}</title>
  <span style="display:none;font-size:1px;color:#0a0a0a;max-height:0;overflow:hidden;">${previewText || subject}&nbsp;&zwnj;</span>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border:1px solid #1f1f1f;">
        <!-- Header -->
        <tr>
          <td align="center" style="padding:40px 40px 30px;border-bottom:1px solid #1f1f1f;">
            <p style="margin:0;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#c5a643;font-weight:bold;">ALBASAX</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:48px 48px 40px;color:#d1d5db;font-size:15px;line-height:1.8;">
            <p style="margin:0 0 24px;color:#9ca3af;font-size:13px;">Ciao ${name},</p>
            ${html}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding:28px 40px;border-top:1px solid #1f1f1f;">
            <p style="margin:0 0 8px;font-size:10px;color:#4b5563;letter-spacing:0.15em;text-transform:uppercase;">Albasax Music &mdash; Official Newsletter</p>
            <p style="margin:0;font-size:10px;color:#374151;">Non vuoi pi&ugrave; ricevere questa newsletter? <a href="${unsubscribeUrl}" style="color:#c5a643;text-decoration:underline;">Disiscriviti</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Middleware
// NOTA: il webhook Stripe richiede il body RAW (prima di express.json)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.CLIENT_URL;
    if (!allowed) return callback(new Error('CLIENT_URL not configured'));
    // Allow same-origin requests (no origin header) and the configured client URL
    if (!origin || origin === allowed) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
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
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    // Validate each item has required fields and sane quantity
    for (const item of items) {
      if (!item.stripe_price_id || typeof item.stripe_price_id !== 'string') {
        return res.status(400).json({ error: 'Invalid item: missing price ID' });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return res.status(400).json({ error: 'Invalid item quantity' });
      }
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: items.map((item) => ({
        price: item.stripe_price_id,
        quantity: item.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/shop?order=success`,
      cancel_url:  `${process.env.CLIENT_URL}/shop?order=cancelled`,
      shipping_address_collection: {
        allowed_countries: ['IT', 'DE', 'FR', 'ES', 'GB', 'US'],
      },
      metadata: { customerEmail },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Checkout]', err.message);
    res.status(500).json({ error: 'Payment service temporarily unavailable. Please try again.' });
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
      const { error: dbErr } = await supabase
        .from('orders')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id);
      if (dbErr) console.error('[Webhook] Failed to update order:', dbErr.message);
      else console.log(`[Webhook] Order paid: ${session.id}`);
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object;
      const { error: dbErr2 } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id);
      if (dbErr2) console.error('[Webhook] Failed to cancel order:', dbErr2.message);
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

// NEWSLETTER: Unsubscribe via link email
// GET /api/newsletter/unsubscribe?id=xxx&token=xxx
app.get('/api/newsletter/unsubscribe', async (req, res) => {
  const { id, token } = req.query;
  if (!id || !token || typeof id !== 'string' || typeof token !== 'string') {
    return res.status(400).json({ error: 'Parametri mancanti' });
  }
  const expected = generateUnsubscribeToken(id);
  let valid = false;
  try {
    const a = Buffer.from(token.padEnd(64, '0').slice(0, 64), 'hex');
    const b = Buffer.from(expected, 'hex');
    valid = token.length === 64 && crypto.timingSafeEqual(a, b);
  } catch (_) { valid = false; }
  if (!valid) return res.status(400).json({ error: 'Token non valido o scaduto' });

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ active: false })
    .eq('id', id);
  if (error) return res.status(500).json({ error: 'Impossibile completare la disiscrizione' });
  res.json({ success: true });
});

// ADMIN: Invia newsletter a tutti gli iscritti attivi
// POST /api/admin/send-newsletter  (richiede header x-admin-secret)
// Body: { subject, html, previewText? }
app.post('/api/admin/send-newsletter', async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { subject, html, previewText } = req.body;
  if (!subject || !html) return res.status(400).json({ error: 'subject e html sono obbligatori' });

  const { data: subscribers, error: fetchErr } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, name')
    .eq('active', true);
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (!subscribers || subscribers.length === 0) return res.json({ sent: 0, total: 0 });

  const clientUrl = process.env.CLIENT_URL || 'https://albasax.com';
  const fromAddress = process.env.NEWSLETTER_FROM || 'Albasax <newsletter@albasax.com>';
  let sent = 0;
  const failed = [];

  for (const sub of subscribers) {
    const token = generateUnsubscribeToken(sub.id);
    const unsubscribeUrl = `${clientUrl}/unsubscribe?id=${sub.id}&token=${token}`;
    const emailHtml = buildEmailTemplate({
      subject,
      html,
      previewText,
      name: sub.name || 'Friend',
      unsubscribeUrl,
    });
    try {
      await resend.emails.send({
        from: fromAddress,
        to: sub.email,
        subject,
        html: emailHtml,
      });
      sent++;
    } catch (err) {
      console.error(`[Newsletter] Failed → ${sub.email}:`, err.message);
      failed.push(sub.email);
    }
  }

  console.log(`[Newsletter] Sent ${sent}/${subscribers.length}`);
  res.json({ sent, total: subscribers.length, failed: failed.length });
});

// Start
app.listen(PORT, () => {
  console.log(`\nAlbasax Server running on port ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'connected' : 'missing SUPABASE_URL'}`);
  console.log(`Stripe:   ${process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing STRIPE_SECRET_KEY'}\n`);
});
