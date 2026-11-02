// Admin/owner authentication: scrypt password hashes + HMAC-signed bearer tokens.
const crypto = require('crypto');
const store = require('../data/store');

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret() {
  const base = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error('ADMIN_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set');
  // Derive a dedicated signing key so the raw secret is never used directly
  return crypto.createHmac('sha256', base).update('masfeeh-admin-session-v1').digest();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(password, stored) {
  const [scheme, saltB64, hashB64] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(String(password), Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

const b64url = buf => Buffer.from(buf).toString('base64url');

// Fingerprint of the current password hash: changing the password invalidates old tokens
const pwFingerprint = passwordHash =>
  crypto.createHmac('sha256', secret()).update(String(passwordHash)).digest('base64url').slice(0, 16);

function signToken(user) {
  const payload = b64url(JSON.stringify({
    sub: user.id, role: user.role, pwv: pwFingerprint(user.password_hash), exp: Date.now() + TOKEN_TTL_MS
  }));
  const sig = b64url(crypto.createHmac('sha256', secret()).update(payload).digest());
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const expected = b64url(crypto.createHmac('sha256', secret()).update(payload).digest());
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

async function getUserFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const claims = verifyToken(token);
  if (!claims) return null;
  const user = await store.getAdminById(claims.sub); // null if the account was removed
  if (!user || claims.pwv !== pwFingerprint(user.password_hash)) return null;
  const { password_hash, ...safeUser } = user; // eslint-disable-line no-unused-vars
  return safeUser;
}

// Express middleware: rejects requests without a valid owner/admin session
async function requireAdmin(req, res, next) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Please log in to the admin dashboard.' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { hashPassword, verifyPassword, signToken, getUserFromRequest, requireAdmin };
