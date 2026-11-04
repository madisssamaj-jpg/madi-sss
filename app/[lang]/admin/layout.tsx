import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { logoutAdminAction } from '@/app/actions/auth-actions';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  const navItems = [
    { href: `/${lang}/admin`, labelNe: 'ड्यासबोर्ड', labelEn: 'Dashboard', icon: '📊' },
    { href: `/${lang}/admin/governance`, labelNe: 'सुशासन ओभरभ्यू', labelEn: 'Governance Overview', icon: '🛡️' },
    { href: `/${lang}/admin/evidence`, labelNe: 'प्रमाण ट्र्याकर', labelEn: 'Evidence Tracker', icon: '📋' },
    { href: `/${lang}/admin/banners`, labelNe: 'ब्यानर व्यवस्थापन', labelEn: 'Banners', icon: '🖼️' },
    { href: `/${lang}/admin/gallery`, labelNe: 'ग्यालरी एल्बम', labelEn: 'Gallery', icon: '📸' },
    { href: `/${lang}/admin/media`, labelNe: 'मिडिया लाइब्रेरी', labelEn: 'Media Library', icon: '📁' },
    { href: `/${lang}/admin/activities`, labelNe: 'गतिविधिहरू', labelEn: 'Activities', icon: '🎯' },
    { href: `/${lang}/admin/relief`, labelNe: 'राहत कोष', labelEn: 'Relief', icon: '🤝' },
    { href: `/${lang}/admin/events`, labelNe: 'कार्यक्रम क्यालेन्डर', labelEn: 'Events', icon: '📅' },
    { href: `/${lang}/admin/membership`, labelNe: 'सदस्यता इनबक्स', labelEn: 'Membership Apps', icon: '📥' },
    { href: `/${lang}/admin/committee`, labelNe: 'कार्यसमिति', labelEn: 'Committee', icon: '👥' },
    { href: `/${lang}/admin/reports`, labelNe: 'प्रतिवेदन तथा अडिट', labelEn: 'Reports', icon: '📄' },
    { href: `/${lang}/admin/notices`, labelNe: 'सूचना तथा समाचार', labelEn: 'Notices', icon: '📢' },
    { href: `/${lang}/admin/feedback`, labelNe: 'गुनासो तथा सुझाव', labelEn: 'Feedback Inbox', icon: '💬' },
    { href: `/${lang}/admin/partners`, labelNe: 'साझेदारहरू', labelEn: 'Partners', icon: '🏢' },
    { href: `/${lang}/admin/transfers`, labelNe: 'आन्तरिक रकमान्तर', labelEn: 'Transfers', icon: '💰' },
    { href: `/${lang}/admin/settings`, labelNe: 'साइट सेटिङ्स', labelEn: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Admin Top Navigation */}
      <header className="bg-[#01366E] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={`/${lang}/admin`} className="flex items-center gap-2">
              <img
                src="/media/madi-sss-logo.jpg"
                alt="Madi SSS Logo"
                className="w-9 h-9 rounded-full object-cover bg-white border border-[#FB6C01] shadow-sm shrink-0"
              />
              <div>
                <span className="font-bold text-lg tracking-tight block leading-tight">
                  {lang === 'ne' ? 'मादी सरोकार समाज' : 'Madi SSS CMS'}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  {lang === 'ne' ? 'प्रशासनिक तथा वित्तीय व्यवस्थापन' : 'CMS Administration Portal'}
                </span>
              </div>
            </Link>

            <Link
              href={`/${lang}`}
              target="_blank"
              className="hidden lg:flex px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition font-medium text-xs items-center gap-1"
            >
              <span>{lang === 'ne' ? 'सार्वजनिक साइट हेर्नुहोस्' : 'View Public Site'}</span>
              <span>↗</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {admin ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold">{admin.fullName}</div>
                  <span className="inline-block bg-[#FB6C01] text-[10px] font-bold uppercase px-1.5 py-0.5 rounded text-white tracking-wide">
                    {admin.role}
                  </span>
                </div>
                <form
                  action={async () => {
                    'use server';
                    await logoutAdminAction();
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs bg-white/15 hover:bg-white/25 text-white font-medium px-3 py-1.5 rounded transition"
                  >
                    {lang === 'ne' ? 'बाहिरिनुहोस्' : 'Sign Out'}
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={`/${lang}/admin/login`}
                className="text-xs bg-[#FB6C01] hover:bg-[#e55a00] text-white font-semibold px-3 py-1.5 rounded transition"
              >
                {lang === 'ne' ? 'लगइन' : 'Sign In'}
              </Link>
            )}
          </div>
        </div>

        {/* Sub-navigation Menu for Modules */}
        {admin && (
          <div className="bg-[#022851] border-t border-blue-900/50 overflow-x-auto scrollbar-thin">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
                >
                  <span>{item.icon}</span>
                  <span>{lang === 'ne' ? item.labelNe : item.labelEn}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu. All rights reserved.
      </footer>
    </div>
  );
}
