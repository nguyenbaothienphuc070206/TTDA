-- Community direct messages (enterprise baseline)
-- Run in Supabase SQL editor after rls.sql

create extension if not exists pgcrypto;

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz null,
  constraint community_messages_not_self check (sender_id <> recipient_id),
  constraint community_messages_body_len check (char_length(body) between 1 and 1200)
);

create table if not exists public.community_typing_state (
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (sender_id, recipient_id),
  constraint community_typing_state_not_self check (sender_id <> recipient_id)
);

create index if not exists community_messages_sender_created_idx
  on public.community_messages (sender_id, created_at desc);

create index if not exists community_messages_recipient_created_idx
  on public.community_messages (recipient_id, created_at desc);

create index if not exists community_messages_pair_created_idx
  on public.community_messages (sender_id, recipient_id, created_at desc);

create index if not exists community_typing_state_recipient_updated_idx
  on public.community_typing_state (recipient_id, updated_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_typing_state'
  ) then
    alter publication supabase_realtime add table public.community_typing_state;
  end if;
end
$$;

alter table public.community_messages enable row level security;
alter table public.community_typing_state enable row level security;

drop policy if exists "community_messages_select_own" on public.community_messages;
create policy "community_messages_select_own"
on public.community_messages
for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "community_messages_insert_sender" on public.community_messages;
create policy "community_messages_insert_sender"
on public.community_messages
for insert
to authenticated
with check (auth.uid() = sender_id and sender_id <> recipient_id);

drop policy if exists "community_messages_update_recipient_read" on public.community_messages;
create policy "community_messages_update_recipient_read"
on public.community_messages
for update
to authenticated
using (auth.uid() = recipient_id)
with check (
  auth.uid() = recipient_id
  and sender_id <> recipient_id
);

drop policy if exists "community_typing_state_select_own" on public.community_typing_state;
create policy "community_typing_state_select_own"
on public.community_typing_state
for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "community_typing_state_insert_sender" on public.community_typing_state;
create policy "community_typing_state_insert_sender"
on public.community_typing_state
for insert
to authenticated
with check (auth.uid() = sender_id and sender_id <> recipient_id);

drop policy if exists "community_typing_state_update_sender" on public.community_typing_state;
create policy "community_typing_state_update_sender"
on public.community_typing_state
for update
to authenticated
using (auth.uid() = sender_id)
with check (auth.uid() = sender_id and sender_id <> recipient_id);