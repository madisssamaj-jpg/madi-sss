import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getBanners, getHomepageHero, getMediaItems, getHeroHistory } from '@/lib/cms/cms-service';
import { BannersManager } from './BannersManager';

export default async function AdminBannersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const [banners, hero, mediaList, heroHistory] = await Promise.all([
    getBanners(false),
    getHomepageHero(true), // Include DRAFT for superadmin
    getMediaItems(undefined, 'IMAGE', true), // Include all incoming/draft images
    getHeroHistory(),
  ]);

  return (
    <BannersManager
      initialBanners={banners}
      initialHero={hero}
      initialMediaList={mediaList}
      initialHeroHistory={heroHistory}
      lang={lang}
    />
  );
}

