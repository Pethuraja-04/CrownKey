'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';
import {
  Menu, X, LogOut, PlusCircle, LayoutDashboard, Phone, Search, Heart, ChevronDown,
  Building2, Home, TreePine, Briefcase, BedDouble, ArrowUpRight, Sparkles, MapPin, Inbox,
  Key, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { cn } from '@/lib/format';
import AuthModal from '@/components/auth/AuthModal';

type MegaKey = 'buy' | 'rent' | null;

const TOP_CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Gurgaon', 'Pune', 'Hyderabad', 'Chennai', 'Noida'];

const PROPERTY_TYPES_BUY = [
  { type: 'APARTMENT', label: 'Apartments', icon: Building2, blurb: 'High-rises & gated communities' },
  { type: 'VILLA', label: 'Villas', icon: Home, blurb: 'Independent luxury homes' },
  { type: 'HOUSE', label: 'Independent houses', icon: Home, blurb: 'Detached & row houses' },
  { type: 'PLOT', label: 'Plots & land', icon: TreePine, blurb: 'Residential & investment plots' },
  { type: 'COMMERCIAL', label: 'Commercial', icon: Briefcase, blurb: 'Offices, shops, warehouses' },
];

const PROPERTY_TYPES_RENT = [
  { type: 'APARTMENT', label: 'Apartments for rent', icon: Building2, blurb: 'Family & bachelor homes' },
  { type: 'HOUSE', label: 'Houses for rent', icon: Home, blurb: 'Independent rentals' },
  { type: 'PG', label: 'PG & Hostels', icon: BedDouble, blurb: 'Single, double & shared rooms' },
  { type: 'COMMERCIAL', label: 'Commercial rent', icon: Briefcase, blurb: 'Office & retail spaces' },
];

export default function Header() {
  const { user, logout, loading, openAuth } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mega, setMega] = useState<MegaKey>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close popovers on route change.
  useEffect(() => {
    setMega(null);
    setUserMenu(false);
    setMobile(false);
    setSearchOpen(false);
  }, [pathname]);

  // Esc closes everything.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMega(null);
        setUserMenu(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Hover-intent helpers so the mega menu doesn't flicker between trigger + panel.
  const openMega = (key: Exclude<MegaKey, null>) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 120);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const usp = new URLSearchParams();
    if (searchVal.trim()) usp.set('q', searchVal.trim());
    router.push(`/properties?${usp.toString()}`);
    setSearchOpen(false);
  };

  return (
    <>
      {/* ─── Announcement bar ────────────────────────────────────────── */}
      <div className="hidden md:block bg-luxury-navy text-zinc-300 text-[11px] border-b border-white/10">
        <div className="container h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:+919000000000" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3 w-3" /> +91 90000 00000
            </a>
            <span className="text-zinc-500">·</span>
            <span>Mon–Sun · 9 AM – 9 PM IST</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-luxury-gold animate-pulse" />
            <span className="font-medium">Zero brokerage on every listing · Direct from owner</span>
          </div>
        </div>
      </div>

      {/* ─── Floating Header Pill Wrapper ────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full py-3 px-4 sm:px-6 md:px-8 pointer-events-none">
        <div 
          className={cn(
            "mx-auto max-w-7xl w-full rounded-full flex items-center justify-between h-14 md:h-16 px-6 pointer-events-auto border transition-all duration-500 ease-out",
            "bg-white/85 backdrop-blur-xl border-white/50 shadow-[0_8px_30px_rgba(11,31,58,0.06)]"
          )}
        >
          {/* Brand Logo (Left) */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative h-8 w-8 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo-navy.png"
                alt="CrownKey Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-luxury-navy">
              CrownKey
            </span>
          </Link>

          {/* Center nav links (Middle) */}
          <Suspense fallback={<div className="hidden lg:block w-96 h-8 bg-transparent" />}>
            <HeaderNavigation
              scrolled={scrolled}
              pathname={pathname}
              mega={mega}
              openMega={openMega}
              scheduleClose={scheduleClose}
            />
          </Suspense>

          {/* Right cluster (Right) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="p-2 rounded-full transition-all border text-luxury-navy hover:bg-zinc-50 border-zinc-200/50"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Wishlist Link */}
            <Link
              href={user ? '/dashboard/wishlist' : '#'}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuth('login');
                }
              }}
              aria-label={wishlistCount > 0 ? `Wishlist (${wishlistCount} saved)` : 'Wishlist'}
              className="relative p-2 rounded-full transition-all border text-luxury-navy hover:bg-zinc-50 border-zinc-200/50"
            >
              <Heart className={cn('h-4 w-4', wishlistCount > 0 && 'fill-rose-500 text-rose-500')} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-luxury-navy text-white text-[10px] font-bold leading-none">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            <div className="w-px h-5 mx-1 bg-zinc-200" />

            {!loading && !user && (
              <button
                onClick={() => openAuth('login')}
                className="bg-luxury-navy hover:bg-luxury-deep text-white text-xs font-bold px-5 py-2.5 rounded-[14px] transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>Get started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {!loading && user && (
              <>
                <Link 
                  href="/dashboard/new" 
                  className="bg-luxury-navy hover:bg-luxury-deep text-white text-xs font-bold px-4 py-2.5 rounded-[14px] transition-all shadow-md flex items-center gap-1 active:scale-95"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Post property
                </Link>
                <div className="relative ml-1">
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-zinc-200 bg-white hover:border-zinc-400 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-luxury-navy text-white grid place-items-center text-xs font-bold">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <ChevronDown className="h-3 w-3 text-zinc-500" />
                  </button>

                  {userMenu && (
                    <div
                      className="absolute right-0 mt-2 w-64 card p-2 animate-fade-up z-50 border border-zinc-200/60 shadow-xl bg-white rounded-2xl"
                      onMouseLeave={() => setUserMenu(false)}
                    >
                      <div className="px-3 py-3 border-b border-zinc-100 mb-1">
                        <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <MenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" sub="My listings" />
                      <MenuItem href="/dashboard/new" icon={PlusCircle} label="Add property" sub="Post a new listing" />
                      <MenuItem href="/dashboard/inquiries" icon={Inbox} label="Inquiries" sub="Messages received" />
                      <div className="my-1 h-px bg-zinc-100" />
                      <button
                        onClick={async () => { setUserMenu(false); await logout(); router.push('/'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-full transition-colors text-luxury-navy hover:bg-zinc-100"
            onClick={() => setMobile((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* ─── Floating Mega Menus ───────────────────────────────────── */}
        {mega === 'buy' && (
          <MegaPanel onEnter={() => openMega('buy')} onLeave={scheduleClose}>
            <MegaContent listingType="SALE" types={PROPERTY_TYPES_BUY} heading="Buy your next home" />
          </MegaPanel>
        )}

        {mega === 'rent' && (
          <MegaPanel onEnter={() => openMega('rent')} onLeave={scheduleClose}>
            <MegaContent listingType="RENT" types={PROPERTY_TYPES_RENT} heading="Rent without brokers" />
          </MegaPanel>
        )}

        {/* ─── Floating Search Dropdown ──────────────────────────────── */}
        {searchOpen && (
          <div className="absolute left-4 right-4 md:left-8 md:right-8 mt-2 max-w-7xl mx-auto bg-white border border-zinc-200/60 rounded-3xl shadow-xl animate-fade-up overflow-hidden z-50 pointer-events-auto">
            <div className="py-5 px-8">
              <form onSubmit={submitSearch} className="flex items-center gap-3">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search by locality, project, or BHK…"
                  className="flex-1 bg-transparent outline-none text-base text-zinc-900 placeholder:text-zinc-400"
                />
                <button type="submit" className="bg-luxury-navy hover:bg-luxury-deep text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm">Search</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-zinc-400 self-center mr-1">Popular:</span>
                {['3 BHK in Bandra', 'Villa in Whitefield', 'PG in HSR Layout', 'Plot in Sohna Road', 'Office in Andheri'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSearchVal(s); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Mobile menu ────────────────────────────────────────────── */}
      {mobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-up">
          <div className="sticky top-0 bg-white border-b border-zinc-100">
            <div className="container h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobile(false)}>
                <div className="relative h-9 w-9">
                  <Image
                    src="/logo-navy.png"
                    alt="CrownKey Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-display text-xl font-semibold text-luxury-navy">CrownKey</span>
              </Link>
              <button onClick={() => setMobile(false)} className="p-2 rounded-md hover:bg-zinc-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="container py-6 space-y-6">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                className="input pl-10 h-12 text-base"
                placeholder="Search properties…"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </form>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Browse</p>
              <div className="space-y-1">
                <MobileLink href="/properties?listingType=SALE" label="Buy a home" icon={Building2} />
                <MobileLink href="/properties?listingType=RENT" label="Rent a home" icon={Home} />
                <MobileLink href="/properties?type=PG" label="PG & Hostels" icon={BedDouble} />
                <MobileLink href="/properties?type=COMMERCIAL" label="Commercial" icon={Briefcase} />
                <MobileLink href="/properties?type=PLOT" label="Plots & land" icon={TreePine} />
                <MobileLink href="/properties" label="All listings" icon={Search} />
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Top cities</p>
              <div className="grid grid-cols-2 gap-2">
                {TOP_CITIES.map((c) => (
                  <Link
                    key={c}
                    href={`/properties?city=${encodeURIComponent(c)}`}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-colors text-sm text-zinc-800"
                    onClick={() => setMobile(false)}
                  >
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" /> {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard/new" className="bg-luxury-navy hover:bg-luxury-deep text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2" onClick={() => setMobile(false)}>
                    <PlusCircle className="h-4 w-4 text-luxury-gold" /> Post property
                  </Link>
                  <Link href="/dashboard" className="btn-outline w-full py-3 justify-center" onClick={() => setMobile(false)}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button onClick={async () => { setMobile(false); await logout(); router.push('/'); }} className="btn-ghost w-full py-3 text-rose-600 justify-center">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMobile(false); openAuth('register'); }}
                    className="bg-luxury-navy hover:bg-luxury-deep text-white text-sm font-bold w-full py-3 rounded-xl"
                  >
                    Get started
                  </button>
                  <button
                    onClick={() => { setMobile(false); openAuth('login'); }}
                    className="btn-outline w-full py-3 justify-center"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Auth Modal popup */}
      <AuthModal />
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────────

function HeaderNavigation({
  scrolled,
  pathname,
  mega,
  openMega,
  scheduleClose,
}: {
  scrolled: boolean;
  pathname: string;
  mega: MegaKey;
  openMega: (key: Exclude<MegaKey, null>) => void;
  scheduleClose: () => void;
}) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || '';
  const listingTypeParam = searchParams.get('listingType') || '';

  return (
    <nav className="hidden lg:flex items-center gap-1">
      <MegaTrigger
        label="Buy"
        active={mega === 'buy' || (pathname === '/properties' && listingTypeParam === 'SALE')}
        onEnter={() => openMega('buy')}
        onLeave={scheduleClose}
        scrolled={scrolled}
      />
      <MegaTrigger
        label="Rent"
        active={mega === 'rent' || (pathname === '/properties' && listingTypeParam === 'RENT')}
        onEnter={() => openMega('rent')}
        onLeave={scheduleClose}
        scrolled={scrolled}
      />
      <NavLink href="/properties?type=PG" label="PG & Hostels" scrolled={scrolled} active={pathname === '/properties' && typeParam === 'PG'} />
      <NavLink href="/properties?type=COMMERCIAL" label="Commercial" scrolled={scrolled} active={pathname === '/properties' && typeParam === 'COMMERCIAL'} />
      <NavLink href="/properties" label="All Listings" scrolled={scrolled} active={pathname === '/properties' && !typeParam && !listingTypeParam} />
    </nav>
  );
}

function NavLink({ href, label, scrolled, active }: { href: string; label: string; scrolled: boolean; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-full text-xs font-bold transition-all duration-300',
        active
          ? 'bg-luxury-navy text-white shadow-sm'
          : 'text-luxury-navy/80 hover:text-luxury-navy hover:bg-luxury-navy/5',
      )}
    >
      {label}
    </Link>
  );
}

function MegaTrigger({
  label,
  active,
  onEnter,
  onLeave,
  scrolled,
}: {
  label: string;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  scrolled: boolean;
}) {
  return (
    <button
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300',
        active
          ? 'bg-luxury-navy text-white shadow-sm'
          : 'text-luxury-navy/80 hover:text-luxury-navy hover:bg-luxury-navy/5',
      )}
    >
      <span>{label}</span>
      <ChevronDown className="h-3 w-3 opacity-70" />
    </button>
  );
}

function MegaPanel({
  children,
  onEnter,
  onLeave,
}: {
  children: React.ReactNode;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute left-4 right-4 md:left-8 md:right-8 mt-2 max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-zinc-200/50 rounded-[2rem] shadow-xl animate-fade-up overflow-hidden z-50 pointer-events-auto"
    >
      <div className="py-8 px-8">{children}</div>
    </div>
  );
}

function MegaContent({
  listingType,
  types,
  heading,
}: {
  listingType: 'SALE' | 'RENT';
  types: { type: string; label: string; icon: React.ComponentType<{ className?: string }>; blurb: string }[];
  heading: string;
}) {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Property types */}
      <div className="col-span-12 md:col-span-7">
        <p className="text-[11px] uppercase tracking-[0.18em] text-luxury-gold font-bold mb-1">{heading}</p>
        <h3 className="font-display text-xl text-luxury-navy mb-4 font-semibold">By property type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {types.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.type}
                href={`/properties?listingType=${listingType}&type=${t.type}`}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-zinc-100 group-hover:bg-luxury-navy group-hover:text-white text-zinc-700 grid place-items-center transition-colors shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-luxury-navy flex items-center gap-1">
                    {t.label}
                    <ArrowUpRight className="h-3 w-3 text-zinc-300 group-hover:text-luxury-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </p>
                  <p className="text-xs text-luxury-muted line-clamp-1">{t.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Top cities */}
      <div className="col-span-6 md:col-span-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-luxury-gold font-bold mb-1">Explore</p>
        <h3 className="font-display text-xl text-luxury-navy mb-4 font-semibold">Top cities</h3>
        <ul className="space-y-1.5">
          {TOP_CITIES.map((c) => (
            <li key={c}>
              <Link
                href={`/properties?listingType=${listingType}&city=${encodeURIComponent(c)}`}
                className="text-sm text-luxury-muted hover:text-luxury-navy hover:underline decoration-luxury-gold underline-offset-4 inline-flex items-center gap-1.5"
              >
                <MapPin className="h-3 w-3 text-luxury-gold animate-pulse" /> {c}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Featured CTA */}
      <div className="col-span-6 md:col-span-2">
        <div className="relative rounded-2xl bg-luxury-navy text-white p-5 h-full overflow-hidden border border-white/5">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-luxury-gold/20 blur-2xl" />
          <Sparkles className="h-5 w-5 text-luxury-gold mb-3 animate-bounce" />
          <p className="font-display text-lg leading-tight mb-2 font-medium">
            Premium homes from ₹2 Cr+
          </p>
          <p className="text-xs text-zinc-400 mb-4">Hand-picked luxury listings.</p>
          <Link
            href={`/properties?listingType=${listingType}&minPrice=20000000&sort=price_desc`}
            className="inline-flex items-center gap-1 text-xs font-bold text-luxury-gold hover:text-white"
          >
            Browse premium <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  href,
  icon: Icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors group"
    >
      <div className="h-8 w-8 rounded-lg bg-zinc-100 group-hover:bg-luxury-navy group-hover:text-white text-zinc-700 grid place-items-center transition-colors shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-luxury-navy leading-tight">{label}</p>
        <p className="text-xs text-luxury-muted">{sub}</p>
      </div>
    </Link>
  );
}

function MobileLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100"
    >
      <span className="flex items-center gap-3">
        <span className="h-8 w-8 rounded-md bg-zinc-100 text-zinc-700 grid place-items-center">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-luxury-navy">{label}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 text-zinc-400" />
    </Link>
  );
}
