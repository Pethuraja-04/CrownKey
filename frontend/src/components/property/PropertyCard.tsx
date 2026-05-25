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
      className="group card overflow-hidden hover:scale-[1.03] hover:shadow-2xl transition-all duration-500 block relative bg-white/80 border border-white/50 backdrop-blur-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <Image
          src={img}
          alt={p.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
          priority={priority}
        />
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <span className={p.listingType === 'SALE' ? 'badge-sale' : 'badge-rent'}>
            For {p.listingType === 'SALE' ? 'Sale' : 'Rent'}
          </span>
          {p.isVerified && (
            <span className="badge bg-luxury-gold/90 text-luxury-navy font-bold flex items-center gap-1 border border-luxury-gold/30">
              <BadgeCheck className="h-3 w-3 text-luxury-navy" /> Verified
            </span>
          )}
        </div>
        
        <WishlistButton propertyId={p.id} variant="card" />

        {/* Navy Price Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-luxury-navy text-white text-sm font-semibold font-display px-3 py-1.5 rounded-[10px] shadow-md border border-white/10">
            {formatINR(p.price, p.listingType)}
          </span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-luxury-text line-clamp-1 text-base group-hover:text-luxury-deep transition-colors font-sans">{p.title}</h3>
          <p className="flex items-center gap-1 text-xs text-luxury-muted mt-1.5">
            <MapPin className="h-3.5 w-3.5 text-luxury-gold shrink-0" />
            <span className="line-clamp-1">{p.locality}, {p.city}</span>
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-luxury-muted border-t border-zinc-100 pt-4 font-sans">
          {isPg && occupancy ? (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              {occupancy}
            </span>
          ) : p.bedrooms > 0 ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-zinc-400" />
              {p.bedrooms} Bed
            </span>
          ) : null}
          
          {p.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-zinc-400" />
              {p.bathrooms} Bath
            </span>
          )}
          
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
            {formatArea(p.areaSqft)}
          </span>
          
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] bg-zinc-100 px-2 py-0.5 rounded-[4px]">{titleCaseType(p.type)}</span>
        </div>
      </div>
    </Link>
  );
}
