import { MetadataRoute } from 'next';
import { getSocialActivities, getEvents, getGalleryAlbums } from '@/lib/cms/cms-service';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['ne', 'en'];

  const [activities, events, albums] = await Promise.all([
    getSocialActivities(undefined, false), // Public only
    getEvents(undefined, false), // Public only
    getGalleryAlbums(true), // Public only
  ]);

  const routes: MetadataRoute.Sitemap = [];

  // Static Public Routes for both languages (Exact 11 canonical sections)
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/activities', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/relief-support', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/events', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/membership', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/committee', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/reports', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/gallery', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/partners', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/feedback', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `${SITE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }

    // Dynamic Activity slugs
    for (const act of activities) {
      routes.push({
        url: `${SITE_URL}/${locale}/activities/${act.slug}`,
        lastModified: new Date(act.updatedAt || act.createdAt || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // Dynamic Event slugs
    for (const evt of events) {
      routes.push({
        url: `${SITE_URL}/${locale}/events/${evt.slug}`,
        lastModified: new Date(evt.createdAt || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // Dynamic Gallery Album slugs
    for (const alb of albums) {
      routes.push({
        url: `${SITE_URL}/${locale}/gallery/${alb.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.65,
      });
    }
  }

  return routes;
}
