'use client';

import { Heart, Loader2 } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { useWishlist } from '@/providers/WishlistProvider';

type Variant = 'card' | 'detail';

interface Props {
  propertyId: string;
  variant?: Variant;
  className?: string;
}

// Heart toggle for saving a property. Used in two places:
//  - `card`   : floats over the property image (PropertyCard)
//  - `detail` : inline button next to the title on the detail page
// The component swallows clicks (stopPropagation + preventDefault) so it works
// safely inside a parent <Link> on the card.
export default function WishlistButton({ propertyId, variant = 'card', className = '' }: Props) {
  const { isWishlisted, toggle } = useWishlist();
  const [busy, setBusy] = useState(false);
  const active = isWishlisted(propertyId);

  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await toggle(propertyId);
    } catch {
      // Optimistic update has already rolled back inside the provider; the
      // failure mode is rare enough that we don't surface a toast here.
    } finally {
      setBusy(false);
    }
  };

  const label = active ? 'Remove from wishlist' : 'Save to wishlist';

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        title={label}
        className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${
          active
            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
        } ${className}`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${active ? 'fill-rose-500 text-rose-500' : ''}`} />
        )}
        {active ? 'Saved' : 'Save'}
      </button>
    );
  }

  // card variant — floating gold pill over the image
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`absolute top-3 right-3 z-10 h-9 w-9 grid place-items-center rounded-full shadow-soft backdrop-blur-sm transition-all ${
        active
          ? 'bg-white text-rose-500 hover:scale-105'
          : 'bg-white/85 text-ink-700 hover:bg-white hover:text-rose-500 hover:scale-105'
      } ${className}`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 transition-transform ${active ? 'fill-rose-500 scale-110' : ''}`} />
      )}
    </button>
  );
}
