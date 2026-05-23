'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await login(form.email, form.password);
      router.push(next);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Welcome back</p>
          <h1 className="font-display text-3xl text-ink-900">Log in to Estatery</h1>
          <p className="text-sm text-ink-500 mt-2">Continue your property search.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="email"
                required
                className="input pl-9"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="password"
                required
                minLength={8}
                className="input pl-9"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          {err && (
            <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 mt-6">
          New to Estatery?{' '}
          <Link href="/register" className="text-ink-900 font-semibold hover:underline">
            Create an account
          </Link>
        </p>

        <p className="mt-6 text-xs text-ink-400 text-center border-t border-ink-100 pt-4">
          Demo: <code className="bg-ink-100 px-1.5 py-0.5 rounded">demo@realestate.dev</code> /{' '}
          <code className="bg-ink-100 px-1.5 py-0.5 rounded">Password123!</code>
        </p>
      </div>
    </div>
  );
}
