import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, BedDouble, Bath, Maximize2, BadgeCheck, Phone, Mail, Calendar, Eye, Sofa, ArrowRight, CheckCircle, Users,
} from 'lucide-react';
import { apiGetProperty, apiSimilar } from '@/lib/api';
import Gallery from '@/components/property/Gallery';
import PropertyCard from '@/components/property/PropertyCard';
import WishlistButton from '@/components/property/WishlistButton';
import ContactCTA from './ContactCTA';
import { formatINR, formatArea, titleCaseType, relativeTime, roomTypeLabel } from '@/lib/format';

// ISR: regenerate the page once per minute. Strikes a balance between fresh
// view counts and CDN-cacheable HTML for SEO.
export const revalidate = 60;

interface Params { slug: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { data: p } = await apiGetProperty(params.slug, { revalidate: 300 });
    const occupancy = p.type === 'PG' && p.roomType ? roomTypeLabel(p.roomType) + ' ' : p.bedrooms ? p.bedrooms + ' BHK ' : '';
    const desc = `${occupancy}${titleCaseType(p.type)} ${p.listingType === 'SALE' ? 'for sale' : 'for rent'} in ${p.locality}, ${p.city}. ${p.areaSqft} sq.ft. ${formatINR(p.price, p.listingType)}.`;
    const img = p.images?.[0]?.url;
    return {
      title: p.title,
      description: desc,
      alternates: { canonical: `/properties/${p.slug}` },
      openGraph: {
        title: p.title,
        description: desc,
        type: 'article',
        images: img ? [{ url: img, width: 1200, height: 800 }] : [],
      },
      twitter: { card: 'summary_large_image', title: p.title, description: desc, images: img ? [img] : [] },
    };
  } catch {
    return { title: 'Property not found' };
  }
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  let property;
  try {
    const r = await apiGetProperty(params.slug);
    property = r.data;
  } catch {
    notFound();
  }

  if (!property) notFound();

  let similar: any[] = [];
  try {
    const r = await apiSimilar(params.slug);
    similar = r.data || [];
  } catch { /* no-op */ }

  // JSON-LD structured data for SEO (RealEstateListing).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images?.map((i) => i.url),
    datePosted: property.createdAt,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/properties/${property.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.locality,
      addressRegion: property.city,
      addressCountry: 'IN',
    },
    offers: {
      '@type': 'Offer',
      price: String(property.price),
      priceCurrency: 'INR',
      availability: property.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    floorSize: { '@type': 'QuantitativeValue', value: property.areaSqft, unitCode: 'FTK' },
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container pt-6 pb-4">
        <nav className="text-xs text-ink-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-ink-900">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-ink-900">Properties</Link>
          <span>/</span>
          <Link href={`/properties?city=${encodeURIComponent(property.city)}`} className="hover:text-ink-900">
            {property.city}
          </Link>
          <span>/</span>
          <span className="text-ink-700 line-clamp-1">{property.locality}</span>
        </nav>
      </div>

      <div className="container">
        <Gallery images={property.images} title={property.title} />
      </div>

      <div className="container py-8 grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-10">
          {/* Header */}
          <section>
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <span className={property.listingType === 'SALE' ? 'badge-sale' : 'badge-rent'}>
                For {property.listingType === 'SALE' ? 'Sale' : 'Rent'}
              </span>
              {property.isVerified && (
                <span className="badge-gold">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              )}
              <span className="badge">{titleCaseType(property.type)}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
                {property.title}
              </h1>
              <WishlistButton propertyId={property.id} variant="detail" className="shrink-0" />
            </div>
            <p className="flex items-center gap-1.5 text-ink-600 mt-3">
              <MapPin className="h-4 w-4 text-ink-400" />
              {property.address}
            </p>
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-4xl text-ink-900">
                {formatINR(property.price, property.listingType)}
              </span>
              {property.listingType === 'SALE' && (
                <span className="text-sm text-ink-500">
                  · ₹{Math.round(Number(property.price) / property.areaSqft).toLocaleString('en-IN')}/sq.ft
                </span>
              )}
            </div>
          </section>

          {/* Spec grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(property.type === 'PG'
              ? [
                  { icon: Users, label: 'Occupancy', value: roomTypeLabel(property.roomType) || '—' },
                  { icon: Bath, label: 'Bathrooms', value: property.bathrooms || '—' },
                  { icon: Maximize2, label: 'Room size', value: formatArea(property.areaSqft) },
                  { icon: Sofa, label: 'Furnishing', value: titleCaseType(property.furnishing) },
                ]
              : [
                  { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms || '—' },
                  { icon: Bath, label: 'Bathrooms', value: property.bathrooms || '—' },
                  { icon: Maximize2, label: 'Area', value: formatArea(property.areaSqft) },
                  { icon: Sofa, label: 'Furnishing', value: titleCaseType(property.furnishing) },
                ]
            ).map((s) => (
              <div key={s.label} className="card p-4">
                <s.icon className="h-5 w-5 text-gold-500 mb-2" />
                <p className="text-xs text-ink-500">{s.label}</p>
                <p className="font-semibold text-ink-900">{s.value}</p>
              </div>
            ))}
          </section>

          {/* Description */}
          <section>
            <h2 className="font-display text-2xl text-ink-900 mb-3">About this property</h2>
            <p className="text-ink-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </section>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <section>
              <h2 className="font-display text-2xl text-ink-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-ink-700">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    {a}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Meta */}
          <section className="card p-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-ink-500 mb-1 flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Listed</p>
              <p className="text-ink-900 font-medium">{relativeTime(property.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1 flex items-center gap-1.5"><Eye className="h-3 w-3" /> Views</p>
              <p className="text-ink-900 font-medium">{property.viewCount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1">Property ID</p>
              <p className="text-ink-900 font-medium font-mono text-xs">{property.id.slice(0, 8)}</p>
            </div>
          </section>
        </div>

        {/* Sidebar: owner card + CTA */}
        <aside className="space-y-4 lg:sticky lg:top-20 self-start">
          <ContactCTA
            propertyId={property.id}
            propertyTitle={property.title}
            ownerName={property.owner.name}
            ownerEmail={property.owner.email}
            ownerPhone={property.owner.phone || ''}
            ownerRole={property.owner.role}
          />
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="bg-ink-50 py-16">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">You might also like</p>
                <h2 className="font-display text-3xl text-ink-900">Similar properties</h2>
              </div>
              <Link
                href={`/properties?city=${encodeURIComponent(property.city)}&type=${property.type}&listingType=${property.listingType}`}
                className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-ink-700 hover:text-ink-900"
              >
                More in {property.city} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
