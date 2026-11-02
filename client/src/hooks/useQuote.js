import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

/**
 * Live price breakdown from the server for the current bag.
 * The server is the only place totals are calculated, so what the shopper sees is what they pay.
 */
export function useQuote(lines, { city = 'Inside Dhaka', coupon = '', enabled = true } = {}) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const key = JSON.stringify([lines, city, coupon]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (lines.length === 0) {
      setQuote(null);
      setError('');
      return undefined;
    }
    const id = ++requestId.current;
    setLoading(true);
    const t = setTimeout(() => {
      api.quote({ items: lines, city, coupon })
        .then(q => { if (id === requestId.current) { setQuote(q); setError(''); } })
        .catch(err => { if (id === requestId.current) setError(err.message); })
        .finally(() => { if (id === requestId.current) setLoading(false); });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return { quote, loading, error };
}
