'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiGetProperty, apiUpdateProperty } from '@/lib/api';
import PropertyForm, { type PropertyFormPayload } from '@/components/property/PropertyForm';
import type { Property } from '@/lib/types';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    apiGetProperty(id)
      .then((r) => setProperty(r.data))
      .catch((e) => setErr(e?.message || 'Could not load property'));
  }, [id]);

  const submit = async ({ data, files }: PropertyFormPayload) => {
    if (!accessToken) throw new Error('Not authenticated');
    const r = await apiUpdateProperty(accessToken, id, data, files);
    router.push(`/properties/${r.data.slug}`);
  };

  if (err) return <div className="card p-6 text-rose-700 bg-rose-50 border-rose-200">{err}</div>;
  if (!property) return <div className="card p-12 text-center text-ink-500">Loading…</div>;

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">Edit</p>
        <h1 className="font-display text-3xl text-ink-900">{property.title}</h1>
      </div>
      <PropertyForm initial={property} onSubmit={submit} submitLabel="Save changes" />
    </div>
  );
}
