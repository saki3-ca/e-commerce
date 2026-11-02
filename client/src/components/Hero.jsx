import React, { useState } from 'react';
import { Sparkles, Truck, ShieldCheck, HeartHandshake, ArrowRight, Star, Camera, Download, Eye, Layers } from 'lucide-react';

export default function Hero({ onExploreCategory, settings }) {
  // Allow toggling between the two redesigned luxury cover styles
  const [activeCover, setActiveCover] = useState('luxury'); // 'luxury' or 'minimal'

  const covers = {
    luxury: {
      title: 'Full Boutique Suite Edition',
      image: '/assets/masfeeh_cover_luxury.jpg',
      subtitle: 'Features Signature Bag, Press-on Nails, Pearl Clips & Gold Rings'
    },
    minimal: {
      title: 'Monogram Haute Couture Edition',
      image: '/assets/masfeeh_cover_minimal.jpg',
      subtitle: 'Clean Parisian Monogram Leather Bag & Flowing Silk'
    }
  };

  const currentCover = covers[activeCover];

  return (
    <section className="relative overflow-hidden pt-2 sm:pt-4 pb-6 sm:pb-8 bg-gradient-to-b from-[#faf6f2] via-[#faf7f5] to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Style Selector Pill Bar (Subtle on mobile) */}
        <div className="flex flex-row justify-between items-center gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#997316] flex items-center gap-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Haute Couture Collection</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white px-2 py-0.5 sm:py-1 rounded-full border border-[#eddcd2] shadow-xs text-[10px] sm:text-xs">
            <button
              onClick={() => setActiveCover('luxury')}
              className={`px-2.5 py-0.5 sm:py-1 rounded-full font-bold transition-all cursor-pointer ${
                activeCover === 'luxury'
                  ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Suite
            </button>
            <button
              onClick={() => setActiveCover('minimal')}
              className={`px-2.5 py-0.5 sm:py-1 rounded-full font-bold transition-all cursor-pointer ${
                activeCover === 'minimal'
                  ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Minimal
            </button>
          </div>
        </div>

        {/* MAIN REDESIGNED COVER PHOTO BANNER CONTAINER */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-[#eddcd2] sm:border-2 bg-stone-950 group">
          {/* Main High-Resolution Redesigned Cover Image with dynamic responsive height */}
          <div className="relative w-full min-h-[300px] xs:min-h-[340px] sm:min-h-[400px] md:min-h-[460px] aspect-[4/3] sm:aspect-21/9 overflow-hidden bg-stone-900">
            <img
              src={currentCover.image}
              alt="Masfeeh Redesigned Luxury Cover"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/banner.jpg';
              }}
            />

            {/* Subtle Gradient Vignette Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

            {/* Interactive Bottom Action Bar Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-4 text-white">
              <div className="space-y-1 sm:space-y-1.5 max-w-lg drop-shadow-md">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[#f5dfb8] text-[10px] sm:text-[11px] font-bold border border-white/20">
                  <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                  <span>Exclusive Boutique • Dhaka</span>
                </div>
                <h2 className="font-serif-luxury text-xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                  Little Things... <span className="italic font-normal text-[#f3d99d]">Big Happiness ♡</span>
                </h2>
                <p className="text-[11px] sm:text-sm text-stone-200 line-clamp-2 font-light">
                  "We believe in premium, authentic & timeless beauty. Every detail matters."
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 pt-1 sm:pt-0">
                <button
                  onClick={() => onExploreCategory('Bags')}
                  className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#c59b27] to-[#aa7d18] text-[#1a1715] hover:brightness-110 font-bold text-xs rounded-full shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Shop Crossbody Bags</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Official Facebook Page Button */}
                <a
                  href={settings?.facebookUrl || "https://www.facebook.com/profile.php?id=61596179578624"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 sm:px-4 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Official Facebook Page"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>FB Page</span>
                </a>

                {/* Direct High-Res Download (Hidden on small mobile) */}
                <a
                  href={currentCover.image}
                  download={`Masfeeh_Facebook_Cover_${activeCover}.jpg`}
                  className="hidden md:flex px-3.5 py-2.5 bg-white/90 hover:bg-white text-stone-900 text-xs font-bold rounded-full shadow-md transition-all items-center gap-1.5 cursor-pointer hover:scale-105"
                  title="Download Facebook cover photo"
                >
                  <Download className="w-3.5 h-3.5 text-[#997316]" />
                  <span>Cover Photo</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Brand Guarantee Pillars (Mobile-Optimized Grid) */}
        <div className="mt-3 sm:mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-[#ede0d7] shadow-xs flex items-center gap-2.5 hover:border-[#c59b27] transition-all">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">Fast Delivery</h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500">Dhaka 24-48h • All BD</p>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-[#ede0d7] shadow-xs flex items-center gap-2.5 hover:border-[#c59b27] transition-all">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">Trusted Shop</h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500">Bashundhara, Dhaka</p>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-[#ede0d7] shadow-xs flex items-center gap-2.5 hover:border-[#c59b27] transition-all">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">COD Available</h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500">Cash on Delivery & bKash</p>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-[#ede0d7] shadow-xs flex items-center gap-2.5 hover:border-[#c59b27] transition-all">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">Dual Belts</h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500">Long & short strap</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
