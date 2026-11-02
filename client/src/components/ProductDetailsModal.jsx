import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Modal, QuantityStepper, formatPrice, ProductImage } from './ui';

function Disclosure({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-line">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 label text-ink"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={1.25} />
      </button>
      {open && <div className="pb-5 text-[14px] leading-relaxed text-muted anim-fade">{children}</div>}
    </div>
  );
}

export default function ProductDetailsModal({ product, inBag = 0, onClose, onAddToBag, onBuyNow, settings }) {
  const images = product && product.images && product.images.length ? product.images : product ? [product.image] : [];
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const available = Math.max(0, product.stock - inBag);
  const soldOut = product.stock <= 0;
  const onSale = product.originalPrice && product.originalPrice > product.price;

  return (
    <Modal open onClose={onClose} label={product.name}>
      <div className="grid md:grid-cols-2">
        {/* Gallery */}
        <div className="bg-sand md:flex md:flex-col">
          <div className="aspect-square md:aspect-auto md:flex-1 md:min-h-[520px] overflow-hidden">
            <ProductImage src={images[active]} alt={product.name} className="w-full h-full object-cover anim-fade" key={active} />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`w-16 h-16 overflow-hidden border transition-opacity ${i === active ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <ProductImage src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-6 sm:px-10 py-10 md:py-12 flex flex-col">
          <p className="label text-muted">{product.category}</p>
          <h2 className="mt-3 font-display text-[32px] sm:text-[38px] leading-[1.08] text-ink">{product.name}</h2>
          <p className="mt-4 text-[17px] font-normal text-ink tabular-nums">
            {formatPrice(product.price)}
            {onSale && <span className="ml-3 text-muted line-through font-light">{formatPrice(product.originalPrice)}</span>}
          </p>

          {product.description && (
            <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
          )}

          <div className="mt-8">
            {soldOut ? (
              <p className="label text-muted">Sold out</p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={Math.max(1, available)} />
                  {product.stock <= 5 && (
                    <span className="text-[13px] text-brass">Only {product.stock} left</span>
                  )}
                </div>
                <div className="mt-5 grid gap-3">
                  <button
                    className="btn-primary w-full"
                    disabled={available <= 0}
                    onClick={() => { onAddToBag(product, quantity); onClose(); }}
                  >
                    {available <= 0 ? 'All available pieces are in your bag' : 'Add to bag'}
                  </button>
                  <button
                    className="btn-outline w-full"
                    disabled={available <= 0 && inBag <= 0}
                    onClick={() => onBuyNow(product, available > 0 ? quantity : 0)}
                  >
                    Buy now
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-10">
            {product.features && product.features.length > 0 && (
              <Disclosure title="Details" defaultOpen>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex gap-3"><span className="text-brass">—</span><span>{f}</span></li>
                  ))}
                </ul>
              </Disclosure>
            )}
            <Disclosure title="Delivery & payment">
              <p>
                Inside Dhaka {formatPrice(settings?.shippingDhaka ?? 70)}, 1–2 days. Outside Dhaka{' '}
                {formatPrice(settings?.shippingOutsideDhaka ?? 130)}, 2–3 days.
                {Number(settings?.freeShippingThreshold) > 0 && (
                  <> Complimentary delivery on orders over {formatPrice(settings.freeShippingThreshold)}.</>
                )}
              </p>
              <p className="mt-2">Pay in cash when your order arrives, or in advance with bKash or Nagad.</p>
            </Disclosure>
            <div className="border-t border-line" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
