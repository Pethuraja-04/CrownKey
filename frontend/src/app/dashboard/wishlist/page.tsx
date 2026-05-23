'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { apiWishlistList, ApiError, type WishlistListItem } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import PropertyCard from '@/components/property/PropertyCard';

export default function WishlistPage() {
  const { accessToken, loading: authLoading } = useAuth();
  // Subscribing keeps the page re-rendering when a heart is toggled elsewhere
  // and lets us re-filter the local items after an unsave.
  const { ids: wishlistIds } = useWishlist();
  const [items, setItems] = useState<WishlistListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const r = await apiWishlistList(accessToken, 1, 50);
      setItems(r.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load your wishlist.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  // Drop items that the user unsaved from another tab/card — keeps the grid
  // consistent without a full refetch.
  const visible = items.filter((p) => wishlistIds.has(p.id));

  return (
    <div>
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1.5">
            Saved by you
          </p>
          <h1 className="font-display text-3xl text-ink-900">Wishlist</h1>
          <p className="text-sm text-ink-500 mt-1.5">
            {visible.length === 0
              ? 'No properties saved yet.'
              : `${visible.length} ${visible.length === 1 ? 'property' : 'properties'} saved.`}
          </p>
        </div>
      </div>

      {loading && (
        <div className="card p-12 text-center text-ink-500">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-3" />
          Loading your saved properties…
        </div>
      )}

      {!loading && error && (
        <div className="card p-6 text-rose-700 bg-rose-50 border-rose-200">
          <p className="font-semibold mb-1">Couldn't load wishlist</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="card p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-rose-50 grid place-items-center mb-4">
            <Heart className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="font-display text-xl text-ink-900 mb-2">Nothing saved yet</h3>
          <p className="text-sm text-ink-500 mb-5 max-w-sm mx-auto">
            Tap the heart on any listing to keep it here. Your shortlist will be ready when you
            come back.
          </p>
          <Link href="/properties" className="btn-primary">Browse properties</Link>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {visible.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
