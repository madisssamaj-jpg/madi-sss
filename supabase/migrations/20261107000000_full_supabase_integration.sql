-- ==============================================================================
-- Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu
-- Migration: 20261107000000_full_supabase_integration.sql
-- Complete Supabase Integration: Safe Table Creation, Indexes, RLS & Seed Data
-- ==============================================================================

-- 1. DIGITAL DEUSI-BHAILO DONATIONS & BLESSINGS
CREATE TABLE IF NOT EXISTS public.digital_deusi_bhailo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contributor_name_ne TEXT NOT NULL,
    contributor_name_en TEXT,
    madi_ward INT CHECK (madi_ward BETWEEN 1 AND 9),
    amount_npr NUMERIC(10, 2) NOT NULL CHECK (amount_npr > 0.00),
    blessing_message_ne TEXT,
    blessing_message_en TEXT,
    payment_method TEXT NOT NULL DEFAULT 'QR_CODE' CHECK (payment_method IN ('QR_CODE', 'FONEPAY', 'BANK_TRANSFER', 'CASH')),
    payment_reference TEXT,
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    is_public BOOLEAN NOT NULL DEFAULT true,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_deusi_public ON public.digital_deusi_bhailo (is_public, payment_status);
CREATE INDEX IF NOT EXISTS idx_deusi_created_at ON public.digital_deusi_bhailo (created_at DESC);

-- 2. SOCIAL & EMERGENCY SUPPORT REQUESTS
CREATE TABLE IF NOT EXISTS public.social_support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_name_ne TEXT NOT NULL,
    applicant_name_en TEXT,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    madi_ward INT CHECK (madi_ward BETWEEN 1 AND 9),
    current_location TEXT NOT NULL,
    support_category TEXT NOT NULL CHECK (support_category IN ('MEDICAL_AID', 'DISASTER_RELIEF', 'EDUCATION_AID', 'WELFARE_GENERAL')),
    description_ne TEXT NOT NULL,
    supporting_document_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED')),
    approved_amount_npr NUMERIC(10, 2) DEFAULT 0.00,
    admin_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_support_status ON public.social_support_requests (status);
CREATE INDEX IF NOT EXISTS idx_support_category ON public.social_support_requests (support_category);

-- 3. CONTACT & GRIEVANCE MESSAGES (ALIAS TABLE / ENHANCED)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('SUGGESTION', 'COMPLAINT', 'RELIEF_REQUEST', 'INQUIRY')),
    message TEXT NOT NULL,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_messages (status);

-- 4. ORGANIZATION PROFILE (ABOUT US STATUTORY & LEADERSHIP DATA)
CREATE TABLE IF NOT EXISTS public.organization_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    org_name_ne TEXT NOT NULL,
    org_name_en TEXT NOT NULL,
    slogan_ne TEXT NOT NULL,
    slogan_en TEXT NOT NULL,
    registration_dao TEXT,
    registration_no TEXT,
    registration_date_bs TEXT,
    office_address_ne TEXT NOT NULL,
    office_address_en TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    logo_url TEXT,
    established_bs TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.digital_deusi_bhailo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6. SAFE RLS POLICIES

-- A. Digital Deusi-Bhailo
DROP POLICY IF EXISTS "Public can view verified public deusi contributions" ON public.digital_deusi_bhailo;
CREATE POLICY "Public can view verified public deusi contributions" ON public.digital_deusi_bhailo
    FOR SELECT TO public
    USING (is_public = true AND payment_status = 'VERIFIED');

DROP POLICY IF EXISTS "Public can submit deusi contributions" ON public.digital_deusi_bhailo;
CREATE POLICY "Public can submit deusi contributions" ON public.digital_deusi_bhailo
    FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on deusi" ON public.digital_deusi_bhailo;
CREATE POLICY "Service role full access on deusi" ON public.digital_deusi_bhailo
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- B. Social Support Requests
DROP POLICY IF EXISTS "Public can submit support requests" ON public.social_support_requests;
CREATE POLICY "Public can submit support requests" ON public.social_support_requests
    FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on support requests" ON public.social_support_requests;
CREATE POLICY "Service role full access on support requests" ON public.social_support_requests
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- C. Contact Messages
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" ON public.contact_messages
    FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on contact messages" ON public.contact_messages;
CREATE POLICY "Service role full access on contact messages" ON public.contact_messages
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- D. Organization Profile
DROP POLICY IF EXISTS "Public can view organization profile" ON public.organization_profile;
CREATE POLICY "Public can view organization profile" ON public.organization_profile
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Service role full access on organization profile" ON public.organization_profile;
CREATE POLICY "Service role full access on organization profile" ON public.organization_profile
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- E. Events & Programs
DROP POLICY IF EXISTS "Public can view published events" ON public.events_programs;
CREATE POLICY "Public can view published events" ON public.events_programs
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Service role full access on events" ON public.events_programs;
CREATE POLICY "Service role full access on events" ON public.events_programs
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- F. Membership Applications
DROP POLICY IF EXISTS "Public can submit membership applications" ON public.membership_applications;
CREATE POLICY "Public can submit membership applications" ON public.membership_applications
    FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on membership applications" ON public.membership_applications;
CREATE POLICY "Service role full access on membership applications" ON public.membership_applications
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- G. Financial Transparency
DROP POLICY IF EXISTS "Public can view active financial accounts summary" ON public.financial_accounts;
CREATE POLICY "Public can view active financial accounts summary" ON public.financial_accounts
    FOR SELECT TO public
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access on financial accounts" ON public.financial_accounts;
CREATE POLICY "Service role full access on financial accounts" ON public.financial_accounts
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view financial transactions" ON public.financial_transactions;
CREATE POLICY "Public can view financial transactions" ON public.financial_transactions
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Service role full access on financial transactions" ON public.financial_transactions;
CREATE POLICY "Service role full access on financial transactions" ON public.financial_transactions
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- H. Reports & Governance Documents
DROP POLICY IF EXISTS "Public can view approved public reports" ON public.governance_reports;
CREATE POLICY "Public can view approved public reports" ON public.governance_reports
    FOR SELECT TO public
    USING (is_public = true AND status = 'PUBLISHED');

DROP POLICY IF EXISTS "Service role full access on reports" ON public.governance_reports;
CREATE POLICY "Service role full access on reports" ON public.governance_reports
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- I. Notices & Announcements
DROP POLICY IF EXISTS "Public can view notices" ON public.notices_announcements;
CREATE POLICY "Public can view notices" ON public.notices_announcements
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Service role full access on notices" ON public.notices_announcements;
CREATE POLICY "Service role full access on notices" ON public.notices_announcements
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- J. Gallery & Media
DROP POLICY IF EXISTS "Public can view gallery albums" ON public.gallery_albums;
CREATE POLICY "Public can view gallery albums" ON public.gallery_albums
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Public can view media items" ON public.media_items;
CREATE POLICY "Public can view media items" ON public.media_items
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Service role full access on gallery" ON public.gallery_albums;
CREATE POLICY "Service role full access on gallery" ON public.gallery_albums
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on media items" ON public.media_items;
CREATE POLICY "Service role full access on media items" ON public.media_items
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- K. Site Settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Service role full access on site settings" ON public.site_settings;
CREATE POLICY "Service role full access on site settings" ON public.site_settings
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- L. Admin Users
DROP POLICY IF EXISTS "Service role full access on admin users" ON public.admin_users;
CREATE POLICY "Service role full access on admin users" ON public.admin_users
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
