import Link from 'next/link';
import Image from 'next/image';
import {
  Mail, Phone, MapPin, ShieldCheck, Sparkles, BadgeCheck,
  FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, YoutubeIcon, Key
} from 'lucide-react';

const cols = [
  {
    title: 'Explore',
    links: [
      { href: '/properties?listingType=SALE', label: 'Properties for sale' },
      { href: '/properties?listingType=RENT', label: 'Properties for rent' },
      { href: '/properties?type=APARTMENT', label: 'Apartments' },
      { href: '/properties?type=VILLA', label: 'Villas' },
      { href: '/properties?type=PG', label: 'PG & hostels' },
      { href: '/properties?type=COMMERCIAL', label: 'Commercial' },
    ],
  },
  {
    title: 'Top Cities',
    links: [
      { href: '/properties?city=Mumbai', label: 'Mumbai' },
      { href: '/properties?city=Bengaluru', label: 'Bengaluru' },
      { href: '/properties?city=Delhi', label: 'Delhi' },
      { href: '/properties?city=Gurgaon', label: 'Gurgaon' },
      { href: '/properties?city=Pune', label: 'Pune' },
      { href: '/properties?city=Hyderabad', label: 'Hyderabad' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#', label: 'About' },
      { href: '#', label: 'Careers' },
      { href: '#', label: 'Press' },
      { href: '#', label: 'Partner with us' },
      { href: '#', label: 'Contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: 'http://localhost:4000/api-docs', label: 'API docs' },
      { href: '#', label: 'Help centre' },
      { href: '#', label: 'Buyer guides' },
      { href: '#', label: 'Owner toolkit' },
      { href: '#', label: 'Sitemap' },
    ],
  },
];

const trustItems = [
  { icon: ShieldCheck, label: 'Verified listings' },
  { icon: BadgeCheck, label: 'Zero broker fees' },
  { icon: Sparkles, label: 'Direct owner contact' },
];

const popularSearches = [
  { href: '/properties?city=Bengaluru&type=APARTMENT&bedrooms=3', label: '3 BHK in Bengaluru' },
  { href: '/properties?city=Mumbai&listingType=SALE&type=APARTMENT', label: 'Apartments to buy in Mumbai' },
  { href: '/properties?city=Pune&type=PG&roomType=SINGLE', label: 'Single PG in Pune' },
  { href: '/properties?city=Gurgaon&type=VILLA', label: 'Villas in Gurgaon' },
  { href: '/properties?city=Hyderabad&listingType=RENT', label: 'Rent in Hyderabad' },
  { href: '/properties?isVerified=true', label: 'Verified only' },
];

const socials = [
  { href: '#', label: 'Instagram', Icon: InstagramIcon },
  { href: '#', label: 'Facebook', Icon: FacebookIcon },
  { href: '#', label: 'Twitter', Icon: TwitterIcon },
  { href: '#', label: 'LinkedIn', Icon: LinkedinIcon },
  { href: '#', label: 'YouTube', Icon: YoutubeIcon },
];

export default function Footer() {
  return (
    <footer className="relative bg-luxury-navy text-zinc-300 border-t border-white/10 font-sans">
      {/* Top gold accent line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/70 to-transparent"
      />

      {/* Trust strip */}
      <div className="border-b border-white/5">
        <div className="container py-6 flex flex-wrap items-center justify-center md:justify-between gap-4 text-xs">
          <p className="text-zinc-400">
            <span className="text-white font-semibold font-display">CrownKey</span> · premium property
            discovery across India.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {trustItems.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-zinc-300">
                <Icon className="h-3.5 w-3.5 text-luxury-gold" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main grid */}
      <div className="container py-16 grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-12">
        {/* Brand block */}
        <div className="col-span-2 md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo-gold.png"
                alt="CrownKey Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display text-2xl font-bold text-white leading-none">
              CrownKey
            </span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-zinc-400 max-w-sm">
            A handpicked marketplace for serious buyers, renters and owners. Verified listings,
            direct contact, and no middlemen — across ten Indian metros.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 mt-0.5 text-luxury-gold shrink-0" />
              <a
                href="mailto:hello@crownkey.com"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                hello@crownkey.com
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 mt-0.5 text-luxury-gold shrink-0" />
              <a
                href="tel:+918000000000"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                +91 80 0000 0000
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 mt-0.5 text-luxury-gold shrink-0" />
              <span className="text-zinc-300">
                Indiranagar, Bengaluru 560038
                <span className="block text-zinc-500 text-xs mt-0.5">Mon–Sat · 10am to 7pm IST</span>
              </span>
            </li>
          </ul>

          <div className="mt-7 flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="h-9 w-9 grid place-items-center rounded-full bg-white/5 text-zinc-300 hover:bg-luxury-gold hover:text-luxury-navy transition-colors duration-300"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white mb-5 font-sans">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <span className="relative">
                      {l.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-luxury-gold transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Popular searches */}
      <div className="border-t border-white/5">
        <div className="container py-7">
          <h5 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 mb-4 font-sans">
            Popular searches
          </h5>
          <ul className="flex flex-wrap gap-2">
            {popularSearches.map((s) => (
              <li key={s.label}>
                <Link
                  href={s.href}
                  className="inline-block px-3 py-1.5 text-xs text-zinc-300 rounded-full border border-white/10 bg-white/[0.02] hover:border-luxury-gold hover:text-white hover:bg-white/5 transition-colors"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom disclaimer bar */}
      <div className="border-t border-white/5">
        <div className="container py-6 flex flex-col gap-4 text-xs text-zinc-500">
          <p className="text-[11px] leading-relaxed text-zinc-500 max-w-3xl">
            <span className="text-zinc-400 font-medium font-display">Disclaimer:</span> CrownKey is a property
            discovery platform. Listings on the site are user-generated and not legal or financial
            advice. Always verify ownership documents and RERA registration with a qualified
            advisor before any transaction.
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span suppressHydrationWarning>
              © {new Date().getFullYear()} CrownKey. All rights reserved.
            </span>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <li>
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
              </li>
            </ul>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="inline-block h-2 w-3 rounded-sm bg-gradient-to-b from-[#ff9933] via-white to-[#138808]" />
              Crafted in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
