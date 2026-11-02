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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#ebdcd3] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-[#faf6f2] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#eddcd2]">
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
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#1f1d1d] text-[#e6c89c]">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === img ? 'border-[#c59b27] shadow-xs' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Delivery highlights */}
            <div className="mt-5 pt-4 border-t border-[#ebdcd3] grid grid-cols-2 gap-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#c59b27]" />
                <span>Inside Dhaka: 24-48 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c59b27]" />
                <span>100% Quality Checked</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#917666] mb-1">
                <span>{product.category}</span>
                <span>•</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 text-xs text-stone-700 font-bold">5.0 (Authentic Masfeeh)</span>
                </div>
              </div>

              <h2 className="font-serif-luxury text-2xl md:text-3xl font-bold text-[#231b17] leading-snug">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold text-[#1f1d1d]">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-stone-400 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c59b27]/15 text-[#997316] border border-[#c59b27]/30">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Out of Stock
                  </span>
                )}
                <span className="text-stone-400">• Cash on Delivery available</span>
              </div>

              {/* Belt feature highlight for bags */}
              {product.category === 'Bags' && (
                <div className="mt-4 p-3 rounded-xl bg-[#faf3ea] border border-[#edd5c0] text-xs text-[#523d30]">
                  <strong className="text-[#8c600b] block mb-1">👜 Dual Belt Styling Included:</strong>
                  <span>Every crossbody bag comes complete with an adjustable long shoulder strap for casual crossbody wear AND a chic short strap for handbag styling!</span>
                </div>
              )}

              {/* Description */}
              <p className="mt-4 text-xs md:text-sm text-stone-600 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                    Key Features:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-600">
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

            {/* Quantity & Action Buttons */}
            <div className="mt-6 pt-5 border-t border-[#ebdcd3]">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-semibold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-stone-800">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Subtotal: <strong className="text-stone-900">৳{(product.price * quantity).toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className="py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#1f1d1d] text-[#1f1d1d] hover:bg-stone-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  disabled={product.stock <= 0}
                  onClick={handleBuy}
                  className="py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-[#1f1d1d] text-[#e6c89c] hover:bg-[#382f29] transition-all shadow-md cursor-pointer disabled:opacity-50"
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
