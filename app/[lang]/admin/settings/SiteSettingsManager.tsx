'use client';

import { useState, useTransition } from 'react';
import { SiteSettings } from '@/lib/cms/cms-service';
import { updateSiteSettingsAction } from '@/app/actions/cms-actions';

export function SiteSettingsManager({
  initialSettings,
  lang,
}: {
  initialSettings: SiteSettings;
  lang: string;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await updateSiteSettingsAction(settings);
      if (res.success && res.data) {
        setMessage('साइट सेटिङ्स तथा हाम्रो परिचय (About Page) विवरण सफलतापूर्वक सुरक्षित गरियो!');
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
          {lang === 'ne' ? 'प्रणाली तथा कन्फिगरेसन' : 'Configuration'}
        </span>
        <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
          {lang === 'ne' ? 'साइट सेटिङ्स तथा हाम्रो परिचय (About Page) व्यवस्थापन' : 'Site Settings & About Page CMS'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {lang === 'ne'
            ? 'संस्थाको आधिकारिक नाम, मूल नारा, दर्ता विवरण, सम्पर्क ठेगाना, हाम्रो परिचय (About Us) पाठ तथा खाली अवस्था सूचनाहरू व्यवस्थापन गर्नुहोस्।'
            : 'Manage organization identity, statutory details, About Us content, contact channels, and empty-state messaging.'}
        </p>
      </div>

      {/* Admin Status Indicator for Approved Constitution PDF */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-sm">
        <span className="text-2xl">⏳</span>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              स्थिति / Status
            </span>
            <span className="font-extrabold text-sm sm:text-base">
              Awaiting original approved Constitution PDF
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            जिल्ला प्रशासन कार्यालयबाट आधिकारिक छाप लागेको <strong>सक्कल (Original Approved & Stamped) विधान PDF</strong> प्राप्त हुन बाँकी छ। सार्वजनिक वेबसाइटमा विधान डाउनलोड बटन स्वतः लुकाइएको छ र तयारीको सूचना देखाइएको छ।
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold">
          ℹ️ {message}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>🏛️</span>
            <span>संस्थागत पहिचान तथा मूल नारा (Organization Identity & Slogan)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                संस्थाको मानक नाम (नेपाली) *
              </label>
              <input
                type="text"
                required
                value={settings.orgNameNe}
                onChange={(e) => setSettings({ ...settings, orgNameNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Organization Name (English) *
              </label>
              <input
                type="text"
                required
                value={settings.orgNameEn}
                onChange={(e) => setSettings({ ...settings, orgNameEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                आधिकारिक मूल नारा (नेपाली) *
              </label>
              <input
                type="text"
                required
                value={settings.sloganNe}
                onChange={(e) => setSettings({ ...settings, sloganNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Official Slogan (English) *
              </label>
              <input
                type="text"
                required
                value={settings.sloganEn}
                onChange={(e) => setSettings({ ...settings, sloganEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>
        </div>

        {/* About Page: Organization Background & History */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>📖</span>
            <span>हाम्रो परिचय पृष्ठ: पृष्ठभूमि तथा इतिहास (About Us Background)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                पृष्ठभूमि शीर्षक (नेपाली)
              </label>
              <input
                type="text"
                value={settings.aboutBackgroundTitleNe || ''}
                onChange={(e) => setSettings({ ...settings, aboutBackgroundTitleNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Background Title (English)
              </label>
              <input
                type="text"
                value={settings.aboutBackgroundTitleEn || ''}
                onChange={(e) => setSettings({ ...settings, aboutBackgroundTitleEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              स्थापना पृष्ठभूमि अनुच्छेद १ (नेपाली)
            </label>
            <textarea
              rows={3}
              value={settings.aboutBackgroundP1Ne || ''}
              onChange={(e) => setSettings({ ...settings, aboutBackgroundP1Ne: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Establishment Background Paragraph 1 (English)
            </label>
            <textarea
              rows={3}
              value={settings.aboutBackgroundP1En || ''}
              onChange={(e) => setSettings({ ...settings, aboutBackgroundP1En: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              संस्थागत भूमिका अनुच्छेद २ (नेपाली)
            </label>
            <textarea
              rows={2}
              value={settings.aboutBackgroundP2Ne || ''}
              onChange={(e) => setSettings({ ...settings, aboutBackgroundP2Ne: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Institutional Role Paragraph 2 (English)
            </label>
            <textarea
              rows={2}
              value={settings.aboutBackgroundP2En || ''}
              onChange={(e) => setSettings({ ...settings, aboutBackgroundP2En: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
            />
          </div>
        </div>

        {/* Founding and Registration (स्थापना तथा दर्ता) Module */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>🚩</span>
              <span>स्थापना तथा दर्ता व्यवस्थापन (Founding & Statutory Registration CMS)</span>
            </h2>
            <span className="text-[11px] font-semibold text-gray-500">
              २०७६ मा ‘मादी सरोकार केन्द्र’ स्थापना, नाम परिवर्तन र २०८२ मा विधिवत दर्ताको आधिकारिक अभिलेख
            </span>
          </div>

          {/* Historical Review & Confirmation Banner */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-emerald-900 block">
                  संगठनात्मक इतिहास प्रमाणीकरण स्थिति (Confirmed Historical Record)
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  वि.सं. २०७६ मा ‘मादी सरोकार केन्द्र’ का रूपमा स्थापना, पछि नाम परिवर्तन भई ‘मादी (संखुवासभा) सरोकार समाज’ र २०८२ मा जिल्ला प्रशासन कार्यालयमा विधिवत दर्ता भएको तथ्य प्रमाणित भइसकेको छ।
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shrink-0">
                <input
                  type="checkbox"
                  checked={settings.isFoundingYearConfirmed || false}
                  onChange={(e) => setSettings({ ...settings, isFoundingYearConfirmed: e.target.checked })}
                  className="rounded text-[#01366E] focus:ring-0"
                />
                <span className="text-xs font-bold text-gray-900">
                  {settings.isFoundingYearConfirmed
                    ? '✓ कार्यसमितिद्वारा प्रमाणित'
                    : '⚠️ प्रारम्भिक अभिलेख (अपुष्ट)'}
                </span>
              </label>
            </div>

            {/* Original vs Current Organization Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-emerald-200/60">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  प्रारम्भिक संस्थागत नाम (नेपाली - Historical Name) *
                </label>
                <input
                  type="text"
                  value={settings.originalOrganizationNameNe || 'मादी सरोकार केन्द्र, काठमाडौं'}
                  onChange={(e) => setSettings({ ...settings, originalOrganizationNameNe: e.target.value })}
                  placeholder="उदा: मादी सरोकार केन्द्र, काठमाडौं"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Original Organization Name (English) *
                </label>
                <input
                  type="text"
                  value={settings.originalOrganizationNameEn || 'Madi Sarokar Kendra, Kathmandu'}
                  onChange={(e) => setSettings({ ...settings, originalOrganizationNameEn: e.target.value })}
                  placeholder="e.g. Madi Sarokar Kendra, Kathmandu"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  वर्तमान आधिकारिक नाम (नेपाली - Official Current Name) *
                </label>
                <input
                  type="text"
                  value={settings.currentOrganizationNameNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं'}
                  onChange={(e) => setSettings({ ...settings, currentOrganizationNameNe: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Current Official Name (English) *
                </label>
                <input
                  type="text"
                  value={settings.currentOrganizationNameEn || 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu'}
                  onChange={(e) => setSettings({ ...settings, currentOrganizationNameEn: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* Milestone Years & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-emerald-200/60">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  प्रारम्भिक स्थापना वर्ष
                </label>
                <input
                  type="text"
                  value={settings.originalEstablishmentYear || '२०७६'}
                  onChange={(e) => setSettings({ ...settings, originalEstablishmentYear: e.target.value })}
                  placeholder="उदा: २०७६"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  विधिवत दर्ता वर्ष
                </label>
                <input
                  type="text"
                  value={settings.formalRegistrationYear || '२०८२'}
                  onChange={(e) => setSettings({ ...settings, formalRegistrationYear: e.target.value })}
                  placeholder="उदा: २०८२"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  विधिवत दर्ता मिति (नेपाली)
                </label>
                <input
                  type="text"
                  value={settings.formalRegistrationDateNe || ''}
                  onChange={(e) => setSettings({ ...settings, formalRegistrationDateNe: e.target.value })}
                  placeholder="उदा: वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Formal Registration Date (En)
                </label>
                <input
                  type="text"
                  value={settings.formalRegistrationDateEn || ''}
                  onChange={(e) => setSettings({ ...settings, formalRegistrationDateEn: e.target.value })}
                  placeholder="e.g. 2082/04/21 BS (Aug 06, 2025)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>
          </div>

          {/* Narrative Paragraphs: 3-step confirmed historical text */}
          <div className="space-y-4">
            {/* Paragraph 1: 2076 Founding as Madi Sarokar Kendra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  १. वि.सं. २०७६ मा ‘मादी सरोकार केन्द्र’ सुरुवात विवरण (नेपाली) *
                </label>
                <textarea
                  rows={3}
                  value={settings.communityStartDescriptionNe || ''}
                  onChange={(e) => setSettings({ ...settings, communityStartDescriptionNe: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. 2076 BS ‘Madi Sarokar Kendra’ Inception (English) *
                </label>
                <textarea
                  rows={3}
                  value={settings.communityStartDescriptionEn || ''}
                  onChange={(e) => setSettings({ ...settings, communityStartDescriptionEn: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* Paragraph 2: Renaming & 2082 DAO Registration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  २. नाम परिवर्तन तथा २०८२ मा विधिवत दर्ता इतिहास (नेपाली) *
                </label>
                <textarea
                  rows={3}
                  value={settings.renamingHistoryNe || ''}
                  onChange={(e) => setSettings({ ...settings, renamingHistoryNe: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Renaming & 2082 BS DAO Kathmandu Registration (English) *
                </label>
                <textarea
                  rows={3}
                  value={settings.renamingHistoryEn || ''}
                  onChange={(e) => setSettings({ ...settings, renamingHistoryEn: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* Paragraph 3: Post-registration Governance & Welfare Continuity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ३. दर्तापश्चात् पारदर्शी निरन्तरता विवरण (नेपाली) *
                </label>
                <textarea
                  rows={3}
                  value={settings.organizationHistoryNe || ''}
                  onChange={(e) => setSettings({ ...settings, organizationHistoryNe: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Post-Registration Transparent Continuity (English) *
                </label>
                <textarea
                  rows={3}
                  value={settings.organizationHistoryEn || ''}
                  onChange={(e) => setSettings({ ...settings, organizationHistoryEn: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Governance & Legal Profile */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>⚖️</span>
            <span>वैधानिक दर्ता तथा क्षेत्राधिकार विवरण (Statutory Details)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                दर्ता निकाय (नेपाली)
              </label>
              <input
                type="text"
                value={settings.registrationAuthorityNe || ''}
                onChange={(e) => setSettings({ ...settings, registrationAuthorityNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Registration Authority (English)
              </label>
              <input
                type="text"
                value={settings.registrationAuthorityEn || ''}
                onChange={(e) => setSettings({ ...settings, registrationAuthorityEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                दर्ता / प्रमाणीकरण मिति (नेपाली)
              </label>
              <input
                type="text"
                value={settings.registrationDateNe || ''}
                onChange={(e) => setSettings({ ...settings, registrationDateNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Registration Date (English)
              </label>
              <input
                type="text"
                value={settings.registrationDateEn || ''}
                onChange={(e) => setSettings({ ...settings, registrationDateEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                जि.प्र.का. दर्ता नम्बर (उपलब्ध भएपछि मात्र भर्नुहोस्)
              </label>
              <input
                type="text"
                placeholder="उदा: १२३/०८२"
                value={settings.daoRegistrationNumber || ''}
                onChange={(e) => setSettings({ ...settings, daoRegistrationNumber: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                केन्द्रीय कार्यालय ठेगाना (नेपाली)
              </label>
              <input
                type="text"
                value={settings.centralOfficeNe || ''}
                onChange={(e) => setSettings({ ...settings, centralOfficeNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Registered Secretariat (English)
              </label>
              <input
                type="text"
                value={settings.centralOfficeEn || ''}
                onChange={(e) => setSettings({ ...settings, centralOfficeEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                कार्यक्षेत्र (नेपाली)
              </label>
              <input
                type="text"
                value={settings.jurisdictionNe || ''}
                onChange={(e) => setSettings({ ...settings, jurisdictionNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Geographic Jurisdiction (English)
              </label>
              <input
                type="text"
                value={settings.jurisdictionEn || ''}
                onChange={(e) => setSettings({ ...settings, jurisdictionEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>
        </div>

        {/* Constitution Empty-State Messaging */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>📜</span>
            <span>विधान खाली अवस्था सूचना (Constitution Empty-State Text)</span>
          </h2>
          <p className="text-xs text-gray-500">
            सक्कल विधान प्रकाशित नभएको अवस्थामा सार्वजनिक हाम्रो परिचय र प्रतिवेदन पृष्ठमा देखिने आधिकारिक सूचना:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                खाली अवस्था सूचना (नेपाली) *
              </label>
              <input
                type="text"
                required
                value={settings.constitutionEmptyStateNe || 'विधान डाउनलोडका लागि तयारी भइरहेको छ।'}
                onChange={(e) => setSettings({ ...settings, constitutionEmptyStateNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Empty State Notice (English) *
              </label>
              <input
                type="text"
                required
                value={settings.constitutionEmptyStateEn || 'The constitution document is being prepared for download.'}
                onChange={(e) => setSettings({ ...settings, constitutionEmptyStateEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>
        </div>

        {/* Contact & Secretariat Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>📞</span>
            <span>सम्पर्क तथा सचिवालय (Contact Information)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                आधिकारिक इमेल (Email) *
              </label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                सचिवालय फोन (प्रमाणित नम्बर प्राप्त भएपछि मात्र भर्नुहोस्)
              </label>
              <input
                type="text"
                placeholder="आधिकारिक नम्बर प्राप्त नभएसम्म खाली राख्नुहोस्"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                उत्पादन वातावरणमा कुनै पनि डमी वा नक्कली फोन नम्बर राख्न निषेध गरिएको छ।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                सचिवालय ठेगाना (नेपाली)
              </label>
              <input
                type="text"
                value={settings.officeAddressNe}
                onChange={(e) => setSettings({ ...settings, officeAddressNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Facebook पेज लिङ्क
              </label>
              <input
                type="text"
                value={settings.facebookUrl || ''}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })}
                className="text-[#01366E] rounded"
              />
              <span>अनलाइन सदस्यता तथा गुनासो दर्ता हुँदा स्वचालित इमेल सूचना पठाउनुहोस् (Transactional Emails)</span>
            </label>
          </div>
        </div>

        {/* SEO & Meta Tags */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>🌐</span>
            <span>सर्च इन्जिन अप्टिमाइजेसन (SEO & Social Sharing)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                डिफल्ट मेटा शीर्षक (नेपाली) *
              </label>
              <input
                type="text"
                required
                value={settings.defaultMetaTitleNe}
                onChange={(e) => setSettings({ ...settings, defaultMetaTitleNe: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Default Meta Title (English) *
              </label>
              <input
                type="text"
                required
                value={settings.defaultMetaTitleEn}
                onChange={(e) => setSettings({ ...settings, defaultMetaTitleEn: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              मेटा विवरण (नेपाली - Search Snippet) *
            </label>
            <textarea
              rows={2}
              required
              value={settings.defaultMetaDescNe}
              onChange={(e) => setSettings({ ...settings, defaultMetaDescNe: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              OpenGraph सामाजिक सञ्जाल तस्बिर (OG Image URL) *
            </label>
            <input
              type="text"
              required
              value={settings.ogImageUrl}
              onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#01366E] hover:bg-blue-900 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-md transition"
          >
            {isPending ? 'सेटिङ्स सुरक्षित गर्दै...' : 'सेटिङ्स सुरक्षित गर्नुहोस्'}
          </button>
        </div>
      </form>
    </div>
  );
}
