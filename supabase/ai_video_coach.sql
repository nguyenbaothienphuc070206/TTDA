-- AI Video Analysis + Coach + Leaderboard + Memory schema
-- Run after existing RBAC/RLS files.

create extension if not exists pgcrypto;

create table if not exists public.video_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  public_url text null,
  lesson_slug text null,
  status text not null default 'uploaded',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_submissions_status_chk check (status in ('uploaded', 'queued', 'processing', 'completed', 'failed'))
);

create table if not exists public.pose_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.video_submissions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  engine text not null default 'mediapipe',
  status text not null default 'queued',
  started_at timestamptz null,
  finished_at timestamptz null,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pose_analysis_jobs_status_chk check (status in ('queued', 'processing', 'completed', 'failed'))
);

create table if not exists public.pose_frame_metrics (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.pose_analysis_jobs (id) on delete cascade,
  frame_index int not null,
  confidence numeric not null default 0,
  axis_error numeric not null default 0,
  knee_height_error numeric not null default 0,
  guard_score numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (job_id, frame_index)
);

create table if not exists public.pose_feedback (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.video_submissions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  score int not null,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint pose_feedback_score_chk check (score between 0 and 100)
);

create table if not exists public.coach_feedback (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id uuid null references public.video_submissions (id) on delete set null,
  video_url text null,
  timestamp_sec int null,
  comment text not null,
  score int null,
  created_at timestamptz not null default now(),
  constraint coach_feedback_score_chk check (score is null or (score between 0 and 100))
);

create table if not exists public.ai_user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weakness text[] not null default '{}',
  history text[] not null default '{}',
  last_updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.user_streak_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  streak_days int not null default 0,
  technique_score_avg numeric not null default 0,
  completed_lessons int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  sent_at timestamptz null,
  constraint notification_events_status_chk check (status in ('pending', 'sent', 'failed'))
);

create or replace view public.global_leaderboard as
select
  s.user_id,
  p.display_name,
  s.streak_days,
  s.technique_score_avg,
  s.completed_lessons,
  ((s.streak_days * 2) + (s.completed_lessons * 1) + coalesce(s.technique_score_avg, 0))::numeric as rank_points
from public.user_streak_stats s
left join public.profiles p on p.user_id = s.user_id;

alter table public.video_submissions enable row level security;
alter table public.pose_analysis_jobs enable row level security;
alter table public.pose_frame_metrics enable row level security;
alter table public.pose_feedback enable row level security;
alter table public.coach_feedback enable row level security;
alter table public.ai_user_memory enable row level security;
alter table public.user_streak_stats enable row level security;
alter table public.notification_events enable row level security;

-- user owns video submissions
create policy if not exists "video_submissions_select_scope"
on public.video_submissions
for select
to authenticated
using (user_id = auth.uid() or public.can_coach_student(user_id));

create policy if not exists "video_submissions_insert_own"
on public.video_submissions
for insert
to authenticated
with check (user_id = auth.uid());

create policy if not exists "video_submissions_update_scope"
on public.video_submissions
for update
to authenticated
using (user_id = auth.uid() or public.can_coach_student(user_id))
with check (user_id = auth.uid() or public.can_coach_student(user_id));

-- analysis jobs
create policy if not exists "pose_analysis_jobs_select_scope"
on public.pose_analysis_jobs
for select
to authenticated
using (user_id = auth.uid() or public.can_coach_student(user_id));

create policy if not exists "pose_analysis_jobs_insert_own"
on public.pose_analysis_jobs
for insert
to authenticated
with check (user_id = auth.uid());

create policy if not exists "pose_analysis_jobs_update_admin"
on public.pose_analysis_jobs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- frame metrics / feedback
create policy if not exists "pose_frame_metrics_select_scope"
on public.pose_frame_metrics
for select
to authenticated
using (
  exists (
    select 1
    from public.pose_analysis_jobs j
    where j.id = pose_frame_metrics.job_id
      and (j.user_id = auth.uid() or public.can_coach_student(j.user_id))
  )
);

create policy if not exists "pose_feedback_select_scope"
on public.pose_feedback
for select
to authenticated
using (user_id = auth.uid() or public.can_coach_student(user_id));

create policy if not exists "pose_feedback_insert_admin"
on public.pose_feedback
for insert
to authenticated
with check (public.is_admin() or user_id = auth.uid());

-- coach feedback
create policy if not exists "coach_feedback_select_scope"
on public.coach_feedback
for select
to authenticated
using (user_id = auth.uid() or coach_id = auth.uid() or public.is_admin());

create policy if not exists "coach_feedback_insert_scope"
on public.coach_feedback
for insert
to authenticated
with check (coach_id = auth.uid() or public.is_admin());

create policy if not exists "coach_feedback_update_scope"
on public.coach_feedback
for update
to authenticated
using (coach_id = auth.uid() or public.is_admin())
with check (coach_id = auth.uid() or public.is_admin());

-- ai user memory
create policy if not exists "ai_user_memory_select_scope"
on public.ai_user_memory
for select
to authenticated
using (user_id = auth.uid() or public.can_coach_student(user_id));

create policy if not exists "ai_user_memory_upsert_scope"
on public.ai_user_memory
for all
to authenticated
using (user_id = auth.uid() or public.can_coach_student(user_id) or public.is_admin())
with check (user_id = auth.uid() or public.can_coach_student(user_id) or public.is_admin());

-- streak + leaderboard
create policy if not exists "user_streak_stats_select_auth"
on public.user_streak_stats
for select
to authenticated
using (true);

create policy if not exists "user_streak_stats_update_admin"
on public.user_streak_stats
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- notifications
create policy if not exists "notification_events_select_own"
on public.notification_events
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy if not exists "notification_events_insert_admin"
on public.notification_events
for insert
to authenticated
with check (public.is_admin());

create policy if not exists "notification_events_update_admin"
on public.notification_events
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
