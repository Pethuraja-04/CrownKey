import type { MetadataRoute } from 'next';
import { apiListProperties } from '@/lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/properties`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

  // Pull a window of recent listings — full pagination would be a separate sitemap.
  try {
    const r = await apiListProperties({ sort: 'newest', limit: 50 });
    for (const p of r.items) {
      staticRoutes.push({
        url: `${SITE}/properties/${p.slug}`,
        lastModified: new Date(p.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch { /* tolerate API down */ }

  return staticRoutes;
}
