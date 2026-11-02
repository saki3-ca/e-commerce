import React from 'react';
import { ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white rounded-xl border border-[#ede2da] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Box */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative w-full aspect-square overflow-hidden bg-[#faf5f0] cursor-pointer"
      >
        <img
          src={product.image || '/assets/bag_fiom.jpg'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/bag_fiom.jpg';
          }}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1f1d1d] text-[#e6c89c] shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#c59b27] text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
          <div className="absolute bottom-2 left-2 text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
            Only {product.stock} left in stock
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 bg-stone-800 text-white text-xs font-semibold rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#917666] mb-1">
            <span className="uppercase font-semibold tracking-wider">{product.category}</span>
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="ml-1 text-[11px] font-medium text-stone-600">4.9</span>
            </div>
          </div>

          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-sm font-semibold text-[#28211d] hover:text-[#997316] line-clamp-2 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.category === 'Bags' && (
            <p className="mt-1 text-[11px] text-stone-500 line-clamp-1 italic">
              ✨ Includes Long & Short Belt
            </p>
          )}
        </div>

        {/* Pricing and Add to Bag */}
        <div className="mt-3 pt-3 border-t border-[#f0e6de] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#1f1d1d]">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              product.stock > 0
                ? 'bg-[#1f1d1d] hover:bg-[#c59b27] text-white shadow-xs active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
