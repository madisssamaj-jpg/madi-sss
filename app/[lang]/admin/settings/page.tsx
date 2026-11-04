import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getSiteSettings } from '@/lib/cms/cms-service';
import { SiteSettingsManager } from './SiteSettingsManager';

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const settings = await getSiteSettings();

  return <SiteSettingsManager initialSettings={settings} lang={lang} />;
}

