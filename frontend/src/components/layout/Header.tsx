'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Menu, X, LogOut, PlusCircle, LayoutDashboard, Phone, Search, Heart, ChevronDown,
  Building2, Home, TreePine, Briefcase, BedDouble, ArrowUpRight, Sparkles, MapPin, Inbox,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { cn } from '@/lib/format';

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
  const { user, logout, loading } = useAuth();
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
      <div className="hidden md:block bg-ink-950 text-ink-300 text-[11px]">
        <div className="container h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:+919000000000" className="flex items-center gap-1.5 hover:text-canvas transition-colors">
              <Phone className="h-3 w-3" /> +91 90000 00000
            </a>
            <span className="text-ink-500">·</span>
            <span>Mon–Sun · 9 AM – 9 PM IST</span>
          </div>
          <div className="flex items-center gap-1.5 text-gold-300">
            <Sparkles className="h-3 w-3" />
            <span>Zero brokerage on every listing · Direct from owner</span>
          </div>
        </div>
      </div>

      {/* ─── Main navbar ─────────────────────────────────────────────── */}
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300 border-b',
          scrolled
            ? 'bg-canvas/85 backdrop-blur-lg border-ink-200/60 shadow-soft'
            : 'bg-canvas border-transparent',
        )}
      >
        <div className="container flex items-center justify-between h-16 lg:h-18">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative h-10 w-10 rounded-xl bg-ink-900 grid place-items-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-gold-400/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative font-display text-xl font-bold text-gold-300">E</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-xl font-semibold text-ink-900">Estatery</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400 mt-0.5">Premium Real Estate</span>
            </div>
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-10">
            <MegaTrigger
              label="Buy"
              active={mega === 'buy' || pathname.startsWith('/properties') && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('listingType') === 'SALE'}
              onEnter={() => openMega('buy')}
              onLeave={scheduleClose}
            />
            <MegaTrigger
              label="Rent"
              active={mega === 'rent'}
              onEnter={() => openMega('rent')}
              onLeave={scheduleClose}
            />
            <NavLink href="/properties?type=PG" label="PG & Hostels" />
            <NavLink href="/properties?type=COMMERCIAL" label="Commercial" />
            <NavLink href="/properties" label="All Listings" />
          </nav>

          {/* Right cluster */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="p-2.5 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href={user ? '/dashboard/wishlist' : '/login?next=/dashboard/wishlist'}
              aria-label={wishlistCount > 0 ? `Wishlist (${wishlistCount} saved)` : 'Wishlist'}
              className="relative p-2.5 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-colors"
            >
              <Heart className={cn('h-4 w-4', wishlistCount > 0 && 'fill-rose-500 text-rose-500')} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-rose-500 text-canvas text-[10px] font-semibold leading-none">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-ink-200 mx-2" />

            {!loading && !user && (
              <>
                <Link href="/login" className="btn-ghost text-sm">Log in</Link>
                <Link href="/register" className="btn-gold text-sm group">
                  <span>Get started</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}

            {!loading && user && (
              <>
                <Link href="/dashboard/new" className="btn-gold text-sm shadow-soft">
                  <PlusCircle className="h-3.5 w-3.5" /> Post property
                </Link>
                <div className="relative ml-1">
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-ink-200 bg-white hover:border-ink-400 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-ink-900 grid place-items-center text-xs font-bold">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <ChevronDown className="h-3 w-3 text-ink-500" />
                  </button>
                  {userMenu && (
                    <div
                      className="absolute right-0 mt-2 w-64 card p-2 animate-fade-up z-50"
                      onMouseLeave={() => setUserMenu(false)}
                    >
                      <div className="px-3 py-3 border-b border-ink-100 mb-1">
                        <p className="text-[11px] uppercase tracking-wider text-ink-400 mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-ink-900 truncate">{user.name}</p>
                        <p className="text-xs text-ink-500 truncate">{user.email}</p>
                      </div>
                      <MenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" sub="My listings" />
                      <MenuItem href="/dashboard/new" icon={PlusCircle} label="Add property" sub="Post a new listing" />
                      <MenuItem href="/dashboard/inquiries" icon={Inbox} label="Inquiries" sub="Messages received" />
                      <div className="my-1 h-px bg-ink-100" />
                      <button
                        onClick={async () => { setUserMenu(false); await logout(); router.push('/'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
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

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 -mr-1 rounded-md hover:bg-ink-100"
            onClick={() => setMobile((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* ─── Mega menu (Buy) ────────────────────────────────────── */}
        {mega === 'buy' && (
          <MegaPanel onEnter={() => openMega('buy')} onLeave={scheduleClose}>
            <MegaContent listingType="SALE" types={PROPERTY_TYPES_BUY} heading="Buy your next home" />
          </MegaPanel>
        )}

        {/* ─── Mega menu (Rent) ───────────────────────────────────── */}
        {mega === 'rent' && (
          <MegaPanel onEnter={() => openMega('rent')} onLeave={scheduleClose}>
            <MegaContent listingType="RENT" types={PROPERTY_TYPES_RENT} heading="Rent without brokers" />
          </MegaPanel>
        )}

        {/* ─── Search dropdown ────────────────────────────────────── */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full bg-white border-b border-ink-100 shadow-soft animate-fade-up">
            <div className="container py-5">
              <form onSubmit={submitSearch} className="flex items-center gap-3">
                <Search className="h-5 w-5 text-ink-400" />
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search by locality, project, or BHK…"
                  className="flex-1 bg-transparent outline-none text-base text-ink-900 placeholder:text-ink-400"
                />
                <button type="submit" className="btn-primary">Search</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 hover:bg-ink-100 rounded-md">
                  <X className="h-4 w-4 text-ink-500" />
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-ink-500 self-center mr-1">Popular:</span>
                {['3 BHK in Bandra', 'Villa in Whitefield', 'PG in HSR Layout', 'Plot in Sohna Road', 'Office in Andheri'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSearchVal(s); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-ink-50 border border-ink-100 text-ink-700 hover:bg-ink-100 hover:border-ink-300 transition-colors"
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
        <div className="lg:hidden fixed inset-0 z-50 bg-canvas overflow-y-auto animate-fade-up">
          <div className="sticky top-0 bg-canvas border-b border-ink-100">
            <div className="container h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobile(false)}>
                <div className="h-9 w-9 rounded-lg bg-ink-900 text-gold-300 grid place-items-center font-display text-lg font-bold">E</div>
                <span className="font-display text-xl font-semibold text-ink-900">Estatery</span>
              </Link>
              <button onClick={() => setMobile(false)} className="p-2 rounded-md hover:bg-ink-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="container py-6 space-y-6">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                className="input pl-10 h-12 text-base"
                placeholder="Search properties…"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </form>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold mb-2">Browse</p>
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
              <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold mb-2">Top cities</p>
              <div className="grid grid-cols-2 gap-2">
                {TOP_CITIES.map((c) => (
                  <Link
                    key={c}
                    href={`/properties?city=${encodeURIComponent(c)}`}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-ink-100 hover:border-ink-300 hover:bg-white transition-colors text-sm text-ink-800"
                    onClick={() => setMobile(false)}
                  >
                    <MapPin className="h-3.5 w-3.5 text-gold-500" /> {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-ink-100 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard/new" className="btn-gold w-full" onClick={() => setMobile(false)}>
                    <PlusCircle className="h-4 w-4" /> Post property
                  </Link>
                  <Link href="/dashboard" className="btn-outline w-full" onClick={() => setMobile(false)}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button onClick={async () => { setMobile(false); await logout(); router.push('/'); }} className="btn-ghost w-full text-rose-600">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" className="btn-gold w-full" onClick={() => setMobile(false)}>Get started</Link>
                  <Link href="/login" className="btn-outline w-full" onClick={() => setMobile(false)}>Log in</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────────

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href.split('?')[0]);
  return (
    <Link
      href={href}
      className={cn(
        'relative px-3.5 py-2 text-sm font-medium transition-colors group',
        active ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900',
      )}
    >
      {label}
      <span
        className={cn(
          'absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-gold-400 origin-left transition-transform duration-300',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
      />
    </Link>
  );
}

function MegaTrigger({
  label,
  active,
  onEnter,
  onLeave,
}: {
  label: string;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      className={cn(
        'relative flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors group',
        active ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900',
      )}
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      <span
        className={cn(
          'absolute left-3.5 right-7 -bottom-0.5 h-0.5 rounded-full bg-gold-400 origin-left transition-transform duration-300',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
      />
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
      className="absolute inset-x-0 top-full bg-white border-b border-ink-100 shadow-lift animate-fade-up"
    >
      <div className="container py-8">{children}</div>
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold mb-1">{heading}</p>
        <h3 className="font-display text-xl text-ink-900 mb-4">By property type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {types.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.type}
                href={`/properties?listingType=${listingType}&type=${t.type}`}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-ink-50 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-ink-100 group-hover:bg-ink-900 group-hover:text-gold-300 text-ink-700 grid place-items-center transition-colors shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 group-hover:text-ink-900 flex items-center gap-1">
                    {t.label}
                    <ArrowUpRight className="h-3 w-3 text-ink-300 group-hover:text-gold-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </p>
                  <p className="text-xs text-ink-500 line-clamp-1">{t.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Top cities */}
      <div className="col-span-6 md:col-span-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold-600 font-semibold mb-1">Explore</p>
        <h3 className="font-display text-xl text-ink-900 mb-4">Top cities</h3>
        <ul className="space-y-1.5">
          {TOP_CITIES.map((c) => (
            <li key={c}>
              <Link
                href={`/properties?listingType=${listingType}&city=${encodeURIComponent(c)}`}
                className="text-sm text-ink-700 hover:text-ink-900 hover:underline decoration-gold-400 underline-offset-4 inline-flex items-center gap-1.5"
              >
                <MapPin className="h-3 w-3 text-ink-400" /> {c}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Featured CTA */}
      <div className="col-span-6 md:col-span-2">
        <div className="relative rounded-2xl bg-ink-900 text-canvas p-5 h-full overflow-hidden">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold-400/30 blur-2xl" />
          <Sparkles className="h-5 w-5 text-gold-300 mb-3" />
          <p className="font-display text-lg leading-tight mb-2">
            Premium homes from ₹2 Cr+
          </p>
          <p className="text-xs text-ink-300 mb-4">Hand-picked luxury listings.</p>
          <Link
            href={`/properties?listingType=${listingType}&minPrice=20000000&sort=price_desc`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300 hover:text-canvas"
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
      className="flex items-start gap-2.5 px-3 py-2 rounded-md hover:bg-ink-50 transition-colors group"
    >
      <div className="h-8 w-8 rounded-md bg-ink-100 group-hover:bg-ink-900 group-hover:text-gold-300 text-ink-700 grid place-items-center transition-colors shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900 leading-tight">{label}</p>
        <p className="text-xs text-ink-500">{sub}</p>
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
      className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-ink-100"
    >
      <span className="flex items-center gap-3">
        <span className="h-8 w-8 rounded-md bg-ink-100 text-ink-700 grid place-items-center">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-ink-900">{label}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 text-ink-400" />
    </Link>
  );
}
