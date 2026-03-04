import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
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

// Genera versione plain text dall'HTML della newsletter
function buildPlainText({ subject, html, name, unsubscribeUrl }) {
  // Rimuovi tag HTML e normalizza whitespace
  const stripped = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&bull;/g, '•')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `Ciao ${name},\n\n${stripped}\n\n— ALBASAX —\n\nStai ricevendo questa email perché ti sei iscritto alla newsletter di Albasax.\nPer disiscriverti: ${unsubscribeUrl}\nPrivacy Policy: https://albasax.com/legal/privacy`;
}

// Template HTML email di conferma iscrizione newsletter
function buildConfirmEmailTemplate({ name, confirmUrl }) {
  const greeting = name ? `Ciao ${name},` : 'Ciao,';
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Conferma iscrizione – Albasax Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#080808;padding:0;margin:0;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          <tr><td style="background:linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td align="center" style="background:#0f0f0f;padding:40px 40px 32px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#c5a643;font-weight:700;">— ALBASAX —</p>
              <p style="margin:0;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#4b4b4b;">Official Newsletter</p>
            </td>
          </tr>
          <tr><td style="background:#1a1a1a;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="background:#0f0f0f;padding:40px 48px;">
              <p style="margin:0 0 16px;font-size:14px;color:#8a8a8a;letter-spacing:0.05em;">${greeting}</p>
              <p style="margin:0 0 32px;font-size:15px;color:#d1d5db;line-height:1.8;">Grazie per esserti iscritto alla newsletter di Albasax.<br>Clicca il pulsante qui sotto per <strong style="color:#c5a643;">confermare la tua iscrizione</strong> e iniziare a ricevere aggiornamenti su musica, concerti e novità.</p>
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#b8860b,#d4af37);padding:16px 40px;">
                    <a href="${confirmUrl}" style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#080808;text-decoration:none;font-weight:700;">Conferma Iscrizione</a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;font-size:11px;color:#3a3a3a;line-height:1.8;">Oppure copia e incolla questo link nel browser:<br><a href="${confirmUrl}" style="color:#555;word-break:break-all;">${confirmUrl}</a></p>
              <p style="margin:24px 0 0;font-size:10px;color:#2a2a2a;">Se non hai richiesto questa iscrizione, ignora questa email.</p>
            </td>
          </tr>
          <tr><td style="background:linear-gradient(90deg,transparent,#1f1f1f,transparent);height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td align="center" style="background:#0a0a0a;padding:24px 40px;">
              <p style="margin:0;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:#c5a643;font-weight:600;">ALBASAX</p>
            </td>
          </tr>
          <tr><td style="background:linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
                    <a href="https://www.instagram.com/albasax_official/" style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#555;text-decoration:none;">Instagram</a>
                  </td>
                  <td style="color:#333;font-size:9px;">&bull;</td>
                  <td style="padding:0 10px;">
                    <a href="https://open.spotify.com/intl-it/artist/3aOCpeC6zsfwRk6C62d6aL" style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#555;text-decoration:none;">Spotify</a>
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
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // needed for API used by external frontend
  contentSecurityPolicy: false, // API server, no HTML pages to protect
}));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,
      'https://albasax.com',
      'https://www.albasax.com',
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

// ─── Admin rate limiter: max 10 requests / 15 min per IP ──────────────────────
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppi tentativi. Riprova tra 15 minuti.' },
});

// Failed-auth lockout: after 5 wrong passwords, block IP for 30 min
const failedAttempts = new Map(); // ip -> { count, lockedUntil }
function checkAuthLockout(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return null;
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    const mins = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    return `IP bloccato per troppi tentativi errati. Riprova tra ${mins} minuti.`;
  }
  return null;
}
function recordFailedAuth(ip) {
  const entry = failedAttempts.get(ip) || { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = Date.now() + 30 * 60 * 1000;
    entry.count = 0;
  }
  failedAttempts.set(ip, entry);
}
function clearFailedAuth(ip) { failedAttempts.delete(ip); }

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
app.get('/api/admin/subscribers', adminRateLimit, async (req, res) => {
  const ip = req.ip;
  const lockMsg = checkAuthLockout(ip);
  if (lockMsg) return res.status(429).json({ error: lockMsg });
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    recordFailedAuth(ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  clearFailedAuth(ip);
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: data.length, subscribers: data });
});

// ADMIN: Elimina iscritto
// DELETE /api/admin/subscribers/:id
app.delete('/api/admin/subscribers/:id', adminRateLimit, async (req, res) => {
  const ip = req.ip;
  const lockMsg = checkAuthLockout(ip);
  if (lockMsg) return res.status(429).json({ error: lockMsg });
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    recordFailedAuth(ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
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

// NEWSLETTER: Subscribe con double opt-in
// POST /api/newsletter/subscribe
// Body: { email, name?, source? }
const newsletterRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5,                    // max 5 richieste per IP per finestra
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Troppe richieste. Riprova tra qualche minuto.' },
});
app.post('/api/newsletter/subscribe', newsletterRateLimit, async (req, res) => {
  const { email, name, source } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email non valida' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  // Se già confermato non ri-inviamo l'email
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, confirmed')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existing?.confirmed) {
    return res.json({ alreadyConfirmed: true });
  }

  // Genera token casuale sicuro
  const token = crypto.randomBytes(32).toString('hex');

  // Upsert: non attivo finché non confermato
  const { data: sub, error: upsertErr } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email: normalizedEmail, name: name?.trim() || null, source: source || 'newsletter', active: false, confirmed: false, confirm_token: token },
      { onConflict: 'email' }
    )
    .select('id')
    .single();

  if (upsertErr) return res.status(500).json({ error: upsertErr.message });

  // Invia email di conferma
  // Il link punta al SERVER (Railway) che verifica il token e reindirizza al frontend
  const clientUrl = process.env.CLIENT_URL || 'https://albasax.com';
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host  = req.headers['x-forwarded-host']  || req.get('host');
  const serverUrl = process.env.SERVER_URL || `${proto}://${host}`;
  const confirmUrl = `${serverUrl}/api/newsletter/confirm?id=${sub.id}&token=${token}`;
  const fromAddress = process.env.NEWSLETTER_FROM || 'Albasax <newsletter@albasax.com>';

  try {
    await resend.emails.send({
      from: fromAddress,
      to: normalizedEmail,
      reply_to: 'info@albasax.com',
      subject: 'Conferma la tua iscrizione alla newsletter di Albasax',
      text: `Ciao${name ? ' ' + name.trim() : ''},\n\nClicca il link qui sotto per confermare la tua iscrizione alla newsletter di Albasax:\n${confirmUrl}\n\nSe non hai richiesto questa iscrizione, ignora questa email.\n\n— ALBASAX —`,
      html: buildConfirmEmailTemplate({ name: name?.trim() || '', confirmUrl }),
    });
  } catch (emailErr) {
    console.error('[Subscribe] Email send error:', emailErr.message);
  }

  res.json({ pending: true });
});

// NEWSLETTER: Conferma iscrizione via link email
// GET /api/newsletter/confirm?id=xxx&token=xxx
app.get('/api/newsletter/confirm', async (req, res) => {
  const { id, token } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'https://albasax.com';

  if (!id || !token || typeof id !== 'string' || typeof token !== 'string') {
    return res.redirect(`${clientUrl}/newsletter/confirm?status=error`);
  }

  const { data: sub, error } = await supabase
    .from('newsletter_subscribers')
    .select('confirm_token, confirmed')
    .eq('id', id)
    .maybeSingle();

  if (error || !sub) return res.redirect(`${clientUrl}/newsletter/confirm?status=error`);
  if (sub.confirmed) return res.redirect(`${clientUrl}/newsletter/confirm?status=already`);

  // Confronto sicuro del token (64 hex chars = 32 bytes)
  let valid = false;
  try {
    if (token.length === 64 && sub.confirm_token?.length === 64) {
      const a = Buffer.from(token, 'hex');
      const b = Buffer.from(sub.confirm_token, 'hex');
      valid = crypto.timingSafeEqual(a, b);
    }
  } catch (_) { valid = false; }

  if (!valid) return res.redirect(`${clientUrl}/newsletter/confirm?status=error`);

  const { error: updateErr } = await supabase
    .from('newsletter_subscribers')
    .update({ confirmed: true, active: true, confirm_token: null })
    .eq('id', id);

  if (updateErr) return res.redirect(`${clientUrl}/newsletter/confirm?status=error`);

  res.redirect(`${clientUrl}/newsletter/confirm?status=success`);
});

// ADMIN: Invia newsletter a tutti gli iscritti attivi
// Stato invii newsletter (in memoria, per status polling)
const newsletterJobs = {};

// POST /api/admin/send-newsletter  (richiede header x-admin-secret)
// Body: { subject, html, previewText? }
// Risponde subito con jobId; l'invio avviene in background via batch Resend
app.post('/api/admin/send-newsletter', adminRateLimit, async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    recordFailedAuth(req.ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { subject, html, previewText } = req.body;
  if (!subject || !html) return res.status(400).json({ error: 'subject e html sono obbligatori' });

  const { data: subscribers, error: fetchErr } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, name')
    .eq('active', true)
    .eq('confirmed', true);
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (!subscribers || subscribers.length === 0) return res.json({ sent: 0, total: 0, jobId: null });

  const jobId = Date.now().toString();
  const job = { total: subscribers.length, sent: 0, failed: 0, failedList: [], done: false };
  newsletterJobs[jobId] = job;

  // Rispondi subito al client
  res.json({ dispatching: true, total: subscribers.length, jobId });

  // Invio asincrono in background
  setImmediate(async () => {
    const clientUrl = process.env.CLIENT_URL || 'https://albasax.com';
    const fromAddress = process.env.NEWSLETTER_FROM || 'Albasax <newsletter@albasax.com>';
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const BATCH_SIZE = 50; // Resend batch: max 100, usiamo 50 per sicurezza

    // Costruisci tutti i payload
    const emails = subscribers.map((sub) => {
      const token = generateUnsubscribeToken(sub.id);
      const unsubscribeUrl = `${clientUrl}/unsubscribe?id=${sub.id}&token=${token}`;
      return {
        from: fromAddress,
        to: sub.email,
        reply_to: 'info@albasax.com',
        subject,
        text: buildPlainText({ subject, html, name: sub.name || 'Friend', unsubscribeUrl }),
        html: buildEmailTemplate({ subject, html, previewText, name: sub.name || 'Friend', unsubscribeUrl }),
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'Precedence': 'bulk',
        },
      };
    });

    // Spezza in chunk da BATCH_SIZE e invia con pausa tra i batch
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const chunk = emails.slice(i, i + BATCH_SIZE);
      try {
        console.log(`[Newsletter][${jobId}] Batch ${Math.floor(i / BATCH_SIZE) + 1}: sending ${chunk.length} emails...`);
        const result = await resend.batch.send(chunk);
        if (result.error) {
          const errMsg = result.error.message || JSON.stringify(result.error);
          console.error(`[Newsletter][${jobId}] Batch error:`, errMsg);
          chunk.forEach((e) => job.failedList.push({ email: e.to, reason: errMsg }));
          job.failed += chunk.length;
        } else {
          job.sent += chunk.length;
          console.log(`[Newsletter][${jobId}] Batch OK — sent so far: ${job.sent}/${job.total}`);
        }
      } catch (err) {
        console.error(`[Newsletter][${jobId}] Batch exception:`, err.message);
        chunk.forEach((e) => job.failedList.push({ email: e.to, reason: err.message }));
        job.failed += chunk.length;
      }
      // Pausa tra batch: 1.5 sec (rate limit Resend: 2 req/sec, abbondante margine)
      if (i + BATCH_SIZE < emails.length) await delay(1500);
    }

    job.done = true;
    console.log(`[Newsletter][${jobId}] DONE — sent: ${job.sent}, failed: ${job.failed}/${job.total}`);
  });
});

// GET /api/admin/newsletter-status/:jobId
app.get('/api/admin/newsletter-status/:jobId', adminRateLimit, (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    recordFailedAuth(req.ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const job = newsletterJobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: 'Job non trovato' });
  res.json(job);
});

// ADMIN: Content table CRUD (usa service_role, bypassa RLS)
// Tabelle consentite — whitelist per evitare SQL injection generica
const ALLOWED_TABLES = new Set(['music_releases', 'tour_dates', 'press_articles', 'media_gallery', 'products']);

// POST /api/admin/content/:table — inserisce una riga
app.post('/api/admin/content/:table', adminRateLimit, async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    recordFailedAuth(req.ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(400).json({ error: 'Tabella non consentita' });
  const { data, error } = await supabase.from(table).insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /api/admin/content/:table/:id — elimina una riga
app.delete('/api/admin/content/:table/:id', adminRateLimit, async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    recordFailedAuth(req.ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { table, id } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(400).json({ error: 'Tabella non consentita' });
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Start
app.listen(PORT, () => {
  console.log(`\nAlbasax Server running on port ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'connected' : 'missing SUPABASE_URL'}`);
  console.log(`Stripe:   ${process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing STRIPE_SECRET_KEY'}`);
  console.log(`Resend:   ${process.env.RESEND_API_KEY ? 'key loaded (' + process.env.RESEND_API_KEY.slice(0,8) + '...)' : 'MISSING RESEND_API_KEY'}`);
  console.log(`From:     ${process.env.NEWSLETTER_FROM || 'MISSING NEWSLETTER_FROM'}\n`);
});
