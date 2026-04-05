-- Final blueprint upgrade: analytics + ai memory + follows + subscriptions + mentor metadata

create extension if not exists pgcrypto;

-- Prefer existing profiles table in this codebase (instead of separate users table).
alter table if exists public.profiles
  add column if not exists last_active timestamptz null;

alter table if exists public.profiles
  add column if not exists consistency_score int not null default 0;

alter table if exists public.profiles
  add column if not exists can_mentor boolean not null default false;

-- Lesson metadata for adaptive unlock.
alter table if exists public.lessons
  add column if not exists difficulty int null;

alter table if exists public.lessons
  add column if not exists prerequisites uuid[] null;

-- AI memory KV store (simple and auditable).
create table if not exists public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  value text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_memory_user_key_created_idx
  on public.ai_memory (user_id, key, created_at desc);

-- Product analytics events.
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users (id) on delete set null,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_event_created_idx
  on public.analytics (event, created_at desc);

create index if not exists analytics_user_created_idx
  on public.analytics (user_id, created_at desc);

-- Social graph for mentor/feed logic.
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  constraint follows_not_self check (follower_id <> following_id)
);

create index if not exists follows_follower_idx
  on public.follows (follower_id, created_at desc);

create index if not exists follows_following_idx
  on public.follows (following_id, created_at desc);

-- Lightweight subscription table (coexists with commerce tables).
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  constraint subscriptions_plan_chk check (plan in ('free', 'premium', 'pro', 'elite')),
  constraint subscriptions_status_chk check (status in ('active', 'past_due', 'canceled', 'trial'))
);

alter table public.ai_memory enable row level security;
alter table public.analytics enable row level security;
alter table public.follows enable row level security;
alter table public.subscriptions enable row level security;

create policy if not exists "ai_memory_select_scope"
on public.ai_memory
for select
to authenticated
using (user_id = auth.uid() or public.can_coach_student(user_id) or public.is_admin());

create policy if not exists "ai_memory_insert_scope"
on public.ai_memory
for insert
to authenticated
with check (user_id = auth.uid() or public.can_coach_student(user_id) or public.is_admin());

create policy if not exists "analytics_insert_auth"
on public.analytics
for insert
to authenticated
with check (user_id is null or user_id = auth.uid() or public.is_admin());

create policy if not exists "analytics_select_admin"
on public.analytics
for select
to authenticated
using (public.is_admin());

create policy if not exists "follows_select_auth"
on public.follows
for select
to authenticated
using (true);

create policy if not exists "follows_insert_own"
on public.follows
for insert
to authenticated
with check (follower_id = auth.uid());

create policy if not exists "follows_delete_own"
on public.follows
for delete
to authenticated
using (follower_id = auth.uid() or public.is_admin());

create policy if not exists "subscriptions_select_scope"
on public.subscriptions
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy if not exists "subscriptions_insert_admin"
on public.subscriptions
for insert
to authenticated
with check (public.is_admin());

create policy if not exists "subscriptions_update_admin"
on public.subscriptions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Mentor rule: hong_dai and above -> can_mentor=true.
update public.profiles
set can_mentor = true
where lower(coalesce(belt_level, '')) in ('hong_dai', 'hong-dai', 'red-belt', 'red');
