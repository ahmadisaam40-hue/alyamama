-- 1. Create policies table if it doesn't exist
create table if not exists public.policies (
    id uuid primary key default gen_random_uuid(),
    policy_no text unique not null,
    policy_type text not null,
    insured_name text not null,
    issue_date date not null,
    expiry_date date not null,
    status text not null default 'active',
    pdf_path text not null,
    created_at timestamptz default now()
);

-- 2. Create qr_tokens table
create table if not exists public.qr_tokens (
    id uuid primary key default gen_random_uuid(),
    policy_id uuid references public.policies(id) on delete cascade,
    token text unique not null,
    is_public boolean default true,
    created_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.policies enable row level security;
alter table public.qr_tokens enable row level security;

-- 4. RLS for internal management (Assume authenticated admins can do anything)
-- Note: The Edge Function will bypass these using service_role.
create policy "allow_read_authenticated" on public.policies for select to authenticated using (true);
create policy "allow_write_authenticated" on public.policies for all to authenticated using (true);

create policy "allow_read_tokens_authenticated" on public.qr_tokens for select to authenticated using (true);
create policy "allow_write_tokens_authenticated" on public.qr_tokens for all to authenticated using (true);

-- 5. Public RLS (Generally deny everything, let the Edge Function handle lookups)
-- If we wanted direct access via anon key, we'd add policies here, 
-- but the requirement is to use an Edge Function for "safe subset" return.

-- 6. Indexes for performance
create index if not exists idx_policies_no on public.policies(policy_no);
create index if not exists idx_qr_tokens_text on public.qr_tokens(token);

-- 7. Storage Bucket (Manual step in Supabase UI or via SQL if possible)
-- insert into storage.buckets (id, name, public) values ('policy-pdfs', 'policy-pdfs', false);
