import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiListProperties } from '@/lib/api';
import PropertyCard from '@/components/property/PropertyCard';
import FiltersSidebar from '@/components/property/FiltersSidebar';
import type { PropertyFilters } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface SP {
  q?: string;
  city?: string;
  type?: string;
  listingType?: string;
  bedrooms?: string;
  bathrooms?: string;
  roomType?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  furnishing?: string;
  amenities?: string | string[];
  isVerified?: string;
  postedWithin?: string;
  sort?: string;
  page?: string;
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const city = searchParams.city ? ` in ${searchParams.city}` : '';
  const intent = searchParams.listingType === 'RENT' ? 'for rent' : searchParams.listingType === 'SALE' ? 'for sale' : '';
  return {
    title: `Properties${intent ? ' ' + intent : ''}${city}`,
    description: `Browse verified properties${intent ? ' ' + intent : ''}${city}. Filter by budget, bedrooms, and amenities.`,
    alternates: { canonical: '/properties' },
  };
}

const parseFilters = (s: SP): PropertyFilters => ({
  q: s.q,
  city: s.city,
  type: s.type as PropertyFilters['type'],
  listingType: s.listingType as PropertyFilters['listingType'],
  bedrooms: s.bedrooms ? Number(s.bedrooms) : undefined,
  bathrooms: s.bathrooms ? Number(s.bathrooms) : undefined,
  roomType: s.roomType as PropertyFilters['roomType'],
  minPrice: s.minPrice ? Number(s.minPrice) : undefined,
  maxPrice: s.maxPrice ? Number(s.maxPrice) : undefined,
  minArea: s.minArea ? Number(s.minArea) : undefined,
  maxArea: s.maxArea ? Number(s.maxArea) : undefined,
  furnishing: s.furnishing as PropertyFilters['furnishing'],
  amenities: s.amenities
    ? Array.isArray(s.amenities)
      ? s.amenities
      : [s.amenities]
    : undefined,
  isVerified: s.isVerified === 'true' || undefined,
  postedWithin: s.postedWithin as PropertyFilters['postedWithin'],
  sort: (s.sort as PropertyFilters['sort']) || 'newest',
  page: s.page ? Number(s.page) : 1,
  limit: 12,
});

export default async function PropertiesPage({ searchParams }: { searchParams: SP }) {
  const filters = parseFilters(searchParams);

  let items: any[] = [];
  let pagination = { page: 1, totalPages: 1, total: 0, limit: 12 };
  let error: string | null = null;

  try {
    const r = await apiListProperties(filters);
    items = r.items || [];
    pagination = r.pagination;
  } catch (e: any) {
    error = e?.message || 'Could not load properties. Is the API running?';
  }

  const qs = new URLSearchParams(searchParams as any);
  const pageUrl = (n: number) => {
    qs.set('page', String(n));
    return `/properties?${qs.toString()}`;
  };

  return (
    <div className="bg-canvas">
      {/* Page header */}
      <div className="border-b border-ink-100 bg-white">
        <div className="container py-8">
          <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">Search results</p>
          <h1 className="font-display text-3xl md:text-4xl text-ink-900">
            {filters.city ? `Properties in ${filters.city}` : 'All properties'}
            {filters.listingType && (
              <span className="text-ink-500"> · {filters.listingType === 'SALE' ? 'For Sale' : 'For Rent'}</span>
            )}
          </h1>
          {!error && (
            <p className="text-sm text-ink-500 mt-2">
              {pagination.total.toLocaleString('en-IN')} properties found
            </p>
          )}
        </div>
      </div>

      <div className="container py-8 grid md:grid-cols-[280px_1fr] gap-8">
        <FiltersSidebar />

        <div>
          {error && (
            <div className="card p-6 text-rose-700 bg-rose-50 border-rose-200">
              <p className="font-semibold mb-1">Couldn't load listings</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-3 text-rose-600">
                Make sure the backend is running at <code>NEXT_PUBLIC_API_URL</code>.
              </p>
            </div>
          )}

          {!error && items.length === 0 && (
            <div className="card p-12 text-center">
              <h3 className="font-display text-xl text-ink-900 mb-2">No properties match your filters</h3>
              <p className="text-sm text-ink-500 mb-5">Try widening your search or clearing some filters.</p>
              <Link href="/properties" className="btn-outline">Clear filters</Link>
            </div>
          )}

          {!error && items.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((p, i) => (
                  <PropertyCard key={p.id} p={p} priority={i < 3} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-1">
                  <Link
                    href={pageUrl(Math.max(1, pagination.page - 1))}
                    className={`btn-outline ${pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                    aria-disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Link>

                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                    const base = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
                    const n = base + i;
                    if (n > pagination.totalPages) return null;
                    const active = n === pagination.page;
                    return (
                      <Link
                        key={n}
                        href={pageUrl(n)}
                        className={`min-w-10 h-10 grid place-items-center rounded-md text-sm font-medium ${
                          active ? 'bg-ink-900 text-canvas' : 'text-ink-700 hover:bg-ink-100'
                        }`}
                      >
                        {n}
                      </Link>
                    );
                  })}

                  <Link
                    href={pageUrl(Math.min(pagination.totalPages, pagination.page + 1))}
                    className={`btn-outline ${pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                    aria-disabled={pagination.page === pagination.totalPages}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
