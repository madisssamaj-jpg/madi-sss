import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getMembershipApplications } from '@/lib/cms/cms-service';
import { MembershipManager } from './MembershipManager';

export default async function AdminMembershipPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const applications = await getMembershipApplications();

  return <MembershipManager initialApplications={applications} lang={lang} />;
}
