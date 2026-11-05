const API_BASE = '/api';

// Two independent sessions: shop staff (admin dashboard) and shoppers (optional account)
function tokenStore(key) {
  return {
    get: () => { try { return localStorage.getItem(key); } catch { return null; } },
    set: token => { try { localStorage.setItem(key, token); } catch { /* private mode */ } },
    clear: () => { try { localStorage.removeItem(key); } catch { /* private mode */ } }
  };
}

const adminToken = tokenStore('masfeeh_admin_token');
const customerToken = tokenStore('masfeeh_customer_token');

export const auth = {
  getToken: adminToken.get,
  setToken: adminToken.set,
  clear: adminToken.clear,
  onUnauthorized: () => {} // set by App: admin session expired
};

export const customerAuth = {
  getToken: customerToken.get,
  setToken: customerToken.set,
  clear: customerToken.clear,
  onUnauthorized: () => {} // set by App: shopper session expired
};

async function request(path, { method = 'GET', body, json, fallbackError } = {}) {
  const headers = {};
  const admin = adminToken.get();
  const customer = customerToken.get();
  if (admin) headers.Authorization = `Bearer ${admin}`;
  if (customer) headers['X-Customer-Token'] = customer;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body });
  } catch {
    throw new Error('Connection problem. Please check your internet and try again.');
  }
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    if (path.startsWith('/account') && customer && !path.endsWith('/login')) {
      customerToken.clear();
      customerAuth.onUnauthorized();
    } else if (admin && !path.startsWith('/account') && !path.startsWith('/auth/login')) {
      adminToken.clear();
      auth.onUnauthorized();
    }
  }
  if (!res.ok) {
    const err = new Error(data.error || fallbackError || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const qs = params => {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : '';
};

export const api = {
  // Staff auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', json: { email, password }, fallbackError: 'Login failed' }),
  me: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', json: { currentPassword, newPassword } }),

  // Shopper accounts
  signup: data => request('/account/signup', { method: 'POST', json: data, fallbackError: 'Could not create account' }),
  accountLogin: (email, password) =>
    request('/account/login', { method: 'POST', json: { email, password }, fallbackError: 'Sign in failed' }),
  getAccount: () => request('/account'),
  updateAccount: data => request('/account', { method: 'PUT', json: data, fallbackError: 'Could not save your details' }),
  saveCart: cart => request('/account/cart', { method: 'PUT', json: { cart } }),
  getMyOrders: () => request('/account/orders', { fallbackError: 'Could not load your orders' }),
  changeAccountPassword: (currentPassword, newPassword) =>
    request('/account/change-password', { method: 'POST', json: { currentPassword, newPassword } }),

  // Pricing (server is the source of truth for totals)
  quote: ({ items, city, coupon }) =>
    request('/quote', { method: 'POST', json: { items, city, coupon } }),

  // Products
  getProducts: (params = {}) => request(`/products${qs(params)}`, { fallbackError: 'Failed to fetch products' }),
  getProduct: id => request(`/products/${encodeURIComponent(id)}`, { fallbackError: 'Failed to fetch product' }),
  addProduct: formData => request('/products', { method: 'POST', body: formData, fallbackError: 'Failed to add product' }),
  updateProduct: (id, formData) =>
    request(`/products/${encodeURIComponent(id)}`, { method: 'PUT', body: formData, fallbackError: 'Failed to update product' }),
  deleteProduct: id =>
    request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE', fallbackError: 'Failed to delete product' }),

  // Orders
  getOrders: (params = {}) => request(`/orders${qs(params)}`, { fallbackError: 'Failed to fetch orders' }),
  getOrder: id => request(`/orders/${encodeURIComponent(id)}`, { fallbackError: 'Order not found' }),
  createOrder: orderData =>
    request('/orders', { method: 'POST', json: orderData, fallbackError: 'Could not place your order' }),
  updateOrderStatus: (id, status, note, courier, trackingCode, notify = true) =>
    request(`/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH', json: { status, note, courier, trackingCode, notify },
      fallbackError: 'Failed to update order status'
    }),

  // Emails & Settings
  getEmails: () => request('/emails', { fallbackError: 'Failed to fetch emails' }),
  getSettings: () => request('/settings', { fallbackError: 'Failed to fetch settings' }),
  updateSettings: settings =>
    request('/settings', { method: 'PUT', json: settings, fallbackError: 'Failed to update settings' }),
  testSmtp: targetEmail =>
    request('/settings/test-email', { method: 'POST', json: { targetEmail }, fallbackError: 'SMTP test failed' }),

  // Stats
  getStats: () => request('/stats', { fallbackError: 'Failed to fetch stats' })
};
