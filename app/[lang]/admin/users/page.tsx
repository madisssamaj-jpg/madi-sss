import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { UsersManager, type AdminUserItem } from './UsersManager';

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  // Pre-configured admin users list
  const initialUsers: AdminUserItem[] = [
    {
      id: '11111111-1111-1111-1111-111111111101',
      email: 'admin@madisss.org.np',
      fullName: 'मादी प्रशासक (Superadmin)',
      role: 'SUPERADMIN',
      isActive: true,
      createdAt: '2026-04-01T00:00:00Z',
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      email: 'editor@madisss.org.np',
      fullName: 'सामग्री सम्पादक (Editor)',
      role: 'EDITOR',
      isActive: true,
      createdAt: '2026-04-01T00:00:00Z',
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      email: 'auditor@madisss.org.np',
      fullName: 'लेखापरीक्षक (Auditor)',
      role: 'AUDITOR',
      isActive: true,
      createdAt: '2026-04-01T00:00:00Z',
    },
    {
      id: '11111111-1111-1111-1111-111111111104',
      email: 'admin@localhost.com',
      fullName: 'Local Development Admin',
      role: 'SUPERADMIN',
      isActive: true,
      createdAt: '2026-04-01T00:00:00Z',
    },
  ];

  return <UsersManager initialUsers={initialUsers} lang={lang} />;
}

