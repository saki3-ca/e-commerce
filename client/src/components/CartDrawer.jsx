import React, { useEffect, useState } from 'react';
import { Drawer, QuantityStepper, formatPrice, ProductImage, Spinner } from './ui';
import { useQuote } from '../hooks/useQuote';

export default function CartDrawer({
  open,
  onClose,
  items, // [{ product, quantity }]
  lines, // [{ id, quantity }]
  onSetQuantity,
  onRemove,
  coupon,
  setCoupon,
  onCheckout,
  onContinue
}) {
  const [code, setCode] = useState(coupon || '');
  useEffect(() => { setCode(coupon || ''); }, [coupon]);

  const { quote, loading } = useQuote(lines, { coupon, enabled: open });
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = quote ? quote.subtotal : items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const threshold = quote ? quote.freeShippingThreshold : 0;
  const remaining = threshold > 0 ? Math.max(0, threshold - subtotal) : 0;
  const stockIssue = quote && quote.problems && quote.problems.find(p => p.reason === 'stock');

  const footer = items.length > 0 && (
    <div className="space-y-4">
      {/* Coupon */}
      <form
        onSubmit={e => { e.preventDefault(); setCoupon(code.trim().toUpperCase()); }}
        className="flex items-end gap-3"
      >
        <label className="flex-1">
          <span className="field-label">Gift or promo code</span>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            className="field mt-0.5 uppercase tracking-wider"
            aria-label="Promo code"
          />
        </label>
        {coupon && quote && quote.coupon ? (
          <button type="button" onClick={() => { setCoupon(''); setCode(''); }} className="label text-muted hover:text-ink pb-3">
            Remove
          </button>
        ) : (
          <button type="submit" className="label text-ink link-underline mb-3" disabled={!code.trim()}>
            Apply
          </button>
        )}
      </form>
      {coupon && quote && quote.couponError && <p className="text-[13px] text-danger -mt-2">{quote.couponError}</p>}

      <dl className="space-y-2 text-[14px]">
        <div className="flex justify-between text-muted">
          <dt>Subtotal</dt><dd className="tabular-nums text-ink">{formatPrice(subtotal)}</dd>
        </div>
        {quote && quote.discount > 0 && (
          <div className="flex justify-between text-muted">
            <dt>{quote.coupon.code} ({quote.coupon.percent}% off)</dt>
            <dd className="tabular-nums text-ink">−{formatPrice(quote.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-muted">
          <dt>Delivery</dt>
          <dd>{remaining === 0 && threshold > 0 ? 'Complimentary' : 'Calculated at checkout'}</dd>
        </div>
      </dl>

      <button className="btn-primary w-full" onClick={onCheckout} disabled={Boolean(stockIssue)}>
        {loading ? <Spinner /> : 'Checkout'}
      </button>
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title={`Your bag${count ? ` (${count})` : ''}`} footer={footer}>
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-10 py-24">
          <p className="font-display text-[28px] text-ink">Your bag is empty</p>
          <p className="mt-3 text-[14px] text-muted">Pieces you add will wait for you here.</p>
          <button onClick={onContinue} className="btn-outline mt-10">Continue shopping</button>
        </div>
      ) : (
        <div className="px-6 sm:px-8">
          {threshold > 0 && (
            <div className="py-5 border-b border-line">
              <p className="text-[13px] text-muted">
                {remaining > 0
                  ? <>You are {formatPrice(remaining)} away from complimentary delivery.</>
                  : 'Your order qualifies for complimentary delivery.'}
              </p>
              <div className="mt-3 h-px bg-line relative">
                <div
                  className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-700"
                  style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <ul className="divide-y divide-line">
            {items.map(({ product, quantity }) => {
              const short = quote && quote.problems && quote.problems.find(p => p.id === product.id && p.reason === 'stock');
              return (
                <li key={product.id} className="py-6 flex gap-5">
                  <div className="w-24 h-24 shrink-0 bg-sand overflow-hidden">
                    <ProductImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <h3 className="font-display text-[18px] leading-snug text-ink">{product.name}</h3>
                      <p className="text-[14px] tabular-nums text-ink shrink-0">{formatPrice(product.price * quantity)}</p>
                    </div>
                    {short && (
                      <p className="mt-1 text-[13px] text-danger">
                        {short.available > 0 ? `Only ${short.available} available` : 'Sold out'}
                      </p>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <QuantityStepper
                        size="sm"
                        value={quantity}
                        min={1}
                        max={Math.max(1, Math.min(10, product.stock))}
                        onChange={q => onSetQuantity(product.id, q)}
                      />
                      <button onClick={() => onRemove(product.id)} className="label text-[10px] text-muted hover:text-ink">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
