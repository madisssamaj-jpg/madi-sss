import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getPartners } from '@/lib/cms/cms-service';
import { PartnersManager } from './PartnersManager';

export default async function AdminPartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const partners = await getPartners();

  return <PartnersManager initialPartners={partners} lang={lang} />;
}

