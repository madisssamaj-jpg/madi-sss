import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getNotices } from '@/lib/cms/cms-service';
import { NoticesManager } from './NoticesManager';

export default async function AdminNoticesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const notices = await getNotices();

  return <NoticesManager initialNotices={notices} lang={lang} />;
}

