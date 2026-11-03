import React, { useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { formatPrice } from './ui';

export default function Header({
  categories,
  selectedCategory,
  onSelectCategory,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenBag,
  onOpenAccount,
  onOpenTrack,
  account,
  settings,
  onHome
}) {
  const inputRef = useRef(null);
  const catBarRef = useRef(null);
  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  // Keep the active category visible in the swipeable bar (mobile)
  useEffect(() => {
    const bar = catBarRef.current;
    const active = bar && bar.querySelector('[aria-current="page"]');
    if (!bar || !active) return;
    const li = active.parentElement;
    const target = li.offsetLeft - (bar.clientWidth - li.clientWidth) / 2;
    bar.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [selectedCategory, categories]);

  const threshold = Number(settings?.freeShippingThreshold || 0);

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md">
      {/* Service line */}
      <div className="bg-ink text-paper/85">
        <p className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center text-center label text-[10px] sm:text-[11px]">
          {threshold > 0
            ? <>Complimentary delivery over {formatPrice(threshold)}<span className="hidden sm:inline">&nbsp;·&nbsp;Cash on delivery across Bangladesh</span></>
            : 'Cash on delivery across Bangladesh'}
        </p>
      </div>

      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 sm:h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2.5 text-ink/80 hover:text-ink transition-colors -ml-1 p-1"
              aria-label={searchOpen ? 'Close search' : 'Search'}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X className="w-[18px] h-[18px]" strokeWidth={1.25} /> : <Search className="w-[18px] h-[18px]" strokeWidth={1.25} />}
              <span className="hidden md:inline label">Search</span>
            </button>
            <button onClick={onOpenTrack} className="hidden md:inline label text-ink/80 hover:text-ink transition-colors">
              Track order
            </button>
          </div>

          {/* Wordmark */}
          <button onClick={onHome} aria-label="Masfeeh home" className="px-2">
            <BrandLogo size="md" />
          </button>

          {/* Right */}
          <div className="flex items-center justify-end gap-5 sm:gap-7">
            <button
              onClick={onOpenAccount}
              className="hidden md:flex items-center gap-2.5 text-ink/80 hover:text-ink transition-colors"
              aria-label={account ? 'Your account' : 'Sign in'}
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.25} />
              <span className="label">{account ? account.name.split(' ')[0] : 'Sign in'}</span>
            </button>
            <button onClick={onOpenBag} className="label text-ink hover:text-ink/70 transition-colors" aria-label={`Bag, ${cartCount} items`}>
              Bag <span className="tabular-nums">({cartCount})</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-line anim-fade">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-3">
              <Search className="w-4 h-4 text-muted shrink-0" strokeWidth={1.25} />
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                }}
                placeholder="Search the collection"
                aria-label="Search the collection"
                className="flex-1 bg-transparent font-display text-xl sm:text-2xl text-ink placeholder:text-muted/60 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="label text-muted hover:text-ink">Clear</button>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        <nav aria-label="Categories" className="border-t border-line/70">
          <ul ref={catBarRef} className="relative max-w-7xl mx-auto px-4 sm:px-8 h-10 flex items-center sm:justify-center gap-7 sm:gap-10 overflow-x-auto no-scrollbar">
            {categories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <li key={cat} className="shrink-0">
                  <button
                    onClick={() => onSelectCategory(cat)}
                    aria-current={active ? 'page' : undefined}
                    className={`label py-2.5 border-b transition-colors focus:outline-none focus-visible:text-ink ${
                      active ? 'text-ink border-ink' : 'text-muted border-transparent hover:text-ink'
                    }`}
                  >
                    {cat === 'All' ? 'All' : cat}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
