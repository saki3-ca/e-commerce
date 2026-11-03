import React from 'react';

export default function Hero({ onShop, onShopCategory }) {
  return (
    <section className="border-b border-line">
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-12 sm:pt-20 sm:pb-20 text-center">
        <p className="label text-brass anim-rise">The Signature Collection</p>
        <h1
          className="mt-4 sm:mt-6 font-display font-normal text-[40px] leading-[1.05] sm:text-[60px] lg:text-[72px] tracking-[-0.01em] text-ink anim-rise"
          style={{ animationDelay: '80ms' }}
        >
          Little things, <em className="italic text-ink-soft">big happiness.</em>
        </h1>
        <p
          className="mt-4 sm:mt-6 mx-auto max-w-md text-[14px] sm:text-[15px] leading-relaxed text-muted anim-rise"
          style={{ animationDelay: '160ms' }}
        >
          Bags, jewellery and finishing touches, chosen piece by piece in Dhaka and
          delivered to your door anywhere in Bangladesh.
        </p>
        <div
          className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 anim-rise"
          style={{ animationDelay: '240ms' }}
        >
          <button onClick={onShop} className="btn-primary w-full sm:w-auto">Shop the collection</button>
          <button onClick={() => onShopCategory('Bags')} className="label link-underline text-ink">
            Discover bags
          </button>
        </div>
      </div>

      {/* Service notes */}
      <div className="border-t border-line">
        <ul className="max-w-7xl mx-auto grid grid-cols-3 divide-x divide-line">
          {[
            ['Delivery nationwide', 'Dhaka in 1–2 days, rest of Bangladesh in 2–3'],
            ['Cash on delivery', 'Or pay ahead with bKash and Nagad'],
            ['Inspected by hand', 'Every piece is checked before it is wrapped']
          ].map(([title, text]) => (
            <li key={title} className="px-2 sm:px-8 py-4 sm:py-5 text-center">
              <p className="label text-[9.5px] sm:text-[11px] text-ink">{title}</p>
              <p className="hidden sm:block mt-1.5 text-[13px] text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
