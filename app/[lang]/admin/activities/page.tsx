import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getSocialActivities } from '@/lib/cms/cms-service';
import { ActivitiesManager } from './ActivitiesManager';

export default async function AdminActivitiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const activities = await getSocialActivities(undefined, true);

  return <ActivitiesManager initialActivities={activities} lang={lang} />;
}

