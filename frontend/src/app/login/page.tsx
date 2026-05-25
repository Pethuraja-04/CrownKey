'use client';

import { FormEvent, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

function LoginForm() {
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
    <div className="min-h-[calc(100vh-4.5rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Left side: Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">Welcome back</p>
            <h1 className="font-display text-3xl font-bold text-zinc-950">Log in to CrownKey</h1>
            <p className="text-sm text-zinc-500 mt-2">Continue your premium property search.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {err && (
              <div className="flex items-start gap-2.5 text-sm text-rose-700 bg-rose-50/50 border border-rose-100 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-8">
            New to CrownKey?{' '}
            <Link href="/register" className="text-zinc-950 font-semibold hover:underline">
              Create an account
            </Link>
          </p>

         
        </div>
      </div>

      {/* Right side: Image */}
      <div className="relative hidden lg:block overflow-hidden bg-zinc-950">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
          alt="Premium luxury modern villa twilight cover"
          fill
          className="object-cover opacity-90 transition-transform duration-[10000ms] hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/40 to-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-2">Curated Luxury</p>
          <blockquote className="font-display text-2xl font-light leading-relaxed text-zinc-100">
            "Find your next sanctuary. Handpicked premium properties with zero brokerage fees, direct owner connect."
          </blockquote>
          <div className="mt-6 w-12 h-0.5 bg-white/40" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-zinc-400 font-display text-lg">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
