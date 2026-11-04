import { MetadataRoute } from 'next';
import { getSocialActivities, getEvents, getGalleryAlbums } from '@/lib/cms/cms-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://madisss.org.np';
  const locales = ['ne', 'en'];

  const [activities, events, albums] = await Promise.all([
    getSocialActivities(),
    getEvents(),
    getGalleryAlbums(),
  ]);

  const routes: MetadataRoute.Sitemap = [];

  // Static Public Routes for both languages
  const staticPages = [
    '',
    '/activities',
    '/relief-support',
    '/events',
    '/membership',
    '/committee',
    '/reports',
    '/gallery',
    '/partners',
    '/feedback',
  ];

  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === '/membership' || page === '/relief-support' ? 0.9 : 0.8,
      });
    }

    // Dynamic Activity slugs
    for (const act of activities) {
      routes.push({
        url: `${baseUrl}/${locale}/activities/${act.slug}`,
        lastModified: new Date(act.createdAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // Dynamic Event slugs
    for (const evt of events) {
      routes.push({
        url: `${baseUrl}/${locale}/events/${evt.slug}`,
        lastModified: new Date(evt.createdAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // Dynamic Gallery Album slugs
    for (const alb of albums) {
      routes.push({
        url: `${baseUrl}/${locale}/gallery/${alb.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return routes;
}

