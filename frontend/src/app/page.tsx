import Image from 'next/image';
import Link from 'next/link';
import { Building2, ShieldCheck, Sparkles, Users, ArrowRight } from 'lucide-react';
import HeroSearch from '@/components/HeroSearch';
import PropertyCard from '@/components/property/PropertyCard';
import { apiListProperties } from '@/lib/api';
import type { PropertyListItem } from '@/lib/types';

// Cache the landing page for 5 minutes — featured props rarely change.
export const revalidate = 300;

async function getFeatured(): Promise<PropertyListItem[]> {
  try {
    const r = await apiListProperties({ sort: 'newest', limit: 6 }, { revalidate: 300 });
    return r.items || [];
  } catch {
    return [];
  }
}

const CITIES = [
  { name: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=70' },
  { name: 'Bengaluru', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=70' },
  { name: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=70' },
  { name: 'Pune', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=70' },
  { name: 'Hyderabad', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=70' },
  { name: 'Chennai', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=70' },
];

const VALUES = [
  { icon: ShieldCheck, title: 'Verified Listings', desc: 'Every property is reviewed for accuracy before going live.' },
  { icon: Users, title: 'Zero Broker Fees', desc: 'Connect directly with owners. No middlemen, no surprises.' },
  { icon: Sparkles, title: 'Curated Premium', desc: 'Hand-picked properties with high-quality photos and details.' },
  { icon: Building2, title: '50,000+ Listings', desc: 'India’s widest catalogue of homes, plots, and commercial spaces.' },
];

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[640px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
          alt="Premium real estate"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="container relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-2xl text-canvas animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-canvas/10 backdrop-blur border border-canvas/20 rounded-full px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-gold-300" />
              India's most trusted property platform
            </span>
            <h1 className="font-display mt-4 text-5xl md:text-6xl lg:text-7xl font-semibold text-canvas leading-[1.05]">
              Find a home <br />
              you'll <span className="text-gold-300 italic">love.</span>
            </h1>
            <p className="mt-5 text-lg text-ink-200 max-w-xl">
              Explore over 50,000 verified properties across India. Buy, rent, or list — all without broker fees.
            </p>
          </div>
          <div className="mt-10 max-w-3xl">
            <HeroSearch />
          </div>
          <div className="mt-8 flex gap-6 text-canvas/80 text-sm">
            <div>
              <p className="font-display text-2xl text-canvas">50K+</p>
              <p>Active listings</p>
            </div>
            <div className="w-px bg-canvas/20" />
            <div>
              <p className="font-display text-2xl text-canvas">10+</p>
              <p>Cities covered</p>
            </div>
            <div className="w-px bg-canvas/20" />
            <div>
              <p className="font-display text-2xl text-canvas">24/7</p>
              <p>Owner support</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Hand-picked</p>
            <h2 className="font-display text-4xl text-ink-900">Featured properties</h2>
          </div>
          <Link href="/properties" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-ink-700 hover:text-ink-900">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="text-center py-12 text-ink-500">
            No listings yet — run <code className="bg-ink-100 px-2 py-1 rounded">npm run seed</code> in the backend to populate.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <PropertyCard key={p.id} p={p} priority={i < 3} />
            ))}
          </div>
        )}
      </section>

      {/* VALUES */}
      <section className="bg-ink-50 py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Why Estatery</p>
            <h2 className="font-display text-4xl text-ink-900">A better way to find your next address.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-6 hover:shadow-lift transition-shadow">
                <div className="h-11 w-11 rounded-lg bg-ink-900 text-gold-300 grid place-items-center mb-4">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg text-ink-900 mb-1.5">{v.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Explore</p>
          <h2 className="font-display text-4xl text-ink-900">Discover top cities</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CITIES.map((c) => (
            <Link
              key={c.name}
              href={`/properties?city=${encodeURIComponent(c.name)}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl"
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-display text-xl text-canvas">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-ink-900 px-8 md:px-16 py-16 md:py-20">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl text-canvas">List your property in minutes.</h2>
            <p className="mt-4 text-ink-300 text-lg">
              Reach thousands of buyers and renters every day. No commission. No hidden charges.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard/new" className="btn-gold">
                Post a listing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="btn bg-canvas/10 text-canvas border border-canvas/20 hover:bg-canvas/20">
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
