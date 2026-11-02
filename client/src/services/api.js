const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async addProduct(formData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      body: formData // can be FormData for file upload
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add product' }));
      throw new Error(err.error || 'Failed to add product');
    }
    return res.json();
  },

  async updateProduct(id, formData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update product' }));
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create order' }));
      throw new Error(err.error || 'Failed to create order');
    }
    return res.json();
  },

  async updateOrderStatus(id, status, note, courier) {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, courier })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Emails & Settings
  async getEmails() {
    const res = await fetch(`${API_BASE}/emails`);
    if (!res.ok) throw new Error('Failed to fetch emails');
    return res.json();
  },

  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async testSmtp(targetEmail) {
    const res = await fetch(`${API_BASE}/settings/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetEmail })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'SMTP test failed');
    return data;
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
