create extension if not exists "pgcrypto";

create table if not exists public.source_records (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('github', 'manual', 'linkedin_api')),
  source_url text not null unique,
  source_payload jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.review_queue (
  id uuid primary key default gen_random_uuid(),
  source_record_id uuid not null references public.source_records(id) on delete cascade,
  decision text not null check (decision in ('approve', 'review', 'reject')),
  score integer not null check (score between 0 and 100),
  reason text not null,
  portfolio_summary text not null,
  skills text[] not null default '{}',
  category text not null check (category in ('project', 'certificate', 'learning')),
  evidence text[] not null default '{}',
  evaluated_at timestamptz not null default now(),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected', 'hidden', 'archived')),
  reviewed_at timestamptz,
  reviewed_by uuid
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references public.review_queue(id) on delete restrict,
  title text not null,
  description text not null,
  skills text[] not null default '{}',
  category text not null check (category in ('project', 'certificate', 'learning')),
  image_url text,
  source_url text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_settings (
  id boolean primary key default true check (id),
  auto_publish boolean not null default false,
  github_username text not null default 'Eshtiaq-a',
  evaluator_endpoint text,
  updated_at timestamptz not null default now()
);

alter table public.source_records enable row level security;
alter table public.review_queue enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.automation_settings enable row level security;

create policy "published portfolio items are public"
  on public.portfolio_items for select
  using (published = true);

insert into public.automation_settings (id, auto_publish)
values (true, false)
on conflict (id) do nothing;
