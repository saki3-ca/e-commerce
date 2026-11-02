import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const KEY = 'masfeeh_cart';

// Cart lines are just {id, quantity}; names/prices always come from live product data.
function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return normalize(raw);
  } catch {
    return [];
  }
}

export function normalize(lines) {
  const merged = new Map();
  for (const l of Array.isArray(lines) ? lines : []) {
    const id = l && typeof l.id === 'string' ? l.id : null;
    const q = Math.floor(Number(l && l.quantity));
    if (!id || !(q > 0)) continue;
    merged.set(id, Math.min(99, (merged.get(id) || 0) + q));
  }
  return [...merged].map(([id, quantity]) => ({ id, quantity }));
}

/**
 * Bag state. Persists to localStorage always; when a shopper is signed in it is also
 * saved to their account (debounced) so it follows them across devices.
 */
export function useCart(account) {
  const [lines, setLines] = useState(readLocal);
  const syncTimer = useRef(null);
  const signedIn = Boolean(account);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* ignore */ }
    if (!signedIn) return undefined;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      api.saveCart(lines).catch(() => { /* will retry on next change */ });
    }, 600);
    return () => clearTimeout(syncTimer.current);
  }, [lines, signedIn]);

  const add = useCallback((id, quantity = 1, max = 99) => {
    setLines(prev => {
      const existing = prev.find(l => l.id === id);
      if (existing) {
        return prev.map(l => (l.id === id ? { ...l, quantity: Math.min(max, l.quantity + quantity) } : l));
      }
      return [...prev, { id, quantity: Math.min(max, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    setLines(prev => (quantity <= 0
      ? prev.filter(l => l.id !== id)
      : prev.map(l => (l.id === id ? { ...l, quantity } : l))));
  }, []);

  const remove = useCallback(id => setLines(prev => prev.filter(l => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  // On sign-in: combine this device's bag with the one saved on the account
  const mergeFromAccount = useCallback(saved => {
    setLines(prev => normalize([...(saved || []), ...prev]));
  }, []);

  return { lines, add, setQuantity, remove, clear, mergeFromAccount, replace: setLines };
}
