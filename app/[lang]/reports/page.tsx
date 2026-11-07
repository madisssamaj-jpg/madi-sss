import Link from 'next/link';
import { getLatestConstitution, GovernanceReport } from '@/lib/cms/cms-service';
import { getReportsFromSupabase as getReports } from '@/lib/supabase/data-service';

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string; year?: string }>;
}) {
  const { lang } = await params;
  const { category, year } = await searchParams;
  const [reports, latestConstitution] = await Promise.all([
    getReports(category, year),
    getLatestConstitution(true),
  ]);

  const categories = [
    { key: 'ALL', ne: 'सबै दस्तावेजहरू', en: 'All Documents' },
    { key: 'REGISTRATION_CERTIFICATE', ne: 'दर्ता प्रमाणपत्र', en: 'Registration Certificate' },
    { key: 'CONSTITUTION', ne: 'विधान', en: 'Constitution' },
    { key: 'ANNUAL_REPORT', ne: 'वार्षिक प्रतिवेदन', en: 'Annual Reports' },
    { key: 'AUDIT_FINANCIAL', ne: 'लेखा परीक्षण तथा वित्तीय', en: 'Financial & Audit' },
    { key: 'POLICY', ne: 'नीति तथा कार्यविधि', en: 'Policies & Guidelines' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'सुशासन तथा पारदर्शीता' : 'Governance & Transparency'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'वार्षिक प्रतिवेदन तथा आधिकारिक विधान' : 'Governance, Audit & Official Constitution'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'संस्थागत सुशासन, आर्थिक पारदर्शीता तथा विधान अनुरुपका आधिकारिक वित्तीय प्रतिवेदन तथा नीति दस्तावेजहरू।'
              : 'Official publications ensuring absolute accountability, statutory compliance, financial audits, and regulatory guidelines.'}
          </p>
        </div>

        {/* Featured Official Constitution Section */}
        <div className="bg-gradient-to-br from-[#01366E] to-[#002244] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#FB6C01]/20 rounded-full blur-3xl pointer-events-none" />
          
          {latestConstitution ? (
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#FB6C01] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {lang === 'ne' ? 'आधिकारिक मूल विधान' : 'Official Constitution'}
                  </span>
                  {latestConstitution.version && (
                    <span className="bg-white/10 text-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-white/20">
                      {lang === 'ne' ? `संस्करण: ${latestConstitution.version}` : `Version: ${latestConstitution.version}`}
                    </span>
                  )}
                  {latestConstitution.effectiveDate && (
                    <span className="bg-white/10 text-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-white/20">
                      {lang === 'ne'
                        ? `प्रमाणित मिति: ${latestConstitution.effectiveDate}`
                        : `Effective: ${latestConstitution.effectiveDate}`}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {lang === 'ne' ? latestConstitution.titleNe : latestConstitution.titleEn}
                </h2>

                <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                  {lang === 'ne'
                    ? (latestConstitution.descriptionNe || 'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता तथा प्रमाणित आधिकारिक मूल विधान।')
                    : (latestConstitution.descriptionEn || 'Official statutory constitution registered and approved by District Administration Office, Kathmandu.')}
                </p>

                <div className="flex items-center gap-4 text-xs text-blue-200">
                  <span>📄 {lang === 'ne' ? 'ढाँचा: PDF दस्तावेज' : 'Format: Official PDF'}</span>
                  <span>•</span>
                  <span>⚖️ {lang === 'ne' ? 'साइज: ' : 'Size: '} {latestConstitution.fileSizeMb}</span>
                  <span>•</span>
                  <span>🏛️ {lang === 'ne' ? 'जि.प्र.का. काठमाण्डौं दर्ता' : 'DAO Kathmandu Approved'}</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                <a
                  href={latestConstitution.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="madi-sss-constitution-2082.pdf"
                  className="inline-flex items-center justify-center gap-2 bg-[#FB6C01] hover:bg-orange-600 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                >
                  <span className="text-lg">📥</span>
                  <span>{lang === 'ne' ? 'विधान डाउनलोड गर्नुहोस् (PDF)' : 'Download Constitution PDF'}</span>
                </a>
                <span className="text-[11px] text-center text-blue-200">
                  {lang === 'ne' ? 'पूर्ण १६ पृष्ठको आधिकारिक प्रमाणित प्रति' : 'Full 16-page officially stamped copy'}
                </span>
              </div>
            </div>
          ) : (
            /* Clear empty state when no constitution is published */
            <div className="relative z-10 text-center py-6 space-y-2">
              <span className="text-3xl block">📜</span>
              <p className="text-lg font-semibold text-blue-100">
                {lang === 'ne'
                  ? 'विधान डाउनलोडका लागि तयारी भइरहेको छ।'
                  : 'The constitution document is being prepared for download.'}
              </p>
              <p className="text-xs text-blue-200">
                {lang === 'ne'
                  ? 'प्रशासकद्वारा प्रमाणीकरण पश्चात् यहाँ स्वतः उपलब्ध हुनेछ।'
                  : 'Will be available here immediately once approved by administration.'}
              </p>
            </div>
          )}
        </div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => {
            const isSelected = (!category && c.key === 'ALL') || category === c.key;
            return (
              <Link
                key={c.key}
                href={c.key === 'ALL' ? `/${lang}/reports` : `/${lang}/reports?category=${c.key}`}
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

        {/* Reports List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                {lang === 'ne' ? 'उपलब्ध आधिकारिक प्रतिवेदनहरू' : 'Official Published Documents'}
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'ne'
                  ? `जम्मा ${reports.length} वटा दस्तावेज फेला पर्यो`
                  : `Showing ${reports.length} verified publications`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-600">{lang === 'ne' ? 'आर्थिक वर्ष:' : 'Fiscal Year:'}</span>
              {['ALL', '२०८२', '२०८१', '२०८०'].map((yr) => (
                <Link
                  key={yr}
                  href={`/${lang}/reports?year=${yr}${category ? `&category=${category}` : ''}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    (!year && yr === 'ALL') || year === yr
                      ? 'bg-[#01366E] text-white border-[#01366E]'
                      : 'bg-white text-gray-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr === 'ALL' ? (lang === 'ne' ? 'सबै' : 'All') : yr}
                </Link>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                {category === 'CONSTITUTION' && !latestConstitution ? (
                  <p className="text-sm font-medium">
                    {lang === 'ne'
                      ? 'विधान डाउनलोडका लागि तयारी भइरहेको छ।'
                      : 'The constitution document is being prepared for download.'}
                  </p>
                ) : (
                  <p className="text-sm font-medium">
                    {lang === 'ne' ? 'कुनै प्रतिवेदन फेला परेन।' : 'No reports found for this filter.'}
                  </p>
                )}
              </div>
            ) : (
              reports.map((report: GovernanceReport) => (
                <div
                  key={report.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#01366E] flex items-center justify-center text-xl shrink-0 border border-blue-100">
                      {report.category === 'CONSTITUTION'
                        ? '📜'
                        : report.category === 'REGISTRATION_CERTIFICATE'
                        ? '🏛️'
                        : '📄'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-[#FB6C01] bg-orange-50 px-2 py-0.5 rounded">
                          {report.fiscalYear}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {report.category === 'CONSTITUTION'
                            ? (lang === 'ne' ? 'विधान' : 'Constitution')
                            : report.category === 'REGISTRATION_CERTIFICATE'
                            ? (lang === 'ne' ? 'दर्ता प्रमाणपत्र' : 'Registration Certificate')
                            : report.category}
                        </span>
                        {report.category === 'REGISTRATION_CERTIFICATE' && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            🏛️ {lang === 'ne' ? 'जि.प्र.का. काठमाण्डौं दर्ता प्रमाणित' : 'DAO Kathmandu Verified'}
                          </span>
                        )}
                        {report.version && (
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {lang === 'ne' ? `संस्करण: ${report.version}` : `v${report.version}`}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {report.publishedDate}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900">
                        {lang === 'ne' ? report.titleNe : report.titleEn}
                      </h3>
                      {report.category === 'REGISTRATION_CERTIFICATE' ? (
                        <p className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                          <span>
                            {lang === 'ne' ? 'दर्ता निकाय: ' : 'Authority: '}
                            <strong>{report.issuingAuthorityNe || 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            {lang === 'ne' ? 'दर्ता मिति: ' : 'Reg Date: '}
                            <strong>{report.registrationDateNe || '२०८२/०४/२१ BS'}</strong>
                          </span>
                          {report.registrationNumber && (
                            <>
                              <span>•</span>
                              <span>
                                {lang === 'ne' ? 'दर्ता नं.: ' : 'Reg No: '}
                                <strong className="text-emerald-800">{report.registrationNumber}</strong>
                              </span>
                            </>
                          )}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {lang === 'ne' ? 'फाइल साइज: ' : 'File Size: '} {report.fileSizeMb}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:shrink-0 flex items-center gap-3">
                    {report.fileUrl ? (
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center justify-center gap-2 bg-[#01366E] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                      >
                        <span>📥</span>
                        <span>
                          {report.category === 'REGISTRATION_CERTIFICATE'
                            ? (lang === 'ne' ? 'प्रमाणपत्र (संशोधित प्रति) PDF/तस्बिर' : 'Download Certificate (Redacted)')
                            : (lang === 'ne' ? 'डाउनलोड PDF' : 'Download PDF')}
                        </span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200">
                        <span>🔒</span>
                        <span>
                          {lang === 'ne'
                            ? 'सक्कल प्रमाणपत्र आन्तरिक अभिलेखमा सुरक्षित'
                            : 'Original Archived in Internal Registry'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Guarantee Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div>
            <h4 className="text-base font-bold text-emerald-950">
              {lang === 'ne' ? 'स्वतन्त्र लेखापरीक्षण तथा वैधानिक पारदर्शिता' : 'Statutory & Independent Audit Transparency'}
            </h4>
            <p className="text-emerald-800 text-xs sm:text-sm mt-1">
              {lang === 'ne'
                ? 'मादी सरोकार समाजका सबै आयव्यय, राहत कोष तथा वित्तीय कारोबारहरू नेपाल चार्टर्ड एकाउन्टेन्ट्स संस्था (ICAN) दर्तावाला लेखापरीक्षकद्वारा वार्षिक अडिट गरिन्छ तथा विधान बमोजिम साधारण सभाबाट अनुमोदन गरिन्छ।'
                : 'All financial inflows, emergency relief funds, and expenditures of Madi SSS undergo rigorous annual audits by ICAN-licensed certified registered auditors and are ratified in accordance with our Constitution.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
