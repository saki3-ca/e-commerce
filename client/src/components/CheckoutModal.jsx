import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Smartphone, Banknote, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  discountCode,
  settings,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Inside Dhaka',
    notes: '',
    paymentMethod: 'Cash on Delivery',
    trxId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = formData.city === 'Inside Dhaka' 
    ? (settings?.shippingDhaka || 70) 
    : (settings?.shippingOutsideDhaka || 130);
  
  // Free shipping over 2500
  const isFreeShipping = subtotal >= 2500;
  const actualShipping = isFreeShipping ? 0 : shippingFee;
  const grandTotal = Math.max(0, subtotal - (discountAmount || 0) + actualShipping);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Please enter your full name');
    if (!formData.phone.trim()) return setError('Please enter your contact phone number');
    if (!formData.email.trim()) return setError('Please enter your email address to receive order notifications');
    if (!formData.address.trim()) return setError('Please enter your complete delivery address');

    try {
      setIsSubmitting(true);
      const payload = {
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city,
          notes: formData.notes.trim()
        },
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image
        })),
        subtotal,
        shipping: actualShipping,
        discount: discountAmount || 0,
        total: grandTotal,
        paymentMethod: formData.paymentMethod === 'bKash / Nagad' 
          ? `Mobile Banking (${formData.trxId ? `TrxID: ${formData.trxId}` : 'Pending Verification'})`
          : formData.paymentMethod
      };

      const res = await api.createOrder(payload);
      setPlacedOrder(res.order);
      onOrderSuccess();

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore confetti errors
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#ebdcd3] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#ebdcd3] bg-[#faf6f2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c59b27]" />
            <h2 className="font-serif-luxury text-xl font-bold text-[#241d1a]">
              {placedOrder ? 'Order Confirmed!' : 'Secure Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {placedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#fdf5e6] text-[#997316] border border-[#e8cda2] mb-2">
                Order #{placedOrder.id}
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                Thank You, {placedOrder.customer.name}!
              </h3>
              <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                Your order has been recorded successfully. An email alert has been sent to the store owner at <strong className="text-stone-800">{settings?.ownerEmail || 'maishamonsura@gmail.com'}</strong>.
              </p>
            </div>

            {/* Notification Callout */}
            <div className="bg-[#fcf9f4] border border-[#e8d5c4] rounded-xl p-4 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex items-center gap-2 font-bold text-[#8c600b]">
                <span>🔔 Customer Notification Alert:</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                We sent an instant receipt to <strong>{placedOrder.customer.email}</strong>. As soon as the shop owner reviews and accepts your order in the dashboard, you will receive another email notification with tracking details!
              </p>
            </div>

            {/* Order Recap */}
            <div className="bg-stone-50 rounded-xl p-4 text-xs text-left border border-stone-200 max-w-lg mx-auto space-y-2">
              <div className="flex justify-between border-b border-stone-200 pb-2 font-semibold">
                <span>Total Amount:</span>
                <span className="text-[#997316] font-bold text-sm">৳{placedOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payment Method:</span>
                <span>{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Address:</span>
                <span className="text-right max-w-xs">{placedOrder.customer.address} ({placedOrder.customer.city})</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1f1d1d] hover:bg-stone-800 text-[#e6c89c] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Back to Shop
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Contact & Shipping Details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#c59b27]" />
                <span>1. Shipping & Contact Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sadia Rahman"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#ebdcd3] rounded-lg focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. 01712-345678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#ebdcd3] rounded-lg focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Email Address (for order acceptance notifications) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. yourname@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#ebdcd3] rounded-lg focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Full Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    required
                    placeholder="House, Road, Area, Landmark (e.g. House 12, Road 4, Block D, Bashundhara R/A)"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#ebdcd3] rounded-lg focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Delivery Area
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#ebdcd3] rounded-lg focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  >
                    <option value="Inside Dhaka">Inside Dhaka (৳70 • 24-48 Hours)</option>
                    <option value="Outside Dhaka">Outside Dhaka (৳130 • 2-3 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Special Note / Instruction (Optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="e.g. Call before delivery"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#ebdcd3] rounded-lg focus:outline-none focus:border-[#c59b27] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-[#c59b27]" />
                <span>2. Select Payment Method</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className={`p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  formData.paymentMethod === 'Cash on Delivery'
                    ? 'border-[#c59b27] bg-[#fdfaf3] shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Banknote className="w-5 h-5 text-[#c59b27] mb-1.5" />
                  <span className="text-xs font-bold text-stone-900">Cash on Delivery</span>
                  <span className="text-[10px] text-stone-500 mt-0.5">Pay when bag arrives</span>
                </label>

                <label className={`p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  formData.paymentMethod === 'bKash / Nagad'
                    ? 'border-[#c59b27] bg-[#fdfaf3] shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bKash / Nagad"
                    checked={formData.paymentMethod === 'bKash / Nagad'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Smartphone className="w-5 h-5 text-[#c59b27] mb-1.5" />
                  <span className="text-xs font-bold text-stone-900">bKash / Nagad</span>
                  <span className="text-[10px] text-stone-500 mt-0.5">Mobile Banking</span>
                </label>

                <label className={`p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  formData.paymentMethod === 'Card Payment'
                    ? 'border-[#c59b27] bg-[#fdfaf3] shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card Payment"
                    checked={formData.paymentMethod === 'Card Payment'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <CreditCard className="w-5 h-5 text-[#c59b27] mb-1.5" />
                  <span className="text-xs font-bold text-stone-900">Debit / Credit Card</span>
                  <span className="text-[10px] text-stone-500 mt-0.5">Visa / Mastercard</span>
                </label>
              </div>

              {formData.paymentMethod === 'bKash / Nagad' && (
                <div className="mt-3 p-3 bg-[#faf3ea] rounded-xl border border-[#edd7c2] text-xs space-y-1 text-[#5c4436]">
                  <p className="font-bold text-[#8f620e]">📱 Mobile Banking Instructions:</p>
                  <p>Send Send-Money to Masfeeh Official bKash/Nagad: <strong>01303-662891</strong></p>
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Enter Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      name="trxId"
                      placeholder="e.g. 9JA72B9X"
                      value={formData.trxId}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#ebdcd3] rounded-lg uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary Breakdown */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({discountCode}):</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge ({formData.city}):</span>
                <span>{actualShipping === 0 ? 'FREE' : `৳${actualShipping}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
                <span>Grand Total:</span>
                <span className="text-[#997316] font-bold text-base">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#1f1d1d] hover:bg-[#382f29] text-[#e6c89c] font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing your order...</span>
              ) : (
                <>
                  <span>Confirm Order (৳{grandTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
