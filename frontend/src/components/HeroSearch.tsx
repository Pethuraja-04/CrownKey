'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Gurgaon', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'];

export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<'SALE' | 'RENT'>('SALE');
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const usp = new URLSearchParams();
    usp.set('listingType', tab);
    if (city) usp.set('city', city);
    if (q) usp.set('q', q);
    router.push(`/properties?${usp.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lift overflow-hidden">
      <div className="flex border-b border-ink-100">
        {(['SALE', 'RENT'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-ink-900 bg-canvas border-b-2 border-gold-400'
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {t === 'SALE' ? 'Buy' : 'Rent'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <select
            className="input pl-9"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">Any city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Locality, project, or BHK"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-gold whitespace-nowrap">
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>
    </div>
  );
}
