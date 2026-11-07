import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGalleryAlbumBySlug, getMediaItems } from '@/lib/cms/cms-service';
import { PAGE_SEO, constructPageMetadata, SITE_URL } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const album = await getGalleryAlbumBySlug(slug);

  if (!album) {
    return constructPageMetadata(PAGE_SEO.gallery, lang);
  }

  const title = lang === 'ne' ? album.titleNe : album.titleEn;
  const description = lang === 'ne' ? album.descriptionNe : album.descriptionEn;
  const photo = album.coverPhotoUrl ? `${SITE_URL}${album.coverPhotoUrl}` : undefined;

  return constructPageMetadata(PAGE_SEO.gallery, lang, {
    dynamicTitle: `${title} | मादी सरोकार समाज ग्यालरी`,
    dynamicDesc: description,
    dynamicPath: `/gallery/${slug}`,
    dynamicImage: photo,
  });
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const album = await getGalleryAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  const mediaItems = await getMediaItems(album.id);

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href={`/${lang}`} className="hover:text-[#01366E]">
            {lang === 'ne' ? 'गृहपृष्ठ' : 'Home'}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/gallery`} className="hover:text-[#01366E]">
            {lang === 'ne' ? 'ग्यालरी' : 'Gallery'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">
            {lang === 'ne' ? album.titleNe : album.titleEn}
          </span>
        </div>

        {/* Album Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
              {album.category}
            </span>
            <span className="text-xs text-gray-400">📅 {album.eventDate}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? album.titleNe : album.titleEn}
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
            {lang === 'ne' ? album.descriptionNe : album.descriptionEn}
          </p>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center text-gray-400 text-xs">
              {lang === 'ne' ? 'यस एल्बममा तस्बिरहरू थप्न बाँकी छ।' : 'No media items uploaded to this album yet.'}
            </div>
          ) : (
            mediaItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                <div className="relative h-64 bg-slate-100 overflow-hidden">
                  <img
                    src={item.fileUrl}
                    alt={lang === 'ne' ? item.altTextNe || item.titleNe : item.altTextEn || item.titleEn}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {item.mediaType === 'VIDEO' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl shadow-lg">
                        ▶
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#01366E] transition">
                    {lang === 'ne' ? item.titleNe : item.titleEn}
                  </h3>
                  {item.captionNe && (
                    <p className="text-xs text-gray-500">
                      {lang === 'ne' ? item.captionNe : item.captionEn}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

