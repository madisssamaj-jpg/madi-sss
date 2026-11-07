import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.madisss.org.np';

export const ORG_NAME_NE = 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं';
export const ORG_NAME_EN = 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/media/incoming/Chauki.jpg`;
export const ORG_LOGO_URL = `${SITE_URL}/media/madi-sss-logo.jpg`;

export interface PageMetadataConfig {
  titleNe: string;
  titleEn: string;
  descriptionNe: string;
  descriptionEn: string;
  path: string; // e.g. '/about', '/membership'
  image?: string;
}

export const PAGE_SEO: Record<string, PageMetadataConfig> = {
  home: {
    titleNe: 'मादी (संखुवासभा) सरोकार समाज | काठमाण्डौं',
    titleEn: 'Madi (Sankhuwasabha) Sarokar Samaj | Kathmandu',
    descriptionNe: 'मादी (संखुवासभा) सरोकार समाजको आधिकारिक वेबसाइट। काठमाण्डौं उपत्यकामा रहनुभएका सम्पूर्ण मादीवासीहरूको एकता, सद्भाव, राहत कोष, सामाजिक गतिविधि र सेवाको साझा मञ्च।',
    descriptionEn: 'Official website of Madi (Sankhuwasabha) Sarokar Samaj. A unified community platform in Kathmandu for unity, relief support, and social welfare.',
    path: '',
  },
  about: {
    titleNe: 'हाम्रो बारेमा (परिचय तथा विधान) | मादी (संखुवासभा) सरोकार समाज',
    titleEn: 'About Us (History & Bylaws) | Madi Sarokar Samaj',
    descriptionNe: 'मादी (संखुवासभा) सरोकार समाजको स्थापना, इतिहास, उद्देश्य, जिल्ला प्रशासन कार्यालय काठमाण्डौं दर्ता विवरण (दर्ता नं. १६) र वैधानिक आधारहरू।',
    descriptionEn: 'Learn about the establishment, history, objectives, statutory DAO registration (Reg. No. 16), and bylaws of Madi Sarokar Samaj.',
    path: '/about',
  },
  activities: {
    titleNe: 'सामाजिक गतिविधि तथा अभियानहरू | मादी सरोकार समाज',
    titleEn: 'Social Activities & Community Initiatives | Madi Sarokar Samaj',
    descriptionNe: 'मादी सरोकार समाजद्वारा सञ्चालित विभिन्न सामाजिक गतिविधिहरू, स्वास्थ्य सहयोग, विपद् व्यवस्थापन र सामुदायिक विकासका अभियानहरू।',
    descriptionEn: 'Explore community initiatives, disaster relief, health support, and social welfare programs conducted by Madi Sarokar Samaj.',
    path: '/activities',
  },
  reliefSupport: {
    titleNe: 'राहत तथा कल्याणकारी कोष | मादी सरोकार समाज',
    titleEn: 'Relief & Community Welfare Fund | Madi Sarokar Samaj',
    descriptionNe: 'मादी राहत तथा कल्याणकारी कोष: विपद् व्यवस्थापन, आकस्मिक चिकित्सा उपचार र विद्यालय शैक्षिक पूर्वाधार सहयोगसम्बन्धी पारदर्शी विवरण।',
    descriptionEn: 'Madi Relief and Welfare Fund: transparent records for disaster relief, medical support, and school infrastructure improvements.',
    path: '/relief-support',
  },
  events: {
    titleNe: 'कार्यक्रमहरू तथा सामुदायिक भेला | मादी सरोकार समाज',
    titleEn: 'Events & Community Gatherings | Madi Sarokar Samaj',
    descriptionNe: 'मादी सरोकार समाजका आगामी तथा सम्पन्न कार्यक्रमहरू, वार्षिक साधारण सभा, भेटघाट तथा सामुदायिक कार्यक्रम तालिका।',
    descriptionEn: 'Upcoming and past events, annual general assemblies, community gatherings, and event calendar of Madi Sarokar Samaj.',
    path: '/events',
  },
  membership: {
    titleNe: 'सदस्यता आवेदन (अनलाइन फारम) | मादी सरोकार समाज',
    titleEn: 'Apply for Membership (Online Form) | Madi Sarokar Samaj',
    descriptionNe: 'मादी (संखुवासभा) सरोकार समाजको साधारण तथा आजीवन सदस्यताका लागि अनलाइन आवेदन दिनुहोस्। काठमाण्डौंमा मादीवासीहरूको एकतामा जोडिनुहोस्।',
    descriptionEn: 'Apply online for general and life membership of Madi (Sankhuwasabha) Sarokar Samaj. Join the community network in Kathmandu.',
    path: '/membership',
  },
  committee: {
    titleNe: 'कार्यसमिति विवरण (नेतृत्व तथा सल्लाहकार) | मादी सरोकार समाज',
    titleEn: 'Executive Committee & Leadership | Madi Sarokar Samaj',
    descriptionNe: 'मादी (संखुवासभा) सरोकार समाजको निर्वाचित कार्यसमिति, पदाधिकारीहरू, सदस्यहरू तथा सल्लाहकार मण्डलको आधिकारिक नामावली।',
    descriptionEn: 'Official directory of the Executive Committee, office bearers, board members, and advisory council of Madi Sarokar Samaj.',
    path: '/committee',
  },
  reports: {
    titleNe: 'आधिकारिक प्रतिवेदनहरू, विधान तथा अडिट | मादी सरोकार समाज',
    titleEn: 'Official Reports, Constitution & Audits | Madi Sarokar Samaj',
    descriptionNe: 'मादी सरोकार समाजको दर्ता प्रमाणपत्र, आधिकारिक विधान (संविधान), लेखापरीक्षण प्रतिवेदन तथा वार्षिक प्रगति विवरणहरू।',
    descriptionEn: 'Access verified statutory reports, approved constitution, registration certificate, and annual audited financial statements.',
    path: '/reports',
  },
  gallery: {
    titleNe: 'तस्बिर तथा भिडियो सँगालो (ग्यालरी) | मादी सरोकार समाज',
    titleEn: 'Photo & Video Gallery | Madi Sarokar Samaj',
    descriptionNe: 'मादी नगरपालिका र काठमाण्डौंमा सम्पन्न सामाजिक कार्यक्रम, सांस्कृतिक भेटघाट र सामुदायिक अभियानका ऐतिहासिक तस्बिरहरू।',
    descriptionEn: 'Glimpses and photo albums of community events, cultural gatherings, and welfare campaigns organized by Madi Sarokar Samaj.',
    path: '/gallery',
  },
  partners: {
    titleNe: 'शुभचिन्तक तथा संस्थागत साझेदारहरू | मादी सरोकार समाज',
    titleEn: 'Institutional Partners & Allies | Madi Sarokar Samaj',
    descriptionNe: 'मादी नगरपालिका नगर कार्यपालिकाको कार्यालय तथा अन्य विकास साझेदारहरूसँगको सहकार्य र संस्थागत सम्बन्ध।',
    descriptionEn: 'Collaboration with Madi Municipality and recognized institutional partners for local welfare and community initiatives.',
    path: '/partners',
  },
  feedback: {
    titleNe: 'सुझाव, गुनासो तथा सम्पर्क सचिवालय | मादी सरोकार समाज',
    titleEn: 'Feedback, Inquiries & Secretariat Contact | Madi Sarokar Samaj',
    descriptionNe: 'मादी (संखुवासभा) सरोकार समाजको सचिवालय सुकेधारा, काठमाण्डौंमा सम्पर्क गर्नुहोस् वा अनलाइन सुझाव तथा गुनासो दर्ता गर्नुहोस्।',
    descriptionEn: 'Contact the secretariat at Sukedhara, Kathmandu or submit suggestions, feedback, and inquiries directly to the team.',
    path: '/feedback',
  },
};

export function constructPageMetadata(
  config: PageMetadataConfig,
  lang: string,
  overrides?: {
    dynamicTitle?: string;
    dynamicDesc?: string;
    dynamicPath?: string;
    dynamicImage?: string;
  }
): Metadata {
  const isNe = lang === 'ne';
  const rawTitle = overrides?.dynamicTitle || (isNe ? config.titleNe : config.titleEn);
  const description = overrides?.dynamicDesc || (isNe ? config.descriptionNe : config.descriptionEn);
  const path = overrides?.dynamicPath || config.path;
  const canonicalUrl = `${SITE_URL}/${lang}${path}`;
  const neAlternateUrl = `${SITE_URL}/ne${path}`;
  const enAlternateUrl = `${SITE_URL}/en${path}`;
  const ogImage = overrides?.dynamicImage || config.image || DEFAULT_OG_IMAGE;

  return {
    title: rawTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ne': neAlternateUrl,
        'en': enAlternateUrl,
        'x-default': `${SITE_URL}/ne${path}`,
      },
    },
    openGraph: {
      title: rawTitle,
      description,
      url: canonicalUrl,
      siteName: isNe ? ORG_NAME_NE : ORG_NAME_EN,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: rawTitle,
        },
      ],
      locale: isNe ? 'ne_NP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: rawTitle,
      description,
      images: [ogImage],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

