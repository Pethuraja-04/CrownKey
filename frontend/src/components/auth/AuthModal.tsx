'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail, Lock, User, Phone, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [regBusy, setRegBusy] = useState(false);
  const [regErr, setRegErr] = useState('');

  // Sync mode with trigger action
  useEffect(() => {
    if (authOpen) {
      setMode(authMode);
      // Reset errors
      setLoginErr('');
      setRegErr('');
    }
  }, [authOpen, authMode]);

  // Handle Escape key closure
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuth();
    };
    if (authOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginErr('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginErr(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegBusy(true);
    setRegErr('');
    try {
      await register(regForm);
    } catch (err) {
      setRegErr(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setRegBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex overflow-hidden animate-fade-in-up">
      {/* Close Button */}
      <button
        onClick={closeAuth}
        className="absolute top-6 right-6 z-40 p-3 rounded-full bg-zinc-100/80 backdrop-blur-sm border border-zinc-200 text-zinc-500 hover:text-zinc-950 transition-all shadow-sm hover:scale-105"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>

      {/* --- Sliding Cover Image Pane (Large Screens Only) --- */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2 hidden lg:block z-30 transition-transform duration-700 ease-in-out overflow-hidden"
        style={{ transform: mode === 'login' ? 'translateX(100%)' : 'translateX(0)' }}
      >
        {/* Inner image container */}
        <div className="absolute inset-0 bg-zinc-950">
          {/* Login Mode Image */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${mode === 'login' ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="CrownKey Curated Luxury cover image"
              fill
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
            <div className="absolute bottom-16 left-16 right-16 text-white max-w-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-3">Curated Luxury</p>
              <blockquote className="font-display text-2xl font-light leading-relaxed text-zinc-100">
                "Find your next sanctuary. Handpicked premium properties with zero brokerage fees."
              </blockquote>
            </div>
          </div>

          {/* Register Mode Image */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${mode === 'register' ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
              alt="CrownKey Direct Connection cover image"
              fill
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
            <div className="absolute bottom-16 left-16 right-16 text-white max-w-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-3">Direct Connections</p>
              <blockquote className="font-display text-2xl font-light leading-relaxed text-zinc-100">
                "Connect directly with owners. Verified listings, complete transparency."
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* --- Form Side Panels --- */}
      
      {/* Left Side: Login Form */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-full lg:w-1/2 p-8 sm:p-16 flex items-center justify-center transition-all duration-500 ease-in-out ${
          mode === 'login'
            ? 'opacity-100 z-20 pointer-events-auto'
            : 'opacity-0 z-10 pointer-events-none lg:pointer-events-auto'
        }`}
      >
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">Welcome back</p>
            <h2 className="font-display text-3xl font-bold text-zinc-950">Log in to CrownKey</h2>
            <p className="text-sm text-zinc-500 mt-1">Continue your premium property search.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="label text-xs">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  className="input pl-10 text-sm py-2.5"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label text-xs">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input pl-10 text-sm py-2.5"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            {loginErr && (
              <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginErr}</span>
              </div>
            )}

            <button type="submit" disabled={loginBusy} className="btn-primary w-full py-3 text-xs font-semibold mt-2">
              {loginBusy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-6">
            New to CrownKey?{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-zinc-950 font-semibold hover:underline"
            >
              Create an account
            </button>
          </p>

         
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div
        className={`absolute left-0 lg:left-auto lg:right-0 top-0 bottom-0 w-full lg:w-1/2 p-8 sm:p-16 flex items-center justify-center transition-all duration-500 ease-in-out ${
          mode === 'register'
            ? 'opacity-100 z-20 pointer-events-auto'
            : 'opacity-0 z-10 pointer-events-none lg:pointer-events-auto'
        }`}
      >
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">Join CrownKey</p>
            <h2 className="font-display text-3xl font-bold text-zinc-950">Create your account</h2>
            <p className="text-sm text-zinc-500 mt-1">Free forever. No broker fees, ever.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="label text-xs">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  required
                  minLength={2}
                  className="input pl-10 text-sm py-2.5"
                  placeholder="Aarav Sharma"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label text-xs">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  className="input pl-10 text-sm py-2.5"
                  placeholder="you@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label text-xs">Phone number (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  className="input pl-10 text-sm py-2.5"
                  placeholder="+91 90000 00000"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label text-xs">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input pl-10 text-sm py-2.5"
                  placeholder="At least 8 characters"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                />
              </div>
            </div>

            {regErr && (
              <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{regErr}</span>
              </div>
            )}

            <button type="submit" disabled={regBusy} className="btn-primary w-full py-3 text-xs font-semibold mt-2">
              {regBusy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-6">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-zinc-950 font-semibold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
