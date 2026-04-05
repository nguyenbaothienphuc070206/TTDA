-- Platform core upgrade for cloud sync + community + streak loop
-- Safe incremental migration for existing schema.

create extension if not exists pgcrypto;

-- profiles enhancements
alter table if exists public.profiles
  add column if not exists streak_days int not null default 0;

alter table if exists public.profiles
  add column if not exists xp int not null default 0;

alter table if exists public.profiles
  add column if not exists last_check_in_at timestamptz null;

-- progress enhancements
alter table if exists public.progress
  add column if not exists time_spent int not null default 0;

alter table if exists public.progress
  add column if not exists completed_at timestamptz null;

alter table if exists public.progress
  add column if not exists score int null;

alter table if exists public.progress
  add column if not exists updated_at timestamptz not null default now();

-- lessons compatibility (belt_level requested by product spec)
alter table if exists public.lessons
  add column if not exists belt_level text null;

update public.lessons
set belt_level = coalesce(belt_level, belt)
where belt_level is null;

-- community messages table for realtime belt-group chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  belt_group text not null default 'all',
  created_at timestamptz not null default now()
);

create index if not exists messages_belt_group_created_idx
  on public.messages (belt_group, created_at desc);

alter table public.messages enable row level security;

create policy if not exists "messages_select_auth"
on public.messages
for select
to authenticated
using (true);

create policy if not exists "messages_insert_own"
on public.messages
for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "messages_update_own"
on public.messages
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "messages_delete_own"
on public.messages
for delete
to authenticated
using (auth.uid() = user_id);

-- realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END
$$;
