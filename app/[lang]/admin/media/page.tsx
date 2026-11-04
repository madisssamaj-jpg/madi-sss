import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getMediaItems, getGalleryAlbums, getMediaConsentRecords } from '@/lib/cms/cms-service';
import { MediaLibraryManager } from './MediaLibraryManager';

export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const [media, albums, consentRecords] = await Promise.all([
    getMediaItems(),
    getGalleryAlbums(),
    getMediaConsentRecords(undefined, undefined, true),
  ]);

  return (
    <MediaLibraryManager
      initialMedia={media}
      albums={albums}
      initialConsentRecords={consentRecords}
      lang={lang}
    />
  );
}

