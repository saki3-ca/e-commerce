import React from 'react';
import { ArrowRight, Star, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Hero({ onExploreCategory, settings }) {
  // Locked to the requested "Full Boutique Suite" luxury cover
  const coverImage = '/assets/masfeeh_cover_luxury.jpg';

  return (
    <section className="relative overflow-hidden pt-1.5 sm:pt-4 pb-4 sm:pb-8 bg-gradient-to-b from-[#faf6f2] via-[#faf7f5] to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* COMPACT & SLEEK LUXURY BANNER CONTAINER */}
        <div className="relative rounded-xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-2xl border border-[#eddcd2] sm:border-2 bg-stone-950 group">
          {/* Cover image with compact height on mobile (170px-200px) */}
          <div className="relative w-full h-[175px] xs:h-[200px] sm:h-[290px] md:h-[380px] overflow-hidden bg-stone-900">
            <img
              src={coverImage}
              alt="Masfeeh Boutique Suite Luxury Cover"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/banner.jpg';
              }}
            />

            {/* Subtle Gradient Vignette for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Content & Actions Overlay */}
            <div className="absolute inset-0 p-3 sm:p-7 flex flex-col justify-end sm:justify-between text-white">
              {/* Top Badge (Hidden on very small mobile to let artwork breathe) */}
              <div className="hidden sm:inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#f5dfb8] text-xs font-bold border border-white/15">
                <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                <span>Haute Couture Boutique Collection • Dhaka</span>
              </div>

              {/* Bottom Action Row */}
              <div className="flex items-end justify-between gap-3">
                {/* Desktop Headline & Slogan (Hidden on compact mobile since it's already on the image artwork) */}
                <div className="hidden sm:block space-y-1 max-w-lg drop-shadow-md">
                  <h2 className="font-serif-luxury text-2xl md:text-3xl font-bold text-white leading-tight">
                    Little Things... <span className="italic font-normal text-[#f3d99d]">Big Happiness ♡</span>
                  </h2>
                  <p className="text-xs md:text-sm text-stone-200 line-clamp-1 font-light">
                    "We believe in premium, authentic & timeless beauty."
                  </p>
                </div>

                {/* Mobile & Desktop Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => onExploreCategory('Bags')}
                    className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#d4af37] via-[#c59b27] to-[#aa7d18] text-[#1a1715] hover:brightness-110 font-bold text-xs sm:text-xs rounded-full shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Shop Bags</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={settings?.facebookUrl || "https://www.facebook.com/profile.php?id=61596179578624"}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Official Facebook Page"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>FB Page</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Brand Guarantee Pillars (Compact & Clean) */}
        <div className="mt-2.5 sm:mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
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
