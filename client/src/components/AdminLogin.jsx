import React, { useState } from 'react';
import { api, auth } from '../services/api';
import BrandLogo from './BrandLogo';
import { Field, Spinner } from './ui';

export default function AdminLogin({ onSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { token, user } = await api.login(email, password);
      auth.setToken(token);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ivory px-6 py-16">
      <BrandLogo size="lg" showTagline />
      <form onSubmit={handleSubmit} className="mt-14 w-full max-w-sm bg-paper border border-line px-8 py-10 space-y-7">
        <div className="text-center">
          <p className="label text-brass">Staff</p>
          <h1 className="mt-3 font-display text-[30px] text-ink leading-none">Owner & admin sign in</h1>
        </div>
        <Field label="Email" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
        <Field label="Password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-[13px] text-danger" role="alert">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Spinner /> : 'Sign in'}
        </button>
      </form>
      <button onClick={onCancel} className="mt-8 label text-muted hover:text-ink link-underline">Back to the shop</button>
    </div>
  );
}
