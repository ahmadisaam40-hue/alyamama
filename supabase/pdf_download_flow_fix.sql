
-- ==========================================================
-- FINAL VERSION: OFFICIAL PDF DOWNLOAD FLOW
-- Includes: Metadata tracking (size, generated_at)
-- ==========================================================

-- 1. Ensure Table Columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='policies' AND column_name='pdf_size') THEN
        ALTER TABLE public.policies ADD COLUMN pdf_size INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='policies' AND column_name='pdf_generated_at') THEN
        ALTER TABLE public.policies ADD COLUMN pdf_generated_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Update RPC Function to return PDF Metadata
CREATE OR REPLACE FUNCTION public_verify_policy(search_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    found_rec RECORD;
    norm_input TEXT;
BEGIN
    -- Normalize input (Arabic digits -> English, / and - unified, spaces removed)
    norm_input := translate(UPPER(TRIM(search_code)), '٠١٢٣٤٥٦٧٨٩-. ', '0123456789//');
    norm_input := regexp_replace(norm_input, '\s+', '', 'g');

    -- Search Strategy: Token -> Policy No (Normalized)
    SELECT p.* INTO found_rec FROM policies p
    LEFT JOIN qr_tokens t ON t.policy_id = p.id
    WHERE UPPER(TRIM(COALESCE(t.token, ''))) = UPPER(TRIM(search_code))
       OR replace(UPPER(TRIM(p.policy_no)), '-', '/') = norm_input
    LIMIT 1;

    IF found_rec.id IS NULL THEN
        -- Log attempt in database
        INSERT INTO public_access_logs (path, query) VALUES ('/verify/not_found', search_code);
        RETURN jsonb_build_object('ok', false, 'message', 'not_found');
    END IF;

    -- Log success
    INSERT INTO public_access_logs (path, query) VALUES ('/verify/success', search_code);

    -- Return full record metadata
    -- Website will use pdf_path to generate signed URL
    RETURN jsonb_build_object(
        'ok', true,
        'data', jsonb_build_object(
            'policyNo', found_rec.policy_no,
            'policyType', found_rec.policy_type,
            'insuredName', found_rec.insured_name,
            'startsAt', found_rec.starts_at,
            'endsAt', found_rec.ends_at,
            'status', found_rec.status,
            'pdf_path', found_rec.pdf_path,
            'pdf_size', found_rec.pdf_size,
            'pdf_generated_at', found_rec.pdf_generated_at
        )
    );
END;
$$;

-- 3. Storage Permissions (Public Read for signed URL generation/public access)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('policy-pdfs', 'policy-pdfs', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Hub Storage Read" ON storage.objects;
CREATE POLICY "Hub Storage Read" 
ON storage.objects FOR SELECT 
TO anon 
USING (bucket_id = 'policy-pdfs');
