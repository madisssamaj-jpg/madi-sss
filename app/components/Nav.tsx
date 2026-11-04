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
  const t = currentLang === 'ne' ? ne : en;

  const navLinks = [
    { href: `/${currentLang}`, label: t.home },
    { href: `/${currentLang}/about`, label: t.aboutUs },
    { href: `/${currentLang}/activities`, label: t.activities },
    { href: `/${currentLang}/relief-support`, label: t.reliefSupport },
    { href: `/${currentLang}/events`, label: t.events },
    { href: `/${currentLang}/membership`, label: t.membership },
    { href: `/${currentLang}/committee`, label: t.committee },
    { href: `/${currentLang}/reports`, label: t.reports },
    { href: `/${currentLang}/gallery`, label: t.gallery },
    { href: `/${currentLang}/partners`, label: t.partners },
    { href: `/${currentLang}/feedback`, label: t.feedback },
  ];

  const switchLang = () => {
    const segments = pathname.split('/');
    segments[1] = otherLang;
    const newPath = segments.join('/') || `/${otherLang}`;
    router.push(newPath);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#01366E] text-white shadow-md">
      {/* Top Banner / Slogan */}
      <div className="bg-[#002447] text-slate-300 text-[11px] py-1 px-4 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            {currentLang === 'ne'
              ? '“मादीदेखि काठमाडौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”'
              : '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration”'}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span>📍</span>
              <span>Kathmandu, Nepal</span>
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5 text-amber-200/90 text-[11px]">
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

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Org Name */}
          <Link href={`/${currentLang}`} className="flex items-center gap-3">
            <img
              src="/media/madi-sss-logo.jpg"
              alt="Madi SSS Logo"
              className="w-11 h-11 rounded-full object-cover bg-white border-2 border-[#FB6C01] shadow-md shrink-0"
            />
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight block leading-tight text-white">
                {currentLang === 'ne'
                  ? 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं'
                  : 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu'}
              </span>
              <span className="text-[10px] text-orange-200 block uppercase tracking-wider font-semibold">
                {currentLang === 'ne' ? 'काठमाडौं, नेपाल' : 'Kathmandu, Nepal'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg transition text-xs font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-slate-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Lang Switch + Admin Portal + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/${currentLang}/admin/login`}
              className="text-xs font-bold bg-[#FB6C01] hover:bg-[#e55a00] text-white px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap"
            >
              {t.adminPortal}
            </Link>

            <button
              onClick={switchLang}
              className="text-xs font-bold border border-white/30 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition"
              title="Switch Language"
            >
              {currentLang === 'ne' ? 'EN' : 'नेपाली'}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#002855] border-t border-white/10 px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-100 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            <Link
              href={`/${currentLang}/admin/login`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center text-xs font-bold bg-[#FB6C01] text-white py-2 rounded-lg"
            >
              {t.adminPortal}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
