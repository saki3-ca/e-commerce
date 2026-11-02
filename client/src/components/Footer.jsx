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
              <li>
                <button onClick={() => onSelectCategory('Photos & Lookbook')} className="text-[#e6c89c] hover:text-[#d4af37] transition-colors cursor-pointer font-semibold flex items-center gap-1.5">
                  <span>📸 Photos & Lookbook</span>
                </button>
              </li>
              <li className="pt-1">
                <a 
                  href="https://www.facebook.com/people/Masfeeh/61596179578624/?sk=photos"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1877f2] transition-colors flex items-center gap-1 text-[11px]"
                >
                  <span>Facebook Photos Gallery</span>
                  <span>↗</span>
                </a>
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
