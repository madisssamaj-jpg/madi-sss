import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import {
  getSocialActivities,
  getReliefPrograms,
  getEvents,
  getMembershipApplications,
  getCommitteeMembers,
  getReports,
  getFeedbacks,
  getPartners,
  getLatestConstitution,
} from '@/lib/cms/cms-service';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${lang}/admin/login`);
  }

  const [
    activities,
    reliefPrograms,
    events,
    applications,
    committee,
    reports,
    feedbacks,
    partners,
    latestConstitution,
  ] = await Promise.all([
    getSocialActivities(undefined, true),
    getReliefPrograms(),
    getEvents(undefined, true),
    getMembershipApplications(),
    getCommitteeMembers(undefined, true),
    getReports(undefined, undefined, true),
    getFeedbacks(),
    getPartners(),
    getLatestConstitution(true),
  ]);

  const pendingApplications = applications.filter((a) => a.status === 'PENDING');
  const newFeedbacks = feedbacks.filter((f) => f.status === 'NEW');
  const totalReliefNpr = reliefPrograms.reduce((sum, r) => sum + r.amountNpr, 0);

  const modules = [
    {
      titleNe: 'सदस्यता आवेदन इनबक्स',
      titleEn: 'Membership Applications',
      count: `${pendingApplications.length} नयाँ`,
      total: `${applications.length} जम्मा`,
      href: `/${lang}/admin/membership`,
      color: 'bg-amber-500',
      icon: '📥',
      urgent: pendingApplications.length > 0,
    },
    {
      titleNe: 'गुनासो तथा सुझाव इनबक्स',
      titleEn: 'Feedback & Grievances',
      count: `${newFeedbacks.length} नयाँ`,
      total: `${feedbacks.length} जम्मा`,
      href: `/${lang}/admin/feedback`,
      color: 'bg-rose-500',
      icon: '💬',
      urgent: newFeedbacks.length > 0,
    },
    {
      titleNe: 'सामाजिक गतिविधिहरू',
      titleEn: 'Social Activities',
      count: `${activities.length} कार्यक्रम`,
      total: 'प्रकाशित पोष्टहरू',
      href: `/${lang}/admin/activities`,
      color: 'bg-blue-600',
      icon: '🎯',
    },
    {
      titleNe: 'राहत कोष तथा सहयोग',
      titleEn: 'Relief Programs',
      count: `रु. ${totalReliefNpr.toLocaleString('en-IN')}`,
      total: `${reliefPrograms.length} वटा कार्यक्रम`,
      href: `/${lang}/admin/relief`,
      color: 'bg-teal-600',
      icon: '🤝',
    },
    {
      titleNe: 'कार्यक्रम क्यालेन्डर',
      titleEn: 'Events Calendar',
      count: `${events.length} कार्यक्रम`,
      total: 'आगामी तथा सम्पन्न',
      href: `/${lang}/admin/events`,
      color: 'bg-indigo-600',
      icon: '📅',
    },
    {
      titleNe: 'कार्यसमिति विवरण',
      titleEn: 'Committee Directory',
      count: `${committee.length} पदाधिकारी`,
      total: 'कार्यसमिति तथा सल्लाहकार',
      href: `/${lang}/admin/committee`,
      color: 'bg-purple-600',
      icon: '👥',
    },
    {
      titleNe: 'प्रतिवेदन तथा अडिट',
      titleEn: 'Reports & Audits',
      count: `${reports.length} दस्तावेज`,
      total: 'वार्षिक प्रतिवेदन/अडिट',
      href: `/${lang}/admin/reports`,
      color: 'bg-emerald-600',
      icon: '📄',
    },
    {
      titleNe: 'साझेदार तथा सहयोगी संस्था',
      titleEn: 'Partners Directory',
      count: `${partners.length} संस्था`,
      total: 'स्थानीय तह र सहयोगी',
      href: `/${lang}/admin/partners`,
      color: 'bg-cyan-600',
      icon: '🏢',
    },
    {
      titleNe: 'आन्तरिक प्रमाण ट्र्याकर',
      titleEn: 'Evidence Collection Tracker',
      count: '४ वटा खण्ड',
      total: 'कार्यसमिति / गतिविधि / विद्यालय / राहत',
      href: `/${lang}/admin/evidence`,
      color: 'bg-indigo-700',
      icon: '📋',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
            {lang === 'ne' ? 'प्रशासनिक नियन्त्रण कक्ष' : 'Admin Control Center'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne'
              ? `स्वागत छ, ${admin.fullName}!`
              : `Welcome, ${admin.fullName}!`}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            {lang === 'ne'
              ? 'मादी सरोकार समाजको वेबसाइट सामग्री, सदस्यता आवेदन, राहत कोष तथा वित्तीय प्रणाली व्यवस्थापन गर्नुहोस्।'
              : 'Manage public website content, review membership applications, oversee relief programs, and inspect financial transactions.'}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href={`/${lang}/admin/transfers`}
            className="w-full sm:w-auto bg-[#01366E] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs text-center shadow-sm transition"
          >
            💰 {lang === 'ne' ? 'आन्तरिक रकमान्तर' : 'Transfers'}
          </Link>
          <Link
            href={`/${lang}`}
            target="_blank"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold px-4 py-2.5 rounded-xl text-xs text-center transition"
          >
            🌐 {lang === 'ne' ? 'साइट हेर्नुहोस्' : 'Live Site'}
          </Link>
        </div>
      </div>

      {/* Admin Status Indicator: Awaiting original approved Constitution PDF */}
      {!latestConstitution && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-sm">
          <span className="text-2xl">⏳</span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                {lang === 'ne' ? 'स्थिति: प्रतीक्षामा' : 'Status: Pending'}
              </span>
              <span className="font-extrabold text-sm sm:text-base">
                Awaiting original approved Constitution PDF
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              {lang === 'ne'
                ? 'जिल्ला प्रशासन कार्यालय, काठमाडौंमा दर्ता तथा छाप लागेको सक्कल (Original Approved & Stamped) विधान PDF प्राप्त हुन बाँकी छ। हाल सार्वजनिक वेबसाइटमा विधान डाउनलोड बटन स्वतः लुकाइएको छ र तयारीको सूचना देखाइएको छ।'
                : 'Pending upload of the officially stamped and approved Constitution from DAO Kathmandu. Public download buttons remain suppressed with the preparation empty state.'}
            </p>
          </div>
        </div>
      )}

      {/* Module Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex flex-col justify-between group ${
              mod.urgent ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`w-10 h-10 rounded-xl text-white flex items-center justify-center text-lg ${mod.color}`}>
                {mod.icon}
              </span>
              {mod.urgent && (
                <span className="animate-pulse bg-red-100 text-red-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  {lang === 'ne' ? 'ध्यानाकर्षण' : 'Attention'}
                </span>
              )}
            </div>

            <div>
              <p className="text-xl font-extrabold text-gray-900 group-hover:text-[#01366E] transition">
                {mod.count}
              </p>
              <h2 className="text-sm font-bold text-gray-800 mt-1">
                {lang === 'ne' ? mod.titleNe : mod.titleEn}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{mod.total}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-semibold text-[#01366E] flex items-center justify-between">
              <span>{lang === 'ne' ? 'व्यवस्थापन गर्नुहोस्' : 'Manage Module'}</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Quick Action Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pending Membership Applications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>📥</span>
                <span>{lang === 'ne' ? 'हालका सदस्यता आवेदनहरू' : 'Recent Membership Inflow'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'ne'
                  ? `${pendingApplications.length} नयाँ आवेदन अनुमोधनको प्रतीक्षामा`
                  : `${pendingApplications.length} pending review`}
              </p>
            </div>
            <Link
              href={`/${lang}/admin/membership`}
              className="text-xs font-bold text-[#01366E] hover:underline"
            >
              {lang === 'ne' ? 'सबै हेर्नुहोस् →' : 'View All →'}
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {lang === 'ne' ? app.fullNameNe : app.fullNameEn}
                  </p>
                  <p className="text-xs text-gray-500">
                    📍 {app.madiAddressNe} | 📞 {app.phone}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    app.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : app.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback & Inquiries */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>💬</span>
                <span>{lang === 'ne' ? 'गुनासो तथा सुझाव इनबक्स' : 'Grievances & Suggestions'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'ne'
                  ? `${newFeedbacks.length} नयाँ सन्देश दर्ता भएका छन्`
                  : `${newFeedbacks.length} new messages`}
              </p>
            </div>
            <Link
              href={`/${lang}/admin/feedback`}
              className="text-xs font-bold text-[#01366E] hover:underline"
            >
              {lang === 'ne' ? 'सबै हेर्नुहोस् →' : 'View All →'}
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {feedbacks.slice(0, 3).map((fb) => (
              <div key={fb.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-xs">{fb.subject}</p>
                  <p className="text-xs text-gray-500">
                    👤 {fb.fullName} ({fb.category})
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    fb.status === 'NEW'
                      ? 'bg-rose-100 text-rose-800'
                      : fb.status === 'IN_REVIEW'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {fb.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

