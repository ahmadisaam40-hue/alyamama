
-- 1. Ensure RLS is enabled on policies
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies
DROP POLICY IF EXISTS "Public read policies" ON public.policies;
DROP POLICY IF EXISTS "hub_public_read" ON public.policies;

-- 3. Create a strict public read policy for the Hub
CREATE POLICY "Public read policies"
ON public.policies
FOR SELECT
TO anon
USING (true);

-- 4. Fix qr_tokens table and RLS
-- First, add is_public column if it's missing (to avoid the ERROR: 42703)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='qr_tokens' AND column_name='is_public') THEN
        ALTER TABLE public.qr_tokens ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tokens" ON public.qr_tokens;
CREATE POLICY "Public read tokens"
ON public.qr_tokens
FOR SELECT
TO anon
USING (COALESCE(is_public, true) = true);

-- 5. Audit Logging Table RLS
ALTER TABLE public.public_access_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon inserts" ON public.public_access_logs;
CREATE POLICY "Allow anon inserts"
ON public.public_access_logs
FOR INSERT
TO anon
WITH CHECK (true);

-- 6. Storage Bucket Permissions
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('policy-pdfs', 'policy-pdfs', true) 
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

DROP POLICY IF EXISTS "Public Access to Policy PDFs" ON storage.objects;
CREATE POLICY "Public Access to Policy PDFs"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'policy-pdfs');
