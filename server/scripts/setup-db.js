// Creates the Supabase tables/bucket and seeds products + settings.
// Usage: npm run db:setup   (needs DATABASE_URL in server/.env)
// Safe to re-run: existing products/settings are never overwritten.
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const DEFAULTS = require('../data/defaults');

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  if (!connectionString) throw new Error('Set DATABASE_URL in server/.env');

  const db = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await db.connect();

  const schema = fs.readFileSync(path.join(__dirname, '../../supabase_schema.sql'), 'utf8');
  await db.query(schema);
  console.log('✔ Schema applied');

  // Prefer the local JSON database (your current inventory), else built-in defaults
  const jsonFile = path.join(__dirname, '../data/db.json');
  const source = fs.existsSync(jsonFile) ? JSON.parse(fs.readFileSync(jsonFile, 'utf8')) : DEFAULTS;

  let added = 0;
  for (const p of source.products || []) {
    const r = await db.query(
      `INSERT INTO public.products
         (id, name, category, price, original_price, stock, badge, image, images, description, features, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.category, p.price, p.originalPrice ?? null, p.stock ?? 10, p.badge ?? null,
       p.image, JSON.stringify(p.images || [p.image]), p.description ?? null,
       JSON.stringify(p.features || []), p.createdAt || new Date().toISOString()]
    );
    added += r.rowCount;
  }
  console.log(`✔ Products: ${added} added, ${(source.products || []).length - added} already present`);

  const settings = { ...DEFAULTS.settings, ...(source.settings || {}) };
  const s = await db.query(
    `INSERT INTO public.settings (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(settings)]
  );
  console.log(s.rowCount ? '✔ Settings seeded' : '✔ Settings already present (unchanged)');

  await db.end();
}

main().catch(err => {
  console.error('✖ Setup failed:', err.message);
  process.exit(1);
});
