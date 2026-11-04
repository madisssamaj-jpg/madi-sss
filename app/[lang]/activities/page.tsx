import Link from 'next/link';
import { getSocialActivities } from '@/lib/cms/cms-service';

export default async function ActivitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { lang } = await params;
  const { category } = await searchParams;
  const activities = await getSocialActivities(category);

  const categories = [
    { key: 'ALL', ne: 'सबै गतिविधिहरू', en: 'All Activities' },
    { key: 'COMMUNITY', ne: 'सामुदायिक सहयोग', en: 'Community Support' },
    { key: 'EDUCATION', ne: 'शैक्षिक पूर्वाधार तथा विद्यालय सहयोग', en: 'Education Support' },
    { key: 'RELIEF', ne: 'विपद् राहत तथा सहयोग', en: 'Disaster Relief' },
    { key: 'CULTURAL', ne: 'कला तथा संस्कृति', en: 'Arts & Culture' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'सामाजिक कार्य तथा अभियान' : 'Social Initiatives'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'सामाजिक गतिविधि तथा सेवाहरू' : 'Community Social Activities'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'मादीवासीहरूबीच आपसी सहयोग, विपद् राहत, विद्यालय पूर्वाधार सहयोग तथा सांस्कृतिक भाइचारा प्रवर्द्धनका विविध सेवाहरू।'
              : 'Our grassroots mutual assistance, disaster relief, school infrastructure support, and cultural solidarity projects.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => {
            const isSelected = (!category && c.key === 'ALL') || category === c.key;
            return (
              <Link
                key={c.key}
                href={c.key === 'ALL' ? `/${lang}/activities` : `/${lang}/activities?category=${c.key}`}
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

        {/* Activities Grid */}
        {activities.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto p-8 space-y-2">
            <span className="text-4xl block mb-2">📋</span>
            <p className="text-base font-bold text-gray-700">
              {lang === 'ne' ? 'हाल कुनै गतिविधि प्रकाशित गरिएको छैन।' : 'No activities are currently published.'}
            </p>
            <p className="text-xs text-gray-500">
              {lang === 'ne'
                ? 'संस्थागत निर्णय, खर्च भौचर तथा सम्बन्धित प्रमाणहरू विधिवत रूपमा प्रमाणीकरण भएपछि मात्र गतिविधिहरू यहाँ सार्वजनिक गरिनेछ।'
                : 'Activities will be published here once organizational approvals, expense vouchers, and supporting evidence are formally verified.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <article
                key={act.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-slate-200 flex flex-col"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {act.photoConsentVerified && act.photos && act.photos[0] ? (
                    <img
                      src={act.photos[0]}
                      alt={lang === 'ne' ? act.titleNe : act.titleEn}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                      <span className="text-2xl mb-1">🏛️</span>
                      <span>{lang === 'ne' ? 'प्रमाणित गतिविधि' : 'Verified Activity'}</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-[#01366E]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {act.category}
                  </span>
                  {act.hasBeneficiaryRecord && act.participantCount && (
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                      👥 {act.participantCount}+ {lang === 'ne' ? 'सहभागी' : 'participants'}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
                      <span>📅 {act.date}</span>
                      <span>•</span>
                      <span className="truncate">📍 {lang === 'ne' ? act.locationNe : act.locationEn}</span>
                    </div>

                    <h2 className="text-lg font-bold text-[#01366E] leading-snug hover:text-[#FB6C01] transition">
                      <Link href={`/${lang}/activities/${act.slug}`}>
                        {lang === 'ne' ? act.titleNe : act.titleEn}
                      </Link>
                    </h2>

                    {(act.organizerNe || act.organizerEn) && (
                      <p className="text-[11px] text-[#FB6C01] font-semibold">
                        {lang === 'ne' ? act.organizerNe : act.organizerEn}
                      </p>
                    )}

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {lang === 'ne' ? act.descriptionNe : act.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/${lang}/activities/${act.slug}`}
                      className="text-xs font-bold text-[#FB6C01] hover:text-[#e55a00] flex items-center gap-1"
                    >
                      <span>{lang === 'ne' ? 'विस्तृत विवरण पढ्नुहोस्' : 'Read Full Story'}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

