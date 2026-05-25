'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight, BedDouble, Bath, Maximize2 } from "lucide-react";

const properties = [
  {
    city: "Miami, Florida",
    price: "$5,80,000",
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    beds: 3,
    baths: 3,
    area: "2,500 sq.ft",
  },
  {
    city: "New York",
    price: "$7,20,000",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    beds: 4,
    baths: 3.5,
    area: "3,100 sq.ft",
  },
  {
    city: "Seattle, Washington",
    price: "$5,80,000",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    beds: 3,
    baths: 3,
    area: "2,500 sq.ft",
  },
  {
    city: "California",
    price: "$8,10,000",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    beds: 5,
    baths: 4.5,
    area: "4,200 sq.ft",
  },
  {
    city: "Texas",
    price: "$6,50,000",
    img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    beds: 3,
    baths: 2.5,
    area: "2,200 sq.ft",
  },
];

export default function FeaturedProperties() {
  const [active, setActive] = useState(2);

  const next = () =>
    setActive((prev) => (prev + 1) % properties.length);

  const prev = () =>
    setActive((prev) => (prev - 1 + properties.length) % properties.length);

  return (
    <section className="py-24 bg-zinc-50 overflow-hidden w-full font-sans">
      {/* Heading */}
      <div className="text-center mb-16 px-4">
        <p className="uppercase text-[11px] tracking-[0.3em] font-bold text-luxury-gold mb-3">
          OUR FEATURED PROPERTIES
        </p>
        <h2 className="text-4xl font-semibold text-luxury-navy tracking-tight font-display">
          Find your dream property
        </h2>
      </div>

      {/* Slider viewport */}
      <div className="relative w-full h-[540px] flex flex-col items-center justify-center">
        {/* Carousel inner container */}
        <div className="relative w-full max-w-[1200px] h-[430px] overflow-visible">
          {properties.map((item, index) => {
            let offset = index - active;

            // Handle wrapping for infinite scroll
            if (offset < -2) offset += properties.length;
            if (offset > 2) offset -= properties.length;

            const isCenter = offset === 0;

            return (
              <div
                key={index}
                className="absolute left-1/2 top-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                style={{
                  transform: `translate3d(calc(-50% + ${offset * 310}px), ${isCenter ? '0px' : '35px'}, 0) scale(${isCenter ? 1.05 : 0.85})`,
                  zIndex: isCenter ? 30 : 20 - Math.abs(offset),
                  opacity: Math.abs(offset) > 2 ? 0 : isCenter ? 1 : 0.6,
                  pointerEvents: isCenter ? 'auto' : 'none',
                  filter: isCenter ? 'none' : 'blur(1.5px)',
                }}
              >
                {/* Fixed-size Card Wrapper to prevent reflow layout shifts */}
                <div className="relative w-[280px] h-[380px] overflow-hidden rounded-[32px] shadow-lg border border-white/40 group bg-white/70 backdrop-blur-md">
                  {/* Property Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={item.img}
                      alt={item.city}
                      className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy/90 via-transparent to-transparent" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 z-10 text-white flex flex-col justify-end">
                    <p className="text-xs font-light text-zinc-300 mb-1">{item.city}</p>
                    <h3 className="text-2xl font-bold tracking-tight mb-3 text-white font-display">
                      {item.price}
                    </h3>

                    {/* Secondary details visible/fading for center active card */}
                    <div className={`flex items-center gap-2.5 text-[11px] text-zinc-300 border-t border-white/10 pt-3.5 transition-opacity duration-500 ${isCenter ? 'opacity-100' : 'opacity-0'}`}>
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-luxury-gold" />
                        {item.beds} Bed
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-luxury-gold" />
                        {item.baths} Bath
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-luxury-gold" />
                        {item.area}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="mt-8 flex gap-4 z-40">
          <button
            onClick={prev}
            className="w-12 h-12 rounded-[14px] bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all text-luxury-navy"
            aria-label="Previous property"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="w-12 h-12 rounded-[14px] bg-luxury-navy text-white shadow-md flex items-center justify-center hover:bg-luxury-deep active:scale-95 transition-all"
            aria-label="Next property"
          >
            <ChevronRight size={20} className="text-luxury-gold" />
          </button>
        </div>
      </div>
    </section>
  );
}