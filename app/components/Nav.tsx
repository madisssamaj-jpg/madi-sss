'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import en from '../../public/locales/en/common.json';
import ne from '../../public/locales/ne/common.json';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide public navigation bar on admin routes
  if (pathname?.includes('/admin')) {
    return null;
  }

  const currentLang = pathname?.split('/')[1] || 'ne';
  const otherLang = currentLang === 'ne' ? 'en' : 'ne';
  const t: Record<string, string> = currentLang === 'ne' ? ne : en;

  const navLinks = [
    { href: `/${currentLang}`, label: t.home || (currentLang === 'ne' ? 'गृहपृष्ठ' : 'Home') },
    { href: `/${currentLang}/about`, label: t.aboutUs || (currentLang === 'ne' ? 'हाम्रो बारेमा' : 'About Us') },
    { href: `/${currentLang}/activities`, label: t.activities || (currentLang === 'ne' ? 'गतिविधि' : 'Activities') },
    { href: `/${currentLang}/relief-support`, label: t.reliefSupport || (currentLang === 'ne' ? 'राहत कोष' : 'Relief Fund') },
    { href: `/${currentLang}/events`, label: t.events || (currentLang === 'ne' ? 'कार्यक्रमहरू' : 'Events') },
    { href: `/${currentLang}/membership`, label: t.membership || (currentLang === 'ne' ? 'सदस्यता' : 'Membership') },
    { href: `/${currentLang}/committee`, label: t.committee || (currentLang === 'ne' ? 'कार्यसमिति' : 'Committee') },
    { href: `/${currentLang}/reports`, label: t.reports || (currentLang === 'ne' ? 'प्रतिवेदनहरू' : 'Reports') },
    { href: `/${currentLang}/gallery`, label: t.gallery || (currentLang === 'ne' ? 'ग्यालरी' : 'Gallery') },
    { href: `/${currentLang}/partners`, label: t.partners || (currentLang === 'ne' ? 'साझेदारहरू' : 'Partners') },
    { href: `/${currentLang}/feedback`, label: t.feedback || (currentLang === 'ne' ? 'सुझाव' : 'Feedback') },
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
    <header className="sticky top-0 z-50 bg-[#01366E]/95 backdrop-blur-md text-white shadow-md border-b border-white/10">
      {/* 1. Top Informational Banner / Privacy Disclaimer */}
      <div className="bg-[#002447] text-slate-300 text-[11px] py-1 px-4 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[#FB6C01] font-bold">●</span>
            <span>
              {currentLang === 'ne'
                ? '“मादीदेखि काठमाडौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”'
                : '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration”'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <span>📍</span>
              <span>{currentLang === 'ne' ? 'काठमाडौं, नेपाल' : 'Kathmandu, Nepal'}</span>
            </span>
            <span className="text-white/30">•</span>
            {/* Social Media Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com/madisss"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition font-medium"
                title="Facebook Page"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#1877F2" />
                  <path
                    d="M15.117 12.875l.44-2.875h-2.757V8.136c0-.788.386-1.556 1.624-1.556H15.7V4.127A15.83 15.83 0 0013.882 4c-2.366 0-3.91 1.435-3.91 4.032V10H7.45v2.875h2.522v6.953c.505.079 1.02.122 1.545.122.524 0 1.04-.043 1.545-.122V12.875h2.055z"
                    fill="white"
                  />
                </svg>
                <span>Facebook</span>
              </a>
              <a
                href="https://youtube.com/@madisss"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition font-medium"
                title="YouTube Channel"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="5" fill="#FF0000" />
                  <polygon points="10,15 15,12 10,9" fill="white" />
                </svg>
                <span>YouTube</span>
              </a>
            </div>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5 text-amber-200/90">
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

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px] gap-2 lg:gap-4">
          {/* LEFT: Clickable Official Organization Logo & Title (40–56px height) */}
          <Link
            href={`/${currentLang}`}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group hover:opacity-95 transition"
            aria-label={currentLang === 'ne' ? 'गृहपृष्ठमा जानुहोस्' : 'Go to Homepage'}
          >
            <div className="relative flex items-center justify-center">
              <img
                src="/media/madi-sss-logo.jpg"
                alt="मादी (संखुवासभा) सरोकार समाज, काठमाडौं लोगो"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover bg-white border-2 border-[#FB6C01] shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-xs sm:text-base leading-tight text-white tracking-tight group-hover:text-amber-100 transition-colors">
                {currentLang === 'ne'
                  ? 'मादी (संखुवासभा) सरोकार समाज'
                  : 'Madi (Sankhuwasabha) Sarokar Samaj'}
              </span>
              <span className="text-[9px] sm:text-[11px] text-orange-200 uppercase tracking-wider font-semibold block leading-tight mt-0.5">
                {currentLang === 'ne' ? 'काठमाडौं, नेपाल' : 'Kathmandu, Nepal'}
              </span>
            </div>
          </Link>

          {/* CENTER: Compact Desktop Navigation Links (11 Links) */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-[11px] xl:text-[12px] font-medium"
            aria-label="Desktop Navigation"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-1.5 xl:px-2 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    active
                      ? 'bg-white/20 text-white font-bold border-b-2 border-[#FB6C01] shadow-xs'
                      : 'text-slate-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Prominent CTA Button + Lang Switch + Admin + Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Prominent CTA Button: सदस्यता आवेदन */}
            <Link
              href={`/${currentLang}/membership`}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#FB6C01] hover:bg-[#e55a00] active:scale-95 text-white font-bold text-xs sm:text-sm px-2.5 sm:px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
            >
              <span className="text-xs sm:text-sm">📝</span>
              <span className="hidden xs:inline">{t.applyMembership || (currentLang === 'ne' ? 'सदस्यता आवेदन' : 'Apply')}</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={switchLang}
              className="text-xs font-bold border border-white/25 bg-white/10 hover:bg-white/20 active:scale-95 text-white px-2 py-2 rounded-lg transition-all"
              title={currentLang === 'ne' ? 'Switch to English' : 'नेपाली भाषामा हेर्नुहोस्'}
              aria-label="Language switch"
            >
              {currentLang === 'ne' ? 'EN' : 'नेपाली'}
            </button>

            {/* Subtle Admin Link (Desktop Only) */}
            <Link
              href={`/${currentLang}/admin/login`}
              className="hidden 2xl:inline-flex items-center text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 px-2 py-2 rounded-lg transition-all whitespace-nowrap"
              title={t.adminPortal}
            >
              {t.adminPortal}
            </Link>

            {/* Mobile Hamburger Toggle Button with Label */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition font-medium text-xs border border-white/20"
              aria-label="मेनु खोल्नुहोस् वा बन्द गर्नुहोस्"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
              <span className="font-bold">{mobileMenuOpen ? (currentLang === 'ne' ? 'बन्द' : 'Close') : (currentLang === 'ne' ? 'मेनु' : 'Menu')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer (11 Links + CTA) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#002447] border-t border-white/10 px-4 pt-4 pb-6 space-y-2 animate-fadeIn shadow-2xl">
          {/* Prominent CTA in Mobile Menu */}
          <div className="pb-2">
            <Link
              href={`/${currentLang}/membership`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-center text-sm font-bold bg-[#FB6C01] hover:bg-[#e55a00] text-white py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <span>📝</span>
              <span>{t.applyMembership || (currentLang === 'ne' ? 'सदस्यता आवेदन' : 'Apply for Membership')}</span>
            </Link>
          </div>

          {/* Navigation Links Grid/List */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-white/20 text-white font-bold border-l-4 border-[#FB6C01]'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="text-xs text-orange-300">●</span>}
                </Link>
              );
            })}
          </div>

          {/* Mobile Footer Area: Admin Portal & Language Info */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
            <Link
              href={`/${currentLang}/admin/login`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-semibold py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              🔒 {t.adminPortal}
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                switchLang();
              }}
              className="text-amber-200 font-bold py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              🌐 {currentLang === 'ne' ? 'English Version' : 'नेपाली संस्करण'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
