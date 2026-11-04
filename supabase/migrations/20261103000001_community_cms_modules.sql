-- ============================================================================
-- MADI SSS — COMMUNITY & CMS MODULES MIGRATION
-- Social Activities, Relief & Welfare, Events, Membership, Committee,
-- Transparency Reports, Suggestions/Feedback, and Partners
-- ============================================================================

-- 1. SOCIAL ACTIVITIES
CREATE TABLE IF NOT EXISTS public.social_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    date TEXT NOT NULL,
    location_ne TEXT NOT NULL,
    location_en TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('CULTURAL', 'HEALTH', 'COMMUNITY', 'EDUCATION', 'ENVIRONMENT')),
    description_ne TEXT NOT NULL,
    description_en TEXT NOT NULL,
    photos TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT,
    participant_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'DRAFT')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. RELIEF AND WELFARE SUPPORT
CREATE TABLE IF NOT EXISTS public.relief_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DISASTER_RELIEF', 'HEALTH_ASSISTANCE', 'SCHOLARSHIP', 'COMMUNITY_WELFARE')),
    beneficiary_group_ne TEXT NOT NULL,
    beneficiary_group_en TEXT NOT NULL,
    date TEXT NOT NULL,
    location_ne TEXT NOT NULL,
    location_en TEXT NOT NULL,
    amount_npr NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    materials_provided_ne TEXT NOT NULL,
    materials_provided_en TEXT NOT NULL,
    description_ne TEXT NOT NULL,
    description_en TEXT NOT NULL,
    photos TEXT[] NOT NULL DEFAULT '{}',
    report_attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'ONGOING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. EVENTS AND PROGRAMS
CREATE TABLE IF NOT EXISTS public.events_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    event_date_time TEXT NOT NULL,
    venue_ne TEXT NOT NULL,
    venue_en TEXT NOT NULL,
    agenda_ne TEXT NOT NULL,
    agenda_en TEXT NOT NULL,
    registration_link TEXT,
    organizer_ne TEXT NOT NULL,
    organizer_en TEXT NOT NULL,
    featured_image TEXT NOT NULL,
    description_ne TEXT NOT NULL,
    description_en TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'COMPLETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. MEMBERSHIP TIERS & INBOX APPLICATIONS
CREATE TABLE IF NOT EXISTS public.membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_key TEXT UNIQUE NOT NULL,
    name_ne TEXT NOT NULL,
    name_en TEXT NOT NULL,
    fee_npr NUMERIC(10, 2) NOT NULL,
    validity_ne TEXT NOT NULL,
    validity_en TEXT NOT NULL,
    description_ne TEXT NOT NULL,
    description_en TEXT NOT NULL,
    requirements_ne TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name_ne TEXT NOT NULL,
    full_name_en TEXT NOT NULL,
    membership_type TEXT NOT NULL CHECK (membership_type IN ('ORDINARY', 'LIFE', 'HONORARY')),
    madi_address_ne TEXT NOT NULL,
    current_address_ne TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    occupation_ne TEXT NOT NULL,
    reason_for_joining_ne TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. COMMITTEE / OFFICIALS
CREATE TABLE IF NOT EXISTS public.committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ne TEXT NOT NULL,
    name_en TEXT NOT NULL,
    designation_ne TEXT NOT NULL,
    designation_en TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('EXECUTIVE', 'ADVISORY', 'SUB_COMMITTEE')),
    department_ne TEXT NOT NULL,
    department_en TEXT NOT NULL,
    contact_phone TEXT,
    email TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    photo_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

-- 6. TRANSPARENCY AND GOVERNANCE REPORTS
CREATE TABLE IF NOT EXISTS public.governance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    fiscal_year TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ANNUAL_REPORT', 'AUDIT_FINANCIAL', 'CONSTITUTION', 'MINUTES', 'POLICY')),
    published_date TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_mb TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7. SUGGESTIONS AND COMPLAINTS (COMMUNITY INBOX)
CREATE TABLE IF NOT EXISTS public.feedback_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('SUGGESTION', 'COMPLAINT', 'RELIEF_REQUEST', 'INQUIRY')),
    message TEXT NOT NULL,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_REVIEW', 'RESOLVED', 'CLOSED')),
    admin_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 8. PARTNERS AND SUPPORTERS
CREATE TABLE IF NOT EXISTS public.community_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ne TEXT NOT NULL,
    name_en TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('LOCAL_GOVERNMENT', 'NGO_INGO', 'SPONSOR', 'COMMUNITY_GROUP')),
    logo_url TEXT NOT NULL,
    website_url TEXT,
    contribution_summary_ne TEXT NOT NULL,
    contribution_summary_en TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

-- 9. NOTICES & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.notices_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    date TEXT NOT NULL,
    summary_ne TEXT NOT NULL,
    summary_en TEXT NOT NULL,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relief_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices_announcements ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Published Content
CREATE POLICY "Public read social activities" ON public.social_activities FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public read relief programs" ON public.relief_programs FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events_programs FOR SELECT USING (true);
CREATE POLICY "Public read membership tiers" ON public.membership_tiers FOR SELECT USING (true);
CREATE POLICY "Public read committee" ON public.committee_members FOR SELECT USING (true);
CREATE POLICY "Public read reports" ON public.governance_reports FOR SELECT USING (is_public = true);
CREATE POLICY "Public read partners" ON public.community_partners FOR SELECT USING (true);
CREATE POLICY "Public read notices" ON public.notices_announcements FOR SELECT USING (true);

-- Public Submit Policies (Inbox - No Public Select)
CREATE POLICY "Public submit membership" ON public.membership_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public submit feedback" ON public.feedback_submissions FOR INSERT WITH CHECK (true);

