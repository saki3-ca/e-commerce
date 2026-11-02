import React, { useState } from 'react';
import { X, Search, PackageCheck, Clock, CheckCircle2, Truck, Home, Phone, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function OrderTrackingModal({ isOpen, onClose, initialOrderId = '' }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError('');
    setLoading(true);
    try {
      const data = await api.getOrder(query.trim());
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError('No order found with this Order ID or Phone number. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', desc: 'Received & Queued' },
    { key: 'accepted', label: 'Accepted by Masfeeh', desc: 'Confirmed by Shop Owner' },
    { key: 'packaging', label: 'Quality Check & Packaging', desc: 'Carefully wrapped with straps' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Handed to Courier' },
    { key: 'delivered', label: 'Delivered', desc: 'Arrived at your doorstep' }
  ];

  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('out') || s.includes('shipping') || s.includes('shipped')) return 3;
    if (s.includes('pack') || s.includes('processing')) return 2;
    if (s.includes('accept')) return 1;
    return 0;
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#ebdcd3] max-h-[94vh] sm:max-h-[90vh] overflow-y-auto my-0 sm:my-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 shrink-0" />
        {/* Header */}
        <div className="p-5 border-b border-[#ebdcd3] bg-[#faf6f2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#c59b27]" />
            <h2 className="font-serif-luxury text-xl font-bold text-[#241d1a]">
              Track Your Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. MSF-7K3QX9AB) or Contact Phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#ebdcd3] rounded-xl focus:outline-none focus:border-[#c59b27] focus:bg-white text-stone-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#1f1d1d] hover:bg-stone-800 text-[#e6c89c] text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* If No order yet */}
          {!order && !error && (
            <div className="text-center py-8 text-stone-500">
              <PackageCheck className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-xs">
                Enter your Order ID from your confirmation email or order screen to track live delivery status.
              </p>
              <div className="mt-3 inline-block text-[11px] bg-[#faf5f0] border border-[#ebdcd3] px-3 py-1 rounded-full text-[#8c6517]">
                Tip: Try demo Order ID: <strong>MSF-10021</strong>
              </div>
            </div>
          )}

          {/* Active Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Status Header Banner */}
              <div className="p-4 rounded-xl bg-[#faf6f2] border border-[#ebdcd3] flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif-luxury text-lg font-bold text-stone-900">
                      Order #{order.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Accepted'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-200 text-stone-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-stone-500">Courier Tracking Code:</div>
                  <div className="text-xs font-mono font-bold text-[#997316]">
                    {order.trackingCode || 'Pending Assignment'}
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-4">
                  Delivery Timeline
                </h4>
                <div className="relative">
                  <div className="space-y-4">
                    {steps.map((st, idx) => {
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={st.key} className="flex items-start gap-3.5 relative">
                          {/* Stepper Dot */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 transition-colors ${
                            isComplete 
                              ? 'bg-[#1f1d1d] text-[#e6c89c] ring-4 ring-[#faf2e6]' 
                              : 'bg-stone-200 text-stone-400'
                          }`}>
                            {isComplete ? <CheckCircle2 className="w-4 h-4 text-[#d4af37]" /> : idx + 1}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between">
                              <h5 className={`text-xs font-bold ${isComplete ? 'text-stone-900' : 'text-stone-400'}`}>
                                {st.label}
                                {isCurrent && (
                                  <span className="ml-2 text-[10px] font-semibold text-[#b07e15] animate-pulse">
                                    (Current Stage)
                                  </span>
                                )}
                              </h5>
                            </div>
                            <p className="text-[11px] text-stone-500">{st.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recipient & Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <h5 className="font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>Shipping Address</span>
                  </h5>
                  <p className="text-stone-700 font-medium">{order.customer?.name}</p>
                  <p className="text-stone-500">{order.customer?.phone}</p>
                  <p className="text-stone-500 mt-1">{order.customer?.address}</p>
                  <p className="text-stone-500 font-medium">{order.customer?.city}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <h5 className="font-bold text-stone-800 mb-1.5">Package Summary</h5>
                  <div className="space-y-1 divide-y divide-stone-200">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1 text-stone-700">
                        <span className="truncate pr-2">{item.name} x {item.quantity}</span>
                        <span className="font-semibold shrink-0">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-300 mt-2 pt-2 flex justify-between font-bold text-stone-900">
                    <span>Total ({order.paymentMethod}):</span>
                    <span className="text-[#997316]">৳{order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Direct Support */}
              <div className="p-3 bg-[#fdfaf5] border border-[#ebdcd3] rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone className="w-4 h-4 text-[#c59b27]" />
                  <span>Need help? Call Masfeeh hotline: <strong>01303-662891</strong></span>
                </div>
                <a
                  href="https://wa.me/8801303662891"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
