'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, PlusCircle, Inbox, Building2, Heart } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';

const nav = [
  { href: '/dashboard', label: 'My listings', icon: Building2 },
  { href: '/dashboard/new', label: 'Add property', icon: PlusCircle },
  { href: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/dashboard/inquiries', label: 'Inquiries', icon: Inbox },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuth } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
      openAuth('login');
    }
  }, [user, loading, router, openAuth]);

  if (loading || !user) {
    return (
      <div className="container py-24 text-center text-ink-500">Checking session…</div>
    );
  }

  return (
    <div className="container py-10 grid md:grid-cols-[240px_1fr] gap-8">
      <aside className="md:sticky md:top-20 self-start">
        <div className="card p-3">
          <div className="px-3 py-3 border-b border-ink-100 mb-2">
            <p className="text-xs text-ink-500">Signed in as</p>
            <p className="text-sm font-semibold text-ink-900 truncate">{user.name}</p>
            <p className="text-xs text-ink-500 truncate">{user.email}</p>
          </div>
          <nav className="space-y-1">
            {nav.map((n) => {
              const active = pathname === n.href;
              const isWishlist = n.href === '/dashboard/wishlist';
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active ? 'bg-ink-900 text-canvas' : 'text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  <span className="flex-1">{n.label}</span>
                  {isWishlist && wishlistCount > 0 && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-canvas/15 text-canvas' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
