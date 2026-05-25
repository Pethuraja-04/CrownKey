import Image from 'next/image';
import Link from 'next/link';
import { Building2, Sparkles, Users, Key } from 'lucide-react';
import HeroSearch from '@/components/HeroSearch';
import FeaturedPropertiesCarousel from '@/components/FeaturedPropertiesCarousel';
import LandingCTA from '@/components/LandingCTA';
import { apiListProperties } from '@/lib/api';
import type { PropertyListItem } from '@/lib/types';
import FeaturedProperties from '@/components/FeaturedProperties';

// Cache the landing page for 5 minutes
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
  {
    name: "Mumbai",
    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f"
  },
  {
    name: "Bengaluru",
    img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2"
  },
  {
    name: "Delhi",
    img: "https://images.unsplash.com/photo-1587474260584-136574528ed5"
  },
  {
    name: "Pune",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41"
  },
  {
    name: "Hyderabad",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23"
  },
];

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-[calc(100vh-4.5rem)] max-h-[850px] min-h-[600px] w-full overflow-hidden flex flex-col justify-between">
        {/* Background Cover Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt="Premium luxury real estate background"
            fill
            priority
            className="object-cover"
          />
          {/* Ambient overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/40 to-luxury-navy/60 z-10" />
        </div>

        <div className="container relative z-20 pt-16 md:pt-20 pb-10 md:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT COLUMN: Heading & Description */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs tracking-[0.2em] uppercase">
                Premium Real Estate
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
                Find Your <br /> 
                <span className="text-luxury-gold">Perfect Property</span>
              </h1>
              <p className="text-white/80 text-sm sm:text-base font-light leading-relaxed max-w-md font-sans">
                CrownKey curates residential and commercial estates across premier destinations. Experience direct, verified property connections with zero brokerage friction.
              </p>
            </div>

            {/* RIGHT COLUMN: Stats Grid Card Showcase */}
            <div className="lg:col-span-7 relative stats-fade-in">
              {/* Background Ambient Glows */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-luxury-gold/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-luxury-deep/20 rounded-full blur-[80px] pointer-events-none" />

              {/* Decorative dotted grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] rounded-3xl pointer-events-none" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                
                {/* Stat 1: Active Listings */}
                <div className="group bg-luxury-navy/40 backdrop-blur-md border border-white/10 hover:border-luxury-gold/30 hover:bg-luxury-navy/60 transition-all duration-500 rounded-[20px] p-6 shadow-xl hover:-translate-y-1.5 flex flex-col justify-between h-[160px]">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-luxury-gold animate-pulse mt-1" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      50k+
                    </h3>
                    <p className="text-zinc-300 text-[11px] font-bold uppercase tracking-wider mt-1.5 font-sans">
                      Active Listings
                    </p>
                  </div>
                </div>

                {/* Stat 2: Cities Covered */}
                <div className="group bg-luxury-navy/40 backdrop-blur-md border border-white/10 hover:border-luxury-gold/30 hover:bg-luxury-navy/60 transition-all duration-500 rounded-[20px] p-6 shadow-xl hover:-translate-y-1.5 sm:translate-y-6 flex flex-col justify-between h-[160px]">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-luxury-gold/50 mt-1" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      10+
                    </h3>
                    <p className="text-zinc-300 text-[11px] font-bold uppercase tracking-wider mt-1.5 font-sans">
                      Cities Covered
                    </p>
                  </div>
                </div>

                {/* Stat 3: Owner Support */}
                <div className="group bg-luxury-navy/40 backdrop-blur-md border border-white/10 hover:border-luxury-gold/30 hover:bg-luxury-navy/60 transition-all duration-500 rounded-[20px] p-6 shadow-xl hover:-translate-y-1.5 sm:col-span-2 sm:translate-y-3 flex flex-col justify-between h-[160px]">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-[14px] bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase font-sans tracking-wide">
                      Live
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      24/7
                    </h3>
                    <p className="text-zinc-300 text-[11px] font-bold uppercase tracking-wider mt-1.5 font-sans">
                      Direct Owner Support
                    </p>
                  </div>
                </div>

              </div>

              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                  }
                  .stats-fade-in {
                    animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
                    opacity: 0;
                  }
                `
              }} />
            </div>

          </div>
        </div>



        <div className="container relative z-20 my-auto">
          <div className="max-w-7xl mx-auto w-full animate-float">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="container py-12">
        <FeaturedPropertiesCarousel properties={featured} />
      </section>

      <FeaturedProperties />

      {/* TOP CITIES SECTION */}
      <section className="container pt-14 pb-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-luxury-gold font-bold mb-4 font-sans">
            Explore
          </p>
          <h2 className="text-4xl font-semibold text-luxury-navy tracking-tight font-display">
            Discover top cities
          </h2>
          <p className="mt-5 text-luxury-muted font-sans">
            Explore premium homes in India's most desirable locations
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {CITIES.map((city, index) => (
            <Link
              key={city.name}
              href={`/properties?city=${city.name}`}
              className={`
                group
                relative
                overflow-hidden
                rounded-[24px]
                shadow-soft
                hover:shadow-2xl
                transition-all
                duration-700
                ${index === 0
                  ? "col-span-12 md:col-span-6 row-span-2 h-[520px]"
                  : "col-span-6 md:col-span-3 h-[250px]"
                }
              `}
            >
              <Image
                src={city.img}
                alt={city.name}
                fill
                className="
                  object-cover
                  transition-transform
                  duration-[1500ms]
                  group-hover:scale-110
                "
              />

              {/* Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-luxury-navy/90
                  via-luxury-navy/20
                  to-transparent
                  transition-opacity
                  duration-500
                "
              />

              {/* Glass Badge */}
              <div
                className="
                  absolute
                  top-5
                  left-5
                  px-4
                  py-2
                  rounded-full
                  backdrop-blur-xl
                  bg-luxury-navy/40
                  border
                  border-white/10
                  text-luxury-gold
                  font-bold
                  text-[11px]
                  tracking-wider
                "
              >
                {120 + index * 20}+ Properties
              </div>

              {/* Content */}
              <div className="absolute bottom-0 p-7 text-white z-10">
                <h3
                  className="
                    text-3xl
                    font-semibold
                    mb-2
                    group-hover:translate-y-[-4px]
                    transition
                    font-display
                  "
                >
                  {city.name}
                </h3>
                <p
                  className="
                    opacity-0
                    translate-y-4
                    group-hover:opacity-100
                    group-hover:translate-y-0
                    transition-all
                    duration-500
                    text-xs
                    text-zinc-300
                    font-sans
                  "
                >
                  Discover premium apartments, villas and luxury spaces
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <div className="bg-zinc-50">

        <LandingCTA />
      </div>
    </>
  );
}
