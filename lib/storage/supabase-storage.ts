// Madi Sankhuwasabha Sarokar Samaj (Kathmandu)
// Supabase Storage & Media Asset Service

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  VIDEO: ['video/mp4', 'video/webm'],
};

const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024,      // 5 MB
  DOCUMENT: 25 * 1024 * 1024,  // 25 MB
  VIDEO: 50 * 1024 * 1024,     // 50 MB
};

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
  category?: 'IMAGE' | 'DOCUMENT' | 'VIDEO';
}

/**
 * Sanitizes a filename, stripping path traversal characters, spaces, and dangerous extensions.
 */
export function sanitizeFilename(filename: string): string {
  const parts = filename.split('.');
  const ext = (parts.pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const base = parts.join('_').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  const timestamp = Date.now();
  return `${base}_${timestamp}.${ext}`;
}

/**
 * Validates uploaded file MIME type, size, and category.
 */
export function validateUploadFile(file: { name: string; size: number; type: string }): UploadValidationResult {
  let category: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null = null;

  if (ALLOWED_MIME_TYPES.IMAGE.includes(file.type)) {
    category = 'IMAGE';
  } else if (ALLOWED_MIME_TYPES.DOCUMENT.includes(file.type)) {
    category = 'DOCUMENT';
  } else if (ALLOWED_MIME_TYPES.VIDEO.includes(file.type)) {
    category = 'VIDEO';
  }

  if (!category) {
    return {
      valid: false,
      error: `अनुमति नभएको फाइल प्रकार (${file.type})। कृपया JPG, PNG, WEBP, PDF वा MP4 मात्र अपलोड गर्नुहोस्।`,
    };
  }

  const maxSize = MAX_FILE_SIZES[category];
  if (file.size > maxSize) {
    const mbLimit = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `फाइल साइज धेरै ठूलो भयो। अधिकतम सीमा ${mbLimit} MB हो।`,
    };
  }

  return {
    valid: true,
    sanitizedFilename: sanitizeFilename(file.name),
    category,
  };
}

/**
 * Validates YouTube / Vimeo video embed URLs.
 */
export function validateVideoEmbedUrl(url: string): { valid: boolean; embedUrl?: string; error?: string } {
  if (!url) return { valid: false, error: 'URL आवश्यक छ।' };

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      valid: true,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  // Vimeo match
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      valid: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return {
    valid: false,
    error: 'मान्य YouTube वा Vimeo लिङ्क प्रदान गर्नुहोस्।',
  };
}

/**
 * Checks if a media asset URL is currently referenced by any CMS module.
 */
export function checkMediaReferences(
  mediaUrl: string,
  existingContent: {
    activities: { photos?: string[] }[];
    relief: { photos?: string[]; reportAttachmentUrl?: string }[];
    events: { featuredImage?: string }[];
    committee: { photoUrl?: string }[];
    reports: { fileUrl?: string }[];
    banners: { imageDesktopUrl?: string; imageMobileUrl?: string }[];
  }
): { isReferenced: boolean; referencedIn: string[] } {
  const referencedIn: string[] = [];

  for (const act of existingContent.activities) {
    if (act.photos?.includes(mediaUrl)) referencedIn.push('Social Activities');
  }
  for (const rel of existingContent.relief) {
    if (rel.photos?.includes(mediaUrl) || rel.reportAttachmentUrl === mediaUrl) referencedIn.push('Relief Programs');
  }
  for (const evt of existingContent.events) {
    if (evt.featuredImage === mediaUrl) referencedIn.push('Events');
  }
  for (const com of existingContent.committee) {
    if (com.photoUrl === mediaUrl) referencedIn.push('Committee Directory');
  }
  for (const rep of existingContent.reports) {
    if (rep.fileUrl === mediaUrl) referencedIn.push('Governance Reports');
  }
  for (const ban of existingContent.banners) {
    if (ban.imageDesktopUrl === mediaUrl || ban.imageMobileUrl === mediaUrl) referencedIn.push('Site Banners');
  }

  return {
    isReferenced: referencedIn.length > 0,
    referencedIn: Array.from(new Set(referencedIn)),
  };
}

/**
 * Constructs the canonical public Supabase Storage URL for official documents.
 */
export function getOfficialDocumentStorageUrl(subPath: string, bucket = 'official-documents'): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypcrfeufdghpxhhjexja.supabase.co';
  const cleanPath = subPath.startsWith('/') ? subPath.slice(1) : subPath;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
