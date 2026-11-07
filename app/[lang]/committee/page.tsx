import Link from 'next/link';
import { Metadata } from 'next';
import { PAGE_SEO, constructPageMetadata } from '@/lib/seo';
import { getCommitteeMembers, CommitteeMember } from '@/lib/cms/cms-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return constructPageMetadata(PAGE_SEO.committee, lang);
}

export default async function CommitteePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { lang } = await params;
  const { category } = await searchParams;
  const members = await getCommitteeMembers(category, false);

  const categories = [
    { key: 'ALL', ne: 'सबै सदस्यहरू', en: 'All Members' },
    { key: 'EXECUTIVE', ne: 'कार्यसमिति', en: 'Executive Committee' },
    { key: 'ADVISORY', ne: 'सल्लाहकार परिषद्', en: 'Advisory Council' },
    { key: 'SUB_COMMITTEE', ne: 'विभागीय उपसमिति', en: 'Sub-Committees' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'नेतृत्व तथा पदाधिकारी' : 'Leadership & Committee'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'समाजको कार्यसमिति तथा सल्लाहकार' : 'Executive & Advisory Committee'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'मादी संखुवासभा सरोकार समाज, काठमाण्डौंको संचालन, नीति निर्माण र सामुदायिक सेवामा समर्पित नेतृत्व टोली।'
              : 'The dedicated leadership and advisors steering the social and welfare initiatives of Madi Sankhuwasabha Sarokar Samaj in Kathmandu.'}
          </p>
        </div>

        {/* Statutory Constitution & Governance Notice */}
        <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs max-w-4xl mx-auto">
          <span className="text-2xl shrink-0 mt-0.5">📜</span>
          <div className="space-y-1 text-xs sm:text-sm text-blue-950">
            <p className="font-semibold leading-relaxed">
              {lang === 'ne'
                ? 'यस कार्यसमितिको गठन, पदाधिकारीहरूको दायित्व, कार्यकाल तथा निर्वाचन प्रक्रिया संस्थाको विधानमा उल्लिखित व्यवस्थाअनुसार सञ्चालन गरिन्छ।'
                : 'The formation, responsibilities, tenure, and election process of this executive committee are governed by the provisions of the organization’s constitution.'}
            </p>
            <p className="text-[11px] text-blue-800/80">
              {lang === 'ne'
                ? 'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता (दर्ता नं. १६) अनुमोदित विधान र संस्थागत सुशासनका मापदण्ड अनुरूप पदाधिकारीहरूको अभिलेख सुरक्षित राखिएको छ।'
                : 'Official executive committee records are maintained in compliance with the approved statutory constitution (DAO Reg. No. 16).'}
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => {
            const isSelected = (!category && c.key === 'ALL') || category === c.key;
            return (
              <Link
                key={c.key}
                href={c.key === 'ALL' ? `/${lang}/committee` : `/${lang}/committee?category=${c.key}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  isSelected
                    ? 'bg-[#01366E] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {lang === 'ne' ? c.ne : c.en}
              </Link>
            );
          })}
        </div>

        {/* Members Grid or Safe Empty State */}
        {members.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto p-8 space-y-3">
            <span className="text-4xl block">🛡️</span>
            <p className="text-base font-bold text-gray-800">
              {lang === 'ne'
                ? 'कार्यसमिति विवरण प्रमाणीकरणको क्रममा छ।'
                : 'Executive committee roster is currently undergoing verification.'}
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              {lang === 'ne'
                ? 'आधिकारिक पदाधिकारी विवरण, कार्यकाल तथा प्रमाणित तस्बिरहरू चाँडै अद्यावधिक गरिनेछ।'
                : 'Official member rosters, verified portraits, and term dates will be updated shortly.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((member: CommitteeMember) => {
              const hasVerifiedPhoto = member.photoUrl && member.photoConsent === 'VERIFIED';
              const termString =
                lang === 'ne'
                  ? member.termStartDateNe && member.termEndDateNe
                    ? `कार्यकाल: ${member.termStartDateNe} देखि ${member.termEndDateNe}`
                    : member.term
                    ? `कार्यकाल: ${member.term}`
                    : null
                  : member.termStartDateEn && member.termEndDateEn
                  ? `Term: ${member.termStartDateEn} – ${member.termEndDateEn}`
                  : member.term
                  ? `Term: ${member.term}`
                  : null;

              const bio = lang === 'ne' ? member.bioNe : member.bioEn;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col items-center text-center p-6 group"
                >
                  {/* Photo or Default Avatar */}
                  <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-100 flex items-center justify-center">
                    {hasVerifiedPhoto ? (
                      <img
                        src={member.photoUrl}
                        alt={lang === 'ne' ? member.nameNe : member.nameEn}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                        <span className="text-3xl">👤</span>
                        <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                          {lang === 'ne' ? 'प्रमाणित फोटो' : 'Verified Photo'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Department / Category Pill */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-0.5 rounded-full mb-2">
                    {lang === 'ne' ? member.departmentNe || member.category : member.departmentEn || member.category}
                  </span>

                  {/* Name */}
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#01366E] transition">
                    {lang === 'ne' ? member.nameNe : member.nameEn}
                  </h2>

                  {/* Designation */}
                  <p className="text-sm font-semibold text-[#01366E] mt-0.5 mb-2">
                    {lang === 'ne' ? member.designationNe : member.designationEn}
                  </p>

                  {/* Term Dates */}
                  {termString && (
                    <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg mb-2">
                      📅 {termString}
                    </div>
                  )}

                  {/* Optional Short Bio */}
                  {bio && (
                    <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-3">
                      {bio}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Volunteer Callout */}
        <div className="bg-gradient-to-r from-[#01366E] to-blue-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-xl font-bold">
              {lang === 'ne' ? 'समाजको विभिन्न उपसमितिहरूमा सहभागी हुनुहोस्' : 'Get Involved with Our Sub-Committees'}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {lang === 'ne'
                ? 'स्वास्थ्य, शिक्षा, युवा तथा खेलकुद, महिला सशक्तिकरण जस्ता उपसमितिहरूमा स्वयम्सेवा गर्न चाहनुहुन्छ?'
                : 'Passionate about health, youth leadership, women empowerment, or culture? Join as a volunteer.'}
            </p>
          </div>
          <Link
            href={`/${lang}/membership`}
            className="whitespace-nowrap bg-[#FB6C01] hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition text-sm"
          >
            {lang === 'ne' ? 'सदस्यता लिनुहोस्' : 'Become a Member'}
          </Link>
        </div>
      </div>
    </div>
  );
}
