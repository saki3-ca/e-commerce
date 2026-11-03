import React, { useEffect, useState } from 'react';
import { Drawer, Field, Spinner, formatPrice } from './ui';
import { api, customerAuth } from '../services/api';

function SignInForm({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.accountLogin(email, password);
      onDone(res, 'login');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
      <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
      {error && <p className="text-[13px] text-danger" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner /> : 'Sign in'}</button>
    </form>
  );
}

function SignUpForm({ onDone, cart }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Please choose a password of at least 8 characters.');
    setBusy(true);
    try {
      const res = await api.signup({ ...form, cart });
      onDone(res, 'signup');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="Full name" name="name" value={form.name} onChange={set} autoComplete="name" required />
      <Field label="Email" name="email" type="email" value={form.email} onChange={set} autoComplete="email" required />
      <Field label="Phone (optional)" name="phone" type="tel" value={form.phone} onChange={set} autoComplete="tel" />
      <Field label="Password (8+ characters)" name="password" type="password" value={form.password} onChange={set} autoComplete="new-password" required />
      {error && <p className="text-[13px] text-danger" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner /> : 'Create account'}</button>
      <p className="text-[12px] text-muted leading-relaxed">
        Your details and bag are saved to your account so checkout is quicker next time. You can always shop as a guest.
      </p>
    </form>
  );
}

function Profile({ account, onSaved }) {
  const [form, setForm] = useState({
    name: account.name, phone: account.phone, address: account.address, city: account.city || 'Inside Dhaka'
  });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const set = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setStatus(''); };

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.updateAccount(form);
      onSaved(res.account);
      setStatus('Saved');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="Full name" name="name" value={form.name} onChange={set} required />
      <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={set} />
      <Field label="Delivery address" name="address" as="textarea" rows={2} value={form.address} onChange={set} />
      <label className="block">
        <span className="field-label">Area</span>
        <select name="city" value={form.city} onChange={set} className="field mt-1">
          <option>Inside Dhaka</option>
          <option>Outside Dhaka</option>
        </select>
      </label>
      <div className="flex items-center gap-5">
        <button className="btn-outline" disabled={busy}>{busy ? <Spinner /> : 'Save details'}</button>
        {status && <span className={`text-[13px] ${status === 'Saved' ? 'text-success' : 'text-danger'}`}>{status}</span>}
      </div>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const res = await api.changeAccountPassword(current, next);
      if (res.token) customerAuth.setToken(res.token); // old sessions are now invalid
      setCurrent(''); setNext('');
      setStatus('Password updated');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="Current password" type="password" value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" required />
      <Field label="New password (8+ characters)" type="password" value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" required minLength={8} />
      <div className="flex items-center gap-5">
        <button className="btn-outline" disabled={busy}>{busy ? <Spinner /> : 'Update password'}</button>
        {status && <span className={`text-[13px] ${status === 'Password updated' ? 'text-success' : 'text-danger'}`}>{status}</span>}
      </div>
    </form>
  );
}

function Orders({ onTrack }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.getMyOrders().then(setOrders).catch(err => setError(err.message));
  }, []);

  if (error) return <p className="text-[14px] text-danger">{error}</p>;
  if (!orders) return <Spinner />;
  if (orders.length === 0) return <p className="text-[14px] text-muted">You have not placed an order yet.</p>;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {orders.map(o => (
        <li key={o.id}>
          <button onClick={() => onTrack(o.id)} className="w-full py-4 flex items-center justify-between gap-4 text-left group">
            <span>
              <span className="block text-[14px] text-ink tracking-wide">{o.id}</span>
              <span className="block text-[12px] text-muted">
                {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {formatPrice(o.total)}
              </span>
            </span>
            <span className="label text-[10px] text-muted group-hover:text-ink">{o.status}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function AccountDrawer({ open, onClose, account, onAuthenticated, onAccountUpdated, onSignOut, onTrack, cart }) {
  const [mode, setMode] = useState('signin');
  const [section, setSection] = useState('orders');

  useEffect(() => {
    if (open) setSection('orders');
  }, [open]);

  return (
    <Drawer open={open} onClose={onClose} title={account ? 'Your account' : 'Account'}>
      <div className="px-6 sm:px-8 py-10">
        {!account ? (
          <>
            <h2 className="font-display text-[34px] leading-tight text-ink">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-3 text-[14px] text-muted">
              {mode === 'signin'
                ? 'Sign in to see your orders and check out with your saved details.'
                : 'Save your details and bag across visits. Optional, always.'}
            </p>
            <div className="mt-8 flex gap-8 border-b border-line">
              {[['signin', 'Sign in'], ['signup', 'Create account']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`label pb-3 -mb-px border-b ${mode === key ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-8">
              {mode === 'signin' ? <SignInForm onDone={onAuthenticated} /> : <SignUpForm onDone={onAuthenticated} cart={cart} />}
            </div>
            <p className="mt-10 pt-6 border-t border-line text-[13px] text-muted">
              Shop owner or staff? <a href="/admin" className="link-underline text-ink">Use the staff login</a>
            </p>
          </>
        ) : (
          <>
            <p className="label text-brass">Hello</p>
            <h2 className="mt-3 font-display text-[34px] leading-tight text-ink">{account.name}</h2>
            <p className="mt-1 text-[14px] text-muted">{account.email}</p>

            <div className="mt-10 flex gap-7 border-b border-line overflow-x-auto no-scrollbar">
              {[['orders', 'Orders'], ['details', 'Details'], ['password', 'Password']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className={`label pb-3 -mb-px border-b shrink-0 ${section === key ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-8">
              {section === 'orders' && <Orders onTrack={onTrack} />}
              {section === 'details' && <Profile account={account} onSaved={onAccountUpdated} />}
              {section === 'password' && <PasswordForm />}
            </div>

            <button onClick={onSignOut} className="mt-14 label text-muted hover:text-ink link-underline">
              Sign out
            </button>
          </>
        )}
      </div>
    </Drawer>
  );
}
