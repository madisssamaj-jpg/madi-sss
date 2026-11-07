-- Migration: 20261103000004_storage_and_constitution_url.sql
-- Description: Register official-documents bucket and update constitution URL to Supabase Storage

-- 1. Create or update the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'official-documents',
    'official-documents',
    true,
    52428800, -- 50 MB
    ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf']::text[];

-- 2. Storage RLS Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Official Documents'
    ) THEN
        CREATE POLICY "Public Access Official Documents" ON storage.objects
        FOR SELECT USING (bucket_id = 'official-documents');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'buckets' AND policyname = 'Public Read Buckets'
    ) THEN
        CREATE POLICY "Public Read Buckets" ON storage.buckets
        FOR SELECT USING (true);
    END IF;
END $$;

-- 3. Idempotently update or insert the official Constitution record with Supabase Storage URL
DO $$
DECLARE
    v_storage_url TEXT := 'https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/official-documents/constitution/madi-sss-constitution-2082-v1.pdf';
BEGIN
    -- Check if Constitution v1.0 already exists
    IF EXISTS (
        SELECT 1 FROM public.governance_reports 
        WHERE category = 'CONSTITUTION' AND version = '१.० (२०८२)'
    ) THEN
        -- Update existing record with the new Supabase Storage URL
        UPDATE public.governance_reports
        SET 
            file_url = v_storage_url,
            status = 'PUBLISHED',
            is_public = true,
            effective_date = '२०८२-०६-२९',
            published_date = '२०८२-०६-२९',
            file_size_mb = '9.9 MB',
            no_private_data_confirmed = true,
            description_ne = 'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा मिति २०८२/०६/२९ मा दर्ता तथा प्रमाणित आधिकारिक विधान (Supabase Storage)',
            description_en = 'Official verified and registered Constitution approved by District Administration Office, Kathmandu on 2082/06/29 (Supabase Storage)'
        WHERE category = 'CONSTITUTION' AND version = '१.० (२०८२)';
    ELSE
        -- Insert new active official Constitution record
        INSERT INTO public.governance_reports (
            id,
            title_ne,
            title_en,
            fiscal_year,
            category,
            version,
            effective_date,
            published_date,
            file_url,
            file_size_mb,
            is_public,
            status,
            description_ne,
            description_en,
            no_private_data_confirmed
        ) VALUES (
            gen_random_uuid(),
            'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको विधान',
            'Constitution of Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
            '२०८२ (2025)',
            'CONSTITUTION',
            '१.० (२०८२)',
            '२०८२-०६-२९',
            '२०८२-०६-२९',
            v_storage_url,
            '9.9 MB',
            true,
            'PUBLISHED',
            'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा मिति २०८२/०६/२९ मा दर्ता तथा प्रमाणित आधिकारिक विधान (Supabase Storage)',
            'Official verified and registered Constitution approved by District Administration Office, Kathmandu on 2082/06/29 (Supabase Storage)',
            true
        );
    END IF;

    -- Ensure any older constitution entries (e.g. preliminary draft 2080) are marked ARCHIVED
    UPDATE public.governance_reports
    SET status = 'ARCHIVED'
    WHERE category = 'CONSTITUTION' 
      AND (version IS NULL OR version <> '१.० (२०८२)')
      AND status = 'PUBLISHED';
END $$;

