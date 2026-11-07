import Link from 'next/link';
import {
  getSocialActivities,
  getReliefPrograms,
  getBanners,
  getGalleryAlbums,
  getHomepageHero,
} from '@/lib/cms/cms-service';
import {
  getEventsFromSupabase as getEvents,
  getNoticesFromSupabase as getNotices,
  getOrganizationProfileFromSupabase as getSiteSettings,
} from '@/lib/supabase/data-service';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const [activities, events, reliefPrograms, notices, banners, albums, settings, hero] = await Promise.all([
    getSocialActivities(),
    getEvents('UPCOMING'),
    getReliefPrograms(),
    getNotices(true), // Strictly public, verified notices only
    getBanners(true),
    getGalleryAlbums(true),
    getSiteSettings(),
    getHomepageHero(false), // Public view: only PUBLISHED hero image
  ]);

  const latestActivities = activities.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);
  const totalReliefNpr = reliefPrograms.reduce((sum, r) => sum + r.amountNpr, 0);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* 1. Urgent Notice Banner */}
      {notices.length > 0 && (
        <div className="bg-[#FB6C01] text-white py-2.5 px-4 text-xs font-semibold shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="bg-black/20 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded tracking-wider shrink-0">
                {lang === 'ne' ? 'ताजा सूचना' : 'Notice'}
              </span>
              <p className="truncate">
                {lang === 'ne' ? notices[0].titleNe : notices[0].titleEn} —{' '}
                <span className="font-normal opacity-90">
                  {lang === 'ne' ? notices[0].summaryNe : notices[0].summaryEn}
                </span>
              </p>
            </div>
            <Link
              href={`/${lang}/events`}
              className="underline text-[11px] shrink-0 font-bold hover:text-orange-100"
            >
              {lang === 'ne' ? 'विस्तृत हेर्नुहोस् →' : 'Details →'}
            </Link>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative bg-gradient-to-br from-[#01366E] via-[#022851] to-blue-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[480px] sm:min-h-[520px] flex items-center">
        {/* Responsive Hero Image Background with Multi-Layer Contrast Overlay */}
        {hero && hero.status === 'PUBLISHED' && (
          <div className="absolute inset-0 z-0">
            <picture>
              {hero.mobileImageUrl && <source media="(max-width: 640px)" type="image/webp" srcSet={hero.mobileImageUrl} />}
              {hero.tabletImageUrl && <source media="(max-width: 1024px)" type="image/webp" srcSet={hero.tabletImageUrl} />}
              {hero.desktopImageUrl && <source media="(min-width: 1025px)" type="image/webp" srcSet={hero.desktopImageUrl} />}
              <img
                src={hero.imageUrl || '/media/incoming/Chauki.jpg'}
                alt={lang === 'ne' ? hero.altTextNe : hero.altTextEn}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
              />
            </picture>
            {/* Subtle multi-layer gradient overlay for 100% WCAG text legibility across all screen sizes */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-[#01366E]/80 to-slate-950/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-transparent to-blue-950/80" />
          </div>
        )}

        {/* Background Subtle Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,108,1,0.15),transparent_50%)] pointer-events-none z-[1]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 w-full">
          {/* Two Verified Milestones Only */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-orange-200">
              <span>🌱</span>
              <span>
                {lang === 'ne'
                  ? 'वि.सं. २०७६: ‘मादी सरोकार केन्द्र’ का रूपमा स्थापना'
                  : '2076 BS: Established as Madi Sarokar Kendra'}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-blue-200">
              <span>🏛️</span>
              <span>
                {lang === 'ne'
                  ? 'वि.सं. २०८२: ‘मादी (संखुवासभा) सरोकार समाज’ का रूपमा जिल्ला प्रशासन कार्यालय, काठमाडौंमा विधिवत दर्ता (दर्ता नं. १६)'
                  : '2082 BS: Formally registered as Madi (Sankhuwasabha) Sarokar Samaj, District Administration Office, Kathmandu (Reg. No. 16)'}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {lang === 'ne' ? (
              <>
                मादी (संखुवासभा) सरोकार समाज,
                <span className="block text-[#FB6C01] mt-1 text-2xl sm:text-4xl lg:text-5xl">
                  काठमाडौं
                </span>
              </>
            ) : (
              <>
                Madi (Sankhuwasabha) Sarokar Samaj,
                <span className="block text-[#FB6C01] mt-1 text-2xl sm:text-4xl lg:text-5xl">
                  Kathmandu
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-3xl mx-auto font-normal leading-relaxed">
            {lang === 'ne'
              ? (hero?.subheadingNe || 'मादीदेखि काठमाडौंसम्म — एकता, सद्भाव र सामाजिक सेवाको साझा थलो')
              : (hero?.subheadingEn || 'From Madi to Kathmandu — A shared platform for unity, solidarity, and community welfare')}
          </p>

          {/* Action Buttons: Membership and Feedback only */}
          <div className="pt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href={`/${lang}/membership`}
              className="bg-[#FB6C01] hover:bg-orange-600 text-white font-bold px-6 sm:px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition transform active:scale-95 text-sm sm:text-base flex items-center gap-2"
            >
              <span>{lang === 'ne' ? 'सदस्यता आवेदन' : 'Apply for Membership'}</span>
              <span>→</span>
            </Link>

            <Link
              href={`/${lang}/feedback`}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 sm:px-8 py-3.5 rounded-2xl border border-white/20 transition text-sm sm:text-base flex items-center gap-2"
            >
              <span>{lang === 'ne' ? 'सुझाव / सम्पर्क' : 'Feedback / Contact'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Community Impact Stats & Milestones Counter */}
      <section className="bg-white border-y border-slate-200/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          {/* Milestone 1: 2076 Establishment as Madi Sarokar Kendra */}
          <div className="p-6 rounded-2xl bg-orange-50/70 border border-orange-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#FB6C01]">
                {settings.originalEstablishmentYear || (lang === 'ne' ? '२०७६' : '2076')}
              </p>
              <p className="text-base font-bold text-gray-900 mt-1">
                {lang === 'ne' ? '‘मादी सरोकार केन्द्र’ का रूपमा स्थापना' : 'Established as ‘Madi Sarokar Kendra’'}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              {lang === 'ne'
                ? 'मादीवासीहरूको प्रारम्भिक सामाजिक एकता र सेवा'
                : 'Initial community solidarity and mutual aid'}
            </p>
          </div>

          {/* Milestone 2: 2082 Formal Registration as Madi (Sankhuwasabha) Sarokar Samaj */}
          <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#01366E]">
                {settings.formalRegistrationYear || (lang === 'ne' ? '२०८२' : '2082')}
              </p>
              <p className="text-base font-bold text-gray-900 mt-1">
                {lang === 'ne'
                  ? '‘मादी (संखुवासभा) सरोकार समाज’ का रूपमा विधिवत दर्ता'
                  : 'Formally Registered as ‘Madi (Sankhuwasabha) Sarokar Samaj’'}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-blue-900/80 mt-2 leading-relaxed">
              {lang === 'ne'
                ? 'जिल्ला प्रशासन कार्यालय, काठमाडौं (२०८२/०४/२१ BS)'
                : 'District Administration Office, Kathmandu (2082/04/21 BS)'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Latest Social Activities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
              {lang === 'ne' ? 'समुदायको सेवामा' : 'Grassroots Action'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#01366E] mt-2">
              {lang === 'ne' ? 'सामाजिक गतिविधि तथा अभियानहरू' : 'Recent Social Activities'}
            </h2>
          </div>
          <Link
            href={`/${lang}/activities`}
            className="text-xs sm:text-sm font-bold text-[#01366E] hover:text-[#FB6C01] transition flex items-center gap-1"
          >
            <span>{lang === 'ne' ? 'सबै गतिविधि हेर्नुहोस्' : 'View All Activities'}</span>
            <span>→</span>
          </Link>
        </div>

        {latestActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-gray-500 text-sm">
            {lang === 'ne'
              ? 'हाल कुनै नयाँ गतिविधि प्रकाशित भएको छैन। नयाँ कार्यक्रमहरू चाँडै अद्यावधिक गरिनेछ।'
              : 'No activities are currently published. New programs will be updated soon.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestActivities.map((act) => (
              <Link
                key={act.id}
                href={`/${lang}/activities/${act.slug}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={act.photos[0]}
                    alt={lang === 'ne' ? act.titleNe : act.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#01366E] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {act.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-1">
                      📅 {act.date} | 📍 {lang === 'ne' ? act.locationNe : act.locationEn}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#01366E] transition line-clamp-2">
                      {lang === 'ne' ? act.titleNe : act.titleEn}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {lang === 'ne' ? act.descriptionNe : act.descriptionEn}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-[#01366E]">
                    <span>👥 {act.participantCount} {lang === 'ne' ? 'सहभागी' : 'Participants'}</span>
                    <span>{lang === 'ne' ? 'थप पढ्नुहोस् →' : 'Read More →'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. Upcoming Events Spotlight */}
      {upcomingEvents.length > 0 && (
        <section className="bg-blue-50/50 py-16 px-4 sm:px-6 lg:px-8 border-y border-blue-100">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#01366E] bg-blue-100 px-3 py-1 rounded-full">
                  {lang === 'ne' ? 'भेटघाट तथा कार्यक्रम' : 'Community Calendar'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#01366E] mt-2">
                  {lang === 'ne' ? 'आगामी कार्यक्रमहरू' : 'Upcoming Community Events'}
                </h2>
              </div>
              <Link
                href={`/${lang}/events`}
                className="text-xs sm:text-sm font-bold text-[#01366E] hover:text-[#FB6C01] transition flex items-center gap-1"
              >
                <span>{lang === 'ne' ? 'सबै कार्यक्रमहरू' : 'View Full Schedule'}</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
                        ⏰ {evt.eventDateTime}
                      </span>
                      <span className="text-xs text-gray-500">
                        📍 {lang === 'ne' ? evt.venueNe : evt.venueEn}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {lang === 'ne' ? evt.titleNe : evt.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4">
                      {lang === 'ne' ? evt.descriptionNe : evt.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/${lang}/events/${evt.slug}`}
                      className="text-xs font-bold text-[#01366E] hover:underline"
                    >
                      {lang === 'ne' ? 'कार्यक्रम तालिका हेर्नुहोस् →' : 'View Program Details →'}
                    </Link>
                    {evt.registrationLink && (
                      <a
                        href={evt.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#01366E] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                      >
                        {lang === 'ne' ? 'नाम दर्ता' : 'Register'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Relief Fund & Transparency Callout */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              {lang === 'ne' ? 'मादी राहत तथा कल्याणकारी कोष' : 'Madi Relief & Welfare Fund'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {lang === 'ne'
                ? 'मादी राहत तथा कल्याणकारी कोष'
                : 'Madi Relief and Welfare Fund'}
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              {lang === 'ne'
                ? 'कोरोना महामारीको समयमा आर्थिक रूपले विपन्न विद्यार्थी तथा परिवारलाई राहत वितरण गरिएको छ। साथै स्थानीय विद्यालयहरूको सुधार तथा शैक्षिक पूर्वाधार सहयोगका लागि कोष सहयोग गरिएको छ। आकस्मिक उपचार तथा चिकित्सा सहयोगमा पनि सहयोग गरिएको छ। भविष्यमा पनि विपद्, रोगव्याधी तथा अभावमा मादीवासीको सहयोगका लागि यो कोष सञ्चालन हुनेछ।'
                : 'During the COVID-19 pandemic, relief was provided to financially needy students and families. Support was also extended for local school improvements and educational infrastructure. Assistance was also provided for emergency and urgent medical treatments. In the future, this fund will continue to support the people of Madi during disasters, illnesses, and hardships.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href={`/${lang}/relief-support`}
              className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-6 py-3.5 rounded-xl text-center text-sm shadow-md transition"
            >
              {lang === 'ne' ? 'राहत कोष विवरण हेर्नुहोस्' : 'Explore Relief Fund'}
            </Link>
            <Link
              href={`/${lang}/reports`}
              className="bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold px-6 py-3.5 rounded-xl text-center text-sm border border-emerald-700 transition"
            >
              {lang === 'ne' ? 'आधिकारिक प्रतिवेदनहरू' : 'Official Reports'}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Gallery Highlights */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
                {lang === 'ne' ? 'तस्बिर तथा भिडियो सँगालो' : 'Media Highlights'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#01366E] mt-2">
                {lang === 'ne' ? 'सामुदायिक ग्यालरी तथा स्मृतिहरू' : 'Community Gallery & Glimpses'}
              </h2>
            </div>
            <Link
              href={`/${lang}/gallery`}
              className="text-xs sm:text-sm font-bold text-[#01366E] hover:text-[#FB6C01] transition flex items-center gap-1"
            >
              <span>{lang === 'ne' ? 'सबै एल्बमहरू हेर्नुहोस्' : 'View Full Gallery'}</span>
              <span>→</span>
            </Link>
          </div>

          {albums.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-gray-500 text-sm">
              {lang === 'ne'
                ? 'हाल कुनै तस्बिर एल्बम प्रकाशित भएको छैन। सामुदायिक कार्यक्रमका नयाँ तस्बिरहरू चाँडै अद्यावधिक गरिनेछ।'
                : 'No photo albums are currently published. Community event photos will be updated soon.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {albums.slice(0, 2).map((alb) => (
                <Link
                  key={alb.id}
                  href={`/${lang}/gallery/${alb.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col"
                >
                  <div className="relative h-60 bg-slate-100 overflow-hidden">
                    <img
                      src={alb.coverPhotoUrl}
                      alt={lang === 'ne' ? alb.titleNe : alb.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#01366E]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {alb.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded font-medium">
                      📅 {alb.eventDate}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#01366E] transition">
                        {lang === 'ne' ? alb.titleNe : alb.titleEn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {lang === 'ne' ? alb.descriptionNe : alb.descriptionEn}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 mt-3 text-xs font-bold text-[#01366E] flex items-center justify-between">
                      <span>{lang === 'ne' ? 'एल्बम हेर्नुहोस्' : 'Explore Album'}</span>
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. Membership Call to Action */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'एकता नै शक्ति हो' : 'Community Strength'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'मादी सरोकार समाजको सदस्य बन्नुहोस्' : 'Become an Official Member of Madi SSS'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {lang === 'ne'
              ? 'काठमाडौं उपत्यकामा रहनुभएका सम्पूर्ण मादीवासी दाजुभाइ तथा दिदीबहिनीहरूलाई समाजको सदस्यता ग्रहण गरी सामाजिक एकतामा जुट्न हार्दिक आह्वान गर्दछौं।'
              : 'Join fellow residents and descendants of Madi Municipality living in Kathmandu Valley. Support community welfare, cultural roots, and mutual assistance.'}
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${lang}/membership`}
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition text-sm flex items-center gap-2"
            >
              <span>{lang === 'ne' ? 'सदस्यता फारम भर्नुहोस्' : 'Online Membership Form'}</span>
              <span>→</span>
            </Link>
            <Link
              href={`/${lang}/committee`}
              className="bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold px-8 py-3.5 rounded-2xl transition text-sm"
            >
              {lang === 'ne' ? 'कार्यसमिति हेर्नुहोस्' : 'Meet the Committee'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
