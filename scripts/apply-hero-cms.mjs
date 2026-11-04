import fs from 'fs';

const cmsPath = 'lib/cms/cms-service.ts';
let code = fs.readFileSync(cmsPath, 'utf8');

const incomingEntries = fs.readFileSync('scripts/incoming-entries.txt', 'utf8');

// Target is lines 1493-1495:
//   },
// ];
//
// export async function getGalleryAlbums

const target = `  {
    id: 'med-003',
    albumId: 'alb-002',
    titleNe: 'रैथाने सांस्कृतिक झाँकी नृत्य',
    titleEn: 'Traditional Folklore Dance',
    mediaType: 'IMAGE',
    fileUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 3100000,
    mimeType: 'image/jpeg',
    altTextNe: 'सांस्कृतिक झाँकी नृत्य प्रस्तुति',
    altTextEn: 'Cultural folk performance',
    isFeatured: true,
    displayOrder: 1,
    createdAt: '2026-02-25T14:00:00Z',
  },
];`;

const replacement = `  {
    id: 'med-003',
    albumId: 'alb-002',
    titleNe: 'रैथाने सांस्कृतिक झाँकी नृत्य',
    titleEn: 'Traditional Folklore Dance',
    mediaType: 'IMAGE',
    fileUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 3100000,
    mimeType: 'image/jpeg',
    altTextNe: 'सांस्कृतिक झाँकी नृत्य प्रस्तुति',
    altTextEn: 'Cultural folk performance',
    isFeatured: true,
    displayOrder: 1,
    createdAt: '2026-02-25T14:00:00Z',
  },
  // --- Incoming Real Madi SSS Photos (Quarantined as Draft/Pending Review) ---
${incomingEntries}
];`;

if (!code.includes(target)) {
  console.error('Target not found for mediaItemsStore');
  process.exit(1);
}

code = code.replace(target, replacement);

// Now update getMediaItems signature and filtering:
const getMediaItemsTarget = `export async function getMediaItems(albumId?: string, type?: string): Promise<MediaItem[]> {
  let list = [...mediaItemsStore];
  if (albumId) list = list.filter((m) => m.albumId === albumId);
  if (type && type !== 'ALL') list = list.filter((m) => m.mediaType === type);
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}`;

const getMediaItemsReplacement = `export async function getMediaItems(albumId?: string, type?: string, includePrivate = true): Promise<MediaItem[]> {
  let list = [...mediaItemsStore];
  if (!includePrivate) {
    list = list.filter((m) => m.isPublic !== false && m.status !== 'DRAFT' && m.status !== 'PENDING_REVIEW');
  }
  if (albumId) list = list.filter((m) => m.albumId === albumId);
  if (type && type !== 'ALL') list = list.filter((m) => m.mediaType === type);
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}`;

if (!code.includes(getMediaItemsTarget)) {
  console.error('Target not found for getMediaItems');
  process.exit(1);
}

code = code.replace(getMediaItemsTarget, getMediaItemsReplacement);

// Now add Homepage Hero store and functions right after deleteMediaItem:
const deleteMediaItemTarget = `export async function deleteMediaItem(id: string): Promise<boolean> {
  mediaItemsStore = mediaItemsStore.filter((m) => m.id !== id);
  return true;
}`;

const heroFunctionsBlock = `export async function deleteMediaItem(id: string): Promise<boolean> {
  mediaItemsStore = mediaItemsStore.filter((m) => m.id !== id);
  return true;
}

// 11B. Homepage Hero Image Management
let homepageHeroStore: HomepageHeroConfig | null = {
  id: 'hero-current',
  mediaItemId: 'med-inc-002',
  imageUrl: 'https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Chauki.jpg',
  mobileImageUrl: '/media/incoming/Chauki-mobile.webp',
  tabletImageUrl: '/media/incoming/Chauki-tablet.webp',
  desktopImageUrl: '/media/incoming/Chauki-desktop.webp',
  altTextNe: 'मादी संखुवासभाको प्राकृतिक सौन्दर्य तथा चौकि बजार',
  altTextEn: 'Scenic landscape of Chauki, Madi, Sankhuwasabha',
  headingNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
  headingEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
  subheadingNe: '“मादीदेखि काठमाडौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”',
  subheadingEn: '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration”',
  ctaLabelNe: 'अनलाइन सदस्यता आवेदन',
  ctaLabelEn: 'Apply for Membership',
  ctaLink: '/membership',
  status: 'DRAFT', // Invariant: Default to DRAFT. Must not appear publicly until Superadmin publishes.
  updatedAt: '2026-11-03T14:45:00Z',
};

let homepageHeroHistoryStore: HomepageHeroConfig[] = [];

export async function getHomepageHero(includeDraft = false): Promise<HomepageHeroConfig | null> {
  if (!homepageHeroStore) return null;
  if (!includeDraft && homepageHeroStore.status !== 'PUBLISHED') {
    return null;
  }
  return homepageHeroStore;
}

export async function getHeroHistory(): Promise<HomepageHeroConfig[]> {
  return [...homepageHeroHistoryStore];
}

export async function saveHomepageHero(
  data: Partial<HomepageHeroConfig>,
  adminId: string,
  adminName: string
): Promise<HomepageHeroConfig> {
  // If replacing an existing hero with a new image, archive the previous one
  if (homepageHeroStore && data.imageUrl && data.imageUrl !== homepageHeroStore.imageUrl) {
    homepageHeroHistoryStore.unshift({ ...homepageHeroStore, status: 'DRAFT' });
  }

  const updated: HomepageHeroConfig = {
    id: homepageHeroStore?.id || \`hero-\${Date.now()}\`,
    mediaItemId: data.mediaItemId ?? homepageHeroStore?.mediaItemId,
    imageUrl: data.imageUrl || homepageHeroStore?.imageUrl || '/media/incoming/Chauki.jpg',
    mobileImageUrl: data.mobileImageUrl ?? homepageHeroStore?.mobileImageUrl,
    tabletImageUrl: data.tabletImageUrl ?? homepageHeroStore?.tabletImageUrl,
    desktopImageUrl: data.desktopImageUrl ?? homepageHeroStore?.desktopImageUrl,
    altTextNe: data.altTextNe || homepageHeroStore?.altTextNe || 'Madi SSS photo — pending review',
    altTextEn: data.altTextEn || homepageHeroStore?.altTextEn || 'Madi SSS photo — pending review',
    headingNe: data.headingNe ?? homepageHeroStore?.headingNe,
    headingEn: data.headingEn ?? homepageHeroStore?.headingEn,
    subheadingNe: data.subheadingNe ?? homepageHeroStore?.subheadingNe,
    subheadingEn: data.subheadingEn ?? homepageHeroStore?.subheadingEn,
    ctaLabelNe: data.ctaLabelNe ?? homepageHeroStore?.ctaLabelNe,
    ctaLabelEn: data.ctaLabelEn ?? homepageHeroStore?.ctaLabelEn,
    ctaLink: data.ctaLink ?? homepageHeroStore?.ctaLink,
    status: data.status || homepageHeroStore?.status || 'DRAFT',
    publishedAt: data.status === 'PUBLISHED' ? (homepageHeroStore?.publishedAt || new Date().toISOString()) : undefined,
    updatedAt: new Date().toISOString(),
    selectedByAdminId: adminId,
    selectedByAdminName: adminName,
    adminNotes: data.adminNotes ?? homepageHeroStore?.adminNotes,
  };

  homepageHeroStore = updated;
  return updated;
}

export async function publishHomepageHero(adminId: string, adminName: string): Promise<HomepageHeroConfig | null> {
  if (!homepageHeroStore) return null;
  homepageHeroStore = {
    ...homepageHeroStore,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selectedByAdminId: adminId,
    selectedByAdminName: adminName,
  };
  return homepageHeroStore;
}

export async function unpublishHomepageHero(adminId: string, adminName: string): Promise<HomepageHeroConfig | null> {
  if (!homepageHeroStore) return null;
  homepageHeroStore = {
    ...homepageHeroStore,
    status: 'DRAFT',
    updatedAt: new Date().toISOString(),
    selectedByAdminId: adminId,
    selectedByAdminName: adminName,
  };
  return homepageHeroStore;
}

export async function replaceHomepageHero(
  newHeroData: Partial<HomepageHeroConfig>,
  adminId: string,
  adminName: string
): Promise<HomepageHeroConfig> {
  if (homepageHeroStore) {
    homepageHeroHistoryStore.unshift({ ...homepageHeroStore, status: 'DRAFT' });
  }
  return saveHomepageHero(newHeroData, adminId, adminName);
}`;

if (!code.includes(deleteMediaItemTarget)) {
  console.error('Target not found for deleteMediaItem');
  process.exit(1);
}

code = code.replace(deleteMediaItemTarget, heroFunctionsBlock);

fs.writeFileSync(cmsPath, code, 'utf8');
console.log('Successfully updated lib/cms/cms-service.ts!');

