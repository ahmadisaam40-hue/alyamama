-- Universal Policy Hub Schema
-- This migration ensures the database is ready for the Public Verification Hub
-- and compatible with the Desktop Policy Manager.

-- 1. Create or Adjust Policies Table
create table if not exists public.policies (
    id uuid primary key default gen_random_uuid(),
    policy_no text unique not null,
    policy_type text not null,
    insured_name text not null,
    starts_at timestamptz not null default now(),
    ends_at timestamptz,
    status text not null default 'active',
    pdf_path text,
    form_data jsonb default '{}',
    created_at timestamptz default now()
);

-- Handle renaming if table was created with old names in previous sessions
do $$ 
begin
    -- Rename policy_number to policy_no
    if exists (select 1 from information_schema.columns where table_name='policies' and column_name='policy_number') then
        alter table public.policies rename column policy_number to policy_no;
    end if;

    -- Rename client_name to insured_name
    if exists (select 1 from information_schema.columns where table_name='policies' and column_name='client_name') then
        alter table public.policies rename column client_name to insured_name;
    end if;

    -- Rename template_name to policy_type
    if exists (select 1 from information_schema.columns where table_name='policies' and column_name='template_name') then
        alter table public.policies rename column template_name to policy_type;
    end if;

    -- Rename issued_at to starts_at
    if exists (select 1 from information_schema.columns where table_name='policies' and column_name='issued_at') then
        alter table public.policies rename column issued_at to starts_at;
    end if;

    -- Rename expires_at to ends_at
    if exists (select 1 from information_schema.columns where table_name='policies' and column_name='expires_at') then
        alter table public.policies rename column expires_at to ends_at;
    end if;

    -- Ensure pdf_path exists
    if not exists (select 1 from information_schema.columns where table_name='policies' and column_name='pdf_path') then
        alter table public.policies add column pdf_path text;
    end if;
end $$;

-- 2. Create QR Tokens Table
create table if not exists public.qr_tokens (
    id uuid primary key default gen_random_uuid(),
    policy_id uuid references public.policies(id) on delete cascade,
    token text unique not null,
    is_public boolean default true,
    created_at timestamptz default now()
);

-- 3. Storage Bucket (Manual confirmation encouraged)
-- insert into storage.buckets (id, name, public) values ('policy-pdfs', 'policy-pdfs', false) on conflict do nothing;

-- 4. RLS & Security
alter table public.policies enable row level security;
alter table public.qr_tokens enable row level security;

-- Authenticated (Program) Access
create policy "program_full_access" on public.policies for all to authenticated using (true);
create policy "program_token_access" on public.qr_tokens for all to authenticated using (true);

-- 5. Indexes
create index if not exists idx_policies_no on public.policies(policy_no);
create index if not exists idx_qr_tokens_text on public.qr_tokens(token);
create index if not exists idx_policies_insured on public.policies(insured_name);
