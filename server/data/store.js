const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const INITIAL_DATA = {
  settings: {
    shopName: 'Masfeeh',
    tagline: 'Accessorize Your World',
    slogan: 'Little Things... Big Happiness ♡',
    ownerEmail: 'maishamonsura@gmail.com',
    ownerPhone: '01303-662891',
    address: 'Bashundhara R/A, Dhaka, Bangladesh',
    currency: '৳',
    shippingDhaka: 70,
    shippingOutsideDhaka: 130,
    facebookUrl: 'https://www.facebook.com/profile.php?id=61596179578624',
    instagramUrl: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
    senderName: 'Masfeeh Online Shop'
  },
  products: [
    {
      id: 'prod-1',
      name: 'Premium Crossbody Bag - FIOM Monogram',
      category: 'Bags',
      price: 1850,
      originalPrice: 2350,
      stock: 15,
      badge: 'Bestseller',
      image: '/assets/bag_fiom.jpg',
      images: ['/assets/bag_fiom.jpg', '/assets/bag_main.jpg'],
      description: 'Premium Cross body bag with both long and short belt. Features our signature FIOM monogram textured finish, high-grade gold-tone hardware, and versatile styling.',
      features: [
        'Includes 2 detachable straps (Adjustable Long Shoulder Strap + Chic Short Hand Belt)',
        'Dual smooth glide gold zipper compartments',
        'High-density scratch resistant vegan leather',
        'Dimensions: 21cm x 13cm x 8cm'
      ],
      createdAt: '2026-11-01T10:00:00.000Z'
    },
    {
      id: 'prod-2',
      name: 'Signature Floral Clover Monogram Crossbody',
      category: 'Bags',
      price: 1950,
      originalPrice: 2450,
      stock: 12,
      badge: 'New Arrival',
      image: '/assets/bag_clover.jpg',
      images: ['/assets/bag_clover.jpg', '/assets/bag_grid.jpg'],
      description: 'Elegant monogram floral clover pattern with luxury champagne gold accents. Comes with dual belts for shoulder or handbag wear.',
      features: [
        'Comes with both long crossbody belt and short handle belt',
        'Reinforced structured corners for timeless durability',
        'Interior slip pocket and zip partition',
        'Dimensions: 22cm x 14cm x 8cm'
      ],
      createdAt: '2026-11-01T11:00:00.000Z'
    },
    {
      id: 'prod-3',
      name: 'Timeless Chocolate Ribbed Leather Crossbody',
      category: 'Bags',
      price: 1750,
      originalPrice: 2150,
      stock: 18,
      badge: 'Trending',
      image: '/assets/bag_brown_solid.jpg',
      images: ['/assets/bag_brown_solid.jpg'],
      description: 'Rich chocolate brown minimal crossbody bag with ribbed edge trim and golden hardware. Pairs effortlessly with both ethnic and western attire.',
      features: [
        'Includes long crossbody belt and wrist/handlet strap',
        'Water-resistant textured PU leather',
        'Golden pull tabs and magnetic snap closure'
      ],
      createdAt: '2026-11-01T12:00:00.000Z'
    },
    {
      id: 'prod-4',
      name: 'Royal Monogram Golden Crest Crossbody',
      category: 'Bags',
      price: 1890,
      originalPrice: 2390,
      stock: 10,
      badge: 'Featured',
      image: '/assets/bag_monogram_gold.jpg',
      images: ['/assets/bag_monogram_gold.jpg'],
      description: 'Exclusive golden deer emblem on monogram leather. Comes with long adjustable belt and short hand strap for modern versatility.',
      features: [
        'Dual strap set included (long belt + short strap)',
        'Golden metallic deer logo plaque',
        'Multiple compartments with luxury lining'
      ],
      createdAt: '2026-11-01T13:00:00.000Z'
    },
    {
      id: 'prod-5',
      name: 'Dainty Pearl & Crystal Hair Bow Set',
      category: 'Hair Accessories',
      price: 450,
      originalPrice: 650,
      stock: 25,
      badge: 'Popular',
      image: '/assets/photo_grid_0_0.jpg',
      images: ['/assets/photo_grid_0_0.jpg'],
      description: 'Intricately handcrafted pearl and crystal embellished hair clips and bow set. High-grip teeth that stay secure without pulling.',
      features: [
        'Hypoallergenic metal clip',
        'Hand-strung faux freshwater pearls',
        'Set includes 3 matching luxury hair accents'
      ],
      createdAt: '2026-11-01T14:00:00.000Z'
    },
    {
      id: 'prod-6',
      name: 'Velvet Rose Gold Royal Bangles Collection',
      category: 'Bangles & More',
      price: 1250,
      originalPrice: 1650,
      stock: 8,
      badge: 'Bestseller',
      image: '/assets/brand_artwork.jpg',
      images: ['/assets/brand_artwork.jpg'],
      description: 'Traditional royal craftsmanship with soft velvet texture, golden thread work, and glistening stones. Perfect for festivals, parties, and weddings.',
      features: [
        'Set of 24 pieces (12 per hand)',
        'Sizes available: 2.4, 2.6, 2.8',
        'Non-tarnish golden alloy and velvet finish'
      ],
      createdAt: '2026-11-01T15:00:00.000Z'
    },
    {
      id: 'prod-7',
      name: 'Salon Gel French Ombre Luxury Press-on Nails',
      category: 'Fake Nails',
      price: 520,
      originalPrice: 750,
      stock: 30,
      badge: 'Trending',
      image: '/assets/photo_grid_1_1.jpg',
      images: ['/assets/photo_grid_1_1.jpg'],
      description: 'High-gloss salon finish medium almond press-on nails. Reusable up to 5 times with gentle removal.',
      features: [
        '24 nails in 12 universal sizes',
        'Includes nail glue, adhesive jelly tabs, mini file & cuticle stick',
        'Wear time: 2-3 weeks with glue, 3-5 days with tabs'
      ],
      createdAt: '2026-11-01T16:00:00.000Z'
    },
    {
      id: 'prod-8',
      name: '18K Gold Plated Stackable Zirconia Rings (Set of 5)',
      category: 'Rings',
      price: 680,
      originalPrice: 950,
      stock: 20,
      badge: 'New',
      image: '/assets/photo_grid_2_1.jpg',
      images: ['/assets/photo_grid_2_1.jpg'],
      description: 'Minimalist dainty gold ring stack with micro-pave zirconia stones. Adjustable open band design fits most finger sizes.',
      features: [
        '18K gold electroplating for lasting luster',
        'Hypoallergenic & nickel-free',
        'Mix and match stacking styles'
      ],
      createdAt: '2026-11-01T17:00:00.000Z'
    }
  ],
  orders: [
    {
      id: 'MSF-10021',
      customer: {
        name: 'Sadia Rahman',
        email: 'sadia.rahman.test@gmail.com',
        phone: '01712-345678',
        address: 'House 14, Road 5, Block B, Bashundhara R/A',
        city: 'Inside Dhaka',
        notes: 'Please call before delivery'
      },
      items: [
        {
          id: 'prod-1',
          name: 'Premium Crossbody Bag - FIOM Monogram',
          price: 1850,
          quantity: 1,
          image: '/assets/bag_fiom.jpg'
        }
      ],
      subtotal: 1850,
      shipping: 70,
      discount: 0,
      total: 1920,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      status: 'Pending', // Pending, Accepted, Packaging, Out for Delivery, Delivered, Cancelled
      trackingCode: 'MSF-TRK-771',
      courier: 'Steadfast Courier',
      timeline: [
        {
          status: 'Order Placed',
          timestamp: '2026-11-02T18:30:00.000Z',
          note: 'Order successfully received from customer'
        }
      ],
      createdAt: '2026-11-02T18:30:00.000Z'
    }
  ],
  emails: []
};

class Store {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all top-level keys exist
        this.data.settings = { ...INITIAL_DATA.settings, ...(this.data.settings || {}) };
        this.data.products = this.data.products || INITIAL_DATA.products;
        this.data.orders = this.data.orders || INITIAL_DATA.orders;
        this.data.emails = this.data.emails || [];
      } else {
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB, resetting to defaults:', err);
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB:', err);
    }
  }

  // Products
  getProducts() {
    return this.data.products;
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(product) {
    const newProduct = {
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...product
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  // Orders
  getOrders() {
    return this.data.orders;
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id.toLowerCase() === id.toLowerCase() || (o.customer && o.customer.phone === id));
  }

  addOrder(order) {
    const orderNumber = Math.floor(10000 + Math.random() * 90000);
    const newOrder = {
      id: `MSF-${orderNumber}`,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      paymentStatus: order.paymentMethod === 'Cash on Delivery' ? 'Pending (COD)' : 'Paid / Verified',
      trackingCode: `TRK-${orderNumber}`,
      courier: 'Pathao / Steadfast Express',
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer via Masfeeh online shop.'
        }
      ],
      ...order
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id, newStatus, note, courier) {
    const order = this.data.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return null;

    order.status = newStatus;
    if (courier) order.courier = courier;

    const timelineEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}`
    };
    order.timeline.push(timelineEntry);
    this.save();
    return order;
  }

  // Settings
  getSettings() {
    return this.data.settings;
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // Email notifications log
  getEmails() {
    return this.data.emails;
  }

  addEmailLog(emailRecord) {
    const record = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...emailRecord
    };
    this.data.emails.unshift(record);
    // Keep max 100 emails in log
    if (this.data.emails.length > 100) {
      this.data.emails = this.data.emails.slice(0, 100);
    }
    this.save();
    return record;
  }
}

module.exports = new Store();
