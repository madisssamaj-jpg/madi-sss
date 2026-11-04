-- Migration: Constitution Versioning & Governance Enhancements
-- Idempotent schema extension for governance_reports table

ALTER TABLE public.governance_reports
    ADD COLUMN IF NOT EXISTS version TEXT,
    ADD COLUMN IF NOT EXISTS effective_date TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN IF NOT EXISTS description_ne TEXT,
    ADD COLUMN IF NOT EXISTS description_en TEXT,
    ADD COLUMN IF NOT EXISTS no_private_data_confirmed BOOLEAN NOT NULL DEFAULT false;

-- Add check constraint for status if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'governance_reports_status_check'
    ) THEN
        ALTER TABLE public.governance_reports
            ADD CONSTRAINT governance_reports_status_check
            CHECK (status IN ('PUBLISHED', 'DRAFT', 'ARCHIVED'));
    END IF;
END $$;

-- Update RLS policy for public read to only show published non-archived items to public
DROP POLICY IF EXISTS "Public read reports" ON public.governance_reports;
CREATE POLICY "Public read reports" ON public.governance_reports
    FOR SELECT USING (is_public = true AND status = 'PUBLISHED');

COMMENT ON COLUMN public.governance_reports.version IS 'Version string e.g. १.० (२०८२)';
COMMENT ON COLUMN public.governance_reports.no_private_data_confirmed IS 'Mandatory privacy assurance confirming no private member PII exists in uploaded document';

