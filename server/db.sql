-- ============================================================
-- ALBASAX DATABASE SCHEMA — Eseguire nel Supabase SQL Editor
-- ============================================================
-- NOTA: la tabella "users" è gestita automaticamente da Supabase Auth
-- (schema auth.users). Non devi crearla manualmente.
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. FUNZIONE UTILITY — deve stare PRIMA di tutti i trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- 1. PROFILES (dati extra utente per sicurezza anti-frode)
--    Viene popolata automaticamente al momento della registrazione.
--    Collegata a auth.users tramite trigger.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id             UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    birth_date     DATE NOT NULL,          -- per verifica età (>= 16 anni)
    phone          VARCHAR(30) NOT NULL,   -- numero di telefono (anti-frode)
    country        VARCHAR(100) NOT NULL,  -- paese di residenza
    email_verified BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Solo il proprietario può leggere e modificare il proprio profilo
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- La funzione viene chiamata dal trigger quando un nuovo utente si registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, birth_date, phone, country)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        (NEW.raw_user_meta_data->>'birth_date')::DATE,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'country', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: si attiva ogni volta che un nuovo utente è CONFERMATO
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- 2. NEWSLETTER SUBSCRIBERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(100),
    source      VARCHAR(50) DEFAULT 'newsletter',  -- 'newsletter' | 'registration' | 'shop_notify'
    active      BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 3. PRODUCTS (Shop)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    image_url   TEXT,
    category    VARCHAR(50),   -- 'vinyl' | 'apparel' | 'limited'
    stock       INTEGER DEFAULT 0,
    active      BOOLEAN DEFAULT TRUE,
    stripe_price_id VARCHAR(255),  -- Stripe Price ID per il checkout
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 4. ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id           UUID REFERENCES auth.users(id),
    user_email        VARCHAR(255) NOT NULL,
    status            VARCHAR(50) DEFAULT 'pending',  -- pending | paid | shipped | delivered | cancelled
    total_amount      DECIMAL(10,2) NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE,
    shipping_address  JSONB,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 5. ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id   UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity     INTEGER NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL
);

-- ─────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            ENABLE ROW LEVEL SECURITY;

-- Newsletter: chiunque può iscriversi
CREATE POLICY "Anyone can subscribe"
    ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Solo l'unsubscribe è permesso (active = false) — non si può cambiare l'email altrui
CREATE POLICY "Subscribers can unsubscribe"
    ON newsletter_subscribers FOR UPDATE
    USING (true)
    WITH CHECK (active = false);

-- Products: chiunque può leggere i prodotti attivi
CREATE POLICY "Anyone can read active products"
    ON products FOR SELECT USING (active = true);

-- Orders: solo il proprietario può leggere/creare i propri ordini
CREATE POLICY "Users can read own orders"
    ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create orders"
    ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: seguono l'accesso agli ordini
CREATE POLICY "Users can read own order items"
    ON order_items FOR SELECT
    USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 7. TRIGGER updated_at sugli ordini
-- ─────────────────────────────────────────────
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- 8. MIGRATION: Double opt-in newsletter
-- Esegui questi comandi nel SQL Editor di Supabase
-- ─────────────────────────────────────────────
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirm_token TEXT;

-- I vecchi iscritti (già attivi) vengono considerati confermati
UPDATE newsletter_subscribers SET confirmed = TRUE WHERE active = TRUE;

-- ─────────────────────────────────────────────
-- 8b. MIGRATION: Welcome email queue
-- Aggiunge welcome_sent per gestire il limite giornaliero di Resend (100/giorno)
-- Gli iscritti confermati senza welcome ricevono l'email dal cron job notturno
-- ─────────────────────────────────────────────
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS welcome_sent BOOLEAN DEFAULT FALSE;

-- Chi è già confermato e attivo da prima viene considerato già benvenuto
UPDATE newsletter_subscribers SET welcome_sent = TRUE WHERE confirmed = TRUE;

-- ─────────────────────────────────────────────
-- 9. CONTENT TABLES (gestite dall'Admin panel via Railway service_role)
--    Eseguire nel Supabase SQL Editor
--    NOTA SICUREZZA: solo SELECT è permesso all'anon key.
--    Le scritture passano da Railway (service_role bypassa RLS).
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS music_releases (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  year        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'Single',
  cover_url   TEXT NOT NULL DEFAULT '',
  spotify_url TEXT DEFAULT '',
  apple_url   TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE music_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read music_releases" ON music_releases FOR SELECT USING (true);
-- Scritture solo via service_role (Railway) — nessuna policy per anon

CREATE TABLE IF NOT EXISTS tour_dates (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date        DATE NOT NULL,
  venue       TEXT NOT NULL,
  location    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Available',
  ticket_url  TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE tour_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tour_dates" ON tour_dates FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS press_articles (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  outlet      TEXT NOT NULL,
  date        TEXT NOT NULL,
  excerpt     TEXT DEFAULT '',
  image_url   TEXT DEFAULT '',
  url         TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE press_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read press_articles" ON press_articles FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS media_gallery (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type        TEXT NOT NULL DEFAULT 'image',
  url         TEXT NOT NULL,
  thumbnail   TEXT DEFAULT '',
  title       TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE media_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media_gallery" ON media_gallery FOR SELECT USING (true);

-- ── Se hai già eseguito le tabelle con le policy aperte, esegui questo
--    per chiuderle (rimuove write pubblico):
-- DROP POLICY IF EXISTS "Admin all music_releases"   ON music_releases;
-- DROP POLICY IF EXISTS "Admin all tour_dates"        ON tour_dates;
-- DROP POLICY IF EXISTS "Admin all press_articles"    ON press_articles;
-- DROP POLICY IF EXISTS "Admin all media_gallery"     ON media_gallery;
