/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      // Production backend (Render). Localhost was removed — Vercel can't
      // reach it and it caused 400 errors on Next.js image optimization.
      { protocol: 'https', hostname: 'crownkey.onrender.com' },
      // Cloudinary (used when CLOUDINARY_* env vars are set on Render)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return [
      // Optional: proxy /api/* to the backend if you want same-origin.
      // Disabled by default — we use NEXT_PUBLIC_API_URL.
    ];
  },
};
export default nextConfig;
