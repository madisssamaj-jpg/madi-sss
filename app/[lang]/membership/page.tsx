'use client';

import { useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { submitMembershipApplicationAction } from '@/app/actions/cms-actions';

export default function MembershipPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'ne';

  const [form, setForm] = useState({
    fullNameNe: '',
    fullNameEn: '',
    membershipType: 'ORDINARY',
    madiAddressNe: '',
    currentAddressNe: '',
    phone: '',
    email: '',
    occupationNe: '',
    reasonForJoiningNe: '',
    consentGiven: false,
  });

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.consentGiven) {
      setError(
        lang === 'ne'
          ? 'कृपया संस्थाको विधान तथा नियम पालना गर्ने सहमतिमा चिन्ह लगाउनुहोस्।'
          : 'Please accept the consent terms before submitting.'
      );
      return;
    }

    startTransition(async () => {
      const res = await submitMembershipApplicationAction(form);
      if (res.success) {
        setSuccess(true);
        setForm({
          fullNameNe: '',
          fullNameEn: '',
          membershipType: 'ORDINARY',
          madiAddressNe: '',
          currentAddressNe: '',
          phone: '',
          email: '',
          occupationNe: '',
          reasonForJoiningNe: '',
          consentGiven: false,
        });
      } else {
        setError(res.error || 'Submission failed.');
      }
    });
  };

  const tiers = [
    {
      key: 'ORDINARY',
      nameNe: 'साधारण सदस्यता',
      nameEn: 'Ordinary Membership',
      validity: lang === 'ne' ? '२ वर्ष (नवीकरण योग्य)' : '2 Years (Renewable)',
      benefitsNe: [
        'साधारण सभामा भाग लिन तथा मताधिकार प्रयोग गर्न पाउने।',
        'संस्थाका सामाजिक तथा सांस्कृतिक गतिविधिहरूमा सक्रिय सहभागिता।',
        'सामुदायिक सूचना तथा सहयोग सञ्जालमा प्रत्यक्ष पहुँच।',
      ],
      benefitsEn: [
        'Full voting rights in the annual general assembly.',
        'Active participation in community welfare projects.',
        'Direct access to member communications & network.',
      ],
    },
    {
      key: 'LIFE',
      nameNe: 'आजीवन सदस्यता',
      nameEn: 'Life Membership',
      validity: lang === 'ne' ? 'आजीवन' : 'Lifetime',
      benefitsNe: [
        'संस्थाको आजीवन सदस्य परिचयपत्र तथा सम्मानपत्र।',
        'संस्थागत साधारण सभामा स्थायी मताधिकार।',
        'संस्थाका महत्वपूर्ण नीतिगत निर्णयहरूमा विशेष परामर्श।',
        'वार्षिक स्मारिका तथा स्मारिकामा स्थायी नामावली अभिलेख।',
      ],
      benefitsEn: [
        'Official Life Membership certificate & identity badge.',
        'Permanent voting franchise in all general assemblies.',
        'Honorary consultation on long-term initiatives.',
        'Permanent inclusion in the annual honor roll.',
      ],
      featured: true,
    },
    {
      key: 'HONORARY',
      nameNe: 'विशिष्ट / संरक्षक सदस्यता',
      nameEn: 'Patron Membership',
      validity: lang === 'ne' ? 'स्थायी संरक्षक' : 'Permanent Patron',
      benefitsNe: [
        'संस्थाको संरक्षक तथा सल्लाहकार परिषदमा सहभागिता।',
        'संस्थाको केन्द्रीय कार्यालयमा विशिष्ट ताम्रपत्रमा नाम अंकन।',
        'मादी राहत कोष तथा विकास परियोजनाहरूको अनुगमन र मार्गदर्शन।',
      ],
      benefitsEn: [
        'Permanent seat in the Council of Advisors.',
        'Permanent inscription on the Society Patron Plaque.',
        'Philanthropic oversight of development funds.',
      ],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 flex flex-col items-center">
          <img
            src="/media/madi-sss-logo.jpg"
            alt="Madi SSS Logo"
            className="w-20 h-20 rounded-full object-cover bg-white border-2 border-[#01366E]/20 shadow-md"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'एकता र सहकार्य' : 'Community Solidarity'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'सदस्यता विवरण तथा अनलाइन आवेदन' : 'Membership Information & Online Application'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'काठमाण्डौं उपत्यकामा बसोबास गर्ने सम्पूर्ण मादीवासीहरूलाई संस्थामा आबद्ध हुन हार्दिक आह्वान गर्दछौं।'
              : 'Uniting all residents of Madi living in Kathmandu Valley into a vibrant, compassionate community network.'}
          </p>
        </div>

        {/* Safe Fee Notice Banner */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 text-center max-w-3xl mx-auto text-amber-950 shadow-xs">
          <p className="text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
            <span>📢</span>
            <span>
              {lang === 'ne'
                ? 'सदस्यता शुल्क तथा वर्गीकरणको अन्तिम विवरण कार्यसमितिको आधिकारिक निर्णयपछि प्रकाशित गरिनेछ।'
                : 'Final details regarding membership fees and classification will be published following the official decision of the Executive Committee.'}
            </span>
          </p>
        </div>

        {/* Membership Tiers Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.key}
              className={`bg-white rounded-3xl p-6 sm:p-8 border transition flex flex-col justify-between ${
                t.featured
                  ? 'border-[#FB6C01] shadow-lg ring-2 ring-[#FB6C01]/20 relative'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FB6C01] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  {lang === 'ne' ? 'सबैभन्दा लोकप्रिय' : 'Most Popular'}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#01366E]">
                    {lang === 'ne' ? t.nameNe : t.nameEn}
                  </h3>
                  <span className="text-xs text-gray-400 font-medium block mt-1">
                    {t.validity}
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center">
                  <span className="text-xs font-bold text-amber-900 block">
                    {lang === 'ne' ? 'निर्णयपछि प्रकाशित गरिने' : 'To be published after decision'}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">
                    {lang === 'ne' ? 'कार्यसमिति समीक्षामा' : 'Under Executive Review'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-slate-100">
                  {(lang === 'ne' ? t.benefitsNe : t.benefitsEn).map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href="#application-form"
                  onClick={() => setForm({ ...form, membershipType: t.key as any })}
                  className={`w-full block text-center py-2.5 rounded-xl text-xs font-bold transition ${
                    t.featured
                      ? 'bg-[#FB6C01] hover:bg-[#e55a00] text-white shadow'
                      : 'bg-[#01366E] hover:bg-[#002855] text-white'
                  }`}
                >
                  {lang === 'ne' ? 'यो सदस्यता छान्नुहोस्' : 'Select This Tier'}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Offline Download Option / Safe Notice */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📄</span>
            <div>
              <h4 className="font-bold text-[#01366E] text-sm">
                {lang === 'ne' ? 'कागजी (अफलाइन) सदस्यता फारम' : 'Printable Membership Form'}
              </h4>
              <p className="text-xs text-gray-500">
                {lang === 'ne'
                  ? 'कागजी (अफलाइन) सदस्यता फारमको आधिकारिक ढाँचा कार्यसमितिबाट अन्तिम प्रमाणीकरण भएपछि यहाँ उपलब्ध गराइनेछ।'
                  : 'Official printable membership form template will be made available here following final certification by the Executive Committee.'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs px-4 py-2 rounded-xl whitespace-nowrap">
            <span>⏳</span>
            <span>{lang === 'ne' ? 'ढाँचा तयारीमा' : 'Preparation in Progress'}</span>
          </span>
        </div>

        {/* Online Registration Form */}
        <div id="application-form" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-extrabold text-[#01366E]">
              {lang === 'ne' ? 'अनलाइन सदस्यता आवेदन फारम' : 'Online Membership Application Form'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'ne'
                ? 'कृपया सम्पूर्ण विवरण यथार्थ भर्नुहोस्। पेश भएको आवेदन कार्यसमितिद्वारा स्वीकृत हुनेछ।'
                : 'All fields are reviewed by the executive secretariat before granting membership. Personal data is never exposed publicly.'}
            </p>
          </div>

          {success && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-sm text-emerald-800">
              <span className="font-bold">{lang === 'ne' ? 'सफल! ' : 'Application Received! '}</span>
              {lang === 'ne'
                ? 'तपाईंको सदस्यता आवेदन सफलतापूर्वक दर्ता भएको छ। सचिवालयले समीक्षा गरी सम्पर्क गर्नेछ।'
                : 'Your application has been received into the secretariat inbox. We will contact you soon.'}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700">
              <span className="font-bold">{lang === 'ne' ? 'त्रुटि: ' : 'Error: '}</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {lang === 'ne' ? 'सदस्यता वर्ग' : 'Membership Category'}
              </label>
              <select
                value={form.membershipType}
                onChange={(e) => setForm({ ...form, membershipType: e.target.value as any })}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
              >
                <option value="ORDINARY">{lang === 'ne' ? 'साधारण सदस्यता' : 'Ordinary Membership'}</option>
                <option value="LIFE">{lang === 'ne' ? 'आजीवन सदस्यता' : 'Life Membership'}</option>
                <option value="HONORARY">{lang === 'ne' ? 'विशिष्ट / संरक्षक सदस्यता' : 'Patron Membership'}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'पूरा नाम (नेपालीमा)' : 'Full Name (Nepali)'} *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullNameNe}
                  onChange={(e) => setForm({ ...form, fullNameNe: e.target.value })}
                  placeholder="राम बहादुर श्रेष्ठ"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'पूरा नाम (अंग्रेजीमा)' : 'Full Name (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullNameEn}
                  onChange={(e) => setForm({ ...form, fullNameEn: e.target.value })}
                  placeholder="Ram Bahadur Shrestha"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'मादीको स्थायी ठेगाना (वडा/गाउँ)' : 'Madi Permanent Address (Ward/Village)'} *
                </label>
                <input
                  type="text"
                  required
                  value={form.madiAddressNe}
                  onChange={(e) => setForm({ ...form, madiAddressNe: e.target.value })}
                  placeholder="मादी–४, ओखरबोटे, संखुवासभा"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'हालको बसोबास ठेगाना (काठमाण्डौं उपत्यका)' : 'Current Kathmandu Address'} *
                </label>
                <input
                  type="text"
                  required
                  value={form.currentAddressNe}
                  onChange={(e) => setForm({ ...form, currentAddressNe: e.target.value })}
                  placeholder="सुकेधारा, काठमाण्डौं"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'सम्पर्क फोन / मोबाइल नम्बर' : 'Contact Phone / Mobile'} *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'इमेल ठेगाना' : 'Email Address'} *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {lang === 'ne' ? 'पेशा वा व्यवसाय' : 'Profession / Occupation'} *
              </label>
              <input
                type="text"
                required
                value={form.occupationNe}
                onChange={(e) => setForm({ ...form, occupationNe: e.target.value })}
                placeholder="शिक्षण / व्यापार / सरकारी सेवा / इन्जिनियरिङ"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {lang === 'ne' ? 'संस्थामा जोडिनुको कारण वा योगदानको इच्छा' : 'Reason for Joining / Intended Contribution'} *
              </label>
              <textarea
                rows={3}
                required
                value={form.reasonForJoiningNe}
                onChange={(e) => setForm({ ...form, reasonForJoiningNe: e.target.value })}
                placeholder="जन्मथलोको सामाजिक सेवा तथा काठमाण्डौंमा रहेका मादीवासीहरूबीच सहकार्य प्रवर्द्धन गर्न..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FB6C01] focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="consent"
                required
                checked={form.consentGiven}
                onChange={(e) => setForm({ ...form, consentGiven: e.target.checked })}
                className="mt-1 h-4 w-4 text-[#FB6C01] rounded border-gray-300"
              />
              <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed">
                {lang === 'ne'
                  ? 'म मादी (संखुवासभा) सरोकार समाजको विधान, उद्देश्य र आचारसंहिता पालना गर्न मञ्जुर गर्दछु। मेरो विवरण संस्थागत अभिलेखमा सुरक्षित रहनेछ।'
                  : 'I declare that the information provided is accurate and agree to adhere to the constitution, code of conduct, and democratic values of Madi Sarokar Samaj.'}
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#01366E] hover:bg-[#002855] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {isPending ? '...' : lang === 'ne' ? 'सदस्यता आवेदन पेश गर्नुहोस्' : 'Submit Membership Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

