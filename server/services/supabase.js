const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
  constructor() {
    this.client = null;
    this.init();
  }

  init() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (url && key && url.startsWith('http') && !url.includes('your-project')) {
      try {
        this.client = createClient(url, key);
        console.log('⚡ Supabase Client initialized successfully!');
      } catch (err) {
        console.warn('⚠️ Could not initialize Supabase:', err.message);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  isConfigured() {
    return Boolean(this.client);
  }

  // Fetch all products from Supabase
  async getProducts() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products from Supabase:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Supabase getProducts exception:', err);
      return null;
    }
  }

  // Insert product to Supabase
  async addProduct(product) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('products')
        .insert([{
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          original_price: product.originalPrice,
          stock: product.stock,
          badge: product.badge,
          image: product.image,
          images: product.images,
          description: product.description,
          features: product.features,
          created_at: product.createdAt || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding product to Supabase:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Supabase addProduct exception:', err);
      return null;
    }
  }

  // Fetch orders from Supabase
  async getOrders() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders from Supabase:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Supabase getOrders exception:', err);
      return null;
    }
  }

  // Insert order to Supabase
  async addOrder(order) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('orders')
        .insert([{
          id: order.id,
          customer: order.customer,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          status: order.status,
          tracking_code: order.trackingCode,
          courier: order.courier,
          timeline: order.timeline,
          created_at: order.createdAt || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting order into Supabase:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Supabase addOrder exception:', err);
      return null;
    }
  }

  // Update order status in Supabase
  async updateOrderStatus(id, status, timeline) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('orders')
        .update({
          status,
          timeline
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating order in Supabase:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Supabase updateOrderStatus exception:', err);
      return null;
    }
  }

  // Test connection
  async testConnection() {
    if (!this.client) {
      throw new Error('Supabase URL or Key not set in environment.');
    }
    const { data, error } = await this.client.from('products').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { success: true, message: 'Supabase connection verified successfully!' };
  }
}

module.exports = new SupabaseService();
