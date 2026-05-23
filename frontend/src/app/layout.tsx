import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { WishlistProvider } from '@/providers/WishlistProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackgroundDecor from '@/components/layout/BackgroundDecor';
import ChatWidget from '@/components/chat/ChatWidget';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Estatery — Premium Real Estate, Found.',
    template: '%s · Estatery',
  },
  description:
    'Discover apartments, villas, and commercial spaces across India. Verified listings, direct owner contact, no broker fees.',
  keywords: ['real estate', 'property', 'apartment', 'villa', 'rent', 'buy', 'India'],
  openGraph: {
    title: 'Estatery — Premium Real Estate, Found.',
    description: 'Verified property listings. No brokers. Direct contact with owners.',
    type: 'website',
    siteName: 'Estatery',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <WishlistProvider>
            <BackgroundDecor />
            <Header />
            <main className="flex-1 relative">{children}</main>
            <Footer />
            <ChatWidget />
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
