import React from 'react';

export default function Hero({ onShop, onShopCategory }) {
  return (
    <section className="border-b border-line">
      <div className="grid md:grid-cols-2 md:min-h-[640px]">
        {/* Words */}
        <div className="order-2 md:order-1 flex flex-col justify-center px-6 sm:px-12 lg:pr-16 lg:pl-[max(4rem,calc((100vw-80rem)/2+2rem))] py-14 md:py-20">
          <p className="label text-brass anim-rise">The Signature Collection</p>
          <h1
            className="mt-6 font-display font-normal text-[46px] leading-[1.02] sm:text-[64px] lg:text-[78px] tracking-[-0.01em] text-ink anim-rise"
            style={{ animationDelay: '80ms' }}
          >
            Little things,
            <br />
            <em className="font-normal italic text-ink-soft">big happiness.</em>
          </h1>
          <p
            className="mt-7 max-w-md text-[15px] leading-relaxed text-muted anim-rise"
            style={{ animationDelay: '160ms' }}
          >
            Bags, jewellery and finishing touches, chosen piece by piece in Dhaka and
            delivered to your door anywhere in Bangladesh.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 anim-rise" style={{ animationDelay: '240ms' }}>
            <button onClick={onShop} className="btn-primary">Shop the collection</button>
            <button onClick={() => onShopCategory('Bags')} className="label link-underline text-ink">
              Discover bags
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="order-1 md:order-2 relative bg-sand overflow-hidden aspect-[4/5] md:aspect-auto">
          <img
            src="/assets/hero-fiom.jpg"
            alt="Masfeeh monogram crossbody bag held against a warm wall"
            className="absolute inset-0 w-full h-full object-cover anim-fade"
            fetchpriority="high"
          />
        </div>
      </div>

      {/* Service notes */}
      <div className="border-t border-line">
        <ul className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
          {[
            ['Delivery nationwide', 'Dhaka in 1–2 days, rest of Bangladesh in 2–3'],
            ['Cash on delivery', 'Or pay ahead with bKash and Nagad'],
            ['Inspected by hand', 'Every piece is checked before it is wrapped']
          ].map(([title, text]) => (
            <li key={title} className="px-6 sm:px-8 py-6 text-center">
              <p className="label text-ink">{title}</p>
              <p className="mt-1.5 text-[13px] text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
