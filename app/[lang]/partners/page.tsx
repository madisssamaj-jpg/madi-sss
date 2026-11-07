import Link from 'next/link';
import { Metadata } from 'next';
import { PAGE_SEO, constructPageMetadata } from '@/lib/seo';
import { getPartners, CommunityPartner } from '@/lib/cms/cms-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return constructPageMetadata(PAGE_SEO.partners, lang);
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const partners = await getPartners();

  const partnerTypes: Record<string, { ne: string; en: string }> = {
    LOCAL_GOVERNMENT: { ne: 'स्थानीय सरकार', en: 'Local Government' },
    NGO_INGO: { ne: 'सहयोगी संस्था', en: 'Partner NGO/INGO' },
    SPONSOR: { ne: 'सहयोगी दाता', en: 'Corporate & Donor Sponsor' },
    COMMUNITY_GROUP: { ne: 'सामुदायिक समूह', en: 'Community Organization' },
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'सहकार्य तथा साझेदारी' : 'Collaboration & Partners'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'सहयोगी संस्था तथा साझेदारहरू' : 'Our Valued Partners & Supporters'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'मादी नगरपालिका, सामाजिक संघसंस्था, कर्पोरेट दाता तथा परोपकारी व्यक्तित्वहरूसँगको अटुट सहकार्य।'
              : 'Working closely with local government, humanitarian agencies, and philanthropic sponsors to drive community welfare in Madi and Kathmandu.'}
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner: CommunityPartner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {partner.logoUrl ? (
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={partner.logoUrl}
                        alt={lang === 'ne' ? partner.nameNe : partner.nameEn}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-blue-50/70 border border-blue-200/60 p-2 flex items-center justify-center text-3xl shadow-sm">
                      🏛️
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-[#01366E] bg-blue-50 px-2.5 py-1 rounded-full">
                    {partnerTypes[partner.partnerType]?.[lang === 'ne' ? 'ne' : 'en'] || partner.partnerType}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {lang === 'ne' ? partner.nameNe : partner.nameEn}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  {lang === 'ne' ? partner.contributionSummaryNe : partner.contributionSummaryEn}
                </p>
              </div>

              {partner.websiteUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#01366E] hover:text-[#FB6C01] transition"
                  >
                    <span>{lang === 'ne' ? 'वेबसाइट हेर्नुहोस्' : 'Visit Website'}</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Safe Empty State for Future Partners */}
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 text-center space-y-2">
          <span className="text-2xl">🤝</span>
          <h3 className="font-bold text-sm sm:text-base text-gray-800">
            {lang === 'ne' ? 'थप संस्थागत तथा विकास साझेदारहरू' : 'Additional Institutional & Development Partners'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            {lang === 'ne'
              ? 'थप संस्थागत तथा विकास साझेदारहरूको विवरण आधिकारिक समझदारी तथा सम्झौता पश्चात् क्रमशः यहाँ अध्यावधिक गरिनेछ।'
              : 'Details of additional institutional and development partners will be updated here following official memoranda of understanding and formal agreements.'}
          </p>
        </div>

        {/* Partnership Call to Action */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-950/60 border border-[#FB6C01]/30 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'हातेमालो गरौं' : 'Partner With Us'}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold">
            {lang === 'ne'
              ? 'मादीको समृद्धि र मानवीय सेवामा जोडिनुहोस्'
              : 'Join Hands for Humanitarian & Community Impact in Madi'}
          </h3>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            {lang === 'ne'
              ? 'यदि तपाईंको संस्था स्वास्थ्य, शिक्षा, विपद् व्यवस्थापन वा सीप विकासमा मादी सरोकार समाजसँग सहकार्य गर्न चाहन्छ भने हामीलाई सम्पर्क गर्नुहोस्।'
              : 'If your organization, foundation, or CSR initiative aims to support health, education, or disaster relief, we invite you to collaborate.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${lang}/feedback`}
              className="bg-[#FB6C01] hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition text-sm"
            >
              {lang === 'ne' ? 'साझेदारी प्रस्ताव पठाउनुहोस्' : 'Submit Partnership Proposal'}
            </Link>
            <Link
              href={`/${lang}/committee`}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition text-sm border border-white/20"
            >
              {lang === 'ne' ? 'सम्पर्क विवरण हेर्नुहोस्' : 'Contact Officials'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

