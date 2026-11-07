import type { Metadata } from 'next';
import '../globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSiteSettings } from '@/lib/cms/cms-service';
import { SITE_URL, ORG_NAME_NE, ORG_NAME_EN, DEFAULT_OG_IMAGE, ORG_LOGO_URL } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const settings = await getSiteSettings();

  const title = lang === 'ne' ? settings.defaultMetaTitleNe : settings.defaultMetaTitleEn;
  const description = lang === 'ne' ? settings.defaultMetaDescNe : settings.defaultMetaDescEn;

  return {
    title: {
      default: title,
      template: `%s | ${lang === 'ne' ? ORG_NAME_NE : ORG_NAME_EN}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        ne: `${SITE_URL}/ne`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/ne`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}`,
      siteName: lang === 'ne' ? ORG_NAME_NE : ORG_NAME_EN,
      images: [
        {
          url: settings.ogImageUrl ? `${SITE_URL}${settings.ogImageUrl}` : DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: lang === 'ne' ? ORG_NAME_NE : ORG_NAME_EN,
        },
      ],
      locale: lang === 'ne' ? 'ne_NP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [settings.ogImageUrl ? `${SITE_URL}${settings.ogImageUrl}` : DEFAULT_OG_IMAGE],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const settings = await getSiteSettings();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'NGO'],
    name: lang === 'ne' ? ORG_NAME_NE : ORG_NAME_EN,
    alternateName: ['मादी सरोकार समाज', 'Madi Sarokar Samaj', 'Madi SSS'],
    url: `${SITE_URL}/${lang}`,
    logo: ORG_LOGO_URL,
    image: DEFAULT_OG_IMAGE,
    description: lang === 'ne' ? settings.defaultMetaDescNe : settings.defaultMetaDescEn,
    email: settings.contactEmail || 'madisssamaj@gmail.com',
    foundingDate: '2019',
    identifier: settings.daoRegistrationNumber ? `दर्ता नं. ${settings.daoRegistrationNumber}` : 'दर्ता नं. १६',
    legalName: lang === 'ne' ? ORG_NAME_NE : ORG_NAME_EN,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.officeAddressNe || 'काठमाण्डौं महानगरपालिका वडा नं. ४, सुकेधारा',
      addressLocality: 'काठमाण्डौं (Kathmandu)',
      addressRegion: 'बागमती प्रदेश (Bagmati Province)',
      postalCode: '44600',
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '27.7314',
      longitude: '85.3448',
    },
    sameAs: [
      settings.facebookUrl || 'https://facebook.com/madisss',
      settings.youtubeUrl || 'https://youtube.com/@madisss',
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.contactPhone || '+977-9851000000',
      email: settings.contactEmail || 'madisssamaj@gmail.com',
      contactType: 'Secretariat Desk',
      areaServed: 'NP',
      availableLanguage: ['Nepali', 'English'],
    },
  };

  return (
    <html lang={lang} className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-slate-50">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
