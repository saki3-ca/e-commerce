import React from 'react';
import BrandLogo from './BrandLogo';

export default function Footer({ categories, onSelectCategory, onOpenTrack, onOpenAccount, settings }) {
  const phone = settings?.ownerPhone;
  const email = settings?.ownerEmail;
  const shopCategories = categories.filter(c => c !== 'All');

  return (
    <footer className="bg-night text-paper/70 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-20 pb-12">
        <div className="flex flex-col items-center text-center">
          <BrandLogo variant="dark" size="lg" showTagline />
          <p className="mt-8 max-w-md text-[14px] leading-relaxed text-paper/55">
            Premium, authentic and timeless. Every detail matters; every choice reflects elegance.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-[14px]">
          <div>
            <p className="label text-paper">Shop</p>
            <ul className="mt-5 space-y-3">
              {shopCategories.map(c => (
                <li key={c}>
                  <button onClick={() => onSelectCategory(c)} className="hover:text-paper transition-colors">{c}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-paper">Client services</p>
            <ul className="mt-5 space-y-3">
              <li><button onClick={onOpenTrack} className="hover:text-paper transition-colors">Track an order</button></li>
              <li><button onClick={onOpenAccount} className="hover:text-paper transition-colors">Your account</button></li>
              <li className="text-paper/50">Cash on delivery · bKash · Nagad</li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="label text-paper">Contact</p>
            <ul className="mt-5 space-y-3">
              {phone && <li><a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-paper transition-colors">{phone}</a></li>}
              {email && <li><a href={`mailto:${email}`} className="hover:text-paper transition-colors">{email}</a></li>}
              {settings?.address && <li className="text-paper/50">{settings.address}</li>}
            </ul>
          </div>

          <div>
            <p className="label text-paper">Follow</p>
            <ul className="mt-5 space-y-3">
              {settings?.facebookUrl && (
                <li><a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-paper transition-colors">Facebook</a></li>
              )}
              {settings?.instagramUrl && (
                <li><a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-paper transition-colors">Instagram</a></li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-paper/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-paper/40">
          <p>© {new Date().getFullYear()} Masfeeh · Dhaka, Bangladesh</p>
          <a href="/admin" className="hover:text-paper/70 transition-colors">Staff login</a>
        </div>
      </div>
    </footer>
  );
}
