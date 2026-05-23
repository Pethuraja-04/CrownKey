'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, FormEvent, useEffect } from 'react';
import { SlidersHorizontal, X, ShieldCheck, Sparkles } from 'lucide-react';

const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'];
const FURNISHINGS = ['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED'];
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];
const BATHROOM_OPTIONS = [1, 2, 3, 4];
const ROOM_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'DOUBLE', label: 'Double' },
  { value: 'TRIPLE', label: 'Triple' },
  { value: 'QUAD', label: 'Quad' },
  { value: 'DORMITORY', label: 'Dorm' },
];
const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Gurgaon', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Noida', 'Ahmedabad'];
// Canonical list — mirrors AMENITY_OPTIONS in PropertyForm.tsx so the
// exact-match `hasEvery` filter on the backend lines up with stored values.
const AMENITIES = [
  'Gym', 'Swimming Pool', 'Parking', 'Lift', '24x7 Security', 'Power Backup',
  'Clubhouse', 'Garden', 'Kids Play Area', 'Jogging Track', 'CCTV', 'Vastu Compliant',
];
const POSTED_WITHIN: { value: string; label: string }[] = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const titleCase = (s: string) => s.replace('_', ' ').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

interface FormState {
  q: string;
  city: string;
  type: string;
  listingType: string;
  bedrooms: string;
  bathrooms: string;
  roomType: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  furnishing: string;
  amenities: string[];
  isVerified: boolean;
  postedWithin: string;
  sort: string;
}

const readForm = (params: URLSearchParams): FormState => ({
  q: params.get('q') || '',
  city: params.get('city') || '',
  type: params.get('type') || '',
  listingType: params.get('listingType') || '',
  bedrooms: params.get('bedrooms') || '',
  bathrooms: params.get('bathrooms') || '',
  roomType: params.get('roomType') || '',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  minArea: params.get('minArea') || '',
  maxArea: params.get('maxArea') || '',
  furnishing: params.get('furnishing') || '',
  amenities: params.getAll('amenities'),
  isVerified: params.get('isVerified') === 'true',
  postedWithin: params.get('postedWithin') || '',
  sort: params.get('sort') || 'newest',
});

export default function FiltersSidebar() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<FormState>(() => readForm(new URLSearchParams(params.toString())));

  useEffect(() => {
    setForm(readForm(new URLSearchParams(params.toString())));
  }, [params]);

  const isPg = form.type === 'PG';

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const apply = (e?: FormEvent) => {
    e?.preventDefault();
    const usp = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => {
      // Drop the field that doesn't apply to the current property type so URLs
      // stay clean and the API doesn't get conflicting filters.
      if (k === 'roomType' && !isPg) return;
      if (k === 'bedrooms' && isPg) return;

      if (k === 'amenities' && Array.isArray(v)) {
        v.forEach((a) => usp.append('amenities', a));
        return;
      }
      if (k === 'isVerified') {
        if (v === true) usp.set('isVerified', 'true');
        return;
      }
      if (typeof v === 'string' && v) usp.set(k, v);
    });
    startTransition(() => {
      router.push(`/properties?${usp.toString()}`);
      setOpen(false);
    });
  };

  const reset = () => {
    startTransition(() => router.push('/properties'));
  };

  const activeCount = (() => {
    let n = 0;
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      if (k === 'sort') return;
      const v = form[k];
      if (k === 'amenities') {
        if ((v as string[]).length > 0) n += 1;
      } else if (k === 'isVerified') {
        if (v === true) n += 1;
      } else if (typeof v === 'string' && v) {
        n += 1;
      }
    });
    return n;
  })();

  return (
    <>
      <button
        className="md:hidden btn-outline mb-4 w-full"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters {activeCount > 0 && <span className="badge-gold ml-1">{activeCount}</span>}
      </button>

      <aside
        className={`
          ${open ? 'fixed inset-0 z-50 bg-canvas overflow-y-auto p-4' : 'hidden'}
          md:block md:sticky md:top-20 md:p-0 md:bg-transparent
        `}
      >
        <form onSubmit={apply} className="card p-5 space-y-5 md:max-w-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink-900">Refine</h3>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="text-xs text-ink-500 hover:text-ink-900">
                  Clear all
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="md:hidden p-1 hover:bg-ink-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Locality, title…"
              value={form.q}
              onChange={(e) => setForm({ ...form, q: e.target.value })}
            />
          </div>

          <div>
            <label className="label">City</label>
            <select
              className="input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <option value="">All cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Listing</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[['', 'All'], ['SALE', 'Buy'], ['RENT', 'Rent']].map(([v, label]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setForm({ ...form, listingType: v })}
                  className={`text-xs font-medium py-2 rounded-md border transition-colors ${
                    form.listingType === v
                      ? 'bg-ink-900 text-canvas border-ink-900'
                      : 'bg-white text-ink-700 border-ink-200 hover:border-ink-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Property type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="">Any type</option>
              {TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
            </select>
          </div>

          {isPg ? (
            <div>
              <label className="label">Room type</label>
              <div className="flex gap-1.5 no-scrollbar overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, roomType: '' })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border whitespace-nowrap ${
                    !form.roomType ? 'bg-ink-900 text-canvas border-ink-900' : 'bg-white border-ink-200 hover:border-ink-400'
                  }`}
                >
                  Any
                </button>
                {ROOM_TYPE_OPTIONS.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setForm({ ...form, roomType: rt.value })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border whitespace-nowrap ${
                      form.roomType === rt.value ? 'bg-ink-900 text-canvas border-ink-900' : 'bg-white border-ink-200 hover:border-ink-400'
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-ink-400">Occupancy / sharing type for PG &amp; hostels.</p>
            </div>
          ) : (
            <div>
              <label className="label">Bedrooms</label>
              <div className="flex gap-1.5 no-scrollbar overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, bedrooms: '' })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                    !form.bedrooms ? 'bg-ink-900 text-canvas border-ink-900' : 'bg-white border-ink-200 hover:border-ink-400'
                  }`}
                >
                  Any
                </button>
                {BEDROOM_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, bedrooms: String(n) })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border whitespace-nowrap ${
                      form.bedrooms === String(n) ? 'bg-ink-900 text-canvas border-ink-900' : 'bg-white border-ink-200 hover:border-ink-400'
                    }`}
                  >
                    {n}+ BHK
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">Bathrooms</label>
            <div className="flex gap-1.5 no-scrollbar overflow-x-auto">
              <button
                type="button"
                onClick={() => setForm({ ...form, bathrooms: '' })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                  !form.bathrooms ? 'bg-ink-900 text-canvas border-ink-900' : 'bg-white border-ink-200 hover:border-ink-400'
                }`}
              >
                Any
              </button>
              {BATHROOM_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, bathrooms: String(n) })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border whitespace-nowrap ${
                    form.bathrooms === String(n) ? 'bg-ink-900 text-canvas border-ink-900' : 'bg-white border-ink-200 hover:border-ink-400'
                  }`}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Budget (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                className="input"
                value={form.minPrice}
                onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max"
                className="input"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Area (sq ft)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                className="input"
                value={form.minArea}
                onChange={(e) => setForm({ ...form, minArea: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max"
                className="input"
                value={form.maxArea}
                onChange={(e) => setForm({ ...form, maxArea: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Furnishing</label>
            <select
              className="input"
              value={form.furnishing}
              onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
            >
              <option value="">Any</option>
              {FURNISHINGS.map((f) => <option key={f} value={f}>{titleCase(f)}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label !mb-0 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-gold-600" />
                Amenities
              </label>
              {form.amenities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, amenities: [] })}
                  className="text-[11px] text-ink-500 hover:text-ink-900"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AMENITIES.map((a) => {
                const active = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                      active
                        ? 'bg-gold-50 text-gold-800 border-gold-400'
                        : 'bg-white text-ink-700 border-ink-200 hover:border-ink-400'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer group">
            <span className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={form.isVerified}
                onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
              />
              <span className="block h-4 w-4 rounded border border-ink-300 bg-white peer-checked:bg-ink-900 peer-checked:border-ink-900 transition-colors" />
              <svg
                className="absolute inset-0 m-auto h-3 w-3 text-canvas opacity-0 peer-checked:opacity-100"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8l3.5 3.5L13 5" />
              </svg>
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-ink-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified listings only
              </span>
              <span className="block text-[11px] text-ink-400 mt-0.5">
                Hide unverified properties.
              </span>
            </span>
          </label>

          <div>
            <label className="label">Posted within</label>
            <select
              className="input"
              value={form.postedWithin}
              onChange={(e) => setForm({ ...form, postedWithin: e.target.value })}
            >
              <option value="">Any time</option>
              {POSTED_WITHIN.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Sort by</label>
            <select
              className="input"
              value={form.sort}
              onChange={(e) => setForm({ ...form, sort: e.target.value })}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="area_desc">Largest first</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending ? 'Applying…' : 'Apply filters'}
          </button>
        </form>
      </aside>
    </>
  );
}
