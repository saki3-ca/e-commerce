import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  discountCode,
  setDiscountCode,
  discountAmount,
  applyDiscount
}) {
  if (!isOpen) return null;

  const [inputCoupon, setInputCoupon] = useState(discountCode || '');
  const [couponError, setCouponError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 2500;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (!inputCoupon.trim()) return;

    if (inputCoupon.trim().toUpperCase() === 'WELCOME10' || inputCoupon.trim().toUpperCase() === 'MASFEEH10') {
      applyDiscount(inputCoupon.trim().toUpperCase(), Math.round(subtotal * 0.10));
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 for 10% off!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#ebdcd3] flex items-center justify-between bg-[#faf6f2]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#c59b27]" />
            <h2 className="font-serif-luxury text-lg font-bold text-[#261f1c]">
              Your Shopping Bag ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free shipping progress bar */}
        <div className="bg-[#f7efe9] px-4 py-2.5 border-b border-[#eeddd3] text-xs">
          {remainingForFree > 0 ? (
            <p className="text-[#6d5140] font-medium mb-1.5">
              Add <strong className="text-[#997316]">৳{remainingForFree.toLocaleString()}</strong> more for Free Shipping! 🚚
            </p>
          ) : (
            <p className="text-emerald-700 font-bold mb-1.5 flex items-center gap-1.5">
              <span>🎉 Congratulations! You have unlocked Free Shipping!</span>
            </p>
          )}
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#c59b27] transition-all duration-500 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#f2e7e1]">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <div className="w-16 h-16 rounded-full bg-[#faf5f0] flex items-center justify-center text-stone-300 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif-luxury text-lg font-semibold text-stone-800">Your bag is empty</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Explore our signature monogram crossbody bags, jewelry, and press-on nails.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2 bg-[#1f1d1d] text-[#e6c89c] text-xs font-semibold rounded-full hover:bg-stone-800 transition-all cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 items-center">
                <img
                  src={item.image || '/assets/bag_fiom.jpg'}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover bg-stone-100 border border-[#ebdcd3] shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/bag_fiom.jpg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-stone-900 truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="text-xs text-stone-500 mt-0.5">
                    ৳{item.price.toLocaleString()}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-200 rounded-md bg-stone-50 overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 text-xs"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-900">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#ebdcd3] bg-[#faf6f2]">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="mb-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon code (Try: WELCOME10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#ebdcd3] rounded-lg uppercase tracking-wider focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1f1d1d] text-[#e6c89c] text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
              {discountAmount > 0 && (
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                  ✓ {discountCode} applied: ৳{discountAmount.toLocaleString()} saved!
                </p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600 border-t border-[#ebdcd3] pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-900">৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Shipping:</span>
                <span>Calculated at checkout (From ৳70)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-dashed border-stone-300 pt-2">
                <span>Total:</span>
                <span className="text-[#997316]">
                  ৳{(subtotal - discountAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="mt-4 w-full py-3 bg-[#1f1d1d] hover:bg-[#382f29] text-[#e6c89c] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#d4af37]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
