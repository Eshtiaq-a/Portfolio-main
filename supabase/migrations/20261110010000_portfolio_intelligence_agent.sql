create extension if not exists "pgcrypto";

alter table public.review_queue
  drop constraint if exists review_queue_decision_check;
alter table public.review_queue
  add constraint review_queue_decision_check
  check (decision in ('publish', 'review', 'reject'));

alter table public.review_queue
  drop constraint if exists review_queue_category_check;
alter table public.review_queue
  add constraint review_queue_category_check
  check (category in ('project', 'credential', 'achievement', 'publication'));

alter table public.portfolio_items
  drop constraint if exists portfolio_items_category_check;
alter table public.portfolio_items
  add constraint portfolio_items_category_check
  check (category in ('project', 'credential', 'achievement', 'publication'));

alter table public.source_records
  drop constraint if exists source_records_source_type_check;
alter table public.source_records
  add constraint source_records_source_type_check
  check (source_type in ('github', 'manual', 'linkedin', 'credential', 'achievement', 'publication'));

alter table public.source_records
  add column if not exists source_metadata jsonb not null default '{}'::jsonb,
  add column if not exists content_hash text,
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'private')),
  add column if not exists last_evaluated_at timestamptz;

alter table public.review_queue
  add column if not exists decision_payload jsonb not null default '{}'::jsonb,
  add column if not exists source_url text,
  add column if not exists live_url text,
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists publication_state text not null default 'unpublished'
    check (publication_state in ('unpublished', 'published', 'hidden', 'unpublished_by_admin')),
  add column if not exists rejection_reason text;

alter table public.portfolio_items
  add column if not exists source_url text,
  add column if not exists evidence text[] not null default '{}',
  add column if not exists score integer check (score between 0 and 100),
  add column if not exists decision text check (decision in ('publish', 'review', 'reject')),
  add column if not exists evaluated_at timestamptz,
  add column if not exists live_url text,
  add column if not exists github_url text,
  add column if not exists linkedin_url text;

create table if not exists public.automation_activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('scan', 'evaluate', 'publish', 'approve', 'reject', 'hide', 'unpublish', 'submit', 'error')),
  actor_id uuid,
  source_record_id uuid references public.source_records(id) on delete set null,
  review_id uuid references public.review_queue(id) on delete set null,
  portfolio_item_id uuid references public.portfolio_items(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.automation_settings
  add column if not exists require_approval_for_all boolean not null default false,
  add column if not exists credential_domains text[] not null default
    '{"microsoft.com","linkedin.com","credly.com"}',
  add column if not exists webhook_secret_configured boolean not null default false,
  add column if not exists rate_limit_per_minute integer not null default 10
    check (rate_limit_per_minute between 1 and 120);

alter table public.automation_activity_log enable row level security;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'portfolio_admin', false);
$$;

drop policy if exists "published portfolio items are public" on public.portfolio_items;
create policy "published portfolio items are public"
  on public.portfolio_items for select
  using (published = true);

create policy "admins manage portfolio items"
  on public.portfolio_items for all
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

create policy "admins manage source records"
  on public.source_records for all
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

create policy "admins manage review queue"
  on public.review_queue for all
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

create policy "admins manage automation settings"
  on public.automation_settings for all
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

create policy "admins read activity log"
  on public.automation_activity_log for select
  using (public.is_portfolio_admin());

insert into public.source_records (source_type, source_url, source_payload, source_metadata)
values
  ('github', 'https://github.com/Eshtiaq-a/stash-money-manager',
   '{"title":"Stash — Student Money Manager","liveUrl":"https://stash-saver.vercel.app/"}',
   '{"initial_publish":true}'),
  ('github', 'https://github.com/Eshtiaq-a/Wrechship',
   '{"title":"WrechShip — Maritime Disaster Dataset & Explorer","liveUrl":"https://www.wreckship.me/"}',
   '{"initial_publish":true}')
on conflict (source_url) do nothing;

insert into public.review_queue
  (source_record_id, decision, score, reason, portfolio_summary, category, evidence,
   source_url, live_url, github_url, approval_status, publication_state, decision_payload)
select
  sr.id, 'publish', 100, 'Initial items explicitly approved by the portfolio owner.',
  case when sr.source_url like '%stash-money-manager'
    then 'A student-focused money manager for expenses, budgets, saving points, and multi-currency support.'
    else 'An open historical maritime-disaster dataset and exploration tool with geospatial records.'
  end,
  'project',
  case when sr.source_url like '%stash-money-manager'
    then array['Owner-provided project description and live URL', 'Public GitHub source repository']
    else array['Owner-provided dataset description and live URL', 'Public GitHub source repository']
  end,
  sr.source_url,
  sr.source_payload ->> 'liveUrl',
  sr.source_url,
  'approved',
  'published',
  jsonb_build_object('decision','publish','score',100,'sourceUrl',sr.source_url)
from public.source_records sr
where sr.source_url in (
  'https://github.com/Eshtiaq-a/stash-money-manager',
  'https://github.com/Eshtiaq-a/Wrechship'
)
and not exists (
  select 1 from public.review_queue rq where rq.source_record_id = sr.id
);

insert into public.portfolio_items
  (review_id, title, description, skills, category, source_url,
   published, evidence, score, decision, evaluated_at, live_url, github_url)
select
  rq.id,
  case when rq.source_url like '%stash-money-manager'
    then 'Stash — Student Money Manager'
    else 'WrechShip — Maritime Disaster Dataset & Explorer'
  end,
  rq.portfolio_summary,
  case when rq.source_url like '%stash-money-manager'
    then array['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL']
    else array['Python', 'Geospatial data', 'Web']
  end,
  'project',
  rq.source_url,
  rq.source_url,
  true,
  rq.evidence,
  rq.score,
  rq.decision,
  rq.evaluated_at,
  rq.live_url,
  rq.github_url
from public.review_queue rq
where rq.source_url in (
  'https://github.com/Eshtiaq-a/stash-money-manager',
  'https://github.com/Eshtiaq-a/Wrechship'
)
and not exists (
  select 1 from public.portfolio_items pi where pi.review_id = rq.id
);
