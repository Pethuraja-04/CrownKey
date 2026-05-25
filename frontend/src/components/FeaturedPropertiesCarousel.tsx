'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Key, Tag, Home, MapPin } from 'lucide-react';
import type { PropertyListItem } from '@/lib/types';

interface CarouselProps {
  properties: PropertyListItem[];
}

const placeholder =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70';

const formatPriceShort = (price: string | number) => {
  const n = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(n)) return String(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n}`;
};

const numberToWord = (n: number) => {
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  return words[n] || String(n);
};

export default function FeaturedPropertiesCarousel({ properties }: CarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
        No listings yet — run <code className="bg-zinc-100 px-2 py-1 rounded">npm run seed</code> in the backend to populate.
      </div>
    );
  }

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + properties.length) % properties.length);
    setHoveredIdx(null); // Reset hover on slide change
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % properties.length);
    setHoveredIdx(null); // Reset hover on slide change
  };

  const visibleItems: PropertyListItem[] = [];
  const displayCount = Math.min(3, properties.length);
  for (let i = 0; i < displayCount; i++) {
    visibleItems.push(properties[(startIndex + i) % properties.length]);
  }

  // The middle card index of visible items is active by default when nothing is hovered
  const defaultActiveIdx = Math.floor(displayCount / 2);

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Title Block */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#e55b3c] font-bold block mb-3">Premium Selections</span>
        <h3 className="font-display text-4xl font-bold text-zinc-950 tracking-tight">Our Featured Properties</h3>
        <p className="mt-3 text-zinc-500 text-sm leading-relaxed">
          Explore CrownKey's handpicked luxury estates. Modern architectural structures styled for refined residential living.
        </p>
      </div>

      {/* Accordion Carousel Grid with parent-level mouse leave detection */}
      <div 
        className="w-full flex flex-col md:flex-row gap-6 items-stretch min-h-[520px]"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {visibleItems.map((property, idx) => {
          const isRent = property.listingType === 'RENT';
          const priceStr = formatPriceShort(property.price);
          const bedroomWord = numberToWord(property.bedrooms);
          
          // A card is active if it is currently hovered, OR if no card is hovered and this is the middle card.
          const isActive = hoveredIdx !== null ? hoveredIdx === idx : defaultActiveIdx === idx;

          return (
            <Link
              key={`${property.id}-${idx}`}
              href={`/properties/${property.slug}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              className={`group relative flex-1 min-w-0 bg-white border border-zinc-200/80 rounded-[2rem] overflow-hidden flex flex-col justify-between transition-all duration-500 ease-out shadow-sm hover:shadow-xl ${
                isActive ? 'md:flex-[1.8] border-zinc-300' : 'md:flex-1'
              }`}
            >
              {/* Image & Badges Container */}
              <div className="relative w-full h-[290px] overflow-hidden">
                <Image
                  src={property.images?.[0]?.url || placeholder}
                  alt={property.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

                {/* Badges - visible if active */}
                <div className={`absolute top-5 left-5 z-10 flex flex-col gap-2 transition-all duration-500 pointer-events-none md:pointer-events-auto ${
                  isActive 
                    ? 'opacity-100 scale-100 translate-x-0' 
                    : 'md:opacity-0 md:scale-95 md:-translate-x-2'
                }`}>
                  {/* Rent / Sale Badge */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 text-[11px] text-white font-medium">
                      {isRent ? <Key className="w-3.5 h-3.5 text-[#e55b3c]" /> : <Tag className="w-3.5 h-3.5 text-[#e55b3c]" />}
                      <span>{isRent ? 'Rent' : 'Sale'}</span>
                    </div>
                    <div className="bg-white border border-zinc-200/50 rounded-full px-3.5 py-1.5 text-[11px] text-zinc-950 font-bold shadow-sm">
                      {priceStr}
                    </div>
                  </div>

                  {/* Rooms Badge */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 text-[11px] text-white font-medium">
                      <Home className="w-3.5 h-3.5 text-[#e55b3c]" />
                      <span>Rooms</span>
                    </div>
                    <div className="bg-white border border-zinc-200/50 rounded-full px-3.5 py-1.5 text-[11px] text-zinc-950 font-bold shadow-sm">
                      {bedroomWord}
                    </div>
                  </div>

                  {/* Place Badge */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 text-[11px] text-white font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#e55b3c]" />
                      <span>Place</span>
                    </div>
                    <div className="bg-white border border-zinc-200/50 rounded-full px-3.5 py-1.5 text-[11px] text-zinc-950 font-bold shadow-sm">
                      {property.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details & Button Container */}
              <div className="p-6 md:p-8 flex flex-col justify-between flex-grow bg-white">
                <div className="mb-6">
                  <h4 className="font-display text-xl md:text-2xl font-bold tracking-tight text-zinc-950 line-clamp-1 group-hover:line-clamp-2 transition-all duration-300">
                    {property.title}
                  </h4>
                  <p className="mt-3 text-zinc-500 text-xs md:text-sm leading-relaxed line-clamp-2">
                    {isRent ? 'Premium rental space ' : 'Exclusive property '}
                    located in the prime area of {property.locality || property.city}. Built with a focus on modern aesthetics and sustainable design.
                  </p>
                </div>

                {/* View Details Button */}
                <div className="w-full">
                  <div className={`w-full py-3.5 px-6 rounded-xl flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                    isActive 
                      ? 'bg-[#e55b3c] text-white border-transparent shadow-md' 
                      : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100'
                  }`}>
                    <span>View Details</span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-1' : ''}`} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Navigation Controls */}
      {properties.length > 3 && (
        <div className="mt-10 flex gap-3 pb-4">
          <button
            onClick={handlePrev}
            className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 text-zinc-700 active:scale-95 transition-all shadow-sm"
            aria-label="Previous properties"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="h-10 w-10 rounded-full bg-zinc-950 text-white flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all shadow-sm"
            aria-label="Next properties"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
