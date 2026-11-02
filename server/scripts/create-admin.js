// Create or reset a dashboard login.
// Usage: npm run admin:create -- <email> <owner|admin> [password] [name]
// If no password is given, a strong random one is generated and printed once.
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const dbSsl = require('./db-ssl');
const { hashPassword } = require('../services/auth');

async function main() {
  const [emailArg, role, passwordArg, ...nameParts] = process.argv.slice(2);
  if (!emailArg || !['owner', 'admin'].includes(role)) {
    console.error('Usage: npm run admin:create -- <email> <owner|admin> [password] [name]');
    process.exit(1);
  }
  const email = emailArg.trim().toLowerCase();
  const password = passwordArg || crypto.randomBytes(9).toString('base64url');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');

  const db = new Client({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT,
    ssl: dbSsl()
  });
  await db.connect();
  await db.query(
    `INSERT INTO public.admin_users (email, name, role, password_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash,
       name = COALESCE(EXCLUDED.name, admin_users.name)`,
    [email, nameParts.join(' ') || null, role, hashPassword(password)]
  );
  await db.end();

  console.log(`✔ ${role} login ready`);
  console.log(`  email:    ${email}`);
  if (!passwordArg) console.log(`  password: ${password}   (shown once, save it now)`);
}

main().catch(err => {
  console.error('✖', err.message);
  process.exit(1);
});
