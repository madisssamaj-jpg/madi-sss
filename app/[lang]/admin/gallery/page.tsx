import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getGalleryAlbums } from '@/lib/cms/cms-service';
import { GalleryManager } from './GalleryManager';

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const albums = await getGalleryAlbums(false, true);

  return <GalleryManager initialAlbums={albums} lang={lang} />;
}

