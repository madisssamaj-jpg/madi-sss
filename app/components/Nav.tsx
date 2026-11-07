'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide public navigation bar on admin routes
  if (pathname?.includes('/admin')) {
    return null;
  }

  const currentLang = pathname?.split('/')[1] || 'ne';
  const otherLang = currentLang === 'ne' ? 'en' : 'ne';

  // Exactly 11 Navigation Links as requested
  const navLinks = [
    { href: `/${currentLang}`, label: currentLang === 'ne' ? 'गृहपृष्ठ' : 'Home' },
    { href: `/${currentLang}/about`, label: currentLang === 'ne' ? 'हाम्रो बारेमा' : 'About Us' },
    { href: `/${currentLang}/activities`, label: currentLang === 'ne' ? 'सामाजिक गतिविधि' : 'Activities' },
    { href: `/${currentLang}/relief-support`, label: currentLang === 'ne' ? 'राहत तथा कल्याणकारी कोष' : 'Relief Fund' },
    { href: `/${currentLang}/events`, label: currentLang === 'ne' ? 'कार्यक्रमहरू' : 'Events' },
    { href: `/${currentLang}/membership`, label: currentLang === 'ne' ? 'सदस्यता' : 'Membership' },
    { href: `/${currentLang}/committee`, label: currentLang === 'ne' ? 'कार्यसमिति' : 'Committee' },
    { href: `/${currentLang}/reports`, label: currentLang === 'ne' ? 'प्रतिवेदनहरू' : 'Reports' },
    { href: `/${currentLang}/gallery`, label: currentLang === 'ne' ? 'ग्यालरी' : 'Gallery' },
    { href: `/${currentLang}/partners`, label: currentLang === 'ne' ? 'शुभचिन्तक तथा साझेदार' : 'Partners' },
    { href: `/${currentLang}/feedback`, label: currentLang === 'ne' ? 'सुझाव तथा गुनासो' : 'Feedback' },
  ];

  const switchLang = () => {
    const segments = pathname ? pathname.split('/') : ['', currentLang];
    segments[1] = otherLang;
    const newPath = segments.join('/') || `/${otherLang}`;
    router.push(newPath);
  };

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === `/${currentLang}`) {
      return pathname === `/${currentLang}` || pathname === `/${currentLang}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#01366E] text-white shadow-md border-b border-white/10">
      {/* 1. Top Informational Banner / Legal Status & Verified Contact Disclaimer */}
      <div className="bg-[#002447] text-slate-300 text-[11px] py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#FB6C01] font-bold">●</span>
            <span className="font-medium">
              {currentLang === 'ne'
                ? '“मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”'
                : '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration”'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <span>📍</span>
              <span>{currentLang === 'ne' ? 'काठमाण्डौं, नेपाल' : 'Kathmandu, Nepal'}</span>
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5 text-amber-200/95 font-medium">
              <span>✉️</span>
              <span>
                {currentLang === 'ne'
                  ? 'सक्रिय र नियमित हेरिने संस्थागत इमेल पुष्टि भएपछि मात्र सार्वजनिक सम्पर्क विवरण थपिनेछ।'
                  : 'Public contact details will be added once an active and monitored organizational email is confirmed.'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Brand Identity & Action CTA Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT: Clickable Official Organization Logo & Title */}
          <Link
            href={`/${currentLang}`}
            className="flex items-center gap-3 shrink-0 group hover:opacity-95 transition"
            aria-label={currentLang === 'ne' ? 'गृहपृष्ठमा जानुहोस्' : 'Go to Homepage'}
          >
            <div className="relative flex items-center justify-center">
              <img
                src="/media/madi-sss-logo.jpg"
                alt="मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं लोगो"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover bg-white border-2 border-[#FB6C01] shadow-md shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg leading-tight text-white tracking-tight group-hover:text-amber-100 transition-colors">
                {currentLang === 'ne'
                  ? 'मादी (संखुवासभा) सरोकार समाज'
                  : 'Madi (Sankhuwasabha) Sarokar Samaj'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-orange-200 uppercase tracking-wider font-semibold block leading-tight mt-0.5">
                {currentLang === 'ne' ? 'काठमाण्डौं, नेपाल' : 'Kathmandu, Nepal'}
              </span>
            </div>
          </Link>

          {/* RIGHT: Prominent CTA Button + Lang Switch + Admin Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* CTA Button: सदस्यता आवेदन */}
            <Link
              href={`/${currentLang}/membership`}
              className="inline-flex items-center gap-1.5 bg-[#FB6C01] hover:bg-[#e55a00] active:scale-95 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <span>📝</span>
              <span>{currentLang === 'ne' ? 'सदस्यता आवेदन' : 'Apply for Membership'}</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={switchLang}
              className="text-xs font-bold border border-white/25 bg-white/10 hover:bg-white/20 active:scale-95 text-white px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl transition-all"
              title={currentLang === 'ne' ? 'Switch to English' : 'नेपाली भाषामा हेर्नुहोस्'}
              aria-label="Language switch"
            >
              {currentLang === 'ne' ? 'EN' : 'नेपाली'}
            </button>

            {/* Admin Portal Button */}
            <Link
              href={`/${currentLang}/admin/login`}
              className="hidden md:inline-flex items-center text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 sm:py-2.5 rounded-xl border border-white/15 transition-all whitespace-nowrap"
              title={currentLang === 'ne' ? 'प्रशासक लगइन' : 'Admin Login'}
            >
              🔐 {currentLang === 'ne' ? 'प्रशासक लगइन' : 'Admin'}
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Bar with All 11 Links */}
      <div 
        className="bg-[#002447] border-t border-white/10 shadow-inner w-full overflow-visible"
        style={{
          backgroundColor: '#002447',
          width: '100%',
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible',
          display: 'block',
          visibility: 'visible',
          opacity: 1,
        }}
      >
        <div 
          className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full overflow-visible"
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            width: '100%',
            height: 'auto',
            maxHeight: 'none',
            overflow: 'visible',
            visibility: 'visible',
            opacity: 1,
          }}
        >
          <nav
            className="flex lg:flex flex-1 w-full overflow-visible flex-wrap items-center justify-between gap-1 sm:gap-1.5 py-2 text-xs sm:text-[13px] font-semibold"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: 'auto',
              maxHeight: 'none',
              overflow: 'visible',
              visibility: 'visible',
              opacity: 1,
            }}
            aria-label="मुख्य नेभिगेसन मेनु"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'inline-block',
                    height: 'auto',
                    maxHeight: 'none',
                    visibility: 'visible',
                    opacity: 1,
                    textDecoration: 'none',
                    color: '#ffffff',
                    backgroundColor: active ? '#FB6C01' : 'transparent',
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#FB6C01] text-white shadow-sm font-bold'
                      : 'text-slate-100 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
