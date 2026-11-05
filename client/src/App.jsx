import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import AccountDrawer from './components/AccountDrawer';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import CategoryTiles from './components/CategoryTiles';
import Reveal from './components/Reveal';
import { api, auth, customerAuth } from './services/api';
import { useCart } from './hooks/useCart';

const isAdminPath = () => window.location.pathname.replace(/\/+$/, '') === '/admin';

function navigate(path) {
  if (window.location.pathname !== path) window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const SORTS = [
  ['featured', 'Featured'],
  ['newest', 'Newest'],
  ['price-low', 'Price, low to high'],
  ['price-high', 'Price, high to low']
];

export default function App() {
  const [adminRoute, setAdminRoute] = useState(isAdminPath);
  const [adminUser, setAdminUser] = useState(null);
  const [adminChecked, setAdminChecked] = useState(!auth.getToken());

  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [account, setAccount] = useState(null);
  const cart = useCart(account);

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState('featured');

  const [selected, setSelected] = useState(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [track, setTrack] = useState({ open: false, id: '' });
  const [coupon, setCoupon] = useState('');
  const [toast, setToast] = useState(null);

  // ---------- routing ----------
  useEffect(() => {
    const onPop = () => setAdminRoute(isAdminPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ---------- data ----------
  const loadData = useCallback(async () => {
    setLoadError('');
    try {
      const [prods, sets] = await Promise.all([api.getProducts(), api.getSettings()]);
      setProducts(prods);
      setSettings(sets);
    } catch (err) {
      setLoadError(err.message || 'The collection could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Refresh the catalogue when the shopper returns to the tab (picks up edits, deletions, stock)
  useEffect(() => {
    let last = Date.now();
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - last > 30000) {
        last = Date.now();
        loadData();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadData]);

  // ---------- sessions ----------
  useEffect(() => {
    auth.onUnauthorized = () => setAdminUser(null);
    customerAuth.onUnauthorized = () => setAccount(null);

    if (auth.getToken()) {
      api.me()
        .then(({ user }) => setAdminUser(user))
        .catch(() => auth.clear())
        .finally(() => setAdminChecked(true));
    }
    if (customerAuth.getToken()) {
      api.getAccount()
        .then(({ account: acc }) => {
          setAccount(acc);
          // A bag saved on another device shows up here if this device's bag is empty
          if (cart.lines.length === 0 && acc.cart && acc.cart.length) cart.replace(acc.cart);
        })
        .catch(() => customerAuth.clear());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- catalogue ----------
  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  // Drop bag lines for products that no longer exist
  useEffect(() => {
    if (loading || loadError) return;
    const stale = cart.lines.filter(l => !productById.has(l.id));
    stale.forEach(l => cart.remove(l.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productById, loading]);

  const categories = useMemo(() => {
    const seen = [];
    products.forEach(p => { if (p.category && !seen.includes(p.category)) seen.push(p.category); });
    return ['All', ...seen];
  }, [products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter(p =>
      (category === 'All' || p.category === category) &&
      (!q || [p.name, p.category, p.description].some(v => v && v.toLowerCase().includes(q)))
    );
    const sorted = [...list];
    if (sort === 'price-low') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'newest') sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    // featured: in-stock pieces first, otherwise keep the shop's order
    if (sort === 'featured') sorted.sort((a, b) => (b.stock > 0) - (a.stock > 0));
    return sorted;
  }, [products, category, search, sort]);

  const bagItems = cart.lines
    .map(l => ({ product: productById.get(l.id), quantity: l.quantity }))
    .filter(i => i.product);
  const bagCount = bagItems.reduce((n, i) => n + i.quantity, 0);
  const inBag = id => (cart.lines.find(l => l.id === id) || {}).quantity || 0;

  // ---------- actions ----------
  const showToast = (message, action) => {
    setToast({ message, action, key: Date.now() });
  };
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  const addToBag = (product, quantity = 1, { silent = false } = {}) => {
    if (quantity <= 0) return;
    cart.add(product.id, quantity, product.stock);
    if (!silent) showToast(`${product.name} added to your bag`, { label: 'View bag', run: () => setBagOpen(true) });
  };

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chooseCategory = cat => {
    setCategory(cat);
    setSearch('');
    requestAnimationFrame(scrollToCollection);
  };

  const goHome = () => {
    setCategory('All');
    setSearch('');
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTrack = (id = '') => {
    setCheckoutOpen(false);
    setAccountOpen(false);
    setTrack({ open: true, id });
  };

  const handleAuthenticated = (res, kind) => {
    customerAuth.setToken(res.token);
    setAccount(res.account);
    if (kind === 'login') cart.mergeFromAccount(res.account.cart);
    setAccountOpen(false);
    showToast(kind === 'signup' ? `Welcome to Masfeeh, ${res.account.name.split(' ')[0]}` : `Welcome back, ${res.account.name.split(' ')[0]}`);
  };

  const signOut = () => {
    customerAuth.clear();
    setAccount(null);
    cart.clear();
    setAccountOpen(false);
    showToast('You have been signed out');
  };

  const handleOrderPlaced = () => {
    cart.clear();
    setCoupon('');
    if (account) api.getAccount().then(({ account: acc }) => setAccount(acc)).catch(() => {});
    loadData(); // refresh stock
  };

  // ---------- staff area (/admin) ----------
  if (adminRoute) {
    if (!adminChecked) return <div className="min-h-screen bg-ivory" />;
    if (!adminUser) {
      return <AdminLogin onSuccess={setAdminUser} onCancel={() => navigate('/')} />;
    }
    return (
      <AdminDashboard
        onSwitchToStore={() => { navigate('/'); loadData(); }}
        settings={settings}
        onRefreshSettings={loadData}
        user={adminUser}
        onLogout={() => { auth.clear(); setAdminUser(null); navigate('/'); }}
      />
    );
  }

  const showHero = category === 'All' && !search;

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#collection" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 label">
        Skip to collection
      </a>

      <Header
        categories={categories}
        selectedCategory={category}
        onSelectCategory={chooseCategory}
        searchOpen={searchOpen}
        setSearchOpen={open => { setSearchOpen(open); if (!open) setSearch(''); }}
        searchQuery={search}
        setSearchQuery={setSearch}
        cartCount={bagCount}
        onOpenBag={() => setBagOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenTrack={() => openTrack()}
        account={account}
        settings={settings}
        onHome={goHome}
      />

      <main className="flex-1">
        {showHero && <Hero onShop={scrollToCollection} onShopCategory={chooseCategory} />}
        {showHero && !loading && !loadError && (
          <CategoryTiles categories={categories} products={products} onSelect={chooseCategory} />
        )}

        <section id="collection" className="scroll-mt-32 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-10 sm:pt-20 pb-16 sm:pb-24">
          <Reveal className="flex flex-col items-center text-center">
            <p className="label text-brass">{search ? 'Search' : 'Masfeeh'}</p>
            <h2 className="mt-3 sm:mt-4 font-display text-[34px] sm:text-[52px] leading-none text-ink">
              {search ? `“${search}”` : category === 'All' ? 'The Collection' : category}
            </h2>
          </Reveal>

          <div className="mt-7 sm:mt-12 flex items-center justify-between border-y border-line py-2.5 sm:py-3">
            <p className="text-[13px] text-muted tabular-nums">
              {loading ? 'Loading' : `${visible.length} ${visible.length === 1 ? 'piece' : 'pieces'}`}
            </p>
            <label className="flex items-center gap-3">
              <span className="label text-muted hidden sm:inline">Sort</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-transparent text-[13px] text-ink focus:outline-none pr-1"
                aria-label="Sort products"
              >
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-8 gap-y-9 sm:gap-y-14">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-square bg-sand animate-pulse" />
                  <div className="mt-4 h-3 w-1/3 bg-sand animate-pulse" />
                  <div className="mt-3 h-4 w-2/3 bg-sand animate-pulse" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="py-24 text-center">
              <p className="font-display text-[28px] text-ink">The collection is resting</p>
              <p className="mt-3 text-[14px] text-muted">{loadError}</p>
              <button className="btn-outline mt-8" onClick={() => { setLoading(true); loadData(); }}>Try again</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-[28px] text-ink">Nothing matches just yet</p>
              <p className="mt-3 text-[14px] text-muted">Try another word, or explore the full collection.</p>
              <button className="btn-outline mt-8" onClick={() => { setSearch(''); setCategory('All'); }}>View all pieces</button>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-8 gap-y-9 sm:gap-y-14">
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onSelect={setSelected} onQuickAdd={prod => addToBag(prod, 1)} />
              ))}
            </div>
          )}
        </section>

        {showHero && (
          <section className="border-t border-line bg-paper">
            <Reveal className="max-w-3xl mx-auto px-6 py-16 sm:py-32 text-center">
              <p className="label text-brass">The house</p>
              <p className="mt-6 sm:mt-8 font-display text-[24px] sm:text-[36px] leading-[1.3] text-ink">
                We believe in premium, authentic and timeless beauty.{' '}
                <em className="text-ink-soft">Every detail matters, every choice reflects elegance.</em>
              </p>
              <p className="mt-8 text-[14px] text-muted">Masfeeh · Bashundhara, Dhaka</p>
            </Reveal>
          </section>
        )}
      </main>

      <Footer
        categories={categories}
        onSelectCategory={chooseCategory}
        onOpenTrack={() => openTrack()}
        onOpenAccount={() => setAccountOpen(true)}
        settings={settings}
      />

      <MobileBottomNav
        cartCount={bagCount}
        account={account}
        onHome={goHome}
        onSearch={() => { setSearchOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onTrack={() => openTrack()}
        onAccount={() => setAccountOpen(true)}
        onBag={() => setBagOpen(true)}
      />

      {selected && (
        <ProductDetailsModal
          key={selected.id}
          product={productById.get(selected.id) || selected}
          inBag={inBag(selected.id)}
          settings={settings}
          onClose={() => setSelected(null)}
          onAddToBag={(p, q) => { addToBag(p, q, { silent: true }); setToast(null); setBagOpen(true); }}
          onBuyNow={(p, q) => {
            if (q > 0) cart.add(p.id, q, p.stock);
            setSelected(null);
            setCheckoutOpen(true);
          }}
        />
      )}

      <CartDrawer
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        items={bagItems}
        lines={cart.lines}
        onSetQuantity={cart.setQuantity}
        onRemove={cart.remove}
        coupon={coupon}
        setCoupon={setCoupon}
        onCheckout={() => { setBagOpen(false); setToast(null); setCheckoutOpen(true); }}
        onContinue={() => { setBagOpen(false); scrollToCollection(); }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={bagItems}
        lines={cart.lines}
        onSetQuantity={cart.setQuantity}
        onRemove={cart.remove}
        coupon={coupon}
        settings={settings}
        account={account}
        onSignIn={() => setAccountOpen(true)}
        onPlaced={handleOrderPlaced}
        onTrack={id => openTrack(id)}
      />

      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        account={account}
        cart={cart.lines}
        onAuthenticated={handleAuthenticated}
        onAccountUpdated={setAccount}
        onSignOut={signOut}
        onTrack={id => openTrack(id)}
      />

      <OrderTrackingModal open={track.open} initialId={track.id} onClose={() => setTrack({ open: false, id: '' })} />

      {toast && (
        <div
          key={toast.key}
          role="status"
          className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-20 md:bottom-8 w-[calc(100%-2rem)] max-w-md bg-ink text-paper px-5 py-4 flex items-center justify-between gap-4 anim-up shadow-[0_10px_40px_rgba(28,24,21,0.25)]"
        >
          <span className="text-[14px] font-light">{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => { toast.action.run(); setToast(null); }}
              className="label text-paper shrink-0 link-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
