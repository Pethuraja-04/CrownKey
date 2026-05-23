'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PropertyImage } from '@/lib/types';

export default function Gallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-ink-100 grid place-items-center text-ink-400">
        No images
      </div>
    );
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[16/9]">
        <button
          className="relative col-span-2 row-span-2 group"
          onClick={() => setOpen(true)}
          aria-label="Open gallery"
        >
          <Image src={images[0].url} alt={title} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 50vw" />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button
            key={img.url + i}
            className="relative group bg-ink-100"
            onClick={() => { setActive(i + 1); setOpen(true); }}
          >
            <Image src={img.url} alt={`${title} ${i + 2}`} fill className="object-cover" sizes="25vw" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-ink-900/60 grid place-items-center text-canvas font-display text-xl">
                +{images.length - 5} more
              </div>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink-950/95 grid place-items-center p-4 animate-fade-up" onClick={() => setOpen(false)}>
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-canvas"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-canvas"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-canvas"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/10]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active].url} alt={title} fill className="object-contain" sizes="100vw" />
          </div>
          <div className="absolute bottom-6 text-canvas text-sm">{active + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}
