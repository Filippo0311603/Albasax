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
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#080808;line-height:1px;">${previewText || subject}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#080808;padding:0;margin:0;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- TOP GOLD LINE -->
          <tr>
            <td style="background:linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a);height:2px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#0f0f0f;padding:36px 40px 28px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#c5a643;font-weight:700;">— ALBASAX —</p>
                    <p style="margin:0;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#4b4b4b;">Official Newsletter</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- THIN DIVIDER -->
          <tr>
            <td style="background:#1a1a1a;height:1px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- GREETING BAND -->
          <tr>
            <td style="background:#0f0f0f;padding:24px 48px 0;">
              <p style="margin:0;font-size:13px;color:#6b6b6b;letter-spacing:0.05em;">Ciao <span style="color:#c5a643;font-weight:600;">${name}</span>,</p>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="background:#0f0f0f;padding:24px 48px 40px;color:#d1d5db;font-size:15px;line-height:1.85;">
              ${html}
            </td>
          </tr>

          <!-- BOTTOM DIVIDER -->
          <tr>
            <td style="background:linear-gradient(90deg,transparent,#1f1f1f,transparent);height:1px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background:#0a0a0a;padding:32px 40px 36px;">
              <p style="margin:0 0 4px;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:#c5a643;font-weight:600;">ALBASAX</p>
              <p style="margin:0 0 20px;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#333;">Music &bull; Official Newsletter</p>
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 20px;">
                <tr>
                  <td style="padding:0 10px;">
                    <a href="https://albasax.com" style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#555;text-decoration:none;">Sito</a>
                  </td>
                  <td style="color:#333;font-size:9px;">&bull;</td>
                  <td style="padding:0 10px;">
                    <a href="https://instagram.com" style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#555;text-decoration:none;">Instagram</a>
                  </td>
                  <td style="color:#333;font-size:9px;">&bull;</td>
                  <td style="padding:0 10px;">
                    <a href="https://spotify.com" style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#555;text-decoration:none;">Spotify</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:9px;color:#2a2a2a;line-height:1.8;">Stai ricevendo questa email perch&eacute; ti sei iscritto alla newsletter di Albasax.<br>
              <a href="${unsubscribeUrl}" style="color:#3a3a3a;text-decoration:underline;text-underline-offset:2px;">Disiscriviti</a> &nbsp;&bull;&nbsp; <a href="https://albasax.com/legal/privacy" style="color:#3a3a3a;text-decoration:underline;text-underline-offset:2px;">Privacy Policy</a></p>
            </td>
          </tr>

          <!-- BOTTOM GOLD LINE -->
          <tr>
            <td style="background:linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a);height:2px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Middleware
// NOTA: il webhook Stripe richiede il body RAW (prima di express.json)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,
      'https://albasax.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return callback(null, true);
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
      console.log(`[Newsletter] Sending to ${sub.email} from "${fromAddress}"...`);
      const result = await resend.emails.send({
        from: fromAddress,
        to: sub.email,
        subject,
        html: emailHtml,
      });
      console.log(`[Newsletter] Result for ${sub.email}:`, JSON.stringify(result));
      if (result.error) {
        console.error(`[Newsletter] Resend error for ${sub.email}:`, JSON.stringify(result.error));
        failed.push(sub.email);
      } else {
        sent++;
      }
    } catch (err) {
      console.error(`[Newsletter] Exception → ${sub.email}:`, err.message, JSON.stringify(err));
      failed.push(sub.email);
    }
  }

  console.log(`[Newsletter] Sent ${sent}/${subscribers.length}, failed: ${failed.length}`);
  res.json({ sent, total: subscribers.length, failed: failed.length });
});

// Start
app.listen(PORT, () => {
  console.log(`\nAlbasax Server running on port ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'connected' : 'missing SUPABASE_URL'}`);
  console.log(`Stripe:   ${process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing STRIPE_SECRET_KEY'}`);
  console.log(`Resend:   ${process.env.RESEND_API_KEY ? 'key loaded (' + process.env.RESEND_API_KEY.slice(0,8) + '...)' : 'MISSING RESEND_API_KEY'}`);
  console.log(`From:     ${process.env.NEWSLETTER_FROM || 'MISSING NEWSLETTER_FROM'}\n`);
});
