import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/cms/cms-service';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href={`/${lang}/events`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#01366E] hover:text-[#FB6C01] transition"
        >
          ← {lang === 'ne' ? 'सबै कार्यक्रमहरूमा फर्कनुहोस्' : 'Back to All Events'}
        </Link>

        {/* Featured Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <div className="h-64 sm:h-80 bg-slate-200 relative overflow-hidden">
            <img
              src={event.featuredImage}
              alt={lang === 'ne' ? event.titleNe : event.titleEn}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-[#01366E] text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow">
              {event.status}
            </span>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#FB6C01] uppercase tracking-wider block">
                {lang === 'ne' ? event.organizerNe : event.organizerEn}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#01366E] leading-tight">
                {lang === 'ne' ? event.titleNe : event.titleEn}
              </h1>
            </div>

            {/* Quick Metadata Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs sm:text-sm">
              <div>
                <span className="text-gray-400 font-bold block uppercase text-[10px]">
                  {lang === 'ne' ? 'मिति र समय' : 'Date & Time'}
                </span>
                <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                  {event.eventDateTime}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block uppercase text-[10px]">
                  {lang === 'ne' ? 'कार्यक्रम स्थल (Venue)' : 'Event Venue'}
                </span>
                <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                  {lang === 'ne' ? event.venueNe : event.venueEn}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#01366E]">
                {lang === 'ne' ? 'कार्यक्रमको परिचय' : 'About the Event'}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {lang === 'ne' ? event.descriptionNe : event.descriptionEn}
              </p>
            </div>

            {/* Agenda */}
            <div className="space-y-3 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
              <h2 className="text-lg font-bold text-[#01366E]">
                {lang === 'ne' ? 'कार्यतालिका / कार्यसूची (Agenda)' : 'Event Agenda & Schedule'}
              </h2>
              <div className="text-xs sm:text-sm text-gray-800 whitespace-pre-line font-medium leading-relaxed">
                {lang === 'ne' ? event.agendaNe : event.agendaEn}
              </div>
            </div>

            {/* Action / Registration Button */}
            {event.registrationLink && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <span className="text-xs text-gray-500">
                  {lang === 'ne'
                    ? 'सहभागिता सुनिश्चित गर्न अनलाइन फारम भर्नुहोस्।'
                    : 'Reserve your participation by registering online.'}
                </span>
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center bg-[#FB6C01] hover:bg-[#e55a00] text-white text-sm font-bold px-8 py-3 rounded-xl shadow transition"
                >
                  {lang === 'ne' ? 'सहभागिता दर्ता गर्नुहोस्' : 'Register for Event'}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

