'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Edit3, Trash2, Eye, PlusCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { apiDeleteProperty, apiMyProperties } from '@/lib/api';
import { formatINR } from '@/lib/format';
import type { PropertyListItem } from '@/lib/types';

export default function MyListingsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<PropertyListItem[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const load = async () => {
    if (!accessToken) return;
    try {
      const r = await apiMyProperties(accessToken);
      setItems(r.items);
    } catch (e: any) {
      setErr(e?.message || 'Could not load listings');
    }
  };

  useEffect(() => { load(); }, [accessToken]);

  const remove = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    if (!accessToken) return;
    setBusyId(id);
    try {
      await apiDeleteProperty(accessToken, id);
      setItems((items) => items?.filter((p) => p.id !== id) || null);
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink-900">My listings</h1>
          <p className="text-sm text-ink-500 mt-1">Manage every property you've posted.</p>
        </div>
        <Link href="/dashboard/new" className="btn-gold">
          <PlusCircle className="h-4 w-4" /> Add property
        </Link>
      </div>

      {err && <div className="card p-4 text-rose-700 bg-rose-50 border-rose-200 mb-4">{err}</div>}

      {items === null && <div className="card p-12 text-center text-ink-500">Loading…</div>}

      {items && items.length === 0 && (
        <div className="card p-12 text-center">
          <h3 className="font-display text-xl text-ink-900 mb-2">No listings yet</h3>
          <p className="text-sm text-ink-500 mb-5">Post your first property in under 2 minutes.</p>
          <Link href="/dashboard/new" className="btn-primary">Add your first listing</Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="card p-3 flex flex-col sm:flex-row gap-4">
              <Link href={`/properties/${p.slug}`} className="relative aspect-[4/3] sm:w-48 shrink-0 rounded-lg overflow-hidden bg-ink-100">
                {p.images?.[0]?.url && (
                  <Image src={p.images[0].url} alt={p.title} fill className="object-cover" sizes="200px" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/properties/${p.slug}`} className="font-semibold text-ink-900 hover:underline line-clamp-1">
                      {p.title}
                    </Link>
                    <p className="text-xs text-ink-500 mt-1">{p.locality}, {p.city}</p>
                  </div>
                  <span className={`badge ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-600'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-ink-600">
                  <span className="font-semibold text-ink-900">{formatINR(p.price, p.listingType)}</span>
                  <span>{p.bedrooms} BHK · {p.areaSqft} sq.ft</span>
                  {typeof p.viewCount === 'number' && (
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {p.viewCount}</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/properties/${p.slug}`} className="btn-outline text-xs py-1.5 px-3">View</Link>
                  <Link href={`/dashboard/properties/${p.id}/edit`} className="btn-outline text-xs py-1.5 px-3">
                    <Edit3 className="h-3 w-3" /> Edit
                  </Link>
                  <button
                    onClick={() => remove(p.id)}
                    disabled={busyId === p.id}
                    className="btn-outline text-xs py-1.5 px-3 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                  >
                    <Trash2 className="h-3 w-3" /> {busyId === p.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
