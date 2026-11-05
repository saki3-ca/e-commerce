import React, { useEffect, useState } from 'react';
import { Modal, formatPrice, Spinner } from './ui';
import { api } from '../services/api';

const STEPS = ['Order placed', 'Confirmed', 'Being prepared', 'With the courier', 'Delivered'];

function stepIndex(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('deliver') && !s.includes('out')) return 4;
  if (s.includes('out') || s.includes('ship')) return 3;
  if (s.includes('pack') || s.includes('process')) return 2;
  if (s.includes('accept') || s.includes('confirm')) return 1;
  return 0;
}

const formatDate = iso => {
  try {
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export default function OrderTrackingModal({ open, onClose, initialId = '' }) {
  const [query, setQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const lookup = async id => {
    if (!id.trim()) return;
    setError('');
    setLoading(true);
    try {
      setOrder(await api.getOrder(id.trim()));
    } catch {
      setOrder(null);
      setError('We could not find an order with that number or phone. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setQuery(initialId);
    setOrder(null);
    setError('');
    if (initialId) lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialId]);

  if (!open) return null;
  const cancelled = order && String(order.status).toLowerCase().includes('cancel');
  const current = order ? stepIndex(order.status) : 0;

  return (
    <Modal open onClose={onClose} label="Track your order" size="max-w-2xl">
      <div className="px-6 sm:px-14 py-14">
        <p className="label text-brass">Client services</p>
        <h2 className="mt-4 font-display text-[38px] leading-tight text-ink">Track your order</h2>

        <form onSubmit={e => { e.preventDefault(); lookup(query); }} className="mt-8 flex items-end gap-4">
          <label className="flex-1">
            <span className="field-label">Order number or phone</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="MSF-XXXXXXXX"
              className="field mt-1 uppercase tracking-wider"
            />
          </label>
          <button type="submit" className="btn-primary h-11 px-6" disabled={loading || !query.trim()}>
            {loading ? <Spinner /> : 'Track'}
          </button>
        </form>
        {error && <p className="mt-5 text-[14px] text-danger">{error}</p>}

        {order && (
          <div className="mt-12 anim-fade">
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5 border-b border-line">
              <p className="font-display text-[24px] text-ink">{order.id}</p>
              <p className="label text-muted">{cancelled ? 'Cancelled' : order.status}</p>
            </div>

            {!cancelled && (
              <ol className="mt-8 space-y-0">
                {STEPS.map((label, i) => {
                  const done = i <= current;
                  const event = order.timeline && [...order.timeline].reverse().find(t => stepIndex(t.status) === i && (i > 0 || /placed/i.test(t.status)));
                  return (
                    <li key={label} className="relative pl-8 pb-7 last:pb-0">
                      {i < STEPS.length - 1 && (
                        <span className={`absolute left-[5px] top-3 bottom-0 w-px ${i < current ? 'bg-ink' : 'bg-line'}`} />
                      )}
                      <span className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border ${done ? 'bg-ink border-ink' : 'bg-paper border-line'}`} />
                      <p className={`text-[15px] ${done ? 'text-ink' : 'text-muted'}`}>{label}</p>
                      {event && <p className="text-[12px] text-muted mt-0.5">{formatDate(event.timestamp)}</p>}
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-10 grid sm:grid-cols-2 gap-8 text-[14px]">
              <div>
                <p className="label text-muted">Pieces</p>
                <ul className="mt-3 space-y-1.5">
                  {(order.items || []).map((it, i) => (
                    <li key={i} className="flex justify-between gap-4">
                      <span className="text-ink-soft">{it.name} × {it.quantity}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-ink tabular-nums">Total {formatPrice(order.total)}</p>
              </div>
              <div>
                <p className="label text-muted">Delivery</p>
                <p className="mt-3 text-ink-soft">{order.customer?.name}</p>
                <p className="text-ink-soft">{order.customer?.address}{order.customer?.city ? `, ${order.customer.city}` : ''}</p>
                {(order.courier || order.trackingCode) && <p className="mt-2 text-muted">{order.courier ? `Courier: ${order.courier}` : ""}{order.trackingCode ? ` · Tracking code: ${order.trackingCode}` : ""}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
