
-- 1. Create Core Tables (If they don't exist)
CREATE TABLE IF NOT EXISTS public.policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_no TEXT UNIQUE NOT NULL,
    policy_type TEXT NOT NULL,
    insured_name TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    pdf_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qr_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id uuid REFERENCES public.policies(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.public_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    path TEXT NOT NULL,
    query TEXT,
    ip TEXT
);

-- 2. Create the RPC function for public verification
-- This runs with SECURITY DEFINER to bypass RLS safely for this specific task
CREATE OR REPLACE FUNCTION public_verify_policy(search_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    found_policy_id UUID;
    result JSONB;
BEGIN
    -- Search by token
    SELECT policy_id INTO found_policy_id FROM qr_tokens WHERE token = search_code AND is_public = true LIMIT 1;

    -- Search by policy number
    IF found_policy_id IS NULL THEN
        SELECT id INTO found_policy_id FROM policies WHERE policy_no = search_code LIMIT 1;
    END IF;

    IF found_policy_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'message', 'not_found');
    END IF;

    SELECT jsonb_build_object(
        'ok', true,
        'data', jsonb_build_object(
            'policyNo', policy_no,
            'policyType', policy_type,
            'insuredName', insured_name,
            'startsAt', starts_at,
            'endsAt', ends_at,
            'status', status,
            'pdf_path', pdf_path
        )
    ) INTO result FROM policies WHERE id = found_policy_id;

    INSERT INTO public_access_logs (path, query) VALUES ('/rpc/public_verify_policy', search_code);

    RETURN result;
END;
$$;

-- 3. Security & Access
GRANT EXECUTE ON FUNCTION public_verify_policy(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public_verify_policy(TEXT) TO authenticated;

-- Allow public to download PDFs (Storage Policy)
-- Note: Replace 'policy-pdfs' with your actual bucket name if different
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'policy-pdfs') THEN
        CREATE POLICY "Allow Public Download" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'policy-pdfs');
    END IF;
END $$;
