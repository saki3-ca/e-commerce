import React from 'react';
import { ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-[#ede2da] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between active:border-[#c59b27]">
      {/* Product Image Box */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative w-full aspect-square overflow-hidden bg-[#faf5f0] cursor-pointer"
      >
        <img
          src={product.image || '/assets/bag_fiom.jpg'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/bag_fiom.jpg';
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.badge && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-[#1f1d1d] text-[#e6c89c] shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-[#c59b27] text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View Button (Desktop Hover) */}
        <div className="hidden sm:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="p-2.5 bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-md backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-all cursor-pointer"
            title="Quick View"
          >
            <Eye className="w-4 h-4 text-stone-700" />
          </button>
        </div>

        {/* Stock warning */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-[9px] sm:text-[10px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md border border-rose-200">
            Only {product.stock} left
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-2.5 py-1 bg-stone-800 text-white text-[11px] sm:text-xs font-semibold rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details (Mobile Ergonomic Spacing) */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#917666] mb-0.5">
            <span className="uppercase font-semibold tracking-wider truncate mr-1">{product.category}</span>
            <div className="flex items-center text-amber-500 shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span className="ml-0.5 sm:ml-1 text-[10px] sm:text-[11px] font-medium text-stone-600">4.9</span>
            </div>
          </div>

          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-xs sm:text-sm font-semibold text-[#28211d] hover:text-[#997316] line-clamp-2 transition-colors cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.category === 'Bags' && (
            <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#b07e15] font-medium line-clamp-1">
              ✨ Dual belts included
            </p>
          )}
        </div>

        {/* Pricing and Add to Bag */}
        <div className="pt-2 border-t border-[#f0e6de] flex items-center justify-between gap-1.5">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 truncate">
            <span className="text-sm sm:text-base font-bold text-[#1f1d1d] truncate">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through truncate">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to bag`}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all shrink-0 cursor-pointer active:scale-90 ${
              product.stock > 0
                ? 'bg-[#1f1d1d] hover:bg-[#c59b27] text-white shadow-xs'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
