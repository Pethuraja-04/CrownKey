'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function LandingCTA() {
  const { openAuth, user } = useAuth();

  return (
    <section className="container pb-24">
      <div className="group relative rounded-[2.5rem] overflow-hidden border border-zinc-800 px-8 md:px-16 py-16 md:py-24 shadow-2xl transition-all duration-500">
        
        {/* Background Image with Hover Scale */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt="Modern luxury estate"
            fill
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            priority
          />
          {/* Dark Overlay Gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/35" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5 w-fit mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#e55b3c] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-200 font-bold">For property owners</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            List your property <br /> in a few simple steps.
          </h2>
          <p className="mt-4 text-zinc-300 text-sm md:text-base leading-relaxed max-w-lg">
            Reach thousands of verified buyers and renters daily. Direct owner-to-tenant transactions, completely free of commissions or hidden charges.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={user ? '/dashboard/new' : '#'}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuth('login');
                }
              }}
              className="bg-[#e55b3c] hover:bg-[#d44a2c] text-white text-xs font-bold px-6 py-3.5 rounded-full transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <span>Post a listing</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            
            {!user && (
              <button
                onClick={() => openAuth('register')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 text-xs font-bold px-6 py-3.5 rounded-full transition-all active:scale-95"
              >
                Create free account
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
