
-- ==========================================================
-- SUPER FIX: QR VERIFICATION END-TO-END
-- Version: 2.1 (Robust Schema Handling)
-- ==========================================================

-- 1. Enable needed extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Normalization Function (Arabic digits, separators, spaces)
CREATE OR REPLACE FUNCTION normalize_policy_text(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    t TEXT;
BEGIN
    IF input_text IS NULL THEN RETURN NULL; END IF;
    -- Translate Arabic digits to English
    t := translate(input_text, '٠١٢٣٤٥٦٧٨٩', '0123456789');
    -- Upper case and trim
    t := UPPER(TRIM(t));
    -- Standardize separators: change '-' and '.' to '/'
    t := replace(t, '-', '/');
    t := replace(t, '.', '/');
    -- Remove all internal whitespace
    t := regexp_replace(t, '\s+', '', 'g');
    RETURN t;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Robust RPC Function
CREATE OR REPLACE FUNCTION public_verify_policy(search_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    norm_input TEXT;
    found_rec RECORD;
    is_legacy_schema BOOLEAN;
BEGIN
    norm_input := normalize_policy_text(search_code);
    
    -- Check which column exists to avoid 42703 (Undefined Column)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='policies' AND column_name='policy_number'
    ) INTO is_legacy_schema;

    -- Try Strategy 1: Specific QR Token or qr_token field
    SELECT p.* INTO found_rec FROM policies p
    LEFT JOIN qr_tokens t ON t.policy_id = p.id
    WHERE UPPER(TRIM(COALESCE(t.token, ''))) = UPPER(TRIM(search_code))
       OR UPPER(TRIM(COALESCE(p.qr_token, ''))) = UPPER(TRIM(search_code))
    LIMIT 1;

    -- Try Strategy 2: Normalized Match
    IF found_rec.id IS NULL THEN
        IF is_legacy_schema THEN
            SELECT * INTO found_rec FROM policies 
            WHERE normalize_policy_text(policy_number) = norm_input LIMIT 1;
        ELSE
            SELECT * INTO found_rec FROM policies 
            WHERE normalize_policy_text(policy_no) = norm_input LIMIT 1;
        END IF;
    END IF;

    -- Final Check: if still not found, return error
    IF found_rec.id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'message', 'not_found');
    END IF;

    -- Return standardized data for the Hub
    RETURN jsonb_build_object(
        'ok', true,
        'data', jsonb_build_object(
            'policyNo', COALESCE(found_rec.policy_no, found_rec.policy_number),
            'policyType', COALESCE(found_rec.policy_type, found_rec.template_name, 'وثيقة تأمين'),
            'insuredName', COALESCE(found_rec.insured_name, found_rec.client_name),
            'startsAt', COALESCE(found_rec.starts_at, found_rec.issued_at),
            'endsAt', COALESCE(found_rec.ends_at, found_rec.expires_at),
            'status', found_rec.status,
            'pdf_path', found_rec.pdf_path
        )
    );
END;
$$;

-- 4. Set Permissions (Anon Access)
GRANT EXECUTE ON FUNCTION public_verify_policy(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public_verify_policy(TEXT) TO authenticated;

-- Ensure RLS allows the RPC to see data (or use SECURITY DEFINER, which we did)
-- However, for simple selects, we enable RLS and allow public read
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Hub Read Access" ON public.policies;
CREATE POLICY "Public Hub Read Access" ON public.policies FOR SELECT TO anon USING (true);

-- 5. Storage Fix (Bucket & Policies)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('policy-pdfs', 'policy-pdfs', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Hub Storage Read" ON storage.objects;
CREATE POLICY "Hub Storage Read" 
ON storage.objects FOR SELECT 
TO anon 
USING (bucket_id = 'policy-pdfs');

-- 6. Insert Test Data (Optional, but good for verification)
-- Note: Replace with actual columns if needed
DO $$
BEGIN
    INSERT INTO public.policies (policy_no, policy_type, insured_name, status)
    VALUES ('POL/2026/311', 'تأمين مركبات', 'محمد العتيبي', 'active')
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- Fallback for legacy schema
    INSERT INTO public.policies (policy_number, template_name, client_name, status, qr_token, template_id, client_phone)
    VALUES ('POL/2026/311', 'تأمين مركبات', 'محمد العتيبي', 'active', 'TEST-TOKEN', 'DUMMY', '050')
    ON CONFLICT DO NOTHING;
END $$;
