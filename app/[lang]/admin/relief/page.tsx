import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getReliefPrograms } from '@/lib/cms/cms-service';
import { ReliefManager } from './ReliefManager';

export default async function AdminReliefPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const reliefList = await getReliefPrograms();

  return <ReliefManager initialRelief={reliefList} lang={lang} />;
}

