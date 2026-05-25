import Image from 'next/image';
import Link from 'next/link';
import { Building2, ShieldCheck, Sparkles, Users, ArrowRight } from 'lucide-react';
import HeroSearch from '@/components/HeroSearch';
import PropertyCard from '@/components/property/PropertyCard';
import FeaturedPropertiesCarousel from '@/components/FeaturedPropertiesCarousel';
import LandingCTA from '@/components/LandingCTA';
import { apiListProperties } from '@/lib/api';
import type { PropertyListItem } from '@/lib/types';
import FeaturedProperties from '@/components/FeaturedProperties';

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

const PROPERTIES = [
  {
    image: "/property1.jpg",
    city: "Miami, Florida",
    price: "$5,80,000",
  },
  {
    image: "/property2.jpg",
    city: "Miami, Florida",
    price: "$5,80,000",
  },
  {
    image: "/property3.jpg",
    city: "Seattle, Washington",
    price: "$5,80,000",
    featured: true,
  },
  {
    image: "/property4.jpg",
    city: "Miami, Florida",
    price: "$5,80,000",
  },
  {
    image: "/property5.jpg",
    city: "Miami, Florida",
    price: "$5,80,000",
  },
];

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
            src="/hero-villa.png"
            alt="Premium luxury real estate background"
            fill
            priority
            className="object-cover"
          />
          {/* Ambient overlay gradient to secure high-contrast for white texts */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/55 z-10" />
        </div>

        {/* Content Container (Top-aligned) */}
        <div className="container relative z-20 pt-16 md:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Headline Column */}
            <div className="lg:col-span-7">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6.5xl font-bold tracking-tight text-white leading-[1.08]">
                We Specialize in <br />
                All Aspects of Housing
              </h1>
            </div>

            {/* Description Paragraph Column */}
            <div className="lg:col-span-5 lg:pt-3">
              <p className="text-white/80 text-sm sm:text-base font-light leading-relaxed max-w-md">
                CrownKey curates residential and commercial estates across premier destinations. Experience direct, verified property connections with zero brokerage friction.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Search Filter Container (Centered relative to hero height) */}
        <div className="container relative z-20 my-auto">
          <div className="max-w-7xl mx-auto w-full">
            <HeroSearch />
          </div>
        </div>

        {/* Stats Section (Bottom-aligned) */}
        <div className="container relative z-20 pb-10 md:pb-14 stats-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl">
            {/* Stat 1 */}
            <div className="group flex items-center gap-4.5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 rounded-2xl py-4.5 px-6 shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#e55b3c]/15 border border-[#e55b3c]/25 flex items-center justify-center text-[#e55b3c] group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  50k+
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </p>
                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Active listings</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group flex items-center gap-4.5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 rounded-2xl py-4.5 px-6 shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  10+
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                </p>
                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Cities covered</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group flex items-center gap-4.5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 rounded-2xl py-4.5 px-6 shadow-lg hover:-translate-y-1 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  24/7
                  <span className="w-2 h-2 rounded-full bg-[#e55b3c] animate-pulse" />
                </p>
                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Owner support</p>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeInRight {
              from { opacity: 0; transform: translateX(-30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .stats-fade-in {
              animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
              opacity: 0;
            }
          `}</style>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="container py-24">
        <FeaturedPropertiesCarousel properties={featured} />
      </section>



      <FeaturedProperties />

      <section className="container py-28">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4">
            Explore
          </p>

          <h2 className="text-5xl font-light text-zinc-950 tracking-tight">
            Discover top cities
          </h2>

          <p className="mt-5 text-zinc-500">
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
          rounded-[15px]
          shadow-sm
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
            from-black/80
            via-black/20
            to-transparent
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
            bg-white/10
            border
            border-white/20
            text-white
            text-xs
          "
              >
                {120 + index * 20}+ Properties
              </div>

              {/* Content */}
              <div className="absolute bottom-0 p-7 text-white">

                <h3
                  className="
              text-3xl
              font-semibold
              mb-2
              group-hover:translate-y-[-4px]
              transition
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
            "
                >
                  Discover premium apartments,
                  villas and luxury spaces
                </p>

              </div>

            </Link>
          ))}

        </div>

      </section>

      {/* CTA SECTION */}
      <LandingCTA />
    </>
  );
}
