import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getFeedbacks } from '@/lib/cms/cms-service';
import { FeedbackManager } from './FeedbackManager';

export default async function AdminFeedbackPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const feedbacks = await getFeedbacks();

  return <FeedbackManager initialFeedbacks={feedbacks} lang={lang} />;
}

