import React, { useState } from 'react';
import { X, ShoppingBag, Zap, Check, Star, Shield, Truck, RefreshCw } from 'lucide-react';

export default function ProductDetailsModal({ product, onClose, onAddToCart, onBuyNow }) {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
  };

  const handleBuy = () => {
    onBuyNow(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#ebdcd3] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto my-0 sm:my-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
          {/* Left Column: Image Gallery */}
          <div className="p-4 sm:p-6 bg-[#faf6f2] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#eddcd2]">
            <div>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#ebdcd3] shadow-xs">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/bag_fiom.jpg';
                  }}
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase bg-[#1f1d1d] text-[#e6c89c] shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer active:scale-95 ${
                        selectedImage === img ? 'border-[#c59b27] shadow-xs' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery highlights */}
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#ebdcd3] grid grid-cols-2 gap-2 text-[11px] sm:text-xs text-stone-600">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Truck className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span>Dhaka: 24-48 Hours</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shield className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span>100% Quality Checked</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between">
            <div className="pb-16 sm:pb-0">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#917666] mb-1">
                <span>{product.category}</span>
                <span>•</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 text-xs text-stone-700 font-bold">5.0 (Authentic Masfeeh)</span>
                </div>
              </div>

              <h2 className="font-serif-luxury text-xl sm:text-2xl md:text-3xl font-bold text-[#231b17] leading-snug">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="mt-2.5 sm:mt-3 flex items-center gap-2.5 sm:gap-3">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1f1d1d]">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm sm:text-base text-stone-400 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#c59b27]/15 text-[#997316] border border-[#c59b27]/30">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mt-2.5 sm:mt-3 flex items-center gap-2 text-xs flex-wrap">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] sm:text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px] sm:text-xs">
                    Out of Stock
                  </span>
                )}
                <span className="text-stone-400 text-[11px] sm:text-xs">• Cash on Delivery available</span>
              </div>

              {/* Belt feature highlight for bags */}
              {product.category === 'Bags' && (
                <div className="mt-3.5 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-[#faf3ea] border border-[#edd5c0] text-xs text-[#523d30]">
                  <strong className="text-[#8c600b] block mb-1">👜 Dual Belt Styling Included:</strong>
                  <span>Every crossbody bag comes complete with an adjustable long shoulder strap for casual crossbody wear AND a chic short strap for handbag styling!</span>
                </div>
              )}

              {/* Description */}
              <p className="mt-3 sm:mt-4 text-xs md:text-sm text-stone-600 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-1.5 sm:mb-2">
                    Key Features:
                  </h4>
                  <ul className="space-y-1 sm:space-y-1.5 text-xs text-stone-600">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#c59b27] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quantity & Action Buttons (Sticky at bottom on mobile!) */}
            <div className="fixed sm:static bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md sm:bg-transparent p-3 sm:p-0 sm:mt-6 sm:pt-5 border-t border-[#ebdcd3] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:shadow-none pb-safe">
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-700">Qty:</span>
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                    <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 sm:w-10 text-center text-xs font-bold text-stone-800">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="text-xs text-stone-500 font-medium">
                  Subtotal: <strong className="text-stone-900">৳{(product.price * quantity).toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 border border-[#1f1d1d] text-[#1f1d1d] hover:bg-stone-100 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  disabled={product.stock <= 0}
                  onClick={handleBuy}
                  className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 bg-[#1f1d1d] text-[#e6c89c] hover:bg-[#382f29] transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Zap className="w-4 h-4 text-[#d4af37]" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
