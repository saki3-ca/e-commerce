import React from 'react';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Sparkles, Truck, PackageCheck, UserCheck } from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenTrack, onToggleAdmin, settings }) {
  return (
    <footer className="bg-[#1a1716] text-[#ded6cf] pt-14 pb-8 border-t border-[#332a24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#c59b27] to-[#e6c89c] shadow-xs">
                <img src="/assets/avatar.jpg" alt="Masfeeh" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="font-serif-luxury text-2xl font-bold tracking-wider text-[#faf5ee]">
                  Masfeeh
                </span>
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#c59b27]">
                  Accessorize Your World
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed font-light">
              "We believe in premium, authentic & timeless beauty. Every detail matters. Every choice reflects elegance."
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs text-[#e6c89c]">
              <span>👑</span>
              <span>Little Things... Big Happiness ♡</span>
            </div>

            {/* Social Media Links (Facebook & Configurable Instagram) */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href={settings?.facebookUrl || "https://www.facebook.com/profile.php?id=61596179578624"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
                title="Official Masfeeh Facebook Page"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {settings?.instagramUrl ? (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] hover:opacity-90 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
                  title="Official Masfeeh Instagram Page"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              ) : (
                <span className="text-[10px] text-stone-500 italic">
                  (Instagram configurable in Admin)
                </span>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#faf5ee] mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onSelectCategory('Bags')} className="hover:text-[#d4af37] transition-colors cursor-pointer">
                  Crossbody Bags (Dual Belts)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Hair Accessories')} className="hover:text-[#d4af37] transition-colors cursor-pointer">
                  Hair Accessories & Clips
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Fake Nails')} className="hover:text-[#d4af37] transition-colors cursor-pointer">
                  Luxury Press-on Nails
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Rings')} className="hover:text-[#d4af37] transition-colors cursor-pointer">
                  Stacking Rings & Jewelry
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Bangles & More')} className="hover:text-[#d4af37] transition-colors cursor-pointer">
                  Bangles & Kada Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Tracking */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#faf5ee] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={onOpenTrack} className="hover:text-[#d4af37] flex items-center gap-1.5 transition-colors cursor-pointer">
                  <PackageCheck className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <span>Delivery: 24-48 Hours (Dhaka)</span>
              </li>
              <li>
                <span>Payment: Cash on Delivery & bKash</span>
              </li>
              <li>
                <span>Authentic Quality Guarantee</span>
              </li>
              <li className="pt-2">
                <button 
                  onClick={onToggleAdmin}
                  className="text-[11px] text-[#c59b27] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Owner Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Store Location & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#faf5ee] mb-4">
              Contact Masfeeh
            </h4>
            <ul className="space-y-3 text-xs text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <span>{settings?.address || 'Bashundhara R/A, Dhaka, Bangladesh'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href={`tel:${settings?.ownerPhone || '01303-662891'}`} className="hover:text-[#d4af37]">
                  {settings?.ownerPhone || '01303-662891'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href={`mailto:${settings?.ownerEmail || 'maishamonsura@gmail.com'}`} className="hover:text-[#d4af37] truncate">
                  {settings?.ownerEmail || 'maishamonsura@gmail.com'}
                </a>
              </li>
              <li className="pt-1">
                <span className="inline-block px-2.5 py-1 rounded bg-[#2a2420] text-[#e6c89c] text-[11px] border border-[#3e342c]">
                  ⏰ Always Open • Online Boutique
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} Masfeeh. All rights reserved. Accessorize Your World.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>bKash</span>
            <span>•</span>
            <span>Nagad</span>
            <span>•</span>
            <span>Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
