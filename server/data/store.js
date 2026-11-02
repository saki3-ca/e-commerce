// Supabase-backed data store. All methods are async.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-side secret key).
const { createClient } = require('@supabase/supabase-js');
const DEFAULTS = require('./defaults');

const IMAGE_BUCKET = 'product-images';

function getClient() {
  if (getClient.client) return getClient.client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Database not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  getClient.client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return getClient.client;
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

const num = v => (v === null || v === undefined ? v : Number(v));

// ---- row <-> object mapping (DB uses snake_case, API uses camelCase) ----
function productFromRow(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    price: num(r.price),
    originalPrice: num(r.original_price),
    stock: r.stock,
    badge: r.badge,
    image: r.image,
    images: r.images || [],
    description: r.description,
    features: r.features || [],
    createdAt: r.created_at
  };
}

function productToRow(p) {
  const map = {
    id: 'id', name: 'name', category: 'category', price: 'price',
    originalPrice: 'original_price', stock: 'stock', badge: 'badge',
    image: 'image', images: 'images', description: 'description',
    features: 'features', createdAt: 'created_at'
  };
  const row = {};
  for (const [k, col] of Object.entries(map)) {
    if (p[k] !== undefined) row[col] = p[k];
  }
  return row;
}

function orderFromRow(r) {
  return {
    id: r.id,
    customer: r.customer,
    items: r.items,
    subtotal: num(r.subtotal),
    shipping: num(r.shipping),
    discount: num(r.discount),
    total: num(r.total),
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    status: r.status,
    trackingCode: r.tracking_code,
    courier: r.courier,
    timeline: r.timeline || [],
    createdAt: r.created_at
  };
}

function orderToRow(o) {
  return {
    id: o.id,
    customer: o.customer,
    items: o.items,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount,
    total: o.total,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    status: o.status,
    tracking_code: o.trackingCode,
    courier: o.courier,
    timeline: o.timeline,
    created_at: o.createdAt
  };
}

class Store {
  get db() {
    return getClient();
  }

  // ---------------- Products ----------------
  async getProducts() {
    const rows = check(await this.db.from('products').select('*').order('created_at', { ascending: false }));
    return rows.map(productFromRow);
  }

  async getProductById(id) {
    const row = check(await this.db.from('products').select('*').eq('id', id).maybeSingle());
    return row ? productFromRow(row) : null;
  }

  async addProduct(product) {
    const row = productToRow({
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...product
    });
    return productFromRow(check(await this.db.from('products').insert(row).select().single()));
  }

  async updateProduct(id, updates) {
    const row = productToRow(updates);
    delete row.id;
    delete row.created_at;
    const data = check(await this.db.from('products').update(row).eq('id', id).select().maybeSingle());
    return data ? productFromRow(data) : null;
  }

  async deleteProduct(id) {
    const data = check(await this.db.from('products').delete().eq('id', id).select('id'));
    return data.length > 0;
  }

  // Upload an image buffer to Supabase Storage; returns its public URL
  async uploadImage(buffer, originalName, contentType) {
    const ext = (originalName.match(/\.[a-zA-Z0-9]+$/) || ['.jpg'])[0].toLowerCase();
    const path = `item-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    check(await this.db.storage.from(IMAGE_BUCKET).upload(path, buffer, { contentType, upsert: false }));
    return this.db.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // ---------------- Orders ----------------
  async getOrders() {
    const rows = check(await this.db.from('orders').select('*').order('created_at', { ascending: false }));
    return rows.map(orderFromRow);
  }

  // Track by order id (case-insensitive) or customer phone number
  async getOrderById(id) {
    const key = String(id).trim();
    let row = check(await this.db.from('orders').select('*').ilike('id', key.replace(/[%_]/g, '')).maybeSingle());
    if (!row) {
      const rows = check(await this.db.from('orders').select('*')
        .eq('customer->>phone', key).order('created_at', { ascending: false }).limit(1));
      row = rows[0];
    }
    return row ? orderFromRow(row) : null;
  }

  async addOrder(order) {
    const now = new Date().toISOString();
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = Math.floor(10000 + Math.random() * 90000);
      const newOrder = {
        id: `MSF-${orderNumber}`,
        createdAt: now,
        status: 'Pending',
        paymentStatus: order.paymentMethod === 'Cash on Delivery' ? 'Pending (COD)' : 'Paid / Verified',
        trackingCode: `TRK-${orderNumber}`,
        courier: 'Pathao / Steadfast Express',
        timeline: [{ status: 'Order Placed', timestamp: now, note: 'Order placed by customer via Masfeeh online shop.' }],
        ...order
      };
      const res = await this.db.from('orders').insert(orderToRow(newOrder)).select().single();
      if (!res.error) return orderFromRow(res.data);
      if (res.error.code !== '23505') throw new Error(res.error.message); // retry only on duplicate id
    }
    throw new Error('Could not allocate a unique order number, please retry.');
  }

  async updateOrderStatus(id, newStatus, note, courier) {
    const order = await this.getOrderById(id);
    if (!order) return null;
    const timeline = [...(order.timeline || []), {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}`
    }];
    const patch = { status: newStatus, timeline };
    if (courier) patch.courier = courier;
    return orderFromRow(check(await this.db.from('orders').update(patch).eq('id', order.id).select().single()));
  }

  // ---------------- Settings ----------------
  async getSettings() {
    const row = check(await this.db.from('settings').select('data').eq('id', 1).maybeSingle());
    return { ...DEFAULTS.settings, ...(row ? row.data : {}) };
  }

  async updateSettings(updates) {
    const merged = { ...(await this.getSettings()), ...updates };
    check(await this.db.from('settings').upsert({ id: 1, data: merged, updated_at: new Date().toISOString() }));
    return merged;
  }

  // ---------------- Email log ----------------
  async getEmails() {
    const rows = check(await this.db.from('email_logs').select('id, created_at, data')
      .order('created_at', { ascending: false }).limit(100));
    return rows.map(r => ({ id: r.id, timestamp: r.created_at, ...r.data }));
  }

  async addEmailLog(emailRecord) {
    const record = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...emailRecord
    };
    const { id, timestamp, ...data } = record;
    check(await this.db.from('email_logs').insert({ id, created_at: timestamp, data }));
    return record;
  }

  // ---------------- Admin users ----------------
  async getAdminByEmail(email) {
    return check(await this.db.from('admin_users').select('*')
      .eq('email', String(email).trim().toLowerCase()).maybeSingle());
  }

  async getAdminById(id) {
    return check(await this.db.from('admin_users').select('id, email, name, role').eq('id', id).maybeSingle());
  }

  async updateAdminPassword(id, passwordHash) {
    check(await this.db.from('admin_users').update({ password_hash: passwordHash }).eq('id', id));
  }
}

module.exports = new Store();
module.exports.productToRow = productToRow;
