-- ==============================================================
-- 🌸 MASFEEH E-COMMERCE - SUPABASE POSTGRESQL SCHEMA
-- Copy and paste this directly into your Supabase SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    stock INTEGER DEFAULT 10,
    badge TEXT DEFAULT 'New Arrival',
    image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    shipping NUMERIC NOT NULL DEFAULT 70,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
    payment_status TEXT DEFAULT 'Pending',
    status TEXT DEFAULT 'Pending',
    tracking_code TEXT,
    courier TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    shop_name TEXT DEFAULT 'Masfeeh',
    tagline TEXT DEFAULT 'Accessorize Your World',
    slogan TEXT DEFAULT 'Little Things... Big Happiness ♡',
    owner_email TEXT DEFAULT 'maishamonsura@gmail.com',
    owner_phone TEXT DEFAULT '01303-662891',
    address TEXT DEFAULT 'Bashundhara R/A, Dhaka, Bangladesh',
    currency TEXT DEFAULT '৳',
    shipping_dhaka NUMERIC DEFAULT 70,
    shipping_outside_dhaka NUMERIC DEFAULT 130,
    facebook_url TEXT DEFAULT 'https://www.facebook.com/profile.php?id=61596179578624',
    instagram_url TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- POLICIES:
-- Anyone can view products
CREATE POLICY "Public products viewable" ON public.products
    FOR SELECT USING (true);

-- Authenticated / Service role can insert & update products
CREATE POLICY "Full access products" ON public.products
    FOR ALL USING (true);

-- Anyone can insert a customer order
CREATE POLICY "Public order creation" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Anyone can view orders (for order tracking by ID)
CREATE POLICY "Public order tracking" ON public.orders
    FOR SELECT USING (true);

-- Service role can update order status
CREATE POLICY "Full access orders" ON public.orders
    FOR ALL USING (true);

-- Anyone can read settings
CREATE POLICY "Public settings viewable" ON public.settings
    FOR SELECT USING (true);

-- Full access settings
CREATE POLICY "Full access settings" ON public.settings
    FOR ALL USING (true);

-- SEED INITIAL PRODUCTS
INSERT INTO public.products (id, name, category, price, original_price, stock, badge, image, images, description, features)
VALUES 
(
    'prod-1',
    'Premium Crossbody Bag - FIOM Monogram',
    'Bags',
    1850,
    2350,
    15,
    'Bestseller',
    '/assets/lookbook_1_fiom.jpg',
    '["/assets/lookbook_1_fiom.jpg", "/assets/bag_video_clean.jpg"]'::jsonb,
    'Premium Cross body bag with both long and short belt. Features our signature FIOM monogram textured finish, high-grade gold-tone hardware, and versatile styling.',
    '["Includes 2 detachable straps (Adjustable Long Shoulder Strap + Chic Short Hand Belt)", "Dual smooth glide gold zipper compartments", "High-density scratch resistant vegan leather", "Dimensions: 21cm x 13cm x 8cm"]'::jsonb
),
(
    'prod-2',
    'Signature Floral Clover Monogram Crossbody',
    'Bags',
    1950,
    2450,
    12,
    'New Arrival',
    '/assets/lookbook_2_clover.jpg',
    '["/assets/lookbook_2_clover.jpg", "/assets/bag_clover.jpg"]'::jsonb,
    'Elegant monogram floral clover pattern with luxury champagne gold accents. Comes with dual belts for shoulder or handbag wear.',
    '["Comes with both long crossbody belt and short handle belt", "Reinforced structured corners for timeless durability", "Interior slip pocket and zip partition", "Dimensions: 22cm x 14cm x 8cm"]'::jsonb
),
(
    'prod-3',
    'Timeless Chocolate Ribbed Leather Crossbody',
    'Bags',
    1750,
    2150,
    18,
    'Trending',
    '/assets/lookbook_3_chocolate.jpg',
    '["/assets/lookbook_3_chocolate.jpg", "/assets/bag_brown_solid.jpg"]'::jsonb,
    'Rich chocolate brown minimal crossbody bag with ribbed edge trim and golden hardware. Pairs effortlessly with both ethnic and western attire.',
    '["Includes long crossbody belt and wrist/handlet strap", "Water-resistant textured PU leather", "Golden pull tabs and magnetic snap closure"]'::jsonb
),
(
    'prod-4',
    'Royal Monogram Golden Crest Crossbody',
    'Bags',
    1890,
    2390,
    10,
    'Featured',
    '/assets/lookbook_5_gold_crest.jpg',
    '["/assets/lookbook_5_gold_crest.jpg", "/assets/bag_monogram_gold.jpg"]'::jsonb,
    'Exclusive golden deer emblem on monogram leather. Comes with long adjustable belt and short hand strap for modern versatility.',
    '["Dual strap set included (long belt + short strap)", "Golden metallic deer logo plaque", "Multiple compartments with luxury lining"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
