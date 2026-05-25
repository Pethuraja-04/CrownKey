'use client';

import React, { FormEvent, useState } from 'react';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Property } from '@/lib/types';
import ImageUploader from './ImageUploader';

const blockInvalidNum = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
    e.preventDefault();
  }
};

const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'];
const FURNISHINGS = ['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED'];
const ROOM_TYPES: { value: string; label: string }[] = [
  { value: 'SINGLE', label: 'Single occupancy' },
  { value: 'DOUBLE', label: 'Double sharing' },
  { value: 'TRIPLE', label: 'Triple sharing' },
  { value: 'QUAD', label: 'Quad sharing' },
  { value: 'DORMITORY', label: 'Dormitory' },
];
const AMENITY_OPTIONS = [
  'Gym', 'Swimming Pool', 'Parking', 'Lift', '24x7 Security', 'Power Backup',
  'Clubhouse', 'Garden', 'Kids Play Area', 'Jogging Track', 'CCTV', 'Vastu Compliant',
];

interface FormState {
  title: string;
  description: string;
  price: string;
  type: string;
  listingType: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  furnishing: string;
  roomType: string;
  city: string;
  locality: string;
  address: string;
  amenities: string[];
}

const fromProperty = (p?: Property): FormState => ({
  title: p?.title || '',
  description: p?.description || '',
  price: p ? String(p.price) : '',
  type: p?.type || 'APARTMENT',
  listingType: p?.listingType || 'SALE',
  bedrooms: p ? String(p.bedrooms) : '2',
  bathrooms: p ? String(p.bathrooms) : '2',
  areaSqft: p ? String(p.areaSqft) : '',
  furnishing: p?.furnishing || 'UNFURNISHED',
  roomType: p?.roomType || '',
  city: p?.city || '',
  locality: p?.locality || '',
  address: p?.address || '',
  amenities: p?.amenities || [],
});

// What the parent's onSubmit callback receives. `keepImageUrls` are pre-existing
// image URLs the user chose to keep on edit; `files` are freshly picked uploads.
export interface PropertyFormPayload {
  data: {
    title: string;
    description: string;
    price: number;
    type: string;
    listingType: string;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    furnishing: string;
    roomType: string | null;
    city: string;
    locality: string;
    address: string;
    amenities: string[];
    keepImageUrls?: string[];
  };
  files: File[];
}

interface Props {
  initial?: Property;
  onSubmit: (payload: PropertyFormPayload) => Promise<void>;
  submitLabel: string;
}

export default function PropertyForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<FormState>(fromProperty(initial));
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<{ keepUrls: string[]; files: File[] }>({
    keepUrls: initial?.images?.map((i) => i.url) || [],
    files: [],
  });

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const isPg = form.type === 'PG';
      
      // Require at least one image (both on create and edit).
      if (images.keepUrls.length === 0 && images.files.length === 0) {
        throw new Error('Please add at least one photo for your listing.');
      }
      await onSubmit({
        data: {
          title: form.title,
          description: form.description,
          price: Number(form.price),
          type: form.type,
          listingType: form.listingType,
          bedrooms: isPg ? 0 : Number(form.bedrooms) || 0,
          bathrooms: Number(form.bathrooms) || 0,
          areaSqft: Number(form.areaSqft),
          furnishing: form.furnishing,
          roomType: isPg ? form.roomType || null : null,
          city: form.city,
          locality: form.locality,
          address: form.address,
          amenities: form.amenities,
          // Only send keepImageUrls for edit flow — controllers merge them
          // with newly-uploaded files into a single ordered list.
          ...(initial ? { keepImageUrls: images.keepUrls } : {}),
        },
        files: images.files,
      });
      toast.success('Property saved successfully!');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed. Please check the fields.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-ink-900">Basics</h2>
        <div>
          <label className="label">Title</label>
          <input className="input" required maxLength={150} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="3 BHK Sea-facing Apartment in Bandra West" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[140px] resize-y" required minLength={20}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Spacious 3BHK with balcony overlooking the Arabian Sea…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Listing type</label>
            <select className="input" value={form.listingType}
              onChange={(e) => setForm({ ...form, listingType: e.target.value })}>
              <option value="SALE">For sale</option>
              <option value="RENT">For rent</option>
            </select>
          </div>
          <div>
            <label className="label">Property type</label>
            <select className="input" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-ink-900">Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Price (₹){form.type === 'PG' ? ' / month' : form.listingType === 'RENT' ? ' / month' : ''}</label>
            <input className="input" type="number" min={0} required value={form.price}
              onKeyDown={blockInvalidNum}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Area (sq.ft)</label>
            <input className="input" type="number" min={1} required value={form.areaSqft}
              onKeyDown={blockInvalidNum}
              onChange={(e) => setForm({ ...form, areaSqft: e.target.value })} />
          </div>
          {form.type === 'PG' ? (
            <div className="col-span-2">
              <label className="label">Room type</label>
              <select
                className="input"
                required
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              >
                <option value="">Select occupancy…</option>
                {ROOM_TYPES.map((rt) => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="label">Bedrooms</label>
                <input className="input" type="number" min={0} max={20} value={form.bedrooms}
                  onKeyDown={blockInvalidNum}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input className="input" type="number" min={0} max={20} value={form.bathrooms}
                  onKeyDown={blockInvalidNum}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
            </>
          )}
          {form.type === 'PG' && (
            <div>
              <label className="label">Bathrooms (shared)</label>
              <input className="input" type="number" min={0} max={20} value={form.bathrooms}
                onKeyDown={blockInvalidNum}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
          )}
        </div>
        <div>
          <label className="label">Furnishing</label>
          <select className="input" value={form.furnishing}
            onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
            {FURNISHINGS.map((f) => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-ink-900">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input className="input" required value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
          </div>
          <div>
            <label className="label">Locality</label>
            <input className="input" required value={form.locality}
              onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="Bandra West" />
          </div>
        </div>
        <div>
          <label className="label">Full address</label>
          <input className="input" required value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Sea View Road, Bandra West, Mumbai 400050" />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-ink-900">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                form.amenities.includes(a)
                  ? 'bg-ink-900 text-canvas border-ink-900'
                  : 'bg-white text-ink-700 border-ink-200 hover:border-ink-400'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-gold-500" />
          <h2 className="font-display text-xl text-ink-900">Photos</h2>
        </div>
        <p className="text-sm text-ink-500">
          High-quality photos sell faster. Upload at least one — the first image becomes your listing's cover.
        </p>
        <ImageUploader
          initialImages={initial?.images}
          onChange={setImages}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={busy} className="btn-gold">
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
