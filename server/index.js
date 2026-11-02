require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const store = require('./data/store');
const emailService = require('./services/emailService');
const supabaseService = require('./services/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads configuration
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `item-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Serve static directories
app.use('/uploads', express.static(uploadDir));
app.use('/assets', express.static(path.join(__dirname, '../client/public/assets')));

// Serve built frontend if available
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'Masfeeh', timestamp: new Date().toISOString() });
});

// Supabase status check
app.get('/api/supabase/status', async (req, res) => {
  res.json({
    configured: supabaseService.isConfigured(),
    urlConfigured: Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project')),
    message: supabaseService.isConfigured() 
      ? 'Supabase is connected and ready!' 
      : 'Supabase credentials not configured in .env (Using high-speed local store)'
  });
});

// ---------------- PRODUCTS APIS ---------------- //

// GET all products
app.get('/api/products', (req, res) => {
  try {
    let products = store.getProducts();
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST add new item (Supports file upload or image URL)
app.post('/api/products', upload.single('imageFile'), (req, res) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      stock,
      badge,
      description,
      features,
      imageUrl
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    let finalImageUrl = '/assets/bag_fiom.jpg';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl && imageUrl.trim()) {
      finalImageUrl = imageUrl.trim();
    }

    let parsedFeatures = [];
    if (features) {
      if (Array.isArray(features)) {
        parsedFeatures = features;
      } else {
        try {
          parsedFeatures = JSON.parse(features);
        } catch {
          parsedFeatures = features.split('\n').map(s => s.trim()).filter(Boolean);
        }
      }
    }

    const newProduct = store.addProduct({
      name,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: stock !== undefined ? Number(stock) : 10,
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
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
app.put('/api/products/:id', upload.single('imageFile'), (req, res) => {
  try {
    const id = req.params.id;
    const existing = store.getProductById(id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
      updates.images = [updates.image, ...(existing.images || [])];
    }

    if (updates.features && typeof updates.features === 'string') {
      try {
        updates.features = JSON.parse(updates.features);
      } catch {
        updates.features = updates.features.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    const updated = store.updateProduct(id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const success = store.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
});

// ---------------- ORDERS APIS ---------------- //

// GET all orders
app.get('/api/orders', (req, res) => {
  let orders = store.getOrders();
  const { status, search } = req.query;

  if (status && status !== 'All') {
    orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      (o.customer && (
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.email.toLowerCase().includes(q)
      ))
    );
  }

  res.json(orders);
});

// GET single order / track
app.get('/api/orders/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// POST place order (Triggers Owner Email & Customer Confirmation!)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, subtotal, shipping, discount, total, paymentMethod } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ error: 'Customer name, phone, and address are required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least 1 item' });
    }

    const newOrder = store.addOrder({
      customer,
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping || 70),
      discount: Number(discount || 0),
      total: Number(total),
      paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    // 1. Email notification to OWNER
    emailService.sendNewOrderAlertToOwner(newOrder).catch(err => {
      console.error('Failed to send new order alert to owner:', err);
    });

    // 2. Email confirmation to CUSTOMER
    if (customer.email) {
      emailService.sendOrderConfirmationToCustomer(newOrder).catch(err => {
        console.error('Failed to send order confirmation to customer:', err);
      });
    }

    // 3. Sync to Supabase if configured
    if (supabaseService.isConfigured()) {
      supabaseService.addOrder(newOrder).catch(err => {
        console.error('Failed to sync order to Supabase:', err);
      });
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully! Owner has been alerted via email.'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH update order status (e.g. ACCEPT order -> notifies customer!)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, courier } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const order = store.updateOrderStatus(id, status, note, courier);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // KEY REQUIREMENT: "every accept order is give notification to user/customer"
    if (status.toLowerCase() === 'accepted' || status.toLowerCase() === 'accept') {
      if (order.customer && order.customer.email) {
        emailService.sendOrderAcceptedNotificationToCustomer(order).catch(err => {
          console.error('Failed to send order accepted email:', err);
        });
      }
    }

    res.json({
      success: true,
      order,
      message: `Order status updated to "${status}". Customer notification dispatched!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- EMAILS & SETTINGS APIS ---------------- //

// GET email log
app.get('/api/emails', (req, res) => {
  res.json(store.getEmails());
});

// GET settings
app.get('/api/settings', (req, res) => {
  const settings = store.getSettings();
  // Don't expose password directly, return masked
  const safeSettings = {
    ...settings,
    smtpPassConfigured: Boolean(settings.smtpPass),
    smtpPass: settings.smtpPass ? '********' : ''
  };
  res.json(safeSettings);
});

// PUT settings
app.put('/api/settings', (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.smtpPass === '********') {
      delete updates.smtpPass; // Don't overwrite with mask
    }
    const updated = store.updateSettings(updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST test email
app.post('/api/settings/test-email', async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const result = await emailService.testSmtp(targetEmail);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET stats
app.get('/api/stats', (req, res) => {
  const orders = store.getOrders();
  const products = store.getProducts();

  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const acceptedOrders = orders.filter(o => o.status === 'Accepted').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  res.json({
    totalSales,
    totalOrders: orders.length,
    pendingOrders,
    acceptedOrders,
    deliveredOrders,
    totalProducts: products.length,
    outOfStockCount: products.filter(p => p.stock <= 0).length
  });
});

// SPA Fallback for production
if (fs.existsSync(clientDist)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/assets')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`🌸 Masfeeh Server running on port ${PORT}`);
  console.log(`📍 Owner Email configured: ${store.getSettings().ownerEmail}`);
});
