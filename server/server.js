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

// Template HTML email di benvenuto (inviata dopo conferma)
function buildWelcomeEmailTemplate({ name, unsubscribeUrl }) {
  const greeting = name ? `Caro/a ${name},` : 'Ospite d\'Onore,';
  const preHeader = 'Mettiti comodo: le luci in sala si stanno abbassando. Lo show sta per iniziare.';
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>🎬 Il proiettore è acceso. Il tuo pass esclusivo per il mondo di Albasax.</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <!-- Pre-header invisibile -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#080808;line-height:1px;">${preHeader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#080808;">
    <tr><td align="center" style="padding:48px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- GOLD LINE TOP -->
        <tr><td style="background:linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- HEADER -->
        <tr><td align="center" style="background:#0f0f0f;padding:40px 40px 28px;">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.6em;text-transform:uppercase;color:#c5a643;font-weight:700;">— ALBASAX —</p>
          <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#4b4b4b;">Official Newsletter</p>
        </td></tr>
        <tr><td style="background:#1a1a1a;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- BODY -->
        <tr><td style="background:#0f0f0f;padding:44px 48px 40px;">

          <!-- Greeting -->
          <p style="margin:0 0 28px;font-size:15px;color:#8a8a8a;line-height:1.6;">${greeting}</p>

          <!-- Titolo benvenuto -->
          <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#ffffff;line-height:1.3;letter-spacing:0.01em;">Benvenuto/a nell’universo di Albasax.</h2>
          <div style="background:linear-gradient(90deg,#c5a643,transparent);height:1px;margin:0 0 28px;"></div>

          <!-- Intro -->
          <p style="margin:0 0 12px;font-size:15px;color:#9ca3af;line-height:1.85;font-weight:300;">Non sei entrato/a in una semplice mailing list.</p>
          <p style="margin:0 0 28px;font-size:15px;color:#d1d5db;line-height:1.85;font-weight:400;">Ora fai parte dei <span style="color:#c5a643;font-weight:700;letter-spacing:0.05em;">THE DRAMATICS</span>, la community ufficiale di chi ama vivere la musica come uno spettacolo, una storia, un film.</p>

          <!-- Dramatic Pop -->
          <p style="margin:0 0 6px;font-size:13px;color:#6b6b6b;letter-spacing:0.15em;text-transform:uppercase;">Il genere di Albasax è il:</p>
          <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#c5a643;letter-spacing:0.05em;font-weight:400;">Dramatic Pop</p>
          <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.85;font-weight:300;">Un mondo dove la teatralità del palco si fonde con l’eleganza del grande cinema hollywoodiano e l’energia del pop elettronico moderno.</p>

          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.6;font-style:italic;">Non si tratta solo di canzoni.</p>

          <p style="margin:0 0 10px;font-size:15px;color:#9ca3af;line-height:1.85;">&#127917; Albasax dà voce ai drammi, alle passioni e alle luci accecanti che tutti portiamo dentro.</p>
          <p style="margin:0 0 40px;font-size:15px;color:#9ca3af;line-height:1.85;">&#127927; Porta in scena musica, danza e visione artistica come un’unica esperienza nel suo grande show.</p>

          <!-- Divider -->
          <div style="background:linear-gradient(90deg,transparent,#2a2a2a,transparent);height:1px;margin:0 0 36px;"></div>

          <!-- Cosa significa -->
          <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#c5a643;font-weight:700;">&#127903;&#65039; Cosa significa essere un Dramatics?</p>
          <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;">Come membro della sua platea esclusiva, avrai accesso a:</p>

          <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin:0 0 36px;">
            <tr><td style="padding:14px 20px;border-left:2px solid #c5a643;margin-bottom:12px;background:#141414;">
              <p style="margin:0 0 4px;font-size:13px;color:#c5a643;font-weight:600;">&#127916; Ciak in anteprima</p>
              <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;">Ascolterai i nuovi brani prima dell’uscita ufficiale.</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:14px 20px;border-left:2px solid #c5a643;background:#141414;">
              <p style="margin:0 0 4px;font-size:13px;color:#c5a643;font-weight:600;">&#127917; Dietro le quinte</p>
              <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;">Scoprirai la nascita dei pezzi, le idee, i concept e le storie che non si vedono sul palco.</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:14px 20px;border-left:2px solid #c5a643;background:#141414;">
              <p style="margin:0 0 4px;font-size:13px;color:#c5a643;font-weight:600;">&#127903;&#65039; Inviti riservati</p>
              <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;">Accesso prioritario a eventi, live, videoclip e contenuti speciali.</p>
            </td></tr>
          </table>

          <!-- Divider -->
          <div style="background:linear-gradient(90deg,transparent,#2a2a2a,transparent);height:1px;margin:0 0 36px;"></div>

          <!-- Sito -->
          <p style="margin:0 0 12px;font-size:15px;color:#9ca3af;line-height:1.85;">Il nuovo palcoscenico digitale ha appena aperto le porte.<br>E tu sei tra i primi a metterci piede.</p>
          <p style="margin:0 0 12px;font-size:15px;color:#d1d5db;line-height:1.85;font-style:italic;">Le luci in sala si stanno abbassando.<br>Il primo atto sta per cominciare.</p>
          <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.85;">Se vuoi iniziare subito a entrare nell’atmosfera, seguici sul red carpet digitale:</p>

          <!-- Social buttons -->
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 40px;">
            <tr>
              <td style="padding:0 8px 0 0;"><a href="https://www.instagram.com/albasax_official/" style="display:inline-block;padding:12px 20px;border:1px solid #c5a643;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#c5a643;text-decoration:none;font-weight:700;">Instagram</a></td>
              <td style="padding:0 8px;"><a href="https://www.youtube.com/@albasaxofficial" style="display:inline-block;padding:12px 20px;border:1px solid #3a3a3a;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#6b6b6b;text-decoration:none;font-weight:700;">YouTube</a></td>
            </tr>
          </table>

          <!-- Sign off -->
          <p style="margin:0 0 8px;font-size:15px;color:#9ca3af;line-height:1.85;">A presto, e buona visione.</p>
          <p style="margin:0 0 4px;font-size:15px;color:#c5a643;font-weight:600;letter-spacing:0.05em;">✨🖤 Albasax Crew 🖤✨</p>
          <p style="margin:0 0 36px;font-size:12px;color:#4b4b4b;font-style:italic;">*Creator of Dramatic Pop*</p>

          <!-- Divider -->
          <div style="background:linear-gradient(90deg,transparent,#1f1f1f,transparent);height:1px;margin:0 0 28px;"></div>

          <!-- Footer legale -->
          <p style="margin:0;font-size:9px;color:#2a2a2a;line-height:1.8;">Stai ricevendo questa email perché ti sei iscritto alla newsletter di Albasax.<br>
          <a href="${unsubscribeUrl}" style="color:#3a3a3a;text-decoration:underline;">Disiscriviti</a> &nbsp;&bull;&nbsp; <a href="https://albasax.com/legal/privacy" style="color:#3a3a3a;text-decoration:underline;">Privacy Policy</a></p>
        </td></tr>

        <!-- GOLD LINE BOTTOM -->
        <tr><td style="background:linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
    </td></tr>
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
    // Se rate limit Resend, metti in coda: il cron la invierà entro 24h con priorità massima
    if (emailErr.statusCode === 429 || emailErr.message?.includes('rate')) {
      await supabase.from('newsletter_subscribers').update({ confirmation_queued: true }).eq('id', sub.id);
      return res.json({ pending: true, queued: true });
    }
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

  const { data: confirmedSub, error: updateErr } = await supabase
    .from('newsletter_subscribers')
    .update({ confirmed: true, active: true, confirm_token: null })
    .eq('id', id)
    .select('id, email, name')
    .single();

  if (updateErr) return res.redirect(`${clientUrl}/newsletter/confirm?status=error`);

  // Tenta invio email di benvenuto
  // Se Resend ha raggiunto il limite giornaliero, welcome_sent rimane false
  // e il cron job notturno completerà l'invio
  try {
    const unsubToken = generateUnsubscribeToken(confirmedSub.id);
    const serverUrl = process.env.SERVER_URL || 'https://albasax-production.up.railway.app';
    const unsubscribeUrl = `${serverUrl}/api/newsletter/unsubscribe?id=${confirmedSub.id}&token=${unsubToken}`;
    const fromAddress = process.env.NEWSLETTER_FROM || 'Albasax <newsletter@albasax.com>';
    await resend.emails.send({
      from: fromAddress,
      to: confirmedSub.email,
      reply_to: 'info@albasax.com',
      subject: '🎬 Il proiettore è acceso. Il tuo pass esclusivo per il mondo di Albasax.',
      html: buildWelcomeEmailTemplate({ name: confirmedSub.name || '', unsubscribeUrl }),
    });
    // Email inviata con successo: marca welcome_sent = true
    await supabase.from('newsletter_subscribers').update({ welcome_sent: true }).eq('id', confirmedSub.id);
  } catch (welcomeErr) {
    // Resend ha risposto con errore (rate limit o altro) — welcome_sent resta false
    // Il cron job si occuperà di inviare il benvenuto più tardi
    console.warn('[Welcome] Email non inviata, verrà riprovata dal cron job:', welcomeErr.message);
  }

  res.redirect(`${clientUrl}/newsletter/confirm?status=success`);
});

// ADMIN: Invia newsletter a tutti gli iscritti attivi
// Stato invii newsletter (in memoria, per status polling)
const newsletterJobs = {};

// POST /api/admin/send-newsletter  (richiede header x-admin-secret)
// Body: { subject, html, previewText? }
// 1. Crea campagna + coda persistente su Supabase
// 2. Invia subito fino a 90 email — le rimanenti vengono processate dal cron notturno
// 3. Ogni destinatario è garantito di ricevere l'email (massimo qualche giorno di ritardo)
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

  // 1. Crea campagna persistente
  const { data: campaign, error: campErr } = await supabase
    .from('newsletter_campaigns')
    .insert([{ subject, preview_text: previewText || '', html_body: html, total: subscribers.length, status: 'queued' }])
    .select('id')
    .single();
  if (campErr) return res.status(500).json({ error: campErr.message });

  // 2. Inserisce tutta la coda in un unico batch
  const queueRows = subscribers.map(sub => ({
    campaign_id: campaign.id,
    subscriber_id: sub.id,
    email: sub.email,
    name: sub.name || '',
    sent: false,
  }));
  const { error: queueErr } = await supabase.from('newsletter_queue').insert(queueRows);
  if (queueErr) return res.status(500).json({ error: queueErr.message });

  // Aggiorna stato campagna
  await supabase.from('newsletter_campaigns').update({ status: 'sending' }).eq('id', campaign.id);

  const jobId = campaign.id;
  const job = { total: subscribers.length, sent: 0, failed: 0, done: false, campaignId: campaign.id };
  newsletterJobs[jobId] = job;

  // Rispondi subito al client
  res.json({ dispatching: true, total: subscribers.length, jobId });

  // 3. Invia subito (fino a 90 per rispettare il limite giornaliero)
  setImmediate(() => processNewsletterQueue(campaign.id, subject, html, previewText, job));
});

// ── Processa coda newsletter: invia fino a maxEmails per sessione ────────────
async function processNewsletterQueue(campaignId, subject, html, previewText, job, maxEmails = 50) {
  const { data: pending } = await supabase
    .from('newsletter_queue')
    .select('id, email, name, subscriber_id')
    .eq('campaign_id', campaignId)
    .eq('sent', false)
    .order('created_at', { ascending: true })
    .limit(maxEmails);

  if (!pending || pending.length === 0) {
    await finalizeCampaign(campaignId, job);
    return;
  }

  const fromAddress = process.env.NEWSLETTER_FROM || 'Albasax <newsletter@albasax.com>';
  const serverUrl = process.env.SERVER_URL || 'https://albasax-production.up.railway.app';
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const BATCH_SIZE = 50;

  const emails = pending.map(sub => {
    const token = generateUnsubscribeToken(sub.subscriber_id);
    const unsubscribeUrl = `${serverUrl}/api/newsletter/unsubscribe?id=${sub.subscriber_id}&token=${token}`;
    return {
      queueId: sub.id,
      payload: {
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
      },
    };
  });

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const queueIds = chunk.map(e => e.queueId);
    try {
      const result = await resend.batch.send(chunk.map(e => e.payload));
      if (result.error) {
        const errMsg = result.error.message || JSON.stringify(result.error);
        console.error(`[Newsletter][${campaignId}] Batch error:`, errMsg);
        await supabase.from('newsletter_queue').update({ error: errMsg }).in('id', queueIds);
        if (job) job.failed += chunk.length;
      } else {
        await supabase.from('newsletter_queue').update({ sent: true, sent_at: new Date().toISOString() }).in('id', queueIds);
        if (job) job.sent += chunk.length;
        console.log(`[Newsletter][${campaignId}] Batch OK — sent: ${job?.sent}/${job?.total}`);
      }
    } catch (err) {
      console.error(`[Newsletter][${campaignId}] Batch exception:`, err.message);
      // Rate limit hit — ferma l'invio, il cron notturno continua
      if (err.statusCode === 429 || err.message?.includes('rate') || err.message?.includes('limit')) {
        console.warn(`[Newsletter][${campaignId}] Rate limit raggiunto — coda riprenderà dal cron notturno`);
        break;
      }
      await supabase.from('newsletter_queue').update({ error: err.message }).in('id', queueIds);
      if (job) job.failed += chunk.length;
    }
    if (i + BATCH_SIZE < emails.length) await delay(1500);
  }

  // Controlla se la coda è completamente svuotata
  const { count } = await supabase
    .from('newsletter_queue')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('sent', false);

  if (count === 0) {
    await finalizeCampaign(campaignId, job);
  } else {
    console.log(`[Newsletter][${campaignId}] ${count} email rimanenti in coda — verranno inviate dal cron notturno`);
    if (job) job.done = true; // Per il polling del pannello admin: consideriamo il job "done" lato UI
  }
}

async function finalizeCampaign(campaignId, job) {
  await supabase.from('newsletter_campaigns').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', campaignId);
  if (job) job.done = true;
  console.log(`[Newsletter][${campaignId}] Campagna completata`);
}

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

// CRON: Processa tutta la coda email pendente (welcome + newsletter)
// GET /api/cron/send-pending-welcomes
// Chiamato ogni notte da cron-job.org — protetto da CRON_SECRET
// Budget giornaliero: 90 email (conservativo su Resend free 100/giorno)
app.get('/api/cron/send-pending-welcomes', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const DAILY_BUDGET = 50; // 50 newsletter + 50 riservati alle email transazionali (conferme, welcome real-time)
  const fromAddress = process.env.NEWSLETTER_FROM || 'Albasax <newsletter@albasax.com>';
  const serverUrl = process.env.SERVER_URL || 'https://albasax-production.up.railway.app';
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  let totalSent = 0;
  let totalFailed = 0;
  const report = { confirmation: { sent: 0, failed: 0 }, welcome: { sent: 0, failed: 0 }, newsletter: {}, budget: DAILY_BUDGET };

  // ── FASE 0: Email di conferma in coda (PRIORITÀ MASSIMA) ─────────────────
  // Iscritti che non hanno ricevuto l'email di conferma per rate limit
  const { data: pendingConfirm } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, name, confirm_token')
    .eq('confirmed', false)
    .eq('confirmation_queued', true)
    .order('subscribed_at', { ascending: true })
    .limit(10); // max 10: sono email critiche, ma non devono prosciugare il budget

  if (pendingConfirm && pendingConfirm.length > 0) {
    for (const sub of pendingConfirm) {
      if (totalSent >= DAILY_BUDGET) break;
      const confirmUrl = `${serverUrl}/api/newsletter/confirm?id=${sub.id}&token=${sub.confirm_token}`;
      try {
        await resend.emails.send({
          from: fromAddress,
          to: sub.email,
          reply_to: 'info@albasax.com',
          subject: 'Conferma la tua iscrizione alla newsletter di Albasax',
          html: buildConfirmEmailTemplate({ name: sub.name || '', confirmUrl }),
        });
        await supabase.from('newsletter_subscribers').update({ confirmation_queued: false }).eq('id', sub.id);
        totalSent++;
        report.confirmation.sent++;
      } catch (err) {
        console.warn(`[Cron Confirm] Fallito ${sub.email}:`, err.message);
        report.confirmation.failed++;
        totalFailed++;
        if (err.statusCode === 429 || err.message?.includes('rate')) break;
      }
      await delay(200);
    }
  }

  // ── FASE 1: Welcome email pending ────────────────────────────────────────
  const welcomeBudget = Math.floor(DAILY_BUDGET * 0.2); // max 20% del budget ai benvenuti (10 email)
  const { data: pendingWelcome } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, name')
    .eq('confirmed', true)
    .eq('active', true)
    .eq('welcome_sent', false)
    .order('subscribed_at', { ascending: true })
    .limit(welcomeBudget);

  if (pendingWelcome && pendingWelcome.length > 0) {
    for (const sub of pendingWelcome) {
      if (totalSent >= DAILY_BUDGET) break;
      try {
        const unsubToken = generateUnsubscribeToken(sub.id);
        const unsubscribeUrl = `${serverUrl}/api/newsletter/unsubscribe?id=${sub.id}&token=${unsubToken}`;
        await resend.emails.send({
          from: fromAddress,
          to: sub.email,
          reply_to: 'info@albasax.com',
          subject: '🎬 Il proiettore è acceso. Il tuo pass esclusivo per il mondo di Albasax.',
          html: buildWelcomeEmailTemplate({ name: sub.name || '', unsubscribeUrl }),
        });
        await supabase.from('newsletter_subscribers').update({ welcome_sent: true }).eq('id', sub.id);
        totalSent++;
        report.welcome.sent++;
      } catch (err) {
        console.warn(`[Cron Welcome] Fallito ${sub.email}:`, err.message);
        report.welcome.failed++;
        totalFailed++;
        if (err.statusCode === 429 || err.message?.includes('rate')) { break; }
      }
      await delay(200);
    }
  }

  // ── FASE 2: Newsletter queue pendenti (più vecchie prima) ────────────────
  // Cerca campagne con email non ancora inviate
  const remainingBudget = DAILY_BUDGET - totalSent;
  if (remainingBudget > 0) {
    const { data: pendingQueue } = await supabase
      .from('newsletter_queue')
      .select('id, campaign_id, subscriber_id, email, name')
      .eq('sent', false)
      .is('error', null) // salta quelle con errore permanente
      .order('created_at', { ascending: true })
      .limit(remainingBudget);

    if (pendingQueue && pendingQueue.length > 0) {
      // Raggruppa per campagna per caricare subject/html una volta sola
      const campaignIds = [...new Set(pendingQueue.map(r => r.campaign_id))];
      const { data: campaigns } = await supabase
        .from('newsletter_campaigns')
        .select('id, subject, html_body, preview_text')
        .in('id', campaignIds);
      const campaignMap = Object.fromEntries((campaigns || []).map(c => [c.id, c]));

      const BATCH_SIZE = 50;
      const batched = [];
      for (const item of pendingQueue) {
        const camp = campaignMap[item.campaign_id];
        if (!camp) continue;
        const token = generateUnsubscribeToken(item.subscriber_id);
        const unsubscribeUrl = `${serverUrl}/api/newsletter/unsubscribe?id=${item.subscriber_id}&token=${token}`;
        batched.push({
          queueId: item.id,
          campaignId: item.campaign_id,
          payload: {
            from: fromAddress,
            to: item.email,
            reply_to: 'info@albasax.com',
            subject: camp.subject,
            text: buildPlainText({ subject: camp.subject, html: camp.html_body, name: item.name || 'Friend', unsubscribeUrl }),
            html: buildEmailTemplate({ subject: camp.subject, html: camp.html_body, previewText: camp.preview_text, name: item.name || 'Friend', unsubscribeUrl }),
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              'Precedence': 'bulk',
            },
          },
        });
      }

      for (let i = 0; i < batched.length; i += BATCH_SIZE) {
        if (totalSent >= DAILY_BUDGET) break;
        const chunk = batched.slice(i, i + BATCH_SIZE);
        const queueIds = chunk.map(e => e.queueId);
        const campaignId = chunk[0].campaignId;
        try {
          const result = await resend.batch.send(chunk.map(e => e.payload));
          if (result.error) {
            await supabase.from('newsletter_queue').update({ error: result.error.message }).in('id', queueIds);
            totalFailed += chunk.length;
            report.newsletter[campaignId] = (report.newsletter[campaignId] || { sent: 0, failed: 0 });
            report.newsletter[campaignId].failed += chunk.length;
          } else {
            await supabase.from('newsletter_queue').update({ sent: true, sent_at: new Date().toISOString() }).in('id', queueIds);
            totalSent += chunk.length;
            report.newsletter[campaignId] = (report.newsletter[campaignId] || { sent: 0, failed: 0 });
            report.newsletter[campaignId].sent += chunk.length;
          }
        } catch (err) {
          console.error(`[Cron Newsletter] Batch exception:`, err.message);
          if (err.statusCode === 429 || err.message?.includes('rate')) break;
          await supabase.from('newsletter_queue').update({ error: err.message }).in('id', queueIds);
          totalFailed += chunk.length;
        }
        await delay(1500);
      }

      // Aggiorna status campagne completate
      for (const campId of campaignIds) {
        const { count } = await supabase
          .from('newsletter_queue')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', campId)
          .eq('sent', false);
        if (count === 0) {
          await supabase.from('newsletter_campaigns').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', campId);
        }
      }
    }
  }

  console.log(`[Cron] Fine — sent: ${totalSent}, failed: ${totalFailed}`);
  res.json({ totalSent, totalFailed, report });
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
