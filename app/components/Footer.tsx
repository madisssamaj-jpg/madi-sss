'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Do not render public footer on CMS admin routes
  if (pathname?.includes('/admin')) {
    return null;
  }

  const lang = pathname?.split('/')[1] === 'en' ? 'en' : 'ne';

  return (
    <footer className="bg-[#002244] text-slate-300 border-t border-white/10 mt-auto text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Org Info Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/media/madi-sss-logo.jpg"
                alt="Madi SSS Logo"
                className="w-12 h-12 rounded-full object-cover bg-white border-2 border-[#FB6C01] shadow-md shrink-0"
              />
              <div>
                <span className="font-extrabold text-sm sm:text-base text-white block leading-tight">
                  {lang === 'ne'
                    ? 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं'
                    : 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu'}
                </span>
                <span className="text-[10px] text-orange-300 uppercase tracking-wider font-semibold block">
                  {lang === 'ne' ? 'काठमाडौं, नेपाल' : 'Kathmandu, Nepal'}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {lang === 'ne'
                ? '“मादीदेखि काठमाडौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान।” जिल्ला प्रशासन कार्यालय, काठमाडौंमा दर्ता भई सञ्चालित गैरनाफामूलक सामाजिक संस्था।'
                : '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration.” A non-profit community social organization.'}
            </p>

            <div className="text-[11px] text-slate-300 space-y-1.5 bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span>🏛️</span>
                <span>
                  {lang === 'ne'
                    ? 'जिल्ला प्रशासन कार्यालय, काठमाडौंमा दर्ता प्रमाणित'
                    : 'DAO Kathmandu Registered & Verified'}
                </span>
              </div>
              <p className="text-slate-400">
                <span className="text-white font-semibold">{lang === 'ne' ? 'दर्ता मिति:' : 'Registered:'}</span>{' '}
                २०८२/०४/२१ BS (दर्ता नं. १६)
              </p>
              <p className="text-slate-400">
                <span className="text-white font-semibold">{lang === 'ne' ? 'कार्यालय:' : 'Office:'}</span>{' '}
                {lang === 'ne' ? 'काठमाडौं-४, सुकेधारा' : 'Kathmandu-4, Sukedhara'}
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm tracking-wider uppercase border-b border-white/10 pb-2">
              {lang === 'ne' ? 'प्रमुख पृष्ठहरू' : 'Explore'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}`} className="hover:text-white transition">
                  {lang === 'ne' ? 'गृहपृष्ठ' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-[#FB6C01]">›</span>
                  <span>{lang === 'ne' ? 'हाम्रो बारेमा (About Us)' : 'About Us'}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/activities`} className="hover:text-white transition">
                  {lang === 'ne' ? 'सामाजिक गतिविधिहरू' : 'Social Activities'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/relief-support`} className="hover:text-white transition">
                  {lang === 'ne' ? 'राहत तथा कल्याणकारी कोष' : 'Relief & Welfare Fund'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/events`} className="hover:text-white transition">
                  {lang === 'ne' ? 'आगामी तथा सम्पन्न कार्यक्रम' : 'Events & Programs'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/committee`} className="hover:text-white transition">
                  {lang === 'ne' ? 'कार्यसमिति विवरण' : 'Executive Committee'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Constitution Column */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm tracking-wider uppercase border-b border-white/10 pb-2">
              {lang === 'ne' ? 'सुशासन तथा विधान' : 'Governance & Law'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}/reports?category=CONSTITUTION`}
                  className="text-orange-400 hover:text-orange-300 font-bold transition flex items-center gap-1.5"
                >
                  <span>📜</span>
                  <span>{lang === 'ne' ? 'विधान तथा नियमावली' : 'Constitution & Bylaws'}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/reports`} className="hover:text-white transition">
                  {lang === 'ne' ? 'वार्षिक प्रतिवेदन तथा अडिट' : 'Annual Audit Reports'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/membership`} className="hover:text-white transition">
                  {lang === 'ne' ? 'सदस्यता आवेदन' : 'Apply for Membership'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/partners`} className="hover:text-white transition">
                  {lang === 'ne' ? 'शुभचिन्तक तथा साझेदार' : 'Partners & Allies'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/feedback`} className="hover:text-white transition">
                  {lang === 'ne' ? 'सुझाव तथा गुनासो' : 'Feedback & Suggestions'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm tracking-wider uppercase border-b border-white/10 pb-2">
              {lang === 'ne' ? 'सम्पर्क तथा सचिवालय' : 'Contact Secretariat'}
            </h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-start gap-2">
                <span>📍</span>
                <span>
                  {lang === 'ne'
                    ? 'काठमाडौं महानगरपालिका वडा नं. ४, सुकेधारा, काठमाडौं'
                    : 'Ward No. 4, Sukedhara, Kathmandu, Nepal'}
                </span>
              </p>
              <div className="flex items-start gap-2 text-xs text-amber-200/90 bg-white/5 p-2 rounded-lg border border-white/10 mt-1">
                <span className="shrink-0 mt-0.5">✉️</span>
                <span>
                  {lang === 'ne'
                    ? 'सक्रिय र नियमित हेरिने संस्थागत इमेल पुष्टि भएपछि मात्र सार्वजनिक सम्पर्क विवरण थपिनेछ।'
                    : 'Public contact details will be added once an active and monitored organizational email is confirmed.'}
                </span>
              </div>
              <p className="flex items-center gap-2">
                <span>⏰</span>
                <span>{lang === 'ne' ? 'आइतबार - शुक्रबार: १०:०० - ५:००' : 'Sun - Fri: 10:00 - 17:00'}</span>
              </p>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                {lang === 'ne' ? 'सामाजिक सञ्जालमा जोडिनुहोस्:' : 'Connect with Us:'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com/madisss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1877F2]/20 hover:bg-[#1877F2]/40 text-blue-300 border border-[#1877F2]/40 text-[11px] font-medium transition"
                  title="Facebook Page"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
                <a
                  href="https://youtube.com/@madisss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF0000]/20 hover:bg-[#FF0000]/40 text-red-300 border border-[#FF0000]/40 text-[11px] font-medium transition"
                  title="YouTube Channel"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/${lang}/admin/login`}
                className="inline-block text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-lg border border-white/20 transition"
              >
                🔐 {lang === 'ne' ? 'प्रशासक लगइन' : 'Admin Login'}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © २०८२ मादी (संखुवासभा) सरोकार समाज, काठमाडौं। {lang === 'ne' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </p>
          <p className="text-slate-500">
            {lang === 'ne'
              ? 'जिल्ला प्रशासन कार्यालय, काठमाडौंमा दर्ता भई सञ्चालित गैरनाफामूलक सामाजिक संस्था'
              : 'Registered Non-Profit Community Organization | DAO Kathmandu Approved'}
          </p>
        </div>
      </div>
    </footer>
  );
}

