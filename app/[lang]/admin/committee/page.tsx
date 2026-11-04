import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getCommitteeMembers } from '@/lib/cms/cms-service';
import { CommitteeManager } from './CommitteeManager';

export default async function AdminCommitteePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const members = await getCommitteeMembers(undefined, true);

  return <CommitteeManager initialMembers={members} lang={lang} />;
}

