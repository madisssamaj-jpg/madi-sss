-- ==============================================================================
-- Madi Sankhuwasabha Sarokar Samaj (Kathmandu) - Database Migration
-- 20261103000005_quarantine_non_original_constitution.sql
--
-- Immediate Quarantine of Non-Original Constitution Reference Draft
-- 1. Create private internal-documents bucket for confidential drafts
-- 2. Move non-original reference draft out of public official-documents bucket
-- 3. Add is_original_approved_document column to governance_reports
-- 4. Mark existing non-original reference draft as ARCHIVED, is_public=false, with internal audit label
-- 5. Add database-level constraint ensuring only original approved documents can ever be PUBLISHED or public
-- ==============================================================================

-- 1. Create or configure private storage bucket for internal documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('internal-documents', 'internal-documents', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Ensure NO public SELECT policy exists on internal-documents
DROP POLICY IF EXISTS "Public Access Internal Documents" ON storage.objects;

-- 3. Move the non-original reference draft from public official-documents to private internal-documents
UPDATE storage.objects
SET 
  bucket_id = 'internal-documents',
  name = 'reference-drafts/madi-sss-constitution-2082-reference-draft.pdf',
  updated_at = clock_timestamp()
WHERE bucket_id = 'official-documents' 
  AND name = 'constitution/madi-sss-constitution-2082-v1.pdf';

-- 4. Add is_original_approved_document column to governance_reports
ALTER TABLE public.governance_reports
ADD COLUMN IF NOT EXISTS is_original_approved_document boolean NOT NULL DEFAULT false;

-- 5. Update existing constitution records BEFORE applying constraint
UPDATE public.governance_reports
SET 
  status = 'ARCHIVED',
  is_public = false,
  is_original_approved_document = false,
  title_ne = 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको विधान (सन्दर्भ मस्यौदा)',
  title_en = 'Constitution of Madi (Sankhuwasabha) Sarokar Samaj (Reference Draft)',
  description_ne = '[Non-original / Reference Draft — Do Not Publish] प्रारम्भिक सन्दर्भ मस्यौदा — संस्थाको आधिकारिक छाप तथा दर्ता भएको सक्कल प्रति नभएकाले सार्वजनिक पहुँच निषेध गरिएको छ।',
  description_en = '[Non-original / Reference Draft — Do Not Publish] Internal reference draft only — Not the stamped original document. Public access restricted.',
  file_url = 'internal-documents/reference-drafts/madi-sss-constitution-2082-reference-draft.pdf'
WHERE category = 'CONSTITUTION';

-- 6. Add database-level constraint ensuring only original approved documents can ever be PUBLISHED or public
ALTER TABLE public.governance_reports
DROP CONSTRAINT IF EXISTS chk_constitution_original_before_publish;

ALTER TABLE public.governance_reports
ADD CONSTRAINT chk_constitution_original_before_publish
CHECK (
  category <> 'CONSTITUTION' OR 
  status <> 'PUBLISHED' OR 
  (is_original_approved_document = true AND no_private_data_confirmed = true AND is_public = true)
);

ALTER TABLE public.governance_reports
DROP CONSTRAINT IF EXISTS chk_constitution_non_original_not_public;

ALTER TABLE public.governance_reports
ADD CONSTRAINT chk_constitution_non_original_not_public
CHECK (
  category <> 'CONSTITUTION' OR 
  is_original_approved_document = true OR 
  is_public = false
);
