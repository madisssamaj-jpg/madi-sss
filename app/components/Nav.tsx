"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import en from "../../public/locales/en/common.json";
import ne from "../../public/locales/ne/common.json";

interface NavItem {
  key: string;
  ne: string;
  en: string;
}

const navItems: NavItem[] = [
  { key: 'home', ne: ne.home, en: en.home },
  { key: 'about-us', ne: ne.aboutUs, en: en.aboutUs },
  { key: 'membership', ne: ne.membership, en: en.membership },
  { key: 'events', ne: ne.events, en: en.events },
  { key: 'social-support', ne: ne.socialSupport, en: en.socialSupport },
  { key: 'condolences', ne: ne.condolences, en: en.condolences },
  { key: 'digital-deusi-bhailo', ne: ne.digitalDeusiBhailo, en: en.digitalDeusiBhailo },
  { key: 'financial-transparency', ne: ne.financialTransparency, en: en.financialTransparency },
  { key: 'reports', ne: ne.reports, en: en.reports },
  { key: 'contact', ne: ne.contact, en: en.contact },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine current language from first path segment
  const currentLang = pathname?.split('/')[1] || 'ne';
  const otherLang = currentLang === 'ne' ? 'en' : 'ne';

  const switchLang = () => {
    const segments = pathname.split('/');
    segments[1] = otherLang;
    const newPath = segments.join('/') || `/${otherLang}`;
    router.push(newPath);
  };

  return (
    <nav className="bg-gray-100 p-4 flex flex-wrap items-center gap-4">
      {navItems.map((item) => (
        <Link
          key={item.key}
          href={`/${currentLang}/${item.key}`}
          className="text-sm font-medium hover:underline"
        >
          {currentLang === 'ne' ? item.ne : item.en}
        </Link>
      ))}
      <button
        onClick={switchLang}
        className="ml-auto text-sm font-semibold"
      >
        {currentLang === 'ne' ? 'English' : 'नेपाली'}
      </button>
    </nav>
  );
}

