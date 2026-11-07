'use client';

import { useState, useTransition } from 'react';
import { SiteBanner, HomepageHeroConfig, MediaItem } from '@/lib/cms/cms-service';
import {
  saveBannerAction,
  deleteBannerAction,
  saveHomepageHeroAction,
  publishHomepageHeroAction,
  unpublishHomepageHeroAction,
  replaceHomepageHeroAction,
} from '@/app/actions/cms-actions';

export function BannersManager({
  initialBanners,
  initialHero,
  initialMediaList,
  initialHeroHistory,
  lang,
}: {
  initialBanners: SiteBanner[];
  initialHero: HomepageHeroConfig | null;
  initialMediaList: MediaItem[];
  initialHeroHistory: HomepageHeroConfig[];
  lang: string;
}) {
  const [activeTab, setActiveTab] = useState<'HERO' | 'BANNERS'>('HERO');
  const [banners, setBanners] = useState<SiteBanner[]>(initialBanners);
  const [hero, setHero] = useState<HomepageHeroConfig | null>(initialHero);
  const [heroHistory, setHeroHistory] = useState<HomepageHeroConfig[]>(initialHeroHistory);
  const [mediaList] = useState<MediaItem[]>(initialMediaList);

  // Hero Management State
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [previewingMedia, setPreviewingMedia] = useState<MediaItem | null>(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Hero form state
  const [heroForm, setHeroForm] = useState<Partial<HomepageHeroConfig>>({
    imageUrl: hero?.imageUrl || '/media/incoming/Chauki.jpg',
    mobileImageUrl: hero?.mobileImageUrl || '/media/incoming/Chauki-mobile.webp',
    tabletImageUrl: hero?.tabletImageUrl || '/media/incoming/Chauki-tablet.webp',
    desktopImageUrl: hero?.desktopImageUrl || '/media/incoming/Chauki-desktop.webp',
    altTextNe: hero?.altTextNe || 'मादी संखुवासभाको प्राकृतिक सौन्दर्य तथा चौकि बजार',
    altTextEn: hero?.altTextEn || 'Scenic landscape of Chauki, Madi, Sankhuwasabha',
    headingNe: hero?.headingNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    headingEn: hero?.headingEn || 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
    subheadingNe: hero?.subheadingNe || '“मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”',
    subheadingEn: hero?.subheadingEn || '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration”',
    ctaLabelNe: hero?.ctaLabelNe || 'अनलाइन सदस्यता आवेदन',
    ctaLabelEn: hero?.ctaLabelEn || 'Apply for Membership',
    ctaLink: hero?.ctaLink || '/membership',
    status: hero?.status || 'DRAFT',
  });

  // Banners Management State
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<SiteBanner> | null>(null);

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter media library photos
  const filteredPhotos = mediaList.filter((m) => {
    if (!mediaSearch) return true;
    const q = mediaSearch.toLowerCase();
    return (
      (m.originalFilename && m.originalFilename.toLowerCase().includes(q)) ||
      m.titleNe.toLowerCase().includes(q) ||
      m.titleEn.toLowerCase().includes(q)
    );
  });

  // Handle Hero Quick Selection from Media Library
  const handleSelectMediaAsHero = (item: MediaItem) => {
    setMessage(null);
    if (item.isHeroEligible === false) {
      setMessage({
        text: 'शोक/समवेदना, बिरामी पहिचान, राहत हस्तान्तरण वा वडा पत्राचार सम्बन्धी संवेदनशील सामग्री होमपेज हिरो इमेज बनाउन पाइँदैन।',
        type: 'error',
      });
      return;
    }
    startTransition(async () => {
      // Ensure only local paths are used for hero image serving
      const localFilePath = item.responsiveUrls?.desktop || `/media/incoming/${item.originalFilename || item.titleEn}`;
      const updates: Partial<HomepageHeroConfig> = {
        mediaItemId: item.id,
        imageUrl: localFilePath,
        mobileImageUrl: item.responsiveUrls?.mobile || localFilePath,
        tabletImageUrl: item.responsiveUrls?.tablet || localFilePath,
        desktopImageUrl: item.responsiveUrls?.desktop || localFilePath,
        altTextNe: item.altTextNe || 'मादी सरोकार समाज तस्बिर',
        altTextEn: item.altTextEn || 'Madi SSS photo',
        status: 'DRAFT', // Keep in DRAFT until explicit administrative publication
      };

      const res = await replaceHomepageHeroAction(updates);
      if (res.success && res.data) {
        setHero(res.data);
        if (hero) {
          setHeroHistory((prev) => [hero, ...prev]);
        }
        setPreviewingMedia(null);
        setMessage({
          text: `सफलतापूर्वक हिरो इमेज परिवर्तन गरियो! (${item.originalFilename || item.titleNe})`,
          type: 'success',
        });
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  // Handle Publish / Unpublish Hero
  const handleTogglePublishHero = () => {
    setMessage(null);
    startTransition(async () => {
      const isCurrentlyPublished = hero?.status === 'PUBLISHED';
      const res = isCurrentlyPublished
        ? await unpublishHomepageHeroAction()
        : await publishHomepageHeroAction();

      if (res.success && res.data) {
        setHero(res.data);
        setMessage({
          text: isCurrentlyPublished
            ? 'हिरो इमेज अप्रकाशित (DRAFT) गरियो। सार्वजनिक होमपेजमा अब डिफल ग्र्याडिएन्ट देखिनेछ।'
            : 'हिरो इमेज सफलतापूर्वक सार्वजनिक होमपेजमा प्रकाशित (PUBLISHED) गरियो!',
          type: 'success',
        });
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  // Handle Save Hero Form
  const handleSaveHeroForm = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await saveHomepageHeroAction(heroForm);
      if (res.success && res.data) {
        setHero(res.data);
        setIsEditingHero(false);
        setMessage({ text: 'हिरो विवरण सफलतापूर्वक सुरक्षित गरियो!', type: 'success' });
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  // Handle Restore Archived Hero
  const handleRestoreHero = (archivedHero: HomepageHeroConfig) => {
    setMessage(null);
    startTransition(async () => {
      const res = await replaceHomepageHeroAction({
        ...archivedHero,
        status: hero?.status || 'DRAFT',
      });
      if (res.success && res.data) {
        setHero(res.data);
        if (hero) {
          setHeroHistory((prev) => [hero, ...prev.filter((h) => h.id !== archivedHero.id)]);
        }
        setMessage({ text: 'अभिलेखबाट पूर्व हिरो इमेज सफलतापूर्वक पुनर्स्थापित गरियो!', type: 'success' });
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  // Banner Actions
  const handleOpenNewBanner = () => {
    setEditingBanner({
      titleNe: '',
      titleEn: '',
      subtitleNe: '',
      subtitleEn: '',
      imageDesktopUrl: '/media/incoming/Chauki.jpg',
      imageMobileUrl: '',
      videoUrl: '',
      linkUrl: '/membership',
      buttonTextNe: 'सदस्यता लिनुहोस्',
      buttonTextEn: 'Join Us',
      isActive: true,
      displayOrder: banners.length + 1,
    });
    setIsEditingBanner(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setMessage(null);
    startTransition(async () => {
      const res = await saveBannerAction(editingBanner);
      if (res.success && res.data) {
        setMessage({ text: 'ब्यानर सफलतापूर्वक सुरक्षित गरियो!', type: 'success' });
        setIsEditingBanner(false);
        setBanners((prev) => {
          const idx = prev.findIndex((b) => b.id === res.data.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = res.data;
            return next.sort((a, b) => a.displayOrder - b.displayOrder);
          }
          return [...prev, res.data].sort((a, b) => a.displayOrder - b.displayOrder);
        });
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  const handleDeleteBanner = (id: string) => {
    if (!confirm('के तपाईं यो ब्यानर हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteBannerAction(id);
      if (res.success) {
        setMessage({ text: 'ब्यानर हटाइयो।', type: 'success' });
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
            {lang === 'ne' ? 'होमपेज डिस्प्ले तथा मिडिया' : 'Homepage Hero & Banners'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'होमपेज हिरो इमेज तथा ब्यानर व्यवस्थापन' : 'Homepage Hero Image & Banners'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'आधिकारिक मादीका मौलिक तस्बिरहरूबाट मुख्य हिरो इमेज छान्नुहोस्, मोबाइल–डेस्कटप पूर्वावलोकन गर्नुहोस् र प्रकाशन नियन्त्रण गर्नुहोस्।'
              : 'Select real Madi photos as Homepage Hero, preview responsive mobile/desktop variants, and manage banner slides.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'HERO' ? (
            <button
              type="button"
              onClick={() => {
                setHeroForm(hero || {
                  imageUrl: '/media/incoming/Chauki.jpg',
                  headingNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
                  headingEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
                  subheadingNe: '“मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”',
                  subheadingEn: '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration”',
                  ctaLabelNe: 'अनलाइन सदस्यता आवेदन',
                  ctaLabelEn: 'Apply for Membership',
                  ctaLink: '/membership',
                  status: 'DRAFT',
                });
                setIsEditingHero(true);
              }}
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>✏️</span>
              <span>{lang === 'ne' ? 'हिरो विवरण सम्पादन' : 'Edit Hero Text/CTA'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenNewBanner}
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>{lang === 'ne' ? 'नयाँ ब्यानर थप्नुहोस्' : 'Create Banner'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 pt-3 rounded-t-2xl gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('HERO')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'HERO'
              ? 'border-[#FB6C01] text-[#01366E]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>🖼️</span>
          <span>
            {lang === 'ne' ? 'Homepage Hero Image छान्नुहोस्' : 'Homepage Hero Image'}{' '}
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                hero?.status === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {hero?.status === 'PUBLISHED' ? 'प्रकाशित (Published)' : 'मस्यौदा (Draft)'}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BANNERS')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'BANNERS'
              ? 'border-[#FB6C01] text-[#01366E]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>📜</span>
          <span>
            {lang === 'ne' ? 'अतिरिक्त स्लाइड ब्यानरहरू' : 'Site Banners'} ({banners.length})
          </span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* -------------------- HERO TAB CONTENT -------------------- */}
      {activeTab === 'HERO' && (
        <div className="space-y-6">
          {/* Active Hero Status Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      hero?.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {hero?.status === 'PUBLISHED'
                      ? '● हाल सार्वजनिक रूपमा सक्रिय (PUBLISHED ON HOMEPAGE)'
                      : '○ मस्यौदा (DRAFT - सार्वजनिक पृष्ठमा अप्रकाशित)'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    अन्तिम अद्यावधिक: {hero?.updatedAt ? new Date(hero.updatedAt).toLocaleDateString() : 'हालै'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#01366E] mt-2">
                  {hero?.headingNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hero?.subheadingNe || '“मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePublishHero}
                  disabled={isPending}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm text-white ${
                    hero?.status === 'PUBLISHED'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <span>{hero?.status === 'PUBLISHED' ? '⏸️' : '🚀'}</span>
                  <span>
                    {hero?.status === 'PUBLISHED'
                      ? 'अप्रकाशित बनाउनुहोस् (Unpublish / Set Draft)'
                      : 'होमपेजमा प्रकाशित गर्नुहोस् (Publish Hero)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Responsive Device Preview Controls */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold text-gray-700">
                लाइभ रेस्पोन्सिभ पूर्वावलोकन (Responsive Live Preview):
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded-lg transition ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-[#01366E] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  🖥️ Desktop Landscape
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`px-3 py-1 rounded-lg transition ${
                    previewDevice === 'tablet'
                      ? 'bg-white text-[#01366E] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  📱 Tablet (1024px)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded-lg transition ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-[#01366E] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  📲 Mobile Portrait
                </button>
              </div>
            </div>

            {/* Live Interactive Hero Container Preview */}
            <div className="flex justify-center bg-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-200">
              <div
                className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 ${
                  previewDevice === 'mobile'
                    ? 'w-[360px] min-h-[460px]'
                    : previewDevice === 'tablet'
                    ? 'w-[720px] min-h-[380px]'
                    : 'w-full min-h-[360px]'
                }`}
              >
                {/* Background image with multi-layer WCAG gradient */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={
                      previewDevice === 'mobile' && hero?.mobileImageUrl
                        ? hero.mobileImageUrl
                        : previewDevice === 'tablet' && hero?.tabletImageUrl
                        ? hero.tabletImageUrl
                        : hero?.desktopImageUrl || hero?.imageUrl || '/media/incoming/Chauki.jpg'
                    }
                    alt={hero?.altTextNe || 'Madi Hero Preview'}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle multi-layer gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-[#01366E]/80 to-slate-950/60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-transparent to-blue-950/80" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-center items-center text-center text-white h-full space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-semibold text-orange-200">
                    <span>🏛️</span>
                    <span>वि.सं. २०८२: जिल्ला प्रशासन कार्यालयमा विधिवत दर्ता (दर्ता नं. १६)</span>
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                    {hero?.headingNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं'}
                  </h3>

                  <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-normal leading-relaxed">
                    {hero?.subheadingNe || '“मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”'}
                  </p>

                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <span className="bg-[#FB6C01] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md">
                      {hero?.ctaLabelNe || 'अनलाइन सदस्यता आवेदन'} →
                    </span>
                    <span className="bg-white/15 text-white font-semibold px-4 py-2 rounded-xl text-xs border border-white/20">
                      राहत कोष तथा पारदर्शीता
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Statutory Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-gray-500 font-semibold block">सक्रिय फाइल पाथ:</span>
                <span className="font-bold text-gray-900 mt-1 block truncate">
                  {hero?.imageUrl}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-gray-500 font-semibold block">Alt विवरण:</span>
                <span className="font-bold text-gray-900 mt-1 block truncate">
                  {hero?.altTextNe}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-gray-500 font-semibold block">सार्वजनिक अवस्था:</span>
                <span className="font-bold mt-1 block">
                  {hero?.status === 'PUBLISHED' ? (
                    <span className="text-emerald-700 font-bold">✅ सार्वजनिक होमपेजमा सक्रिय</span>
                  ) : (
                    <span className="text-amber-700 font-bold">🔒 केवल एडमिन मस्यौदा (अप्रकाशित)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ----------------- Media Library Photo Grid Selector ----------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#01366E] bg-blue-50 px-2.5 py-1 rounded-full">
                  मौलिक तस्बिर सँगालो (Media Library)
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  मिडिया लाइब्रेरीबाट नयाँ Homepage Hero Image छान्नुहोस्
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  मादीका १३+ समुदायिक तथा ऐतिहासिक तस्बिरहरूमध्ये कुनै एकलाई छनोट गरी सिधै होमपेज हिरो इमेज बनाउन सक्नुहुन्छ।
                </p>
              </div>

              {/* Search filter */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="तस्बिर खोज्नुहोस्..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* Photo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => {
                const isCurrentActive = hero?.imageUrl === photo.fileUrl;
                return (
                  <div
                    key={photo.id}
                    className={`rounded-2xl border transition overflow-hidden flex flex-col justify-between ${
                      isCurrentActive
                        ? 'border-[#FB6C01] ring-2 ring-[#FB6C01]/20 bg-orange-50/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-xs'
                    }`}
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden group">
                      <img
                        src={photo.thumbnailUrl || photo.fileUrl}
                        alt={photo.altTextNe || photo.titleNe}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {isCurrentActive && (
                        <div className="absolute top-2 left-2 bg-[#FB6C01] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          ⭐ सक्रिय हिरो
                        </div>
                      )}
                      {!isCurrentActive && photo.sensitivityNotice && (
                        <div className="absolute top-2 left-2 bg-red-600/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{lang === 'ne' ? photo.sensitivityNoticeNe || 'संवेदनशील — आन्तरिक मात्र' : photo.sensitivityNotice}</span>
                        </div>
                      )}
                      {photo.dimensions && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {photo.dimensions.width}×{photo.dimensions.height}
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 truncate" title={photo.originalFilename || photo.titleNe}>
                          {photo.originalFilename || photo.titleNe}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {photo.fileSizeBytes ? `${Math.round(photo.fileSizeBytes / 1024)} KB` : ''} • {photo.mimeType}
                        </p>
                        {photo.sensitivityNotice && (
                          <div className="mt-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 inline-block">
                            🔒 {lang === 'ne' ? 'संवेदनशील — आन्तरिक प्रयोजन मात्र' : 'Sensitive — Internal use only'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewingMedia(photo)}
                          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-gray-700 transition"
                        >
                          👁️ पूर्वावलोकन
                        </button>
                        {photo.isHeroEligible === false ? (
                          <button
                            type="button"
                            disabled
                            title={lang === 'ne' ? 'संवेदनशील सामग्री — हिरो इमेज बनाउन निषेध' : 'Sensitive media — ineligible as homepage hero'}
                            className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          >
                            🚫 {lang === 'ne' ? 'हिरो निषेध' : 'Ineligible'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectMediaAsHero(photo)}
                            disabled={isPending || isCurrentActive}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                              isCurrentActive
                                ? 'bg-orange-100 text-[#FB6C01] cursor-default'
                                : 'bg-[#01366E] hover:bg-blue-900 text-white'
                            }`}
                          >
                            {isCurrentActive ? '✓ सक्रिय' : '⭐ छान्नुहोस्'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----------------- Archived / Previous Hero History ----------------- */}
          {heroHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>पूर्व हिरो इमेजहरूको अभिलेख (Hero Image History - {heroHistory.length})</span>
                </h4>
                <span className="text-[11px] text-gray-400">
                  आवश्यक परेका बेला जुनसुकै पुराना हिरो इमेज पनि १–क्लिकमा पुनः सक्रिय गर्न सकिन्छ।
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroHistory.map((hist, idx) => (
                  <div
                    key={`${hist.id}-${idx}`}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3"
                  >
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                      <img src={hist.imageUrl} alt={hist.altTextNe} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-500 block truncate">
                        {hist.headingNe || 'मादी सरोकार समाज'}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        अभिलेख मिति: {new Date(hist.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRestoreHero(hist)}
                        className="mt-1 text-[11px] font-bold text-[#01366E] hover:underline"
                      >
                        पुनः सक्रिय गर्नुहोस् →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- BANNERS TAB CONTENT -------------------- */}
      {activeTab === 'BANNERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-gray-700">
            <span>दर्ता भएका ब्यानरहरू ({banners.length})</span>
            <span>अवस्था तथा कार्य</span>
          </div>

          <div className="divide-y divide-slate-100">
            {banners.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img src={b.imageDesktopUrl} alt={b.titleNe} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-400">क्रम: {b.displayOrder}</span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mt-1">{b.titleNe}</h3>
                    <p className="text-xs text-gray-500">{b.subtitleNe || b.linkUrl}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBanner(b);
                      setIsEditingBanner(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    सम्पादन
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                  >
                    हटाउनुहोस्
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- FULL IMAGE PREVIEW MODAL -------------------- */}
      {previewingMedia && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 truncate">
                {previewingMedia.originalFilename || previewingMedia.titleNe}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewingMedia(null)}
                className="text-gray-400 hover:text-gray-600 font-bold px-2 py-1 rounded bg-slate-100 text-xs"
              >
                ✕ बन्द
              </button>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-center overflow-auto max-h-[60vh]">
              <img
                src={previewingMedia.fileUrl}
                alt={previewingMedia.altTextNe || 'Preview'}
                className="max-h-[55vh] object-contain rounded-lg"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-gray-500 space-y-0.5">
                <div>
                  <strong>आयाम: </strong>
                  {previewingMedia.dimensions?.width}×{previewingMedia.dimensions?.height} px
                </div>
                <div>
                  <strong>साइज: </strong>
                  {Math.round(previewingMedia.fileSizeBytes / 1024)} KB ({previewingMedia.mimeType})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewingMedia(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-slate-100 font-semibold"
                >
                  रद्द
                </button>
                {previewingMedia.isHeroEligible === false ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 font-bold cursor-not-allowed text-xs"
                  >
                    🚫 संवेदनशील सामग्री — Hero बनाउन मिल्दैन
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectMediaAsHero(previewingMedia)}
                    className="px-4 py-2 rounded-xl bg-[#01366E] hover:bg-blue-900 text-white font-bold shadow-sm"
                  >
                    ⭐ यसलाई Hero Image बनाउनुहोस्
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- HERO EDIT MODAL -------------------- */}
      {isEditingHero && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                होमपेज हिरो विवरण सम्पादन (Edit Hero Text & CTA)
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingHero(false)}
                className="text-gray-400 hover:text-gray-600 font-bold px-2 py-1 rounded bg-slate-100 text-xs"
              >
                ✕ बन्द
              </button>
            </div>

            <form onSubmit={handleSaveHeroForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">तस्बिर URL *</label>
                <input
                  type="text"
                  required
                  value={heroForm.imageUrl || ''}
                  onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">शीर्षक (नेपाली)</label>
                  <input
                    type="text"
                    value={heroForm.headingNe || ''}
                    onChange={(e) => setHeroForm({ ...heroForm, headingNe: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Heading (English)</label>
                  <input
                    type="text"
                    value={heroForm.headingEn || ''}
                    onChange={(e) => setHeroForm({ ...heroForm, headingEn: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">उपशीर्षक / नारा (नेपाली)</label>
                <textarea
                  rows={2}
                  value={heroForm.subheadingNe || ''}
                  onChange={(e) => setHeroForm({ ...heroForm, subheadingNe: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">बटन लेबल (नेपाली)</label>
                  <input
                    type="text"
                    value={heroForm.ctaLabelNe || ''}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaLabelNe: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">बटन लिङ्क URL</label>
                  <input
                    type="text"
                    value={heroForm.ctaLink || ''}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alt विवरण (नेपाली)</label>
                  <input
                    type="text"
                    value={heroForm.altTextNe || ''}
                    onChange={(e) => setHeroForm({ ...heroForm, altTextNe: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">अवस्था (Status)</label>
                  <select
                    value={heroForm.status || 'DRAFT'}
                    onChange={(e) => setHeroForm({ ...heroForm, status: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="DRAFT">मस्यौदा (DRAFT - अप्रकाशित)</option>
                    <option value="PUBLISHED">सार्वजनिक (PUBLISHED - सक्रिय)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingHero(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-slate-100"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm"
                >
                  {isPending ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- BANNER EDIT MODAL -------------------- */}
      {isEditingBanner && editingBanner && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingBanner.id ? 'ब्यानर सम्पादन गर्नुहोस्' : 'नयाँ ब्यानर सिर्जना गर्नुहोस्'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditingBanner(false)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold px-2 py-1 rounded-md bg-slate-100"
            >
              ✕ बन्द
            </button>
          </div>

          <form onSubmit={handleSaveBanner} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ब्यानर मुख्य शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  required
                  value={editingBanner.titleNe || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, titleNe: e.target.value })}
                  placeholder="उदा: ११औं वार्षिक साधारण सभा"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.titleEn || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, titleEn: e.target.value })}
                  placeholder="e.g. 11th Annual General Assembly"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  उपशीर्षक (नेपाली)
                </label>
                <input
                  type="text"
                  value={editingBanner.subtitleNe || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitleNe: e.target.value })}
                  placeholder="उदा: सम्पूर्ण सदस्यहरूको उपस्थितिको लागि हार्दिक आह्वान"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle (English)</label>
                <input
                  type="text"
                  value={editingBanner.subtitleEn || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitleEn: e.target.value })}
                  placeholder="e.g. Cordially inviting all general and life members"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  डेस्कटप तस्बिर URL *
                </label>
                <input
                  type="text"
                  required
                  value={editingBanner.imageDesktopUrl || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, imageDesktopUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मोबाइल तस्बिर URL (ऐच्छिक)
                </label>
                <input
                  type="text"
                  value={editingBanner.imageMobileUrl || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, imageMobileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">बटन टेक्स्ट (नेपाली)</label>
                <input
                  type="text"
                  value={editingBanner.buttonTextNe || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, buttonTextNe: e.target.value })}
                  placeholder="उदा: सदस्यता लिनुहोस्"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">लिङ्क URL</label>
                <input
                  type="text"
                  value={editingBanner.linkUrl || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                  placeholder="/membership"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">प्रदर्शन क्रम (Order)</label>
                <input
                  type="number"
                  value={editingBanner.displayOrder || 1}
                  onChange={(e) => setEditingBanner({ ...editingBanner, displayOrder: parseInt(e.target.value, 10) })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBanner.isActive !== false}
                  onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                  className="text-[#01366E] rounded"
                />
                <span>सक्रिय राख्नुहोस् (Display on Public Homepage)</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingBanner(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-slate-100 transition"
              >
                रद्द गर्नुहोस्
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
    </div>
  );
}
