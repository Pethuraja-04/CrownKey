'use client';

import { FormEvent, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await register(form);
      router.push('/dashboard');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Left side: Image */}
      <div className="relative hidden lg:block overflow-hidden bg-zinc-950 order-first lg:order-1">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
          alt="Premium concrete architectural villa design cover"
          fill
          className="object-cover opacity-90 transition-transform duration-[10000ms] hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/40 to-black/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-2">Architectural Excellence</p>
          <blockquote className="font-display text-2xl font-light leading-relaxed text-zinc-100">
            "Direct owner-to-tenant properties. Pure transparency. Zero commission."
          </blockquote>
          <div className="mt-6 w-12 h-0.5 bg-white/40" />
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white order-last lg:order-2">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">Join CrownKey</p>
            <h1 className="font-display text-3xl font-bold text-zinc-950">Create your account</h1>
            <p className="text-sm text-zinc-500 mt-2">Free forever. No broker fees, ever.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <input
                  required
                  minLength={2}
                  className="input pl-10"
                  placeholder="Aarav Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
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
              <label className="label">Phone number (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <input
                  className="input pl-10"
                  placeholder="+91 90000 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input pl-10"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">Minimum 8 characters.</p>
            </div>

            {err && (
              <div className="flex items-start gap-2.5 text-sm text-rose-700 bg-rose-50/50 border border-rose-100 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-zinc-950 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-zinc-400 font-display text-lg">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
