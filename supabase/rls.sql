-- Vovinam Learning — Supabase RLS (User/Coach/Admin)
--
-- Cách dùng: mở Supabase Dashboard → SQL Editor → paste chạy file này.
-- Mục tiêu:
-- - User chỉ xem/sửa dữ liệu của chính mình (không xem được người khác)
-- - Coach chỉ thao tác trên học viên được phân công
-- - Admin full quyền + quản lý học phí
--
-- Lưu ý: Bạn cần tạo user qua Supabase Auth trước, rồi bootstrap 1 Admin bằng SQL ở cuối file.

-- 0) Extensions
create extension if not exists pgcrypto;

-- 1) Types
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'coach', 'admin');
  end if;
end
$$;

-- 2) Core tables
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  set_by uuid null,
  set_at timestamptz null
);

create table if not exists public.coach_students (
  coach_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coach_id, student_id)
);

-- Chỉ chứa thông tin "an toàn" (user có thể tự sửa). Các field nhạy cảm như đai/điểm nằm ở bảng khác.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nhạy cảm: cấp bậc đai/điểm… chỉ Coach/Admin được update.
create table if not exists public.student_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  belt_rank text not null default 'white',
  points integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users (id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null,
  present boolean not null default true,
  recorded_by uuid null references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  belt_target text not null,
  score numeric null,
  result text null,
  notes text null,
  recorded_by uuid null references auth.users (id),
  created_at timestamptz not null default now()
);

-- Admin quản lý học phí
create table if not exists public.tuition_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null,
  currency text not null default 'VND',
  paid_at date null,
  recorded_by uuid null references auth.users (id),
  created_at timestamptz not null default now()
);

-- 3) Helpers (SECURITY DEFINER)
-- Dùng function để tránh lặp logic và tránh recursion/policy pitfalls.
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.user_roles ur
    where ur.user_id = uid
      and ur.role = 'admin'
  );
$$;

create or replace function public.is_coach(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.user_roles ur
    where ur.user_id = uid
      and ur.role = 'coach'
  );
$$;

create or replace function public.can_coach_student(student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin(auth.uid())
     or exists(
          select 1
          from public.coach_students cs
          where cs.coach_id = auth.uid()
            and cs.student_id = student
        );
$$;

-- 4) Auto-provision rows on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  insert into public.student_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end
$$;

-- 5) Enable RLS
alter table public.user_roles enable row level security;
alter table public.coach_students enable row level security;
alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.attendance enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.tuition_payments enable row level security;

-- (Optional hardening) Uncomment if you want table owners to also obey RLS.
-- alter table public.user_roles force row level security;
-- alter table public.coach_students force row level security;
-- alter table public.profiles force row level security;
-- alter table public.student_progress force row level security;
-- alter table public.attendance force row level security;
-- alter table public.exam_attempts force row level security;
-- alter table public.tuition_payments force row level security;

-- 6) Policies
-- user_roles
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_roles_select_admin" on public.user_roles;
create policy "user_roles_select_admin"
on public.user_roles
for select
to authenticated
using (public.is_admin());

drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write"
on public.user_roles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update"
on public.user_roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete"
on public.user_roles
for delete
to authenticated
using (public.is_admin());

-- coach_students
drop policy if exists "coach_students_select_self" on public.coach_students;
create policy "coach_students_select_self"
on public.coach_students
for select
to authenticated
using (coach_id = auth.uid());

drop policy if exists "coach_students_select_admin" on public.coach_students;
create policy "coach_students_select_admin"
on public.coach_students
for select
to authenticated
using (public.is_admin());

drop policy if exists "coach_students_admin_write" on public.coach_students;
create policy "coach_students_admin_write"
on public.coach_students
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.can_coach_student(user_id)
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete"
on public.profiles
for delete
to authenticated
using (public.is_admin());

-- student_progress (belt_rank/points): ONLY coach/admin can update; student can only read own
drop policy if exists "progress_select" on public.student_progress;
create policy "progress_select"
on public.student_progress
for select
to authenticated
using (
  auth.uid() = user_id
  or public.can_coach_student(user_id)
);

drop policy if exists "progress_admin_insert" on public.student_progress;
create policy "progress_admin_insert"
on public.student_progress
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "progress_update_coach_admin" on public.student_progress;
create policy "progress_update_coach_admin"
on public.student_progress
for update
to authenticated
using (public.can_coach_student(user_id))
with check (public.can_coach_student(user_id));

drop policy if exists "progress_delete_admin" on public.student_progress;
create policy "progress_delete_admin"
on public.student_progress
for delete
to authenticated
using (public.is_admin());

-- attendance
drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select"
on public.attendance
for select
to authenticated
using (
  auth.uid() = student_id
  or public.can_coach_student(student_id)
);

drop policy if exists "attendance_write" on public.attendance;
create policy "attendance_write"
on public.attendance
for insert
to authenticated
with check (public.can_coach_student(student_id));

drop policy if exists "attendance_update" on public.attendance;
create policy "attendance_update"
on public.attendance
for update
to authenticated
using (public.can_coach_student(student_id))
with check (public.can_coach_student(student_id));

drop policy if exists "attendance_delete" on public.attendance;
create policy "attendance_delete"
on public.attendance
for delete
to authenticated
using (public.can_coach_student(student_id));

-- exam_attempts
drop policy if exists "exams_select" on public.exam_attempts;
create policy "exams_select"
on public.exam_attempts
for select
to authenticated
using (
  auth.uid() = student_id
  or public.can_coach_student(student_id)
);

drop policy if exists "exams_insert" on public.exam_attempts;
create policy "exams_insert"
on public.exam_attempts
for insert
to authenticated
with check (public.can_coach_student(student_id));

drop policy if exists "exams_update" on public.exam_attempts;
create policy "exams_update"
on public.exam_attempts
for update
to authenticated
using (public.can_coach_student(student_id))
with check (public.can_coach_student(student_id));

drop policy if exists "exams_delete" on public.exam_attempts;
create policy "exams_delete"
on public.exam_attempts
for delete
to authenticated
using (public.can_coach_student(student_id));

-- tuition_payments (admin only write; student can read own)
drop policy if exists "tuition_select" on public.tuition_payments;
create policy "tuition_select"
on public.tuition_payments
for select
to authenticated
using (
  auth.uid() = student_id
  or public.is_admin()
);

drop policy if exists "tuition_admin_write" on public.tuition_payments;
create policy "tuition_admin_write"
on public.tuition_payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 7) Grants (explicit — avoid "Public" access by accident)
revoke all on public.user_roles from anon, authenticated;
revoke all on public.coach_students from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.student_progress from anon, authenticated;
revoke all on public.attendance from anon, authenticated;
revoke all on public.exam_attempts from anon, authenticated;
revoke all on public.tuition_payments from anon, authenticated;

grant select on public.user_roles to authenticated;
grant select, insert, update, delete on public.coach_students to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.student_progress to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;
grant select, insert, update, delete on public.exam_attempts to authenticated;
grant select, insert, update, delete on public.tuition_payments to authenticated;

-- 8) Bootstrap (chạy SAU khi bạn tạo user Admin qua Supabase Auth)
-- Thay <ADMIN_UUID> bằng UUID của user (Auth → Users → copy UUID)
-- insert into public.user_roles (user_id, role, set_by, set_at)
-- values ('<ADMIN_UUID>', 'admin', '<ADMIN_UUID>', now())
-- on conflict (user_id) do update set role = excluded.role, set_by = excluded.set_by, set_at = excluded.set_at, updated_at = now();

-- Gán học viên cho coach (Admin chạy)
-- insert into public.coach_students (coach_id, student_id)
-- values ('<COACH_UUID>', '<STUDENT_UUID>')
-- on conflict do nothing;
