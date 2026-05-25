'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Gurgaon', 'Pune', 'Hyderabad', 'Chennai', 'Noida', 'Kolkata'];

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'Independent House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PLOT', label: 'Plot & Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'PG', label: 'PG & Hostel' },
];

const PRICE_RANGES = [
  { label: 'Under ₹25 Lakhs', min: 0, max: 2500000 },
  { label: '₹25L - ₹50 Lakhs', min: 2500000, max: 5000000 },
  { label: '₹50L - ₹1 Crore', min: 5000000, max: 10000000 },
  { label: '₹1Cr - ₹2 Crores', min: 10000000, max: 20000000 },
  { label: '₹2Cr - ₹5 Crores', min: 20000000, max: 50000000 },
  { label: '₹5 Crores+', min: 50000000, max: 999999999 },
];

const ROOMS_OPTIONS = [
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4+ BHK' },
];

export default function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<'SALE' | 'RENT'>('SALE');
  const [propertyType, setPropertyType] = useState('');
  const [priceIdx, setPriceIdx] = useState('');
  const [city, setCity] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const usp = new URLSearchParams();
    usp.set('listingType', listingType);
    if (propertyType) usp.set('type', propertyType);
    if (city) usp.set('city', city);
    if (bedrooms) usp.set('bedrooms', bedrooms);

    if (priceIdx !== '') {
      const range = PRICE_RANGES[Number(priceIdx)];
      if (range) {
        if (range.min > 0) usp.set('minPrice', String(range.min));
        if (range.max < 999999999) usp.set('maxPrice', String(range.max));
      }
    }

    router.push(`/properties?${usp.toString()}`);
  };

  const applyQuickFilter = (typeVal: string) => {
    const usp = new URLSearchParams();
    usp.set('listingType', listingType);
    if (typeVal === 'CITY') {
      usp.set('city', 'Mumbai');
    } else {
      usp.set('type', typeVal);
    }
    router.push(`/properties?${usp.toString()}`);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-[24px] shadow-[0_24px_50px_-15px_rgba(11,31,58,0.3)] p-6 md:p-8 border border-white/20 w-full relative z-20 hero-fade-up">
      {/* CSS Animation injection */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-fade-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Title + Buy/Rent Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-white/40 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight font-display">
            Discover Your Perfect Address
          </h2>
          <p className="text-white/60 text-xs mt-1 font-sans">Direct owner connections with verified listings</p>
        </div>
        
        {/* Toggle Pills */}
        <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-full self-start sm:self-auto backdrop-blur-md">
          <button
            type="button"
            onClick={() => setListingType('SALE')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              listingType === 'SALE'
                ? 'bg-luxury-navy text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setListingType('RENT')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              listingType === 'RENT'
                ? 'bg-luxury-navy text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Rent
          </button>
        </div>
      </div>

      {/* Grid Fields */}
      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Property Type Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-2 ml-1">
              Looking for
            </label>
            <div className="relative bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:-translate-y-[1px] focus-within:bg-white/10 focus-within:border-white/30 transition-all duration-300 rounded-[14px] flex items-center px-4 py-3.5 shadow-sm">
              <select
                className="w-full bg-transparent outline-none text-white text-sm appearance-none pr-8 cursor-pointer font-medium"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="" className="bg-luxury-navy text-white font-medium">Select property type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-luxury-navy text-white font-medium">
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/60 pointer-events-none" />
            </div>
          </div>

          {/* Price Range Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-2 ml-1">
              Budget Range
            </label>
            <div className="relative bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:-translate-y-[1px] focus-within:bg-white/10 focus-within:border-white/30 transition-all duration-300 rounded-[14px] flex items-center px-4 py-3.5 shadow-sm">
              <select
                className="w-full bg-transparent outline-none text-white text-sm appearance-none pr-8 cursor-pointer font-medium"
                value={priceIdx}
                onChange={(e) => setPriceIdx(e.target.value)}
              >
                <option value="" className="bg-luxury-navy text-white font-medium">Select budget</option>
                {PRICE_RANGES.map((r, idx) => (
                  <option key={idx} value={idx} className="bg-luxury-navy text-white font-medium">
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/60 pointer-events-none" />
            </div>
          </div>

          {/* Location Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-2 ml-1">
              Select City
            </label>
            <div className="relative bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:-translate-y-[1px] focus-within:bg-white/10 focus-within:border-white/30 transition-all duration-300 rounded-[14px] flex items-center px-4 py-3.5 shadow-sm">
              <select
                className="w-full bg-transparent outline-none text-white text-sm appearance-none pr-8 cursor-pointer font-medium"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="" className="bg-luxury-navy text-white font-medium">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-luxury-navy text-white font-medium">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/60 pointer-events-none" />
            </div>
          </div>

          {/* Bedrooms Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-2 ml-1">
              Rooms configuration
            </label>
            <div className="relative bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:-translate-y-[1px] focus-within:bg-white/10 focus-within:border-white/30 transition-all duration-300 rounded-[14px] flex items-center px-4 py-3.5 shadow-sm">
              <select
                className="w-full bg-transparent outline-none text-white text-sm appearance-none pr-8 cursor-pointer font-medium"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              >
                <option value="" className="bg-luxury-navy text-white font-medium">Select configuration</option>
                {ROOMS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-luxury-navy text-white font-medium">
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/60 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bottom row: Filter pills & Search Button */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-5 border-t border-white/10">
          {/* Pills row */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-white/40 mr-1.5 uppercase tracking-wider">Quick Filters:</span>
            <button
              type="button"
              onClick={() => applyQuickFilter('CITY')}
              className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5 font-medium transition-all duration-300"
            >
              Mumbai Listings
            </button>
            <button
              type="button"
              onClick={() => applyQuickFilter('HOUSE')}
              className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5 font-medium transition-all duration-300"
            >
              Independent Houses
            </button>
            <button
              type="button"
              onClick={() => applyQuickFilter('VILLA')}
              className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5 font-medium transition-all duration-300"
            >
              Luxury Villas
            </button>
            <button
              type="button"
              onClick={() => applyQuickFilter('APARTMENT')}
              className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5 font-medium transition-all duration-300"
            >
              Apartments
            </button>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full md:w-auto bg-luxury-navy hover:bg-luxury-deep hover:shadow-[0_8px_20px_-6px_rgba(11,31,58,0.5)] active:scale-[0.98] px-8 py-4 rounded-[14px] font-bold text-sm transition-all duration-300 shadow-md tracking-wider flex items-center justify-center gap-2 text-white"
          >
            <Search className="w-4 h-4 text-luxury-gold" />
            <span>Search Properties</span>
          </button>
        </div>
      </form>
    </div>
  );
}
