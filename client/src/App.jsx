import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import AdminDashboard from './components/AdminDashboard';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import { api } from './services/api';
import { Sparkles, SlidersHorizontal, Check, ShoppingBag, ArrowUpRight } from 'lucide-react';

export default function App() {
  // Storefront & Admin toggle
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');

  // Products & Settings State
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('masfeeh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Coupons
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, sets] = await Promise.all([
        api.getProducts(),
        api.getSettings()
      ]);
      setProducts(prods);
      setSettings(sets);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('masfeeh_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Math.min(product.stock, quantity)
      }];
    });
    showToast(`Added "${product.name}" to bag!`);
  };

  const handleBuyNow = (product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const applyDiscount = (code, amount) => {
    setDiscountCode(code);
    setDiscountAmount(amount);
    showToast(`Coupon ${code} applied (-৳${amount})!`);
  };

  const handleOrderSuccess = () => {
    setCartItems([]);
    setDiscountCode('');
    setDiscountAmount(0);
  };

  // Filter & Sort Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOption === 'price-low') return a.price - b.price;
    if (sortOption === 'price-high') return b.price - a.price;
    if (sortOption === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return 0; // featured
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If in Admin mode, show Owner Admin Portal
  if (isAdmin) {
    return (
      <AdminDashboard 
        onSwitchToStore={() => setIsAdmin(false)}
        settings={settings}
        onRefreshSettings={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f5] text-[#2c2420]">
      {/* Toast Notification (Mobile Safe Positioning) */}
      {toastMessage && (
        <div className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:top-20 z-50 bg-[#1f1d1d] text-[#e6c89c] px-4 py-2.5 rounded-xl shadow-2xl border border-[#d4af37] text-xs flex items-center justify-between sm:justify-start gap-2 animate-in slide-in-from-top-4 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage('')}
            className="text-stone-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        settings={settings}
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* Hero Section */}
        {selectedCategory === 'All' && !searchQuery && (
          <Hero 
            onExploreCategory={(cat) => setSelectedCategory(cat)}
            settings={settings}
          />
        )}

        {/* Product Catalog Section */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          {/* Section Header & Sorters */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[#ebdcd3]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#997316]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Boutique Catalog</span>
              </div>
              <h2 className="font-serif-luxury text-xl sm:text-3xl font-bold text-[#231b17] mt-0.5">
                {selectedCategory === 'All' ? 'Signature Collection' : `${selectedCategory}`}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1">
                Showing {filteredProducts.length} premium accessories from Masfeeh.
              </p>
            </div>

            {/* Sorter Selector */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-[#ebdcd3] rounded-lg focus:outline-none focus:border-[#c59b27] text-stone-800"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6 py-12">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-stone-200/60 rounded-xl aspect-square"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-stone-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <h3 className="font-serif-luxury text-lg font-semibold text-stone-800">No items found</h3>
              <p className="text-xs text-stone-400 mt-1">
                Try selecting a different category or clearing your search term.
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-[#1f1d1d] text-[#e6c89c] text-xs font-semibold rounded-full"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onToggleAdmin={() => setIsAdmin(true)}
        settings={settings}
      />

      {/* Dynamic Mobile Bottom Navigation Bar (md:hidden) */}
      <MobileBottomNav
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenSearch={() => {
          setMobileSearchOpen(prev => !prev);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGoHome={() => {
          setSelectedCategory('All');
          setSearchQuery('');
          setIsAdmin(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
        discountCode={discountCode}
        setDiscountCode={setDiscountCode}
        discountAmount={discountAmount}
        applyDiscount={applyDiscount}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountAmount={discountAmount}
        discountCode={discountCode}
        settings={settings}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
      />
    </div>
  );
}
