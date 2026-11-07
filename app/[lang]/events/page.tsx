import Link from 'next/link';
import { Metadata } from 'next';
import { PAGE_SEO, constructPageMetadata } from '@/lib/seo';
import { getEventsFromSupabase as getEvents } from '@/lib/supabase/data-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return constructPageMetadata(PAGE_SEO.events, lang);
}

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { lang } = await params;
  const { tab } = await searchParams;

  const currentTab = tab === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING';
  const events = await getEvents(currentTab);

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'कार्यक्रम तथा भेला' : 'Events & Programs'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'संस्थागत कार्यक्रम तथा भेलाहरू' : 'Community Events & Gatherings'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'वार्षिक साधारण सभा, भेला, अन्तर्क्रिया तथा सांस्कृतिक उत्सवहरूको सूचना र विवरण।'
              : 'Official notice of general assemblies, cultural evenings, dialogues, and festive events.'}
          </p>
        </div>

        {/* Tabs: Upcoming vs Completed */}
        <div className="flex justify-center gap-3">
          <Link
            href={`/${lang}/events?tab=UPCOMING`}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              currentTab === 'UPCOMING'
                ? 'bg-[#01366E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {lang === 'ne' ? 'आगामी कार्यक्रमहरू' : 'Upcoming Events'}
          </Link>
          <Link
            href={`/${lang}/events?tab=COMPLETED`}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              currentTab === 'COMPLETED'
                ? 'bg-[#01366E] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {lang === 'ne' ? 'सम्पन्न कार्यक्रमहरू' : 'Completed Events'}
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-slate-200">
              <p className="text-base font-semibold">
                {lang === 'ne' ? 'हाल कुनै कार्यक्रम भेटिएन।' : 'No events found in this category.'}
              </p>
            </div>
          ) : (
            events.map((evt) => (
              <article
                key={evt.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto bg-slate-200 relative overflow-hidden flex-shrink-0">
                  <img
                    src={evt.featuredImage}
                    alt={lang === 'ne' ? evt.titleNe : evt.titleEn}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#01366E] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    {evt.status}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-[#FB6C01] font-bold">
                      ⏰ {evt.eventDateTime}
                    </div>

                    <h2 className="text-lg font-bold text-[#01366E] leading-snug hover:text-[#FB6C01] transition">
                      <Link href={`/${lang}/events/${evt.slug}`}>
                        {lang === 'ne' ? evt.titleNe : evt.titleEn}
                      </Link>
                    </h2>

                    <div className="text-xs text-gray-500 font-medium">
                      📍 {lang === 'ne' ? evt.venueNe : evt.venueEn}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 pt-1 leading-relaxed">
                      {lang === 'ne' ? evt.descriptionNe : evt.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold truncate max-w-[150px]">
                      {lang === 'ne' ? evt.organizerNe : evt.organizerEn}
                    </span>

                    <Link
                      href={`/${lang}/events/${evt.slug}`}
                      className="text-xs font-bold bg-[#01366E] hover:bg-[#002855] text-white px-3.5 py-1.5 rounded-xl transition"
                    >
                      {lang === 'ne' ? 'विवरण हेर्नुहोस्' : 'View Details'}
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

