import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Phone, MapPin, Sparkles, UserCheck, PackageCheck, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Header({
  cartCount,
  onOpenCart,
  onOpenTrack,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  isAdmin,
  setIsAdmin,
  settings,
  mobileSearchOpen,
  setMobileSearchOpen
}) {
  const categories = ['All', 'Bags', 'Hair Accessories', 'Fake Nails', 'Rings', 'Bangles & More'];
  const [internalMobileSearch, setInternalMobileSearch] = useState(false);

  const isSearchOpen = mobileSearchOpen !== undefined ? mobileSearchOpen : internalMobileSearch;
  const toggleMobileSearch = () => {
    if (setMobileSearchOpen) {
      setMobileSearchOpen(!isSearchOpen);
    } else {
      setInternalMobileSearch(!internalMobileSearch);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ebdcd3] shadow-xs">
      {/* Top Luxury Announcement Bar (Compact & responsive on mobile) */}
      <div className="bg-[#1f1d1d] text-[#e6c89c] text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-[#3b322b]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Slogan */}
          <div className="flex items-center gap-1.5 truncate tracking-wide font-medium">
            <span className="text-[#d4af37] shrink-0">✨</span>
            <span className="truncate">Little Things... Big Happiness ♡</span>
            <span className="hidden md:inline text-zinc-500">|</span>
            <span className="hidden md:inline text-zinc-300">Fast Delivery All Over Bangladesh</span>
          </div>

          {/* Contact & Social Links */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-zinc-300 font-light">
            {/* Facebook Link */}
            <a 
              href={settings?.facebookUrl || "https://www.facebook.com/profile.php?id=61596179578624"} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 text-white hover:brightness-110 bg-[#1877f2] px-2 py-0.5 rounded-full transition-all text-[10px] sm:text-[11px] font-semibold"
              title="Official Facebook"
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>FB</span>
            </a>

            {/* Instagram Link (If configured) */}
            {settings?.instagramUrl && (
              <a 
                href={settings.instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 text-white hover:brightness-110 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-2 py-0.5 rounded-full transition-all text-[10px] sm:text-[11px] font-semibold"
                title="Follow on Instagram"
              >
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="hidden sm:inline">IG</span>
              </a>
            )}

            <a href="tel:01303-662891" className="flex items-center gap-1 hover:text-[#d4af37] transition-colors font-medium">
              <Phone className="w-3 h-3 text-[#d4af37]" />
              <span className="hidden sm:inline">01303-662891</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => { setIsAdmin(false); setActiveTab('shop'); }}
          className="cursor-pointer shrink-0"
          title="Masfeeh - Accessorize Your World"
        >
          <BrandLogo size="md" variant="default" />
        </div>

        {/* Desktop Search Bar (md+) */}
        {!isAdmin && (
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search bags, hair accessories, nails, rings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-[#faf6f3] border border-[#ebdcd3] rounded-full focus:outline-none focus:border-[#c59b27] focus:bg-white transition-all text-[#332a26] placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-stone-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Search Toggle Button (Storefront View) */}
          {!isAdmin && (
            <button
              onClick={toggleMobileSearch}
              className="md:hidden p-2 rounded-full text-stone-600 hover:text-[#997316] hover:bg-[#faf4ee] transition-colors cursor-pointer"
              title="Search Products"
              aria-label="Toggle Search"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          )}

          {/* Order Tracking Button (Desktop md+) */}
          <button
            onClick={onOpenTrack}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5a483f] hover:text-[#997316] hover:bg-[#faf4ee] rounded-lg transition-colors border border-transparent hover:border-[#ebdcd3]"
            title="Track Your Order"
          >
            <PackageCheck className="w-4 h-4 text-[#c59b27]" />
            <span>Track Order</span>
          </button>

          {/* Cart Trigger (Always accessible) */}
          {!isAdmin && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-[#1f1d1d] hover:bg-[#332b26] text-[#e6c89c] rounded-full text-xs font-medium transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline font-semibold">Bag</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-[11px] font-bold bg-[#c59b27] text-white rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Owner Portal Toggle Switch */}
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium rounded-full transition-all border ${
              isAdmin 
                ? 'bg-[#c59b27] text-white border-[#b07e15] shadow-xs' 
                : 'bg-[#faf4ee] text-[#5a483f] border-[#ebdcd3] hover:bg-[#ebdcd3]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isAdmin ? 'Store View' : 'Admin'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar (Only shown on mobile when toggled or search active) */}
      {!isAdmin && isSearchOpen && (
        <div className="md:hidden px-3 pb-2.5 pt-1 bg-[#fcfaf7] border-t border-[#ebdcd3]/70 animate-in slide-in-from-top-2 duration-200">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search bags, nails, hair accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-[#ebdcd3] rounded-full focus:outline-none focus:border-[#c59b27] text-[#332a26] placeholder:text-stone-400 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-stone-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Horizontal Category Pill Bar (Dynamic touch-scrolling on mobile) */}
      {!isAdmin && (
        <div className="bg-[#fcfaf7] border-t border-[#ebdcd3]/70 overflow-x-auto no-scrollbar py-2 px-3 sm:px-6 overscroll-x-contain touch-pan-x">
          <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 min-w-max">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    active
                      ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs font-semibold'
                      : 'text-[#6b584d] hover:text-[#1f1d1d] hover:bg-[#f1e6de]'
                  }`}
                >
                  {cat === 'All' && '✨ '}
                  {cat === 'Bags' && '👜 '}
                  {cat === 'Hair Accessories' && '🎀 '}
                  {cat === 'Fake Nails' && '💅 '}
                  {cat === 'Rings' && '💍 '}
                  {cat === 'Bangles & More' && '✨ '}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
