import React from 'react';
import { Plus } from 'lucide-react';
import { formatPrice, ProductImage } from './ui';
import Reveal from './Reveal';

export default function ProductCard({ product, onSelect, onQuickAdd, index = 0 }) {
  const soldOut = product.stock <= 0;
  const onSale = product.originalPrice && product.originalPrice > product.price;
  const secondPhoto = (product.images || []).find(u => u && u !== product.image);

  return (
    <Reveal as="article" delay={(index % 3) * 90} className="group">
      <div className="relative overflow-hidden bg-sand aspect-square">
        <button
          onClick={() => onSelect(product)}
          className="block w-full h-full"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-[1.04] ${soldOut ? 'opacity-60' : ''}`}
          />
          {/* Second photo fades in on hover (desktop) */}
          {secondPhoto && (
            <img
              src={secondPhoto}
              alt=""
              loading="lazy"
              className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            />
          )}
        </button>

        {(product.badge || soldOut) && (
          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 bg-paper/90 px-2 sm:px-2.5 py-1 label text-[8.5px] sm:text-[9.5px] text-ink pointer-events-none">
            {soldOut ? 'Sold out' : product.badge}
          </span>
        )}

        {/* Desktop quick add */}
        {!soldOut && (
          <button
            onClick={() => onQuickAdd(product)}
            className="hidden md:flex absolute inset-x-0 bottom-0 h-12 items-center justify-center bg-paper/95 label text-ink translate-y-full group-hover:translate-y-0 focus-visible:translate-y-0 transition-transform duration-500 ease-[var(--ease-lux)] hover:bg-paper"
          >
            Add to bag
          </button>
        )}
      </div>

      <div className="pt-3 sm:pt-4 flex items-start justify-between gap-2 sm:gap-3">
        <button onClick={() => onSelect(product)} className="text-left min-w-0">
          <p className="label text-[10px] text-muted">{product.category}</p>
          <h3 className="mt-1 sm:mt-1.5 font-display text-[16px] sm:text-[19px] leading-snug text-ink line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-[14px] font-normal text-ink tabular-nums">
            {formatPrice(product.price)}
            {onSale && (
              <span className="ml-2 text-muted line-through font-light">{formatPrice(product.originalPrice)}</span>
            )}
          </p>
        </button>
        {!soldOut && (
          <button
            onClick={() => onQuickAdd(product)}
            aria-label={`Add ${product.name} to bag`}
            className="md:hidden mt-4 shrink-0 w-8 h-8 border border-line flex items-center justify-center text-ink active:bg-sand"
          >
            <Plus className="w-4 h-4" strokeWidth={1.25} />
          </button>
        )}
      </div>
    </Reveal>
  );
}
