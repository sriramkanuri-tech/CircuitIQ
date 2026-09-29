import { MetadataRoute } from 'next';
import { MODULES_ANALOG } from '@/lib/seed/courseData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://circuitiq.edu';

  const staticPages = [
    '',
    '/about',
    '/courses',
    '/courses/analog-electronic-circuits',
    '/contact',
    '/verify',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const modulePages = MODULES_ANALOG.map((mod) => ({
    url: `${baseUrl}/courses/analog-electronic-circuits/modules/${mod.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...modulePages];
}
