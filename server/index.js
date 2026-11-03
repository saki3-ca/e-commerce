const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // also allow a root .env
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const store = require('./data/store');
const emailService = require('./services/emailService');
const auth = require('./services/auth');
const pricing = require('./services/pricing');

const app = express();
const PORT = process.env.PORT || 5000;

// Wrap async route handlers so rejected promises reach the error handler
const h = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Images are kept in memory then pushed to Supabase Storage (no local disk on Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // Vercel functions accept ~4.5MB request bodies
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});

// Local dev only: serve built frontend + legacy assets. On Vercel the CDN serves these.
const clientDist = path.join(__dirname, '../client/dist');
if (!process.env.VERCEL) {
  app.use('/assets', express.static(path.join(__dirname, '../client/public/assets')));
  if (fs.existsSync(clientDist)) app.use(express.static(clientDist));
}

const PUBLIC_SETTING_KEYS = [
  'shopName', 'tagline', 'slogan', 'ownerEmail', 'ownerPhone', 'address', 'currency',
  'shippingDhaka', 'shippingOutsideDhaka', 'freeShippingThreshold', 'mobileBankingNumber',
  'facebookUrl', 'instagramUrl'
];

const EMAIL_RE = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-zA-Z]{2,}$/;

// Customer account as returned to the browser
function accountView(c) {
  return {
    id: c.id, email: c.email, name: c.name, phone: c.phone || '',
    address: c.address || '', city: c.city || 'Inside Dhaka', cart: c.cart || []
  };
}

// What an anonymous visitor may see when tracking an order (no full address/phone/email)
function publicOrderView(order) {
  const c = order.customer || {};
  const parts = String(c.name || '').trim().split(/\s+/);
  const phone = String(c.phone || '');
  return {
    ...order,
    customer: {
      name: parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0],
      phone: phone.length > 6 ? `${phone.slice(0, 3)}•••••${phone.slice(-3)}` : '•••',
      address: 'Hidden for privacy',
      city: c.city
    }
  };
}

const str = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

function validateOrderInput({ customer, items }) {
  if (!customer || !str(customer.name, 100) || !str(customer.phone, 30) || !str(customer.address, 500)) {
    return 'Customer name, phone, and address are required';
  }
  if (customer.email && !EMAIL_RE.test(customer.email)) {
    return 'Please enter a valid email address';
  }
  for (const k of ['city', 'notes']) {
    if (customer[k] !== undefined && (typeof customer[k] !== 'string' || customer[k].length > 500)) {
      return `Invalid ${k}`;
    }
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return 'Order must contain at least 1 item';
  }
  return null;
}

function parseFeatures(features) {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try {
    const parsed = JSON.parse(features);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* fall through to newline split */ }
  return String(features).split('\n').map(s => s.trim()).filter(Boolean);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------- AUTH ---------------- //

app.post('/api/auth/login', h(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = await store.getAdminByEmail(email);
  if (!user || !auth.verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({
    token: auth.signToken(user),
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
}));

app.get('/api/auth/me', auth.requireAdmin, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/change-password', auth.requireAdmin, h(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  const user = await store.getAdminByEmail(req.user.email);
  if (!auth.verifyPassword(currentPassword || '', user.password_hash)) {
    return res.status(401).json({ error: 'Current password is wrong' });
  }
  const passwordHash = auth.hashPassword(newPassword);
  await store.updateAdminPassword(user.id, passwordHash);
  // Old sessions (incl. this one) are now invalid: hand back a fresh token
  res.json({ success: true, token: auth.signToken({ ...user, password_hash: passwordHash }) });
}));

// ---------------- CUSTOMER ACCOUNTS (optional) ---------------- //

app.post('/api/account/signup', h(async (req, res) => {
  const { name, email, phone, password, cart } = req.body || {};
  if (!str(name, 100)) return res.status(400).json({ error: 'Please enter your name' });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (phone && !str(phone, 30)) return res.status(400).json({ error: 'Invalid phone number' });

  let customer;
  try {
    customer = await store.createCustomer({
      email, name: name.trim(), phone: phone ? phone.trim() : null, passwordHash: auth.hashPassword(password)
    });
  } catch (err) {
    if (err.status === 409) return res.status(409).json({ error: err.message });
    throw err;
  }
  // Keep whatever the shopper had in their bag before signing up
  const saved = pricing.normalizeItems(cart);
  if (saved.length) customer = await store.updateCustomer(customer.id, { cart: saved });
  res.status(201).json({ token: auth.signToken(customer, 'customer'), account: accountView(customer) });
}));

app.post('/api/account/login', h(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const customer = await store.getCustomerByEmail(email);
  if (!customer || !auth.verifyPassword(password, customer.password_hash)) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ token: auth.signToken(customer, 'customer'), account: accountView(customer) });
}));

app.get('/api/account', auth.requireCustomer, (req, res) => {
  res.json({ account: accountView(req.customer) });
});

app.put('/api/account', auth.requireCustomer, h(async (req, res) => {
  const { name, phone, address, city } = req.body || {};
  const patch = {};
  if (name !== undefined) {
    if (!str(name, 100)) return res.status(400).json({ error: 'Please enter your name' });
    patch.name = name.trim();
  }
  if (phone !== undefined) {
    if (phone !== '' && !str(phone, 30)) return res.status(400).json({ error: 'Invalid phone number' });
    patch.phone = phone.trim();
  }
  if (address !== undefined) {
    if (address !== '' && !str(address, 500)) return res.status(400).json({ error: 'Invalid address' });
    patch.address = address.trim();
  }
  if (city !== undefined) patch.city = pricing.AREAS.includes(city) ? city : 'Inside Dhaka';
  const updated = await store.updateCustomer(req.customer.id, patch);
  res.json({ account: accountView(updated) });
}));

// Saved bag: [{id, quantity}]. Prices always come from /api/quote.
app.put('/api/account/cart', auth.requireCustomer, h(async (req, res) => {
  const cart = pricing.normalizeItems(req.body && req.body.cart).slice(0, 50);
  const updated = await store.updateCustomer(req.customer.id, { cart });
  res.json({ cart: updated.cart });
}));

app.get('/api/account/orders', auth.requireCustomer, h(async (req, res) => {
  res.json(await store.getOrdersByCustomer(req.customer.id));
}));

app.post('/api/account/change-password', auth.requireCustomer, h(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  const full = await store.getCustomerById(req.customer.id);
  if (!auth.verifyPassword(currentPassword || '', full.password_hash)) {
    return res.status(401).json({ error: 'Current password is wrong' });
  }
  const updated = await store.updateCustomer(full.id, { password_hash: auth.hashPassword(newPassword) });
  res.json({ success: true, token: auth.signToken(updated, 'customer') });
}));

// ---------------- PRODUCTS (read: public, write: admin) ---------------- //

app.get('/api/products', h(async (req, res) => {
  let products = await store.getProducts();
  const { category, search, badge } = req.query;

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (badge) {
    products = products.filter(p => p.badge && p.badge.toLowerCase() === badge.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  }
  res.json(products);
}));

app.get('/api/products/:id', h(async (req, res) => {
  const product = await store.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}));

app.post('/api/products', auth.requireAdmin, upload.single('imageFile'), h(async (req, res) => {
  const { name, category, price, originalPrice, stock, badge, description, features, imageUrl } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  let finalImageUrl = '/assets/bag_fiom.jpg';
  if (req.file) {
    finalImageUrl = await store.uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
  } else if (imageUrl && imageUrl.trim()) {
    finalImageUrl = imageUrl.trim();
  }

  const parsedFeatures = parseFeatures(features);
  const newProduct = await store.addProduct({
    name,
    category,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    stock: stock !== undefined && stock !== '' ? Number(stock) : 10,
    badge: badge || 'New',
    image: finalImageUrl,
    images: [finalImageUrl],
    description: description || 'Premium accessory from Masfeeh boutique collection.',
    features: parsedFeatures.length > 0 ? parsedFeatures : [
      'Premium high-grade construction',
      'Timeless elegance & authentic design',
      'Includes Masfeeh luxury packaging'
    ]
  });

  res.status(201).json(newProduct);
}));

app.put('/api/products/:id', auth.requireAdmin, upload.single('imageFile'), h(async (req, res) => {
  const existing = await store.getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const updates = { ...req.body };
  delete updates.imageUrl;
  if (updates.price) updates.price = Number(updates.price);
  if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (updates.features !== undefined) updates.features = parseFeatures(updates.features);
  if (typeof updates.images === 'string') {
    try { updates.images = JSON.parse(updates.images); } catch { delete updates.images; }
  }

  if (req.file) {
    updates.image = await store.uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
    updates.images = [updates.image, ...(existing.images || [])];
  } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
    updates.image = req.body.imageUrl.trim();
  }

  res.json(await store.updateProduct(req.params.id, updates));
}));

app.delete('/api/products/:id', auth.requireAdmin, h(async (req, res) => {
  const success = await store.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
}));

// ---------------- ORDERS ---------------- //

// All orders: admin only
app.get('/api/orders', auth.requireAdmin, h(async (req, res) => {
  let orders = await store.getOrders();
  const { status, search } = req.query;

  if (status && status !== 'All') {
    orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      (o.customer && (
        (o.customer.name || '').toLowerCase().includes(q) ||
        (o.customer.phone || '').includes(q) ||
        (o.customer.email || '').toLowerCase().includes(q)
      ))
    );
  }
  res.json(orders);
}));

// Single order lookup: public tracking by order ID or phone (redacted unless logged in)
app.get('/api/orders/:id', h(async (req, res) => {
  const order = await store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const user = await auth.getUserFromRequest(req).catch(() => null);
  const customer = user ? null : await auth.getCustomerFromRequest(req).catch(() => null);
  const isOwnOrder = customer && order.customerId === customer.id;
  res.json(user || isOwnOrder ? order : publicOrderView(order));
}));

// Price a cart (used by the bag and checkout so the shopper sees exactly what the server will charge)
app.post('/api/quote', h(async (req, res) => {
  const { items, city, coupon } = req.body || {};
  res.json(await pricing.quote({ items, city, coupon }));
}));

// Bangladeshi mobile numbers in one canonical form: 1XXXXXXXXX (accepts 01..., +8801..., 8801...)
function canonicalBdPhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('880')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^1[3-9]\d{8}$/.test(d) ? d : null;
}

// Best-effort throttle on order placement (in-memory, per server instance).
// - IP only from platform-set headers (never client-controlled X-Forwarded-For).
// - IP and phone limits live in separate maps so IP churn cannot evict phone limits.
// - When a map is full, expired entries are swept, then least-recently-used keys are dropped.
//   Never refuses everyone (a full map must not become a site-wide outage).
// - IPv6 addresses are grouped by /64 so one host cannot pose as millions of clients.
// - The phone slot is reserved synchronously before any await, and released if the order fails.
const ORDER_WINDOW_MS = 10 * 60 * 1000;
const MAX_KEYS = 20000;
const ipHits = new Map();
const phoneHits = new Map();

function clientIp(req) {
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown')
    .split(',')[0].trim().slice(0, 64).replace(/^::ffff:/, '');
  if (ip.includes(':')) {
    // IPv6: keep the /64 network prefix
    const parts = ip.split('::')[0].split(':');
    return `${parts.slice(0, 4).join(':')}::/64`;
  }
  return ip;
}
function live(map, key, now) {
  return (map.get(key) || []).filter(t => now - t < ORDER_WINDOW_MS);
}
// Store hits for key, keeping the map bounded (LRU order = Map insertion order)
function store_(map, key, hits, now) {
  map.delete(key);
  map.set(key, hits);
  if (map.size > MAX_KEYS) {
    for (const [k, times] of map) {
      if (!times.length || now - times[times.length - 1] >= ORDER_WINDOW_MS) map.delete(k);
      if (map.size <= MAX_KEYS) break;
    }
    while (map.size > MAX_KEYS) map.delete(map.keys().next().value);
  }
}
// Returns null when allowed (and reserves a phone slot), or an error message when limited.
function acquireOrderSlot(req) {
  const now = Date.now();
  const ipKey = clientIp(req);
  const ipRecent = live(ipHits, ipKey, now);
  if (ipRecent.length >= 5) {
    return { error: 'Too many orders from this connection. Please wait a few minutes or call us.' };
  }
  ipRecent.push(now);
  store_(ipHits, ipKey, ipRecent, now);

  const phone = canonicalBdPhone(req.body && req.body.customer && req.body.customer.phone);
  if (!phone) return { invalidPhone: true };
  const phoneRecent = live(phoneHits, phone, now);
  if (phoneRecent.length >= 3) {
    return { error: 'Several orders were just placed with this phone number. Please wait a few minutes or call us.' };
  }
  phoneRecent.push(now);
  store_(phoneHits, phone, phoneRecent, now);
  return { release: () => {
    const arr = phoneHits.get(phone) || [];
    const i = arr.indexOf(now);
    if (i >= 0) arr.splice(i, 1);
  } };
}

// Place order: guests or signed-in customers. Prices are computed here, never trusted from the browser.
app.post('/api/orders', h(async (req, res) => {
  const slot = acquireOrderSlot(req);
  if (slot.error) return res.status(429).json({ error: slot.error });
  if (slot.invalidPhone) return res.status(400).json({ error: 'Please enter a valid Bangladeshi mobile number (01XXXXXXXXX).' });
  let placed = false;
  try {
  const { customer, items, coupon, paymentMethod, trxId } = req.body || {};

  const invalid = validateOrderInput(req.body);
  if (invalid) return res.status(400).json({ error: invalid });

  const q = await pricing.quote({ items, city: customer.city, coupon });
  if (q.items.length === 0) {
    return res.status(400).json({ error: 'Your bag is empty or the items are no longer available.' });
  }
  if (q.problems.length > 0) {
    const p = q.problems[0];
    return res.status(409).json({
      error: p.reason === 'stock'
        ? `Only ${p.available} of "${p.name}" left. Please update your bag.`
        : 'Some items in your bag are no longer available. Please review your bag.',
      quote: q
    });
  }
  if (coupon && q.couponError) return res.status(400).json({ error: `Coupon: ${q.couponError}` });

  const method = paymentMethod === 'Mobile Banking'
    ? `Mobile Banking (bKash/Nagad)${trxId ? ` · TrxID ${String(trxId).trim().slice(0, 40)}` : ' · TrxID pending'}`
    : 'Cash on Delivery';

  const account = await auth.getCustomerFromRequest(req).catch(() => null);
  const stockItems = q.items.map(i => ({ id: i.id, quantity: i.quantity }));

  try {
    await store.reserveStock(stockItems);
  } catch (err) {
    if (err.outOfStockId) {
      return res.status(409).json({ error: 'An item in your bag just sold out. Please review your bag.' });
    }
    throw err;
  }

  let newOrder;
  try {
    newOrder = await store.addOrder({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: (customer.email || (account && account.email) || '').trim(),
        address: customer.address.trim(),
        city: q.area,
        notes: (customer.notes || '').trim()
      },
      items: q.items.map(({ id, name, price, quantity, image }) => ({ id, name, price, quantity, image })),
      subtotal: q.subtotal,
      shipping: q.shipping,
      discount: q.discount,
      total: q.total,
      paymentMethod: method,
      // Never trust the shopper: mobile payments stay unverified until staff confirm the TrxID
      paymentStatus: paymentMethod === 'Mobile Banking' ? 'Awaiting verification' : 'Pending (COD)',
      customerId: account ? account.id : null
    });
  } catch (err) {
    await store.releaseStock(stockItems).catch(e => console.error('Stock release failed:', e));
    throw err;
  }

  // Signed-in shoppers: remember their delivery details and empty their saved bag
  if (account) {
    await store.updateCustomer(account.id, {
      phone: newOrder.customer.phone,
      address: newOrder.customer.address,
      city: newOrder.customer.city,
      cart: []
    }).catch(e => console.error('Profile update after order failed:', e));
  }

  // Await emails: serverless functions may be frozen once the response is sent.
  // Failures are logged but never fail the order.
  const emailJobs = [emailService.sendNewOrderAlertToOwner(newOrder)];
  if (newOrder.customer.email) emailJobs.push(emailService.sendOrderConfirmationToCustomer(newOrder));
  const results = await Promise.allSettled(emailJobs);
  results.filter(r => r.status === 'rejected').forEach(r => console.error('Order email failed:', r.reason));

  placed = true;
  res.status(201).json({ success: true, order: newOrder });
  } finally {
    if (!placed) slot.release(); // failed or rejected orders don't use up the phone's allowance
  }
}));

app.patch('/api/orders/:id/status', auth.requireAdmin, h(async (req, res) => {
  const { status, note, courier } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const before = await store.getOrderById(req.params.id);
  if (!before) return res.status(404).json({ error: 'Order not found' });
  const order = await store.updateOrderStatus(before.id, status, note, courier);

  // Put stock back when an order is cancelled (and take it again if it is revived)
  const wasCancelled = before.status === 'Cancelled';
  const isCancelled = status === 'Cancelled';
  const stockItems = (order.items || []).map(i => ({ id: i.id, quantity: Number(i.quantity) || 0 }))
    .filter(i => i.quantity > 0);
  if (!wasCancelled && isCancelled) {
    await store.releaseStock(stockItems).catch(e => console.error('Restock failed:', e));
  } else if (wasCancelled && !isCancelled) {
    await store.reserveStock(stockItems).catch(e => console.error('Re-reserve failed:', e));
  }

  if (['accepted', 'accept'].includes(status.toLowerCase()) && order.customer && order.customer.email) {
    await emailService.sendOrderAcceptedNotificationToCustomer(order)
      .catch(err => console.error('Failed to send order accepted email:', err));
  }

  res.json({
    success: true,
    order,
    message: `Order status updated to "${status}". Customer notification dispatched!`
  });
}));

// ---------------- EMAILS & SETTINGS ---------------- //

app.get('/api/emails', auth.requireAdmin, h(async (req, res) => {
  res.json(await store.getEmails());
}));

// Public storefront info for everyone; full settings (SMTP etc.) only for logged-in admins
app.get('/api/settings', h(async (req, res) => {
  const settings = await store.getSettings();
  const user = await auth.getUserFromRequest(req).catch(() => null);
  if (!user) {
    const publicSettings = {};
    PUBLIC_SETTING_KEYS.forEach(k => { publicSettings[k] = settings[k]; });
    return res.json(publicSettings);
  }
  res.json({
    ...settings,
    smtpPassConfigured: Boolean(settings.smtpPass),
    smtpPass: settings.smtpPass ? '********' : ''
  });
}));

app.put('/api/settings', auth.requireAdmin, h(async (req, res) => {
  const updates = { ...req.body };
  delete updates.smtpPassConfigured;
  if (updates.smtpPass === '********') delete updates.smtpPass; // don't overwrite with the mask
  const updated = await store.updateSettings(updates);
  res.json({ ...updated, smtpPassConfigured: Boolean(updated.smtpPass), smtpPass: updated.smtpPass ? '********' : '' });
}));

app.post('/api/settings/test-email', auth.requireAdmin, h(async (req, res) => {
  try {
    res.json(await emailService.testSmtp(req.body.targetEmail));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

app.get('/api/stats', auth.requireAdmin, h(async (req, res) => {
  const [orders, products] = await Promise.all([store.getOrders(), store.getProducts()]);
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  res.json({
    totalSales,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    acceptedOrders: orders.filter(o => o.status === 'Accepted').length,
    deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
    totalProducts: products.length,
    outOfStockCount: products.filter(p => p.stock <= 0).length
  });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// SPA fallback for local production runs
if (!process.env.VERCEL && fs.existsSync(clientDist)) {
  app.use((req, res, next) => {
    if (req.method === 'GET') return res.sendFile(path.join(clientDist, 'index.html'));
    next();
  });
}

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(`[${req.method} ${req.path}]`, err);
  const status = err instanceof multer.MulterError ? 400 : 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌸 Masfeeh Server running on port ${PORT}`);
  });
}

module.exports = app;
