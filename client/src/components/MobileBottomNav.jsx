import React from 'react';
import { Home, Search, Package, User, ShoppingBag } from 'lucide-react';

export default function MobileBottomNav({ cartCount, onHome, onSearch, onTrack, onAccount, onBag, account }) {
  const items = [
    { label: 'Shop', icon: Home, onClick: onHome },
    { label: 'Search', icon: Search, onClick: onSearch },
    { label: 'Track', icon: Package, onClick: onTrack },
    { label: account ? 'Account' : 'Sign in', icon: User, onClick: onAccount },
    { label: 'Bag', icon: ShoppingBag, onClick: onBag, badge: cartCount }
  ];

  return (
    <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-t border-line pb-safe">
      <ul className="grid grid-cols-5">
        {items.map(({ label, icon: Icon, onClick, badge }) => (
          <li key={label}>
            <button onClick={onClick} className="w-full flex flex-col items-center gap-1 pt-2.5 pb-1.5 text-ink/80 active:text-ink">
              <span className="relative">
                <Icon className="w-5 h-5" strokeWidth={1.25} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-ink text-paper text-[9px] leading-4 text-center tabular-nums">
                    {badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] tracking-[0.08em] uppercase">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
