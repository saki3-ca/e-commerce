import React from 'react';
import Reveal from './Reveal';
import { ProductImage } from './ui';

// Preferred cover image per category; falls back to the category's first product
const COVERS = {
  Bags: '/assets/products/golden-crest-crossbody.jpg',
  Rings: '/assets/products/demo-ring-carnelian.jpg',
  'Fake Nails': '/assets/products/demo-nails-gilded-marble.jpg',
  'Bangles & More': '/assets/products/demo-bangle-filigree-cuff.jpg',
  'Hair Accessories': '/assets/products/demo-hair-gilded-blossom.jpg'
};

export default function CategoryTiles({ categories, products, onSelect }) {
  const tiles = categories
    .filter(c => c !== 'All')
    .map(c => {
      const items = products.filter(p => p.category === c);
      return { name: c, count: items.length, image: COVERS[c] || (items[0] && items[0].image) };
    })
    .filter(t => t.count > 0);

  if (tiles.length === 0) return null;

  return (
    <section className="pt-10 sm:pt-20" aria-labelledby="shop-by-category">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-8 flex items-end justify-between">
        <div>
          <p className="label text-brass">Explore</p>
          <h2 id="shop-by-category" className="mt-2 sm:mt-3 font-display text-[28px] sm:text-[40px] leading-none text-ink">
            Shop by category
          </h2>
        </div>
        <p className="hidden sm:block text-[13px] text-muted">{tiles.length} collections</p>
      </Reveal>

      {/* Swipeable row on mobile, grid on desktop */}
      <div className="mt-6 sm:mt-10 max-w-7xl mx-auto">
        <ul className="flex sm:grid sm:grid-cols-5 gap-3 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-8 pb-1">
          {tiles.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 80} className="snap-start shrink-0 w-[44%] sm:w-auto">
              <button onClick={() => onSelect(t.name)} className="group block w-full text-left" aria-label={`Shop ${t.name}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  <ProductImage
                    src={t.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-lux)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-paper">
                    <p className="font-display text-[19px] sm:text-[22px] leading-tight">{t.name}</p>
                    <p className="mt-1 label text-[9.5px] text-paper/80">
                      {t.count} {t.count === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
