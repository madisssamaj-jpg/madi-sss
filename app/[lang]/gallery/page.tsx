import Link from 'next/link';
import { getGalleryAlbums, GalleryAlbum } from '@/lib/cms/cms-service';

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { lang } = await params;
  const { category } = await searchParams;
  const allAlbums = await getGalleryAlbums();

  const filteredAlbums = category && category !== 'ALL'
    ? allAlbums.filter((a) => a.category === category)
    : allAlbums;

  const categories = [
    { key: 'ALL', ne: 'सबै एल्बमहरू', en: 'All Albums' },
    { key: 'HEALTH', ne: 'स्वास्थ्य शिविर', en: 'Health Clinics' },
    { key: 'CULTURAL', ne: 'सांस्कृतिक उत्सव', en: 'Cultural Events' },
    { key: 'RELIEF', ne: 'विपद् राहत', en: 'Disaster Relief' },
    { key: 'COMMUNITY', ne: 'सामुदायिक भेटघाट', en: 'Community Gatherings' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'तस्बिर तथा भिडियो सँगालो' : 'Media & Memories'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'सामुदायिक ग्यालरी तथा झलकहरू' : 'Community Photo & Video Gallery'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'मादी गाउँपालिकादेखि काठमाण्डौंसम्म सञ्चालित विविध स्वास्थ्य, सामाजिक, सांस्कृतिक तथा मानवीय सेवाका ऐतिहासिक झलकहरू।'
              : 'Visual moments of solidarity, health camps, relief distribution, cultural festivals, and community welfare from Madi to Kathmandu.'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => {
            const isSelected = (!category && c.key === 'ALL') || category === c.key;
            return (
              <Link
                key={c.key}
                href={c.key === 'ALL' ? `/${lang}/gallery` : `/${lang}/gallery?category=${c.key}`}
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

        {/* Albums Grid */}
        {filteredAlbums.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto p-8 space-y-2">
            <p className="text-base font-bold text-gray-700">
              {lang === 'ne' ? 'हाल कुनै तस्बिर एल्बम प्रकाशित गरिएको छैन।' : 'No photo albums are currently published.'}
            </p>
            <p className="text-xs text-gray-500">
              {lang === 'ne'
                ? 'मादी सामुदायिक गतिविधि तथा ऐतिहासिक कार्यक्रमका प्रमाणित तस्बिरहरू चाँडै अद्यावधिक गरिनेछ।'
                : 'Verified community event albums and historical photographs will be updated soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album: GalleryAlbum) => (
              <Link
                key={album.id}
                href={`/${lang}/gallery/${album.slug}`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition overflow-hidden group flex flex-col"
              >
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  <img
                    src={album.coverPhotoUrl}
                    alt={lang === 'ne' ? album.titleNe : album.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#01366E]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider backdrop-blur-sm">
                    {album.category}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                    📅 {album.eventDate}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-[#01366E] transition">
                      {lang === 'ne' ? album.titleNe : album.titleEn}
                    </h2>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {lang === 'ne' ? album.descriptionNe : album.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-[#01366E]">
                    <span>{lang === 'ne' ? 'तस्बिरहरू हेर्नुहोस्' : 'Explore Album'}</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

