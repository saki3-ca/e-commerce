import React from 'react';
import { ShoppingBag, Search, Home, PackageCheck, UserCheck, Shield } from 'lucide-react';

/**
 * Modern Dynamic Mobile Bottom Navigation Bar
 * Optimized for mobile touch, thumb-reach ergonomic shopping.
 */
export default function MobileBottomNav({
  cartCount,
  onOpenCart,
  onOpenTrack,
  onOpenSearch,
  onGoHome,
  selectedCategory,
  searchQuery,
  isAdmin,
  setIsAdmin
}) {
  const isHomeActive = !isAdmin && selectedCategory === 'All' && !searchQuery;

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#ebdcd3] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-all duration-300"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {/* 1. Home / Shop */}
        <button
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-90 ${
            isHomeActive
              ? 'text-[#997316] font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c59325]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Shop</span>
        </button>

        {/* 2. Mobile Search */}
        <button
          onClick={onOpenSearch}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-90 ${
            searchQuery ? 'text-[#997316] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Search</span>
        </button>

        {/* 3. Track Order */}
        <button
          onClick={onOpenTrack}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-stone-500 hover:text-stone-800 transition-all cursor-pointer active:scale-90"
        >
          <PackageCheck className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Track</span>
        </button>

        {/* 4. Cart / Shopping Bag (Prominent with badge) */}
        {!isAdmin && (
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-stone-700 hover:text-stone-900 transition-all cursor-pointer active:scale-90 relative"
          >
            <div className="relative">
              <div className="p-1.5 rounded-full bg-gradient-to-tr from-[#1f1d1d] to-[#36302c] text-[#e6c89c] shadow-xs">
                <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold bg-[#c59325] text-white rounded-full ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-bold text-[#1f1d1d]">
              Bag {cartCount > 0 ? `(${cartCount})` : ''}
            </span>
          </button>
        )}

        {/* 5. Owner Admin Portal Toggle */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer active:scale-90 ${
            isAdmin ? 'text-[#c59325] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">
            {isAdmin ? 'Store' : 'Admin'}
          </span>
        </button>
      </div>
    </nav>
  );
}
