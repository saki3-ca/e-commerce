import React, { useEffect, useRef } from 'react';
import { X, Minus, Plus } from 'lucide-react';

export const formatPrice = value =>
  `৳${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// Lock page scroll while any overlay is open (counts nested overlays)
let lockCount = 0;
function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    lockCount += 1;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = prev;
    };
  }, [active]);
}

// Escape closes only the top-most overlay
const escapeStack = [];
function useEscape(active, onClose) {
  const handlerRef = useRef(onClose);
  useEffect(() => { handlerRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!active) return undefined;
    const entry = () => handlerRef.current();
    escapeStack.push(entry);
    const onKey = e => {
      if (e.key === 'Escape' && escapeStack[escapeStack.length - 1] === entry) entry();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const i = escapeStack.indexOf(entry);
      if (i >= 0) escapeStack.splice(i, 1);
    };
  }, [active]);
}

// Move focus into the panel when it opens and back to the trigger when it closes
function useFocusReturn(active, panelRef) {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.activeElement;
    const t = setTimeout(() => panelRef.current && panelRef.current.focus(), 30);
    return () => {
      clearTimeout(t);
      if (previous && previous.focus) previous.focus({ preventScroll: true, focusVisible: false });
    };
  }, [active, panelRef]);
}

/** Side panel sliding in from the right (bag, account, menus). */
export function Drawer({ open, onClose, title, children, footer, width = 'max-w-[440px]' }) {
  const panelRef = useRef(null);
  useScrollLock(open);
  useEscape(open, onClose);
  useFocusReturn(open, panelRef);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/35 anim-fade" onClick={onClose} />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={`absolute right-0 top-0 h-full w-full ${width} bg-paper flex flex-col shadow-[0_0_60px_rgba(28,24,21,0.18)] anim-drawer outline-none`}
      >
        <header className="flex items-center justify-between px-6 sm:px-8 h-16 border-b border-line shrink-0">
          <h2 className="label text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="-mr-2 p-2 text-ink/70 hover:text-ink transition-colors">
            <X className="w-5 h-5" strokeWidth={1.25} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <footer className="border-t border-line px-6 sm:px-8 py-5 shrink-0 pb-safe">{footer}</footer>}
      </aside>
    </div>
  );
}

/** Centered dialog on desktop, full-height sheet on mobile. */
export function Modal({ open, onClose, label, children, size = 'max-w-5xl' }) {
  const panelRef = useRef(null);
  useScrollLock(open);
  useEscape(open, onClose);
  useFocusReturn(open, panelRef);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-ink/40 anim-fade" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full ${size} bg-paper max-h-[100dvh] sm:max-h-[92vh] h-[100dvh] sm:h-auto overflow-y-auto overscroll-contain anim-up outline-none`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 p-2 bg-paper/80 backdrop-blur-sm text-ink/70 hover:text-ink transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.25} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md' }) {
  const h = size === 'sm' ? 'h-8' : 'h-11';
  const w = size === 'sm' ? 'w-8' : 'w-11';
  return (
    <div className={`inline-flex items-center border border-line ${h}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={`${w} h-full flex items-center justify-center text-ink/70 hover:text-ink disabled:opacity-30`}
      >
        <Minus className="w-3.5 h-3.5" strokeWidth={1.25} />
      </button>
      <span className="min-w-8 text-center text-sm font-normal tabular-nums" aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={`${w} h-full flex items-center justify-center text-ink/70 hover:text-ink disabled:opacity-30`}
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={1.25} />
      </button>
    </div>
  );
}

export function Field({ label, error, as = 'input', className = '', ...props }) {
  const Tag = as;
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      <Tag className="field mt-1" {...props} />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Spinner({ className = 'w-4 h-4' }) {
  return (
    <span
      className={`inline-block ${className} rounded-full border border-current border-r-transparent animate-spin`}
      aria-hidden="true"
    />
  );
}

export function ProductImage({ src, alt, className = '', ...props }) {
  return (
    <img
      src={src || '/assets/products/fiom-monogram-crossbody.jpg'}
      alt={alt}
      className={className}
      onError={e => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/assets/products/fiom-monogram-crossbody.jpg';
      }}
      {...props}
    />
  );
}
