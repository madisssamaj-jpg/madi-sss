import Link from 'next/link';
import { getReliefPrograms } from '@/lib/cms/cms-service';

export default async function ReliefSupportPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const programs = await getReliefPrograms();

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Hero with Verified Organizational Description */}
        <div className="bg-[#01366E] text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-4xl space-y-4">
            <span className="bg-[#FB6C01] text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
              {lang === 'ne' ? 'कल्याणकारी सहयोग कोष' : 'Welfare & Emergency Relief Fund'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {lang === 'ne' ? 'मादी राहत तथा कल्याणकारी कोष' : 'Madi Relief & Humanitarian Welfare Fund'}
            </h1>
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed pt-2">
              {lang === 'ne'
                ? 'कोरोना महामारीको समयमा आर्थिक रूपले विपन्न विद्यार्थी तथा परिवारलाई राहत वितरण गरिएको छ। साथै स्थानीय विद्यालयहरूको सुधार तथा शैक्षिक पूर्वाधार सहयोगका लागि कोष सहयोग गरिएको छ। आकस्मिक उपचार तथा चिकित्सा सहयोगमा पनि सहयोग गरिएको छ। भविष्यमा पनि विपद्, रोगव्याधी तथा अभावमा मादीवासीको सहयोगका लागि यो कोष सञ्चालन हुनेछ।'
                : 'During the COVID-19 pandemic, relief was provided to financially needy students and families. Support was also extended for local school improvements and educational infrastructure. Assistance was also provided for emergency and urgent medical treatments. In the future, this fund will continue to support the people of Madi during disasters, illnesses, and hardships.'}
            </p>
          </div>
        </div>

        {/* Public Transparency & Records View */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#01366E]">
                {lang === 'ne' ? 'सार्वजनिक राहत अभिलेख' : 'Public Relief Fund Records'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {lang === 'ne'
                  ? 'प्रमाणित निर्णय, खर्च भौचर तथा आधिकारिक कागजातको आधारमा मात्र राहत वितरण विवरण सार्वजनिक गरिन्छ।'
                  : 'Itemized disbursement records are published strictly upon formal verification of vouchers, administrative minutes, and accounts.'}
              </p>
            </div>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-dashed border-slate-300 text-center space-y-3 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#01366E] flex items-center justify-center mx-auto text-xl font-bold">
                📋
              </div>
              <h3 className="text-base font-bold text-gray-800">
                {lang === 'ne' ? 'प्रमाणीकरण प्रक्रियामा रहेको अभिलेख' : 'Disbursement Records Under Verification'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {lang === 'ne'
                  ? 'संस्थाबाट सञ्चालित राहत तथा सहयोगका आधिकारिक कागजात, भौचर तथा कार्यसमिति निर्णय प्रमाणीकरण भएपछि मात्र वस्तुनिष्ठ विवरण यहाँ सार्वजनिक गरिनेछ।'
                  : 'Official records will be published here once administrative decisions, vouchers, and bank statements are formally verified and approved.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#01366E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {prog.type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            prog.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prog.status}
                        </span>
                        <span className="text-xs text-gray-400">📅 {prog.date}</span>
                      </div>

                      <h3 className="text-xl font-bold text-[#01366E] pt-1">
                        {lang === 'ne' ? prog.titleNe : prog.titleEn}
                      </h3>
                    </div>

                    <div className="text-right sm:border-l sm:pl-6 border-slate-200">
                      <span className="text-xs text-gray-400 block font-medium">
                        {lang === 'ne' ? 'सहयोग रकम' : 'Amount Allocated'}
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#01366E]">
                        NPR {prog.amountNpr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                      <span className="font-bold text-gray-500 block uppercase tracking-wider text-[11px]">
                        {lang === 'ne' ? 'सहयोग समूह / क्षेत्र' : 'Target Beneficiary Group'}
                      </span>
                      <span className="font-semibold text-gray-800 block">
                        {lang === 'ne' ? prog.beneficiaryGroupNe : prog.beneficiaryGroupEn}
                      </span>
                      <span className="text-gray-500 block mt-1">
                        📍 {lang === 'ne' ? prog.locationNe : prog.locationEn}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                      <span className="font-bold text-gray-500 block uppercase tracking-wider text-[11px]">
                        {lang === 'ne' ? 'सहयोग विवरण' : 'Support Provided'}
                      </span>
                      <span className="font-semibold text-gray-800 block">
                        {lang === 'ne' ? prog.materialsProvidedNe : prog.materialsProvidedEn}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {lang === 'ne' ? prog.descriptionNe : prog.descriptionEn}
                  </p>

                  {prog.reportAttachmentUrl && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href={prog.reportAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#01366E] bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
                      >
                        <span>📥</span>
                        <span>{lang === 'ne' ? 'विस्तृत प्रतिवेदन (PDF)' : 'Download Full Verified Report (PDF)'}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
