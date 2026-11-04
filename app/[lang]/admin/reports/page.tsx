import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getReports, getFinancialTransparencyRecords } from '@/lib/cms/cms-service';
import { ReportsManager } from './ReportsManager';

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const [reports, financialRecords] = await Promise.all([
    getReports(undefined, undefined, true),
    getFinancialTransparencyRecords(undefined, undefined, true),
  ]);

  return (
    <ReportsManager
      initialReports={reports}
      initialFinancialRecords={financialRecords}
      lang={lang}
    />
  );
}

