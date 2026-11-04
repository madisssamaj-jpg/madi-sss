-- ============================================================================
-- MADI SSS — MEDIA, BANNERS, GALLERY, SITE SETTINGS & AUDIT LOGS MIGRATION
-- Migration: 20261103000002_media_banners_gallery_settings.sql
-- ============================================================================

-- 1. SITE BANNERS & HERO CAROUSEL
CREATE TABLE IF NOT EXISTS public.site_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_ne TEXT,
    subtitle_en TEXT,
    image_desktop_url TEXT NOT NULL,
    image_mobile_url TEXT,
    video_url TEXT,
    link_url TEXT,
    button_text_ne TEXT,
    button_text_en TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. GALLERY ALBUMS
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ne TEXT,
    description_en TEXT,
    cover_photo_url TEXT NOT NULL,
    event_date TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'COMMUNITY' CHECK (category IN ('HEALTH', 'CULTURAL', 'RELIEF', 'COMMUNITY', 'GENERAL')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. MEDIA LIBRARY ITEMS (Photos, Videos, Documents)
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL,
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO', 'DOCUMENT')),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
    alt_text_ne TEXT,
    alt_text_en TEXT,
    caption_ne TEXT,
    caption_en TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. SITE SETTINGS & SEO CONFIGURATION
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_by UUID
);

-- 5. CMS AUDIT ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.cms_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_site_banners_active ON public.site_banners (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_slug ON public.gallery_albums (slug);
CREATE INDEX IF NOT EXISTS idx_media_items_album ON public.media_items (album_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items (media_type);
CREATE INDEX IF NOT EXISTS idx_cms_activity_logs_created ON public.cms_activity_logs (created_at DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_activity_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read active banners" ON public.site_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read gallery albums" ON public.gallery_albums FOR SELECT USING (true);
CREATE POLICY "Public read media items" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);

-- Admin-only Activity Logs (No Public Access)
CREATE POLICY "No public read activity logs" ON public.cms_activity_logs FOR SELECT USING (false);

