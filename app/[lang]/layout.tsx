import type { Metadata } from 'next';
import '../globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSiteSettings } from '@/lib/cms/cms-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://madisss.org.np';

  const title = lang === 'ne' ? settings.defaultMetaTitleNe : settings.defaultMetaTitleEn;
  const description = lang === 'ne' ? settings.defaultMetaDescNe : settings.defaultMetaDescEn;

  return {
    title: {
      default: title,
      template: `%s | ${lang === 'ne' ? 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं' : 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu'}`,
    },
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: {
        ne: `${baseUrl}/ne`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${lang}`,
      siteName: lang === 'ne' ? settings.orgNameNe : settings.orgNameEn,
      images: [
        {
          url: settings.ogImageUrl,
          width: 1200,
          height: 630,
          alt: lang === 'ne' ? settings.orgNameNe : settings.orgNameEn,
        },
      ],
      locale: lang === 'ne' ? 'ne_NP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [settings.ogImageUrl],
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://madisss.org.np';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: lang === 'ne' ? settings.orgNameNe : settings.orgNameEn,
    url: `${baseUrl}/${lang}`,
    logo: `${baseUrl}/logo.png`,
    slogan: lang === 'ne' ? settings.sloganNe : settings.sloganEn,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kathmandu',
      addressCountry: 'NP',
      streetAddress: settings.officeAddressNe,
    },
    ...(settings.contactEmail || settings.contactPhone ? {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: settings.contactPhone || undefined,
        email: settings.contactEmail || undefined,
        contactType: 'Secretariat Desk',
      },
    } : {}),
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
