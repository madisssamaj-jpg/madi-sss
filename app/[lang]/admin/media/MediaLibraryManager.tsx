'use client';

import { useState, useTransition } from 'react';
import { MediaItem, GalleryAlbum, MediaConsentRecord } from '@/lib/cms/cms-service';
import { saveMediaItemAction, deleteMediaItemAction } from '@/app/actions/cms-actions';
import { validateUploadFile, validateVideoEmbedUrl } from '@/lib/storage/supabase-storage';
import { MediaConsentTracker } from './MediaConsentTracker';

export function MediaLibraryManager({
  initialMedia,
  albums,
  initialConsentRecords = [],
  lang,
}: {
  initialMedia: MediaItem[];
  albums: GalleryAlbum[];
  initialConsentRecords?: MediaConsentRecord[];
  lang: string;
}) {
  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'CONSENT_TRACKER'>('LIBRARY');
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<{
    albumId: string;
    titleNe: string;
    titleEn: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    fileUrl: string;
    altTextNe: string;
    altTextEn: string;
    captionNe: string;
  }>({
    albumId: albums.length > 0 ? albums[0].id : '',
    titleNe: '',
    titleEn: '',
    mediaType: 'IMAGE',
    fileUrl: '',
    altTextNe: '',
    altTextEn: '',
    captionNe: '',
  });

  const filteredMedia = mediaList.filter((m) => {
    const matchesType = selectedType === 'ALL' || m.mediaType === selectedType;
    const matchesSearch =
      !searchQuery ||
      m.titleNe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newItem.mediaType === 'VIDEO' && (newItem.fileUrl.includes('youtube.com') || newItem.fileUrl.includes('youtu.be') || newItem.fileUrl.includes('vimeo.com'))) {
      const vVal = validateVideoEmbedUrl(newItem.fileUrl);
      if (!vVal.valid) {
        setMessage(vVal.error || 'भिडियो लिङ्क मिलेन।');
        return;
      }
    }

    startTransition(async () => {
      const res = await saveMediaItemAction({
        albumId: newItem.albumId || undefined,
        titleNe: newItem.titleNe,
        titleEn: newItem.titleEn || newItem.titleNe,
        mediaType: newItem.mediaType,
        fileUrl: newItem.fileUrl,
        thumbnailUrl: newItem.fileUrl,
        fileSizeBytes: 1024 * 500,
        mimeType: newItem.mediaType === 'IMAGE' ? 'image/jpeg' : newItem.mediaType === 'VIDEO' ? 'video/mp4' : 'application/pdf',
        altTextNe: newItem.altTextNe,
        altTextEn: newItem.altTextEn,
        captionNe: newItem.captionNe,
        isFeatured: false,
        displayOrder: 1,
      });

      if (res.success && res.data) {
        setMessage('मिडिया सामग्री थपियो!');
        setIsAdding(false);
        setMediaList((prev) => [res.data, ...prev]);
        setNewItem({
          albumId: albums.length > 0 ? albums[0].id : '',
          titleNe: '',
          titleEn: '',
          mediaType: 'IMAGE',
          fileUrl: '',
          altTextNe: '',
          altTextEn: '',
          captionNe: '',
        });
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो मिडिया फाइल मेटाउन निश्चित हुनुहुन्छ? यो साइटका विभिन्न पृष्ठहरूमा प्रयोग भइरहेको हुन सक्छ।')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteMediaItemAction(id);
      if (res.success) {
        setMessage('फाइल हटाइयो।');
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('LIBRARY')}
          className={`pb-3 text-xs sm:text-sm font-extrabold transition relative ${
            activeTab === 'LIBRARY'
              ? 'text-[#01366E] border-b-2 border-[#01366E]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          📁 {lang === 'ne' ? 'मिडिया लाइब्रेरी' : 'Media Library'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CONSENT_TRACKER')}
          className={`pb-3 text-xs sm:text-sm font-extrabold transition relative flex items-center gap-1.5 ${
            activeTab === 'CONSENT_TRACKER'
              ? 'text-[#FB6C01] border-b-2 border-[#FB6C01]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span>🔒</span>
          <span>{lang === 'ne' ? 'सहमति तथा प्रकाशन ट्र्याकर' : 'Consent & Publication Tracker'}</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
            {initialConsentRecords.length}
          </span>
        </button>
      </div>

      {activeTab === 'CONSENT_TRACKER' ? (
        <MediaConsentTracker initialRecords={initialConsentRecords} lang={lang} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
            {lang === 'ne' ? 'भण्डारण तथा सम्पत्ति' : 'Digital Assets'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'मिडिया तथा कागजात लाइब्रेरी' : 'Media & Assets Library'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'वेबसाइट, गतिविधि, राहत र प्रतिवेदनहरूमा प्रयोग हुने तस्बिर, भिडियो तथा PDF कागजातहरू व्यवस्थापन गर्नुहोस्।'
              : 'Centralized repository of photos, videos, and PDFs with direct URL copy and usage checking.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ फाइल थप्नुहोस्' : 'Upload Asset'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold">
          ℹ️ {message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'IMAGE', 'VIDEO', 'DOCUMENT'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedType === t
                  ? 'bg-[#01366E] text-white shadow-sm'
                  : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'सबै फाइलहरू' : t === 'IMAGE' ? 'तस्बिरहरू' : t === 'VIDEO' ? 'भिडियोहरू' : 'कागजात/PDF'}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="शीर्षक खोजी गर्नुहोस्..."
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
          />
        </div>
      </div>

      {/* Upload/Add Modal */}
      {isAdding && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">नयाँ मिडिया वा कागजात थप्नुहोस्</h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              ✕ बन्द
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मिडिया प्रकार (Type) *
                </label>
                <select
                  value={newItem.mediaType}
                  onChange={(e) => setNewItem({ ...newItem, mediaType: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="IMAGE">तस्बिर (Image)</option>
                  <option value="VIDEO">भिडियो (Video)</option>
                  <option value="DOCUMENT">कागजात (PDF Document)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  सम्बन्धित एल्बम (Album)
                </label>
                <select
                  value={newItem.albumId}
                  onChange={(e) => setNewItem({ ...newItem, albumId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="">(कुनै एल्बम नजोड्ने / General)</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.titleNe}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.titleNe}
                  onChange={(e) => setNewItem({ ...newItem, titleNe: e.target.value })}
                  placeholder="उदा: आँखा शिविर ओखरबोटे"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  फाइल वा भिडियो लिङ्क (Direct URL / Embed) *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.fileUrl}
                  onChange={(e) => setNewItem({ ...newItem, fileUrl: e.target.value })}
                  placeholder="https://... (JPG, PNG, PDF or YouTube)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  वैकल्पिक पाठ (Alt Text - दृष्टिहीन पाठकका लागि)
                </label>
                <input
                  type="text"
                  value={newItem.altTextNe}
                  onChange={(e) => setNewItem({ ...newItem, altTextNe: e.target.value })}
                  placeholder="तस्बिरको वर्णन"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-slate-100 transition"
              >
                रद्द
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#01366E] hover:bg-blue-900 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-sm transition"
              >
                {isPending ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-36 bg-slate-100 overflow-hidden flex items-center justify-center">
                {item.mediaType === 'IMAGE' ? (
                  <img src={item.fileUrl} alt={item.titleNe} className="w-full h-full object-cover" />
                ) : item.mediaType === 'VIDEO' ? (
                  <div className="flex flex-col items-center text-rose-600">
                    <span className="text-3xl">▶</span>
                    <span className="text-[10px] font-bold mt-1">भिडियो</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-blue-800">
                    <span className="text-3xl">📄</span>
                    <span className="text-[10px] font-bold mt-1">PDF कागजात</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="bg-black/60 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur-sm">
                    {item.mediaType}
                  </span>
                  {item.status === 'PENDING_REVIEW' && (
                    <span className="bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Draft / Pending
                    </span>
                  )}
                </div>
                {item.dimensions && (
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {item.dimensions.width}×{item.dimensions.height}
                  </span>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{item.titleNe}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {item.fileSizeBytes ? `${Math.round(item.fileSizeBytes / 1024)} KB` : ''}{' '}
                  {item.category ? `• ${item.category}` : ''}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.fileUrl}</p>
              </div>
            </div>

            <div className="p-3 pt-0 border-t border-slate-100 mt-1 flex items-center justify-between gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => handleCopyUrl(item.fileUrl, item.id)}
                className={`text-[11px] font-bold px-2 py-1 rounded transition ${
                  copiedId === item.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 hover:bg-slate-200 text-gray-700'
                }`}
              >
                {copiedId === item.id ? '✓ कपि भयो!' : '📋 URL कपि'}
              </button>

              {item.mediaType === 'IMAGE' && (
                <a
                  href={`/${lang}/admin/banners?select=${item.id}`}
                  className="text-[11px] font-bold text-[#FB6C01] hover:underline px-1 py-0.5"
                  title="Homepage Hero Image छान्नुहोस्"
                >
                  ⭐ Hero बनाउनुहोस्
                </a>
              )}

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 px-1 py-0.5 transition"
              >
                हटाउनुहोस्
              </button>
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}

