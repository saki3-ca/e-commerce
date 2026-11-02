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
  'shippingDhaka', 'shippingOutsideDhaka', 'facebookUrl', 'instagramUrl'
];

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
  if (customer.email && !/^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-zA-Z]{2,}$/.test(customer.email)) {
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
  res.json(user ? order : publicOrderView(order));
}));

// Place order: public
app.post('/api/orders', h(async (req, res) => {
  const { customer, items, subtotal, shipping, discount, total, paymentMethod } = req.body;

  const invalid = validateOrderInput(req.body);
  if (invalid) return res.status(400).json({ error: invalid });

  const newOrder = await store.addOrder({
    customer,
    items,
    subtotal: Number(subtotal),
    shipping: Number(shipping || 70),
    discount: Number(discount || 0),
    total: Number(total),
    paymentMethod: paymentMethod || 'Cash on Delivery'
  });

  // Await emails: serverless functions may be frozen once the response is sent.
  // Failures are logged but never fail the order.
  const emailJobs = [emailService.sendNewOrderAlertToOwner(newOrder)];
  if (customer.email) emailJobs.push(emailService.sendOrderConfirmationToCustomer(newOrder));
  const results = await Promise.allSettled(emailJobs);
  results.filter(r => r.status === 'rejected').forEach(r => console.error('Order email failed:', r.reason));

  res.status(201).json({
    success: true,
    order: newOrder, // the customer who just ordered sees their own full details
    message: 'Order placed successfully! Owner has been alerted via email.'
  });
}));

app.patch('/api/orders/:id/status', auth.requireAdmin, h(async (req, res) => {
  const { status, note, courier } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const order = await store.updateOrderStatus(req.params.id, status, note, courier);
  if (!order) return res.status(404).json({ error: 'Order not found' });

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
