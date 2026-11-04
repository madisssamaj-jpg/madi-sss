import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getRealContentCollectionTrackers } from '@/lib/cms/cms-service';
import { EvidenceTrackerManager } from './EvidenceTrackerManager';

export default async function AdminEvidencePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login?next=/${lang}/admin/evidence`);
  }

  const trackersData = await getRealContentCollectionTrackers(true);

  return <EvidenceTrackerManager initialData={trackersData} lang={lang} adminRole={admin.role} />;
}

