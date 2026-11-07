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
                    ? 'मादी (संखुवासभा) सरोकार समाज'
                    : 'Madi (Sankhuwasabha) Sarokar Samaj'}
                </span>
                <span className="text-[10px] text-orange-300 uppercase tracking-wider font-semibold block">
                  {lang === 'ne' ? 'काठमाण्डौं, नेपाल' : 'Kathmandu, Nepal'}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {lang === 'ne'
                ? 'काठमाण्डौंमा बसोबास गर्ने मादीवासीहरूको एकता, आपसी सद्भाव र सामाजिक सेवामा समर्पित गैरनाफामूलक सामाजिक संस्था।'
                : 'A non-profit community social organization dedicated to the solidarity, mutual welfare, and social service of Madi residents in Kathmandu.'}
            </p>
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
                    ? 'काठमाण्डौं महानगरपालिका वडा नं. ४, सुकेधारा, काठमाण्डौं'
                    : 'Ward No. 4, Sukedhara, Kathmandu, Nepal'}
                </span>
              </p>
              <div className="flex items-center gap-2 text-xs text-white bg-white/5 p-2 rounded-lg border border-white/10 mt-1">
                <span className="shrink-0">✉️</span>
                <a
                  href="mailto:madisssamaj@gmail.com"
                  className="font-bold text-[#FB6C01] hover:text-orange-400 hover:underline transition-colors"
                >
                  madisssamaj@gmail.com
                </a>
              </div>
              <p className="flex items-center gap-2">
                <span>⏰</span>
                <span>{lang === 'ne' ? 'आइतबार - शुक्रबार: १०:०० - ५:००' : 'Sun - Fri: 10:00 - 17:00'}</span>
              </p>
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
            © २०८२ मादी (संखुवासभा) सरोकार समाज। {lang === 'ne' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </p>
          <p className="text-slate-500">
            {lang === 'ne'
              ? 'गैरनाफामूलक सामाजिक संस्था'
              : 'Non-Profit Community Organization'}
          </p>
        </div>
      </div>
    </footer>
  );
}

