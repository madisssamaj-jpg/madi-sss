'use client';

import { useState, useTransition, use } from 'react';
import Link from 'next/link';
import { submitFeedbackAction } from '@/app/actions/cms-actions';

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    category: 'SUGGESTION' as 'SUGGESTION' | 'COMPLAINT' | 'RELIEF_REQUEST' | 'INQUIRY',
    message: '',
  });

  const categories = [
    { key: 'SUGGESTION', ne: 'सल्लाह तथा सुझाव (Suggestion)', en: 'Constructive Suggestion' },
    { key: 'COMPLAINT', ne: 'गुनासो तथा ध्यानाकर्षण (Grievance / Complaint)', en: 'Grievance / Complaint' },
    { key: 'RELIEF_REQUEST', ne: 'राहत वा सहयोग निवेदन (Relief Assistance Request)', en: 'Relief Request' },
    { key: 'INQUIRY', ne: 'सामान्य सोधपुछ (General Inquiry)', en: 'General Inquiry' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitFeedbackAction(formData);
      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Failed to submit feedback.');
      }
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 flex flex-col items-center">
          <img
            src="/media/madi-sss-logo.jpg"
            alt="Madi SSS Logo"
            className="w-20 h-20 rounded-full object-cover bg-white border-2 border-[#01366E]/20 shadow-md"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3 py-1 rounded-full">
            {lang === 'ne' ? 'प्रतिक्रिया तथा गुनासो' : 'Voice of Community'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#01366E]">
            {lang === 'ne' ? 'सुझाव, गुनासो तथा सहयोग निवेदन' : 'Suggestions, Grievances & Inquiries'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {lang === 'ne'
              ? 'तपाईंका अमूल्य सल्लाह–सुझाव, समस्या वा आकस्मिक राहत सहायता आवश्यकता सिधै समाजको सचिवालयमा पुग्नेछ।'
              : 'Submit suggestions, voice grievances, or request emergency assistance directly to our administrative desk.'}
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-md text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {lang === 'ne' ? 'तपाईंको सन्देश सफलतापूर्वक दर्ता भयो!' : 'Submission Received Successfully!'}
            </h2>
            <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
              {lang === 'ne'
                ? 'तपाईंको सुझाव वा गुनासो समाजको आन्तरिक कार्यदलमा दर्ता भएको छ। आवश्यक परेमा सचिवालयबाट सम्पर्क गरिनेछ।'
                : 'Thank you for reaching out. Your feedback is securely logged in our CMS inbox and will be reviewed by the executive desk.'}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    subject: '',
                    category: 'SUGGESTION',
                    message: '',
                  });
                }}
                className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                {lang === 'ne' ? 'अर्को सन्देश पठाउनुहोस्' : 'Send Another Message'}
              </button>
              <Link
                href={`/${lang}`}
                className="bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold px-6 py-2.5 rounded-xl text-xs transition"
              >
                {lang === 'ne' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Return to Home'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  {lang === 'ne' ? 'सन्देशको प्रकृति / विषय वर्ग *' : 'Feedback Category *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((c) => (
                    <label
                      key={c.key}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer transition ${
                        formData.category === c.key
                          ? 'border-[#01366E] bg-blue-50/50 text-[#01366E] shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={c.key}
                        checked={formData.category === c.key}
                        onChange={() => setFormData({ ...formData, category: c.key as any })}
                        className="text-[#01366E] focus:ring-[#01366E]"
                      />
                      <span>{lang === 'ne' ? c.ne : c.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {lang === 'ne' ? 'पूरा नाम *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={lang === 'ne' ? 'उदा: राम बहादुर श्रेष्ठ' : 'e.g. Ram Bahadur Shrestha'}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#01366E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {lang === 'ne' ? 'मोबाइल नम्बर *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#01366E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {lang === 'ne' ? 'इमेल ठेगाना *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@mail.com"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#01366E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {lang === 'ne' ? 'विषय (Subject) *' : 'Subject *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={lang === 'ne' ? 'विषय खुलाउनुहोस्' : 'Brief subject'}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#01366E]"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {lang === 'ne' ? 'विस्तृत व्यहोरा / सन्देश *' : 'Detailed Message / Details *'}
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={
                    lang === 'ne'
                      ? 'तपाईंको विचार, गुनासो वा सहयोगको आवश्यकता स्पष्ट रूपमा लेख्नुहोस्...'
                      : 'Provide details, context, and any specific requests...'
                  }
                  className="w-full text-sm p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#01366E]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto bg-[#01366E] hover:bg-blue-900 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <span>{lang === 'ne' ? 'पठाउँदैछ...' : 'Submitting...'}</span>
                  ) : (
                    <>
                      <span>{lang === 'ne' ? 'सन्देश पेश गर्नुहोस्' : 'Submit Message'}</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confidentiality & Security Notice */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>🔒 {lang === 'ne' ? 'गोपनीयता प्रत्याभूति: तपाईंको सन्देश तथा फोन नम्बर सार्वजनिक गरिँदैन।' : 'Privacy Guarantee: All submissions are treated strictly confidential and never displayed publicly.'}</p>
          <p>
            {lang === 'ne'
              ? 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं सचिवालय | सक्रिय र नियमित हेरिने संस्थागत इमेल पुष्टि भएपछि मात्र सार्वजनिक सम्पर्क विवरण थपिनेछ।'
              : 'Madi (Sankhuwasabha) Sarokar Samaj Secretariat | Public contact details will be added once an active and monitored organizational email is confirmed.'}
          </p>
        </div>
      </div>
    </div>
  );
}

