import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal, Field, formatPrice, ProductImage, Spinner, QuantityStepper } from './ui';
import { useQuote } from '../hooks/useQuote';
import { api } from '../services/api';

const AREAS = ['Inside Dhaka', 'Outside Dhaka'];

function emptyForm(account) {
  return {
    name: account?.name || '',
    phone: account?.phone || '',
    email: account?.email || '',
    address: account?.address || '',
    city: account?.city || 'Inside Dhaka',
    notes: '',
    paymentMethod: 'Cash on Delivery',
    trxId: ''
  };
}

export default function CheckoutModal({
  open,
  onClose,
  items,
  lines,
  onSetQuantity,
  onRemove,
  coupon,
  settings,
  account,
  onSignIn,
  onPlaced,
  onTrack
}) {
  const [form, setForm] = useState(() => emptyForm(account));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(null);

  // Fresh form every time checkout opens (prefilled for signed-in shoppers)
  useEffect(() => {
    if (open) {
      setForm(emptyForm(account));
      setError('');
      setPlaced(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Account loaded while checkout is open: fill blanks only
  useEffect(() => {
    if (!open || !account) return;
    setForm(f => ({
      ...f,
      name: f.name || account.name || '',
      phone: f.phone || account.phone || '',
      email: f.email || account.email || '',
      address: f.address || account.address || ''
    }));
  }, [account, open]);

  const { quote, loading } = useQuote(lines, { city: form.city, coupon, enabled: open && !placed });
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please complete your name, phone number and delivery address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createOrder({
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city,
          notes: form.notes.trim()
        },
        items: lines,
        coupon: coupon || undefined,
        paymentMethod: form.paymentMethod,
        trxId: form.paymentMethod === 'Mobile Banking' ? form.trxId.trim() : undefined
      });
      setPlaced(res.order);
      onPlaced(res.order);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  if (placed) {
    return (
      <Modal open onClose={onClose} label="Order confirmed" size="max-w-xl">
        <div className="px-8 sm:px-14 py-16 text-center">
          <p className="label text-brass">Thank you</p>
          <h2 className="mt-5 font-display text-[40px] leading-tight text-ink">Your order is placed</h2>
          <p className="mt-5 text-[15px] text-muted leading-relaxed">
            Order <span className="text-ink font-normal tracking-wide">{placed.id}</span> has been received.
            We will call you on {placed.customer.phone} to confirm before it is dispatched.
          </p>
          {placed.customer.email && (
            <p className="mt-2 text-[14px] text-muted">A confirmation will be sent to {placed.customer.email}.</p>
          )}
          <dl className="mt-10 border-y border-line divide-y divide-line text-[14px] text-left">
            <div className="flex justify-between py-3"><dt className="text-muted">Total</dt><dd className="tabular-nums">{formatPrice(placed.total)}</dd></div>
            <div className="flex justify-between py-3 gap-6"><dt className="text-muted">Payment</dt><dd className="text-right">{placed.paymentMethod}</dd></div>
            <div className="flex justify-between py-3 gap-6"><dt className="text-muted">Deliver to</dt><dd className="text-right">{placed.customer.address}, {placed.customer.city}</dd></div>
          </dl>
          <p className="mt-6 text-[13px] text-muted">Keep your order number to track delivery at any time.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-primary" onClick={() => onTrack(placed.id)}>Track this order</button>
            <button className="btn-outline" onClick={onClose}>Continue shopping</button>
          </div>
        </div>
      </Modal>
    );
  }

  const mobileNumber = settings?.mobileBankingNumber || settings?.ownerPhone;
  const stockIssue = quote && quote.problems && quote.problems.find(p => p.reason === 'stock');

  return (
    <Modal open onClose={onClose} label="Checkout" size="max-w-6xl">
      <form onSubmit={submit} className="grid lg:grid-cols-[1.25fr_1fr]">
        {/* Details */}
        <div className="px-6 sm:px-12 py-12">
          <h2 className="font-display text-[36px] leading-none text-ink">Checkout</h2>
          {!account && (
            <p className="mt-4 text-[14px] text-muted">
              Checking out as a guest.{' '}
              <button type="button" onClick={onSignIn} className="link-underline text-ink">Sign in</button>{' '}
              to use your saved details.
            </p>
          )}

          <fieldset className="mt-10">
            <legend className="label text-ink">Contact</legend>
            <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-6">
              <Field label="Full name" name="name" value={form.name} onChange={set} autoComplete="name" required />
              <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={set} autoComplete="tel" placeholder="01XXX-XXXXXX" required />
              <Field
                className="sm:col-span-2"
                label="Email (for order updates, optional)"
                name="email"
                type="email"
                value={form.email}
                onChange={set}
                autoComplete="email"
              />
            </div>
          </fieldset>

          <fieldset className="mt-12">
            <legend className="label text-ink">Delivery</legend>
            <div className="mt-5 grid gap-y-6">
              <Field label="Address" as="textarea" rows={2} name="address" value={form.address} onChange={set} autoComplete="street-address" placeholder="House, road, area" required />
              <div className="grid sm:grid-cols-2 gap-3">
                {AREAS.map(area => {
                  const fee = area === 'Inside Dhaka' ? settings?.shippingDhaka : settings?.shippingOutsideDhaka;
                  const active = form.city === area;
                  return (
                    <label key={area} className={`flex items-center justify-between gap-3 border px-4 py-4 transition-colors ${active ? 'border-ink' : 'border-line hover:border-muted'}`}>
                      <span className="flex items-center gap-3">
                        <input type="radio" name="city" value={area} checked={active} onChange={set} className="accent-[var(--color-ink)]" />
                        <span className="text-[14px] text-ink">{area}</span>
                      </span>
                      <span className="text-[13px] text-muted tabular-nums">
                        {fee !== undefined ? formatPrice(fee) : ''} · {area === 'Inside Dhaka' ? '1–2 days' : '2–3 days'}
                      </span>
                    </label>
                  );
                })}
              </div>
              <Field label="Note for the courier (optional)" name="notes" value={form.notes} onChange={set} maxLength={300} />
            </div>
          </fieldset>

          <fieldset className="mt-12">
            <legend className="label text-ink">Payment</legend>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {[
                ['Cash on Delivery', 'Cash on delivery', 'Pay when your order arrives'],
                ['Mobile Banking', 'bKash / Nagad', 'Pay now by Send Money']
              ].map(([value, title, sub]) => {
                const active = form.paymentMethod === value;
                return (
                  <label key={value} className={`flex items-start gap-3 border px-4 py-4 transition-colors ${active ? 'border-ink' : 'border-line hover:border-muted'}`}>
                    <input type="radio" name="paymentMethod" value={value} checked={active} onChange={set} className="mt-1 accent-[var(--color-ink)]" />
                    <span>
                      <span className="block text-[14px] text-ink">{title}</span>
                      <span className="block text-[13px] text-muted">{sub}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {form.paymentMethod === 'Mobile Banking' && (
              <div className="mt-5 bg-sand/60 px-5 py-5 anim-fade">
                <p className="text-[14px] text-ink-soft leading-relaxed">
                  Send {quote ? formatPrice(quote.total) : 'the total'} to <span className="text-ink font-normal">{mobileNumber}</span> (bKash or Nagad, Send Money),
                  then enter the transaction ID below. We confirm payments before dispatch.
                </p>
                <Field className="mt-4" label="Transaction ID" name="trxId" value={form.trxId} onChange={set} maxLength={40} />
              </div>
            )}
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="bg-sand/50 px-6 sm:px-12 py-12 lg:border-l border-line">
          <h3 className="label text-ink">Order summary</h3>
          <ul className="mt-6 space-y-5">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4">
                <div className="relative w-16 h-16 bg-sand shrink-0 overflow-hidden">
                  <ProductImage src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[17px] leading-snug text-ink">{product.name}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <QuantityStepper
                      size="sm"
                      value={quantity}
                      min={1}
                      max={Math.max(1, Math.min(10, product.stock))}
                      onChange={q => onSetQuantity(product.id, q)}
                    />
                    <button
                      type="button"
                      onClick={() => onRemove(product.id)}
                      aria-label={`Delete ${product.name} from bag`}
                      title="Delete"
                      className="w-8 h-8 flex items-center justify-center text-ink/70 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.25} />
                    </button>
                  </div>
                </div>
                <p className="text-[14px] tabular-nums">{formatPrice(product.price * quantity)}</p>
              </li>
            ))}
          </ul>
          {items.length === 0 && (
            <p className="mt-6 text-[14px] text-muted">
              Your bag is empty.{' '}
              <button type="button" onClick={onClose} className="link-underline text-ink">Continue shopping</button>
            </p>
          )}

          <dl className="mt-8 pt-6 border-t border-line space-y-2.5 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{quote ? formatPrice(quote.subtotal) : '—'}</dd></div>
            {quote && quote.discount > 0 && (
              <div className="flex justify-between"><dt className="text-muted">{quote.coupon.code}</dt><dd className="tabular-nums">−{formatPrice(quote.discount)}</dd></div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Delivery · {form.city}</dt>
              <dd className="tabular-nums">{quote ? (quote.shipping === 0 ? 'Complimentary' : formatPrice(quote.shipping)) : '—'}</dd>
            </div>
            <div className="flex justify-between pt-4 mt-2 border-t border-line text-[16px]">
              <dt className="font-normal">Total</dt>
              <dd className="tabular-nums font-normal">{quote ? formatPrice(quote.total) : '—'}</dd>
            </div>
          </dl>

          {stockIssue && (
            <p className="mt-6 text-[13px] text-danger">
              Only {stockIssue.available} of “{stockIssue.name}” available. Please adjust your bag.
            </p>
          )}
          {error && <p className="mt-6 text-[13px] text-danger" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full mt-8"
            disabled={submitting || loading || !quote || Boolean(stockIssue) || items.length === 0}
          >
            {submitting ? <Spinner /> : `Place order${quote ? ` · ${formatPrice(quote.total)}` : ''}`}
          </button>
          <p className="mt-4 text-[12px] text-muted text-center">
            You will receive a call to confirm your order before dispatch.
          </p>
        </aside>
      </form>
    </Modal>
  );
}
