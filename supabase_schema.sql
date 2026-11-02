-- ==============================================================
-- MASFEEH E-COMMERCE - SUPABASE SCHEMA
-- Applied with: npm run db:setup  (server/scripts/setup-db.js)
-- Safe to re-run.
--
-- Security model: the browser never talks to Supabase directly.
-- All reads/writes go through the Express API (/api), which uses the
-- SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). RLS is enabled on every
-- table with no anon policies except public read of products, so the
-- publishable/anon key cannot read orders, settings or admin users.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.products (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    category       TEXT NOT NULL,
    price          NUMERIC NOT NULL,
    original_price NUMERIC,
    stock          INTEGER NOT NULL DEFAULT 10,
    badge          TEXT,
    image          TEXT NOT NULL,
    images         JSONB NOT NULL DEFAULT '[]'::jsonb,
    description    TEXT,
    features       JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id             TEXT PRIMARY KEY,
    customer       JSONB NOT NULL,
    items          JSONB NOT NULL,
    subtotal       NUMERIC NOT NULL,
    shipping       NUMERIC NOT NULL DEFAULT 70,
    discount       NUMERIC NOT NULL DEFAULT 0,
    total          NUMERIC NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
    payment_status TEXT,
    status         TEXT NOT NULL DEFAULT 'Pending',
    tracking_code  TEXT,
    courier        TEXT,
    timeline       JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

-- Single-row settings document (shop info, shipping, social, SMTP)
CREATE TABLE IF NOT EXISTS public.settings (
    id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    data       JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_logs (
    id         TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    data       JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx ON public.email_logs (created_at DESC);

-- Dashboard logins (owner / admin). Passwords are scrypt hashes.
CREATE TABLE IF NOT EXISTS public.admin_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    name          TEXT,
    role          TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products
    FOR SELECT TO anon, authenticated USING (true);

-- Public bucket for product photos uploaded from the admin dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
