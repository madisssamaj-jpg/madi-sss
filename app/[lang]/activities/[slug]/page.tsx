import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSocialActivityBySlug } from '@/lib/cms/cms-service';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const activity = await getSocialActivityBySlug(slug);

  if (!activity) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href={`/${lang}/activities`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#01366E] hover:text-[#FB6C01] transition"
        >
          ← {lang === 'ne' ? 'सबै गतिविधिहरूमा फर्कनुहोस्' : 'Back to All Activities'}
        </Link>

        {/* Header Block */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#FB6C01] text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
              {activity.category}
            </span>
            <span className="text-xs text-gray-500 font-medium">📅 {activity.date}</span>
            <span className="text-xs text-gray-500 font-medium">
              📍 {lang === 'ne' ? activity.locationNe : activity.locationEn}
            </span>
            {activity.hasBeneficiaryRecord && activity.participantCount && (
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
                👥 {activity.participantCount}+ {lang === 'ne' ? 'प्रमाणित सहभागी' : 'verified participants'}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#01366E] leading-tight">
            {lang === 'ne' ? activity.titleNe : activity.titleEn}
          </h1>

          {(activity.organizerNe || activity.organizerEn) && (
            <p className="text-xs text-[#FB6C01] font-bold">
              {lang === 'ne' ? `आयोजक: ${activity.organizerNe}` : `Organized by: ${activity.organizerEn}`}
            </p>
          )}

          <div className="prose max-w-none text-sm sm:text-base text-gray-700 leading-relaxed pt-2">
            <p className="whitespace-pre-line">
              {lang === 'ne' ? activity.descriptionNe : activity.descriptionEn}
            </p>
          </div>

          {/* Related Public Approved Document */}
          {activity.relatedDocumentApproved && activity.relatedDocumentUrl && (
            <div className="pt-4 border-t border-slate-100">
              <a
                href={activity.relatedDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#01366E] font-bold px-4 py-2.5 rounded-xl text-xs border border-blue-200 transition"
              >
                <span>📄</span>
                <span>
                  {activity.relatedDocumentTitleNe || (lang === 'ne' ? 'अनुमोदित गतिविधि प्रतिवेदन (PDF)' : 'Approved Activity Report (PDF)')}
                </span>
                <span>↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Photos Gallery (Consented & Verified Only) */}
        {activity.photoConsentVerified && activity.photos && activity.photos.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#01366E]">
                {lang === 'ne' ? 'तस्वीर संकलन' : 'Event Photo Gallery'}
              </h2>
              {activity.albumLink && (
                <Link
                  href={activity.albumLink}
                  className="text-xs font-bold text-[#FB6C01] hover:underline"
                >
                  {lang === 'ne' ? 'पूरा एल्बम हेर्नुहोस् →' : 'View Full Album →'}
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activity.photos.map((url, i) => (
                <div key={i} className="h-64 rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={url}
                    alt={`Activity photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Embed */}
        {activity.videoUrl && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-[#01366E]">
              {lang === 'ne' ? 'भिडियो झलक' : 'Video Highlight'}
            </h2>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe
                src={activity.videoUrl.replace('watch?v=', 'embed/')}
                title="Activity Video"
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

