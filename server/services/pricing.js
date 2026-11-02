// Server-side pricing: the browser never decides what an order costs.
const store = require('../data/store');

const AREAS = ['Inside Dhaka', 'Outside Dhaka'];

function normalizeItems(items) {
  // Merge duplicate lines and keep only sane quantities
  const merged = new Map();
  for (const it of Array.isArray(items) ? items : []) {
    const id = typeof it?.id === 'string' ? it.id : null;
    const qty = Math.floor(Number(it?.quantity));
    if (!id || !Number.isFinite(qty) || qty <= 0) continue;
    merged.set(id, Math.min(99, (merged.get(id) || 0) + qty));
  }
  return [...merged].map(([id, quantity]) => ({ id, quantity }));
}

/**
 * Price a cart. Returns lines with live prices and stock, plus totals.
 * Lines whose product no longer exists are dropped; quantities above stock are flagged.
 */
async function quote({ items, city, coupon }) {
  const [products, settings] = await Promise.all([store.getProducts(), store.getSettings()]);
  const byId = new Map(products.map(p => [p.id, p]));

  const lines = [];
  const problems = [];
  for (const { id, quantity } of normalizeItems(items)) {
    const p = byId.get(id);
    if (!p) { problems.push({ id, reason: 'unavailable' }); continue; }
    if (p.stock < quantity) problems.push({ id, reason: 'stock', available: Math.max(0, p.stock), name: p.name });
    lines.push({ id, name: p.name, price: p.price, image: p.image, quantity, stock: p.stock });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const area = AREAS.includes(city) ? city : 'Inside Dhaka';
  const baseShipping = area === 'Inside Dhaka'
    ? Number(settings.shippingDhaka ?? 70)
    : Number(settings.shippingOutsideDhaka ?? 130);
  const threshold = Number(settings.freeShippingThreshold ?? 0);
  const shipping = lines.length === 0 || (threshold > 0 && subtotal >= threshold) ? 0 : baseShipping;

  let discount = 0;
  let appliedCoupon = null;
  let couponError = null;
  if (coupon && String(coupon).trim()) {
    const code = String(coupon).trim().toUpperCase();
    const percent = Number((settings.coupons || {})[code]);
    if (percent > 0 && percent <= 100) {
      appliedCoupon = { code, percent };
      discount = Math.round(subtotal * percent / 100);
    } else {
      couponError = 'This code is not valid';
    }
  }

  return {
    items: lines,
    problems,
    area,
    subtotal,
    shipping,
    discount,
    coupon: appliedCoupon,
    couponError,
    freeShippingThreshold: threshold,
    total: Math.max(0, subtotal - discount + shipping)
  };
}

module.exports = { quote, normalizeItems, AREAS };
