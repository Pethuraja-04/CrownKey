import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Bath, Maximize2, MapPin, BadgeCheck, Users } from 'lucide-react';
import type { PropertyListItem } from '@/lib/types';
import { formatINR, formatArea, titleCaseType, occupancyShort } from '@/lib/format';
import WishlistButton from './WishlistButton';

const placeholder =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70';

export default function PropertyCard({ p, priority = false }: { p: PropertyListItem; priority?: boolean }) {
  const img = p.images?.[0]?.url || placeholder;
  const isPg = p.type === 'PG';
  const occupancy = occupancyShort(p);

  return (
    <Link
      href={`/properties/${p.slug}`}
      className="group card overflow-hidden hover:shadow-lift transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <Image
          src={img}
          alt={p.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={p.listingType === 'SALE' ? 'badge-sale' : 'badge-rent'}>
            For {p.listingType === 'SALE' ? 'Sale' : 'Rent'}
          </span>
          {p.isVerified && (
            <span className="badge-gold">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
        <WishlistButton propertyId={p.id} variant="card" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink-900/60 to-transparent p-3">
          <p className="text-canvas font-display text-xl font-semibold">
            {formatINR(p.price, p.listingType)}
          </p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-ink-900 line-clamp-1 text-base">{p.title}</h3>
          <p className="flex items-center gap-1 text-xs text-ink-500 mt-1">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{p.locality}, {p.city}</span>
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-ink-600 border-t border-ink-100 pt-3">
          {isPg && occupancy ? (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-ink-400" />
              {occupancy}
            </span>
          ) : p.bedrooms > 0 ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-ink-400" />
              {p.bedrooms} Bed
            </span>
          ) : null}
          {p.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-ink-400" />
              {p.bathrooms} Bath
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5 text-ink-400" />
            {formatArea(p.areaSqft)}
          </span>
          <span className="text-ink-400">{titleCaseType(p.type)}</span>
        </div>
      </div>
    </Link>
  );
}
