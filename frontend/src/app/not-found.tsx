import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <p className="font-display text-7xl text-gold-400">404</p>
      <h1 className="font-display text-3xl text-ink-900 mt-4">Page not found</h1>
      <p className="text-ink-500 mt-2">The page you're looking for doesn't exist or was moved.</p>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
