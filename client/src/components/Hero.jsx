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
    <section className="relative overflow-hidden pt-4 pb-8 bg-gradient-to-b from-[#faf6f2] via-[#faf7f5] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Style Selector Pill Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#997316] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Redesigned Facebook Cover Banner</span>
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-[#eddcd2] shadow-xs text-xs">
            <span className="text-stone-400 text-[11px] font-medium hidden sm:inline">Cover Style:</span>
            <button
              onClick={() => setActiveCover('luxury')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer text-xs ${
                activeCover === 'luxury'
                  ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              1. Full Boutique Suite
            </button>
            <button
              onClick={() => setActiveCover('minimal')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer text-xs ${
                activeCover === 'minimal'
                  ? 'bg-[#1f1d1d] text-[#e6c89c] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2. Minimalist Monogram
            </button>
          </div>
        </div>

        {/* MAIN REDESIGNED COVER PHOTO BANNER CONTAINER */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-[#eddcd2] bg-stone-950 group">
          {/* Main High-Resolution Redesigned Cover Image */}
          <div className="relative w-full aspect-16/9 sm:aspect-21/9 max-h-[540px] overflow-hidden bg-stone-900">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

            {/* Interactive Bottom Action Bar Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4 text-white">
              <div className="space-y-1.5 max-w-lg drop-shadow-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#f5dfb8] text-[11px] font-bold border border-white/20">
                  <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                  <span>Haute Couture Boutique Collection • Dhaka</span>
                </div>
                <h2 className="font-serif-luxury text-xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                  Little Things... <span className="italic font-normal text-[#f3d99d]">Big Happiness ♡</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 font-light">
                  "We believe in premium, authentic & timeless beauty. Every detail matters. Every choice reflects elegance."
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => onExploreCategory('Bags')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#c59b27] to-[#aa7d18] text-[#1a1715] hover:brightness-110 font-bold text-xs rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Shop Crossbody Bags</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Official Facebook Page Button */}
                <a
                  href={settings?.facebookUrl || "https://www.facebook.com/profile.php?id=61596179578624"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                  title="Visit official Masfeeh Facebook page"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook Page</span>
                </a>

                {/* Official Instagram Page Button (Displays whenever configured by owner!) */}
                {settings?.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                    title="Follow Masfeeh on Instagram"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>
                )}

                {/* Direct High-Res Download for Facebook Cover Photo */}
                <a
                  href={currentCover.image}
                  download={`Masfeeh_Facebook_Cover_${activeCover}.jpg`}
                  className="px-3.5 py-2.5 bg-white/90 hover:bg-white text-stone-900 text-xs font-bold rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                  title="Download this exact cover photo to upload to Facebook"
                >
                  <Download className="w-3.5 h-3.5 text-[#997316]" />
                  <span className="hidden md:inline">Download Cover (1920x1080)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Brand Guarantee Pillars (Authentic to Masfeeh) */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#ede0d7] shadow-xs flex items-center gap-3 hover:border-[#c59b27] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">Fast Delivery</h4>
              <p className="text-[11px] text-stone-500">Dhaka 24-48h • All BD 2-3d</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede0d7] shadow-xs flex items-center gap-3 hover:border-[#c59b27] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">Trusted Shop</h4>
              <p className="text-[11px] text-stone-500">Bashundhara R/A, Dhaka</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede0d7] shadow-xs flex items-center gap-3 hover:border-[#c59b27] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">Shop Confidently</h4>
              <p className="text-[11px] text-stone-500">Cash on Delivery & bKash</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede0d7] shadow-xs flex items-center gap-3 hover:border-[#c59b27] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#fdf5e6] text-[#b07e15] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2d2420]">Dual Belts</h4>
              <p className="text-[11px] text-stone-500">Long & short strap included</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
