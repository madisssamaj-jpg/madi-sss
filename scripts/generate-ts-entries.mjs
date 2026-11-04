import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('public/media/incoming/manifest.json', 'utf8'));

const lines = manifest.map((item, idx) => {
  return `  {
    id: 'med-inc-${String(idx + 1).padStart(3, '0')}',
    titleNe: ${JSON.stringify(item.filename)},
    titleEn: ${JSON.stringify(item.filename)},
    originalFilename: ${JSON.stringify(item.filename)},
    mediaType: 'IMAGE',
    fileUrl: ${JSON.stringify(item.storageUrl)},
    thumbnailUrl: ${JSON.stringify(item.responsiveUrls.mobile)},
    fileSizeBytes: ${item.sizeBytes},
    mimeType: ${JSON.stringify(item.mimeType)},
    dimensions: { width: ${item.width}, height: ${item.height} },
    responsiveUrls: {
      mobile: ${JSON.stringify(item.responsiveUrls.mobile)},
      tablet: ${JSON.stringify(item.responsiveUrls.tablet)},
      desktop: ${JSON.stringify(item.responsiveUrls.desktop)},
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'PENDING_REVIEW',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    displayOrder: ${100 + idx + 1},
    createdAt: '2026-11-03T14:45:00Z',
  },`;
});

fs.writeFileSync('scripts/incoming-entries.txt', lines.join('\n'), 'utf8');
console.log('Generated successfully.');

