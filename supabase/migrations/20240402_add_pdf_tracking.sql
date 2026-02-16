
-- Update policies table with official PDF tracking columns
DO $$ 
BEGIN
    -- 1. Add pdf_size column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='policies' AND column_name='pdf_size') THEN
        ALTER TABLE public.policies ADD COLUMN pdf_size INTEGER;
    END IF;

    -- 2. Add pdf_generated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='policies' AND column_name='pdf_generated_at') THEN
        ALTER TABLE public.policies ADD COLUMN pdf_generated_at TIMESTAMPTZ;
    END IF;

    -- 3. Ensure pdf_path exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='policies' AND column_name='pdf_path') THEN
        ALTER TABLE public.policies ADD COLUMN pdf_path TEXT;
    END IF;
END $$;
