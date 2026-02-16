
-- Create a table to log public access for rate limiting and auditing
CREATE TABLE IF NOT EXISTS public_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    path TEXT NOT NULL,
    query TEXT,
    ip TEXT,
    user_agent TEXT
);

-- Basic index for performance
CREATE INDEX IF NOT EXISTS idx_public_access_logs_ip ON public_access_logs(ip, created_at);

-- Policy to allow inserting from Edge Functions (service role)
-- and potentially restrict read access
ALTER TABLE public_access_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage logs" ON public_access_logs
    USING (true)
    WITH CHECK (true);
