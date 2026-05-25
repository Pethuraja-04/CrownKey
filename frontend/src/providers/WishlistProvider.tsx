'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiWishlistAdd, apiWishlistIds, apiWishlistRemove, ApiError } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface WishlistCtx {
  ids: ReadonlySet<string>;
  count: number;
  isWishlisted: (propertyId: string) => boolean;
  // Returns true if the property is now saved, false if removed, null if the
  // call was redirected to login (caller can skip its own toast in that case).
  toggle: (propertyId: string, opts?: { loginRedirect?: boolean }) => Promise<boolean | null>;
  loading: boolean;
}

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, loading: authLoading, openAuth } = useAuth();
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);

  // Track the currently-signed-in user so we can wipe local state on logout
  // even when the next user is the guest (no fetch fires for that case).
  const signedInUserId = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    // Logged out — clear any leftover state from a previous session.
    if (!user || !accessToken) {
      if (signedInUserId.current !== null) {
        setIds(new Set());
        signedInUserId.current = null;
      }
      return;
    }

    // Same user, already hydrated — skip.
    if (signedInUserId.current === user.id) return;
    signedInUserId.current = user.id;

    let cancelled = false;
    setLoading(true);
    apiWishlistIds(accessToken)
      .then((r) => {
        if (!cancelled) setIds(new Set(r.data));
      })
      .catch(() => {
        // Non-fatal — wishlist just won't be hydrated this session.
        if (!cancelled) setIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, accessToken, authLoading]);

  const isWishlisted = useCallback((propertyId: string) => ids.has(propertyId), [ids]);

  const toggle = useCallback<WishlistCtx['toggle']>(
    async (propertyId, opts = {}) => {
      const { loginRedirect = true } = opts;

      if (!user || !accessToken) {
        if (loginRedirect && typeof window !== 'undefined') {
          openAuth('login');
        }
        return null;
      }

      const wasSaved = ids.has(propertyId);
      // Optimistic update — flip the local Set immediately.
      setIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });

      try {
        if (wasSaved) await apiWishlistRemove(accessToken, propertyId);
        else await apiWishlistAdd(accessToken, propertyId);
        return !wasSaved;
      } catch (e) {
        // Roll back on failure.
        setIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(propertyId);
          else next.delete(propertyId);
          return next;
        });
        // Surface the upstream message so the button can show a useful toast.
        throw e instanceof ApiError ? e : new Error('Wishlist update failed');
      }
    },
    [user, accessToken, ids, router],
  );

  const value = useMemo<WishlistCtx>(
    () => ({
      ids,
      count: ids.size,
      isWishlisted,
      toggle,
      loading,
    }),
    [ids, isWishlisted, toggle, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
