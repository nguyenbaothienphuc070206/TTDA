-- Enterprise baseline schema (profiles, lessons, progress, logs, posts)
-- Safe to run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text,
  belt_level text not null default 'lam_dai',
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  belt text not null,
  type text not null,
  duration int not null default 15,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  score int,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.workout_logs enable row level security;
alter table public.posts enable row level security;

-- Profiles: user owns profile
create policy if not exists "profiles_select_own"
on public.profiles
for select
using (auth.uid() = user_id);

create policy if not exists "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = user_id);

create policy if not exists "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Lessons: authenticated read
create policy if not exists "lessons_select_auth"
on public.lessons
for select
to authenticated
using (true);

-- Progress: user owns data
create policy if not exists "progress_own_all"
on public.progress
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Workout logs: user owns data
create policy if not exists "workout_logs_own_all"
on public.workout_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Posts: user can read all, write own
create policy if not exists "posts_select_auth"
on public.posts
for select
to authenticated
using (true);

create policy if not exists "posts_insert_own"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "posts_update_own"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "posts_delete_own"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id);
