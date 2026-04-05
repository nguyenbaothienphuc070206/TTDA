-- Vovinam App — Enterprise Data Blueprint (Curriculum/Progress/Plans/Community/Commerce)
--
-- Run order recommendation:
-- 1) supabase/rls.sql
-- 2) supabase/community_messages.sql
-- 3) supabase/ai_rag.sql
-- 4) this file

create extension if not exists pgcrypto;

-- =============================================================================
-- 1) Curriculum domain
-- =============================================================================

create table if not exists public.curriculum_belts (
  id text primary key,
  name text not null,
  rank_order integer not null unique,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_lessons (
  id text primary key,
  belt_id text not null references public.curriculum_belts (id),
  slug text not null unique,
  title text not null,
  summary text null,
  difficulty smallint not null default 1,
  video_url text null,
  duration_min integer null,
  sort_order integer not null default 0,
  is_premium boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_lessons_difficulty_chk check (difficulty between 1 and 5),
  constraint curriculum_lessons_duration_chk check (duration_min is null or duration_min >= 1)
);

create table if not exists public.lesson_prerequisites (
  lesson_id text not null references public.curriculum_lessons (id) on delete cascade,
  prerequisite_lesson_id text not null references public.curriculum_lessons (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (lesson_id, prerequisite_lesson_id),
  constraint lesson_prerequisites_not_self check (lesson_id <> prerequisite_lesson_id)
);

create index if not exists curriculum_lessons_belt_sort_idx
  on public.curriculum_lessons (belt_id, sort_order, id);

-- =============================================================================
-- 2) Progression domain
-- =============================================================================

create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.curriculum_lessons (id) on delete cascade,
  status text not null default 'not_started',
  completion_percent smallint not null default 0,
  started_at timestamptz null,
  completed_at timestamptz null,
  last_score numeric null,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users (id),
  unique (user_id, lesson_id),
  constraint user_lesson_progress_status_chk check (status in ('not_started', 'in_progress', 'completed')),
  constraint user_lesson_progress_percent_chk check (completion_percent between 0 and 100),
  constraint user_lesson_progress_score_chk check (last_score is null or (last_score >= 0 and last_score <= 100))
);

create index if not exists user_lesson_progress_user_status_idx
  on public.user_lesson_progress (user_id, status, updated_at desc);

-- =============================================================================
-- 3) Training plan domain
-- =============================================================================

create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  goal text null,
  intensity text not null default 'medium',
  source text not null default 'system',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references auth.users (id),
  unique (user_id, week_start),
  constraint training_plans_intensity_chk check (intensity in ('light', 'medium', 'hard')),
  constraint training_plans_source_chk check (source in ('system', 'coach', 'user')),
  constraint training_plans_status_chk check (status in ('active', 'archived'))
);

create table if not exists public.training_plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans (id) on delete cascade,
  lesson_id text null references public.curriculum_lessons (id),
  training_date date not null,
  day_index smallint not null,
  title text not null,
  description text null,
  is_rest_day boolean not null default false,
  status text not null default 'todo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_plan_items_day_idx_chk check (day_index between 1 and 7),
  constraint training_plan_items_status_chk check (status in ('todo', 'done', 'skipped'))
);

create index if not exists training_plans_user_week_idx
  on public.training_plans (user_id, week_start desc);

create index if not exists training_plan_items_plan_date_idx
  on public.training_plan_items (plan_id, training_date, day_index);

-- =============================================================================
-- 4) Achievement domain
-- =============================================================================

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text null,
  icon text null,
  points integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  awarded_by uuid null references auth.users (id),
  unique (user_id, achievement_id)
);

create index if not exists user_achievements_user_earned_idx
  on public.user_achievements (user_id, earned_at desc);

-- =============================================================================
-- 5) Community feed domain (complements community_messages.sql)
-- =============================================================================

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  visibility text not null default 'public',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_posts_visibility_chk check (visibility in ('public', 'members')),
  constraint community_posts_body_len_chk check (char_length(body) between 1 and 3000)
);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_post_comments_body_len_chk check (char_length(body) between 1 and 1200)
);

create table if not exists public.community_post_reactions (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id),
  constraint community_post_reactions_chk check (reaction in ('like', 'respect', 'fire'))
);

create index if not exists community_posts_created_idx
  on public.community_posts (created_at desc);

create index if not exists community_post_comments_post_created_idx
  on public.community_post_comments (post_id, created_at asc);

-- =============================================================================
-- 6) Commerce domain
-- =============================================================================

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null default 'stripe',
  provider_subscription_id text not null,
  plan_code text not null,
  status text not null,
  current_period_end timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id),
  constraint user_subscriptions_status_chk check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete'))
);

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_code text not null unique,
  amount numeric not null,
  currency text not null default 'VND',
  status text not null,
  provider text not null default 'stripe',
  provider_checkout_id text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_orders_amount_chk check (amount >= 0),
  constraint commerce_orders_status_chk check (status in ('pending', 'paid', 'failed', 'refunded'))
);

create index if not exists commerce_orders_user_created_idx
  on public.commerce_orders (user_id, created_at desc);

-- =============================================================================
-- 7) Enable RLS
-- =============================================================================

alter table public.curriculum_belts enable row level security;
alter table public.curriculum_lessons enable row level security;
alter table public.lesson_prerequisites enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.training_plans enable row level security;
alter table public.training_plan_items enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_post_comments enable row level security;
alter table public.community_post_reactions enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.commerce_orders enable row level security;

-- =============================================================================
-- 8) Policies: curriculum (public read for authenticated, admin write)
-- =============================================================================

drop policy if exists "curriculum_belts_read_auth" on public.curriculum_belts;
create policy "curriculum_belts_read_auth"
on public.curriculum_belts
for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "curriculum_belts_admin_write" on public.curriculum_belts;
create policy "curriculum_belts_admin_write"
on public.curriculum_belts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "curriculum_lessons_read_auth" on public.curriculum_lessons;
create policy "curriculum_lessons_read_auth"
on public.curriculum_lessons
for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "curriculum_lessons_admin_write" on public.curriculum_lessons;
create policy "curriculum_lessons_admin_write"
on public.curriculum_lessons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lesson_prerequisites_read_auth" on public.lesson_prerequisites;
create policy "lesson_prerequisites_read_auth"
on public.lesson_prerequisites
for select
to authenticated
using (true);

drop policy if exists "lesson_prerequisites_admin_write" on public.lesson_prerequisites;
create policy "lesson_prerequisites_admin_write"
on public.lesson_prerequisites
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =============================================================================
-- 9) Policies: lesson progress
-- =============================================================================

drop policy if exists "user_lesson_progress_select_scope" on public.user_lesson_progress;
create policy "user_lesson_progress_select_scope"
on public.user_lesson_progress
for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
);

drop policy if exists "user_lesson_progress_insert_scope" on public.user_lesson_progress;
create policy "user_lesson_progress_insert_scope"
on public.user_lesson_progress
for insert
to authenticated
with check (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
);

drop policy if exists "user_lesson_progress_update_scope" on public.user_lesson_progress;
create policy "user_lesson_progress_update_scope"
on public.user_lesson_progress
for update
to authenticated
using (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
)
with check (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
);

drop policy if exists "user_lesson_progress_delete_admin" on public.user_lesson_progress;
create policy "user_lesson_progress_delete_admin"
on public.user_lesson_progress
for delete
to authenticated
using (public.is_admin());

-- =============================================================================
-- 10) Policies: training plans
-- =============================================================================

drop policy if exists "training_plans_select_scope" on public.training_plans;
create policy "training_plans_select_scope"
on public.training_plans
for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
);

drop policy if exists "training_plans_insert_scope" on public.training_plans;
create policy "training_plans_insert_scope"
on public.training_plans
for insert
to authenticated
with check (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
);

drop policy if exists "training_plans_update_scope" on public.training_plans;
create policy "training_plans_update_scope"
on public.training_plans
for update
to authenticated
using (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
)
with check (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
);

drop policy if exists "training_plans_delete_admin" on public.training_plans;
create policy "training_plans_delete_admin"
on public.training_plans
for delete
to authenticated
using (public.is_admin());

drop policy if exists "training_plan_items_select_scope" on public.training_plan_items;
create policy "training_plan_items_select_scope"
on public.training_plan_items
for select
to authenticated
using (
  exists (
    select 1
    from public.training_plans p
    where p.id = training_plan_items.plan_id
      and (p.user_id = auth.uid() or public.can_coach_student(p.user_id))
  )
);

drop policy if exists "training_plan_items_insert_scope" on public.training_plan_items;
create policy "training_plan_items_insert_scope"
on public.training_plan_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.training_plans p
    where p.id = training_plan_items.plan_id
      and (p.user_id = auth.uid() or public.can_coach_student(p.user_id))
  )
);

drop policy if exists "training_plan_items_update_scope" on public.training_plan_items;
create policy "training_plan_items_update_scope"
on public.training_plan_items
for update
to authenticated
using (
  exists (
    select 1
    from public.training_plans p
    where p.id = training_plan_items.plan_id
      and (p.user_id = auth.uid() or public.can_coach_student(p.user_id))
  )
)
with check (
  exists (
    select 1
    from public.training_plans p
    where p.id = training_plan_items.plan_id
      and (p.user_id = auth.uid() or public.can_coach_student(p.user_id))
  )
);

drop policy if exists "training_plan_items_delete_admin" on public.training_plan_items;
create policy "training_plan_items_delete_admin"
on public.training_plan_items
for delete
to authenticated
using (public.is_admin());

-- =============================================================================
-- 11) Policies: achievements
-- =============================================================================

drop policy if exists "achievements_read_auth" on public.achievements;
create policy "achievements_read_auth"
on public.achievements
for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "achievements_admin_write" on public.achievements;
create policy "achievements_admin_write"
on public.achievements
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_achievements_select_scope" on public.user_achievements;
create policy "user_achievements_select_scope"
on public.user_achievements
for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_coach_student(user_id)
);

drop policy if exists "user_achievements_insert_scope" on public.user_achievements;
create policy "user_achievements_insert_scope"
on public.user_achievements
for insert
to authenticated
with check (
  public.can_coach_student(user_id)
  or user_id = auth.uid()
);

drop policy if exists "user_achievements_delete_admin" on public.user_achievements;
create policy "user_achievements_delete_admin"
on public.user_achievements
for delete
to authenticated
using (public.is_admin());

-- =============================================================================
-- 12) Policies: community feed
-- =============================================================================

drop policy if exists "community_posts_select_auth" on public.community_posts;
create policy "community_posts_select_auth"
on public.community_posts
for select
to authenticated
using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
on public.community_posts
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "community_posts_update_own_or_admin" on public.community_posts;
create policy "community_posts_update_own_or_admin"
on public.community_posts
for update
to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "community_posts_delete_own_or_admin" on public.community_posts;
create policy "community_posts_delete_own_or_admin"
on public.community_posts
for delete
to authenticated
using (author_id = auth.uid() or public.is_admin());

drop policy if exists "community_post_comments_select_auth" on public.community_post_comments;
create policy "community_post_comments_select_auth"
on public.community_post_comments
for select
to authenticated
using (true);

drop policy if exists "community_post_comments_insert_own" on public.community_post_comments;
create policy "community_post_comments_insert_own"
on public.community_post_comments
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "community_post_comments_update_own_or_admin" on public.community_post_comments;
create policy "community_post_comments_update_own_or_admin"
on public.community_post_comments
for update
to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "community_post_comments_delete_own_or_admin" on public.community_post_comments;
create policy "community_post_comments_delete_own_or_admin"
on public.community_post_comments
for delete
to authenticated
using (author_id = auth.uid() or public.is_admin());

drop policy if exists "community_post_reactions_select_auth" on public.community_post_reactions;
create policy "community_post_reactions_select_auth"
on public.community_post_reactions
for select
to authenticated
using (true);

drop policy if exists "community_post_reactions_insert_own" on public.community_post_reactions;
create policy "community_post_reactions_insert_own"
on public.community_post_reactions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "community_post_reactions_update_own" on public.community_post_reactions;
create policy "community_post_reactions_update_own"
on public.community_post_reactions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "community_post_reactions_delete_own_or_admin" on public.community_post_reactions;
create policy "community_post_reactions_delete_own_or_admin"
on public.community_post_reactions
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

-- =============================================================================
-- 13) Policies: commerce
-- =============================================================================

drop policy if exists "user_subscriptions_select_scope" on public.user_subscriptions;
create policy "user_subscriptions_select_scope"
on public.user_subscriptions
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_subscriptions_insert_admin" on public.user_subscriptions;
create policy "user_subscriptions_insert_admin"
on public.user_subscriptions
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "user_subscriptions_update_admin" on public.user_subscriptions;
create policy "user_subscriptions_update_admin"
on public.user_subscriptions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_subscriptions_delete_admin" on public.user_subscriptions;
create policy "user_subscriptions_delete_admin"
on public.user_subscriptions
for delete
to authenticated
using (public.is_admin());

drop policy if exists "commerce_orders_select_scope" on public.commerce_orders;
create policy "commerce_orders_select_scope"
on public.commerce_orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "commerce_orders_insert_scope" on public.commerce_orders;
create policy "commerce_orders_insert_scope"
on public.commerce_orders
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "commerce_orders_update_admin" on public.commerce_orders;
create policy "commerce_orders_update_admin"
on public.commerce_orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "commerce_orders_delete_admin" on public.commerce_orders;
create policy "commerce_orders_delete_admin"
on public.commerce_orders
for delete
to authenticated
using (public.is_admin());
