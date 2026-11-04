import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getEvents } from '@/lib/cms/cms-service';
import { EventsManager } from './EventsManager';

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const events = await getEvents(undefined, true);

  return <EventsManager initialEvents={events} lang={lang} />;
}

