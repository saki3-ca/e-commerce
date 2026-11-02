import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { api, auth } from '../services/api';
import BrandLogo from './BrandLogo';

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
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f5] px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={onCancel}
          className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to store
        </button>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4"
        >
          <div className="flex flex-col items-center gap-2 pb-2">
            <BrandLogo />
            <h1 className="text-lg font-bold text-stone-900">Owner & Admin Login</h1>
            <p className="text-xs text-stone-500 text-center">Sign in to manage orders, products and settings.</p>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-stone-600">Email</span>
            <div className="mt-1 flex items-center gap-2 border border-stone-200 rounded-lg px-3 focus-within:border-[#c59b27]">
              <Mail className="w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full py-2.5 text-sm outline-none bg-transparent"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-stone-600">Password</span>
            <div className="mt-1 flex items-center gap-2 border border-stone-200 rounded-lg px-3 focus-within:border-[#c59b27]">
              <Lock className="w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full py-2.5 text-sm outline-none bg-transparent"
              />
            </div>
          </label>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
