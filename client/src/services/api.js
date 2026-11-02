const API_BASE = '/api';
const TOKEN_KEY = 'masfeeh_admin_token';

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: token => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  // Called when the server rejects the session (expired / logged out elsewhere)
  onUnauthorized: () => {}
};

async function request(path, { method = 'GET', body, json, fallbackError } = {}) {
  const headers = {};
  const token = auth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token && !path.startsWith('/auth/login')) {
    auth.clear();
    auth.onUnauthorized();
  }
  if (!res.ok) throw new Error(data.error || fallbackError || 'Request failed');
  return data;
}

const qs = params => {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : '';
};

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', json: { email, password }, fallbackError: 'Login failed' }),
  me: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', json: { currentPassword, newPassword } }),

  // Products
  getProducts: (params = {}) => request(`/products${qs(params)}`, { fallbackError: 'Failed to fetch products' }),
  getProduct: id => request(`/products/${id}`, { fallbackError: 'Failed to fetch product' }),
  addProduct: formData => request('/products', { method: 'POST', body: formData, fallbackError: 'Failed to add product' }),
  updateProduct: (id, formData) =>
    request(`/products/${id}`, { method: 'PUT', body: formData, fallbackError: 'Failed to update product' }),
  deleteProduct: id => request(`/products/${id}`, { method: 'DELETE', fallbackError: 'Failed to delete product' }),

  // Orders
  getOrders: (params = {}) => request(`/orders${qs(params)}`, { fallbackError: 'Failed to fetch orders' }),
  getOrder: id => request(`/orders/${encodeURIComponent(id)}`, { fallbackError: 'Order not found' }),
  createOrder: orderData =>
    request('/orders', { method: 'POST', json: orderData, fallbackError: 'Failed to create order' }),
  updateOrderStatus: (id, status, note, courier) =>
    request(`/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH', json: { status, note, courier }, fallbackError: 'Failed to update order status'
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
