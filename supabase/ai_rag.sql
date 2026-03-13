-- Vovinam Learning — AI Coach RAG + Memory (Supabase pgvector)
--
-- Cách dùng (Supabase Dashboard → SQL Editor):
-- 1) Chạy supabase/rls.sql trước (RBAC helpers + profiles…)
-- 2) Chạy file này để tạo Vector DB + chat history

-- 0) Extensions
create extension if not exists pgcrypto;

-- pgvector (Supabase Vector)
create extension if not exists vector;

-- 1) Vector Knowledge Base (chunks)
-- Lưu ý: bảng này khuyến nghị chỉ ingest/đọc từ server (service role).
create table if not exists public.ai_knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,                    -- ex: 'manual', 'technique', 'video', ...
  source_id text null,                     -- ex: slug/id from source
  title text null,
  url text null,                           -- deep link in app (optional)
  content text not null,                   -- the chunk text
  metadata jsonb not null default '{}'::jsonb,
  belt_id text null,                       -- ex: 'lam-dai' | 'hoang-dai' | 'huyen-dai'
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

-- Vector index (cosine). Tune lists per your dataset size.
create index if not exists ai_knowledge_chunks_embedding_ivfflat
  on public.ai_knowledge_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists ai_knowledge_chunks_source_idx
  on public.ai_knowledge_chunks (source, source_id);

alter table public.ai_knowledge_chunks enable row level security;

-- Optional: allow Admin to browse/manage chunks from a Supabase client.
-- (Service role bypasses RLS anyway; keeping this minimal.)
drop policy if exists "ai_kb_admin_select" on public.ai_knowledge_chunks;
create policy "ai_kb_admin_select"
on public.ai_knowledge_chunks
for select
to authenticated
using (public.is_admin());

drop policy if exists "ai_kb_admin_write" on public.ai_knowledge_chunks;
create policy "ai_kb_admin_write"
on public.ai_knowledge_chunks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Semantic search RPC (cosine similarity)
create or replace function public.match_ai_knowledge_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  match_threshold float default 0.70,
  filter_source text default null,
  filter_belt_id text default null
)
returns table (
  id uuid,
  source text,
  source_id text,
  title text,
  url text,
  content text,
  metadata jsonb,
  belt_id text,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.source,
    c.source_id,
    c.title,
    c.url,
    c.content,
    c.metadata,
    c.belt_id,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  from public.ai_knowledge_chunks c
  where (1 - (c.embedding <=> query_embedding)) > match_threshold
    and (filter_source is null or c.source = filter_source)
    and (filter_belt_id is null or c.belt_id is null or c.belt_id = filter_belt_id)
  order by c.embedding <=> query_embedding
  limit greatest(1, match_count);
$$;

revoke all on function public.match_ai_knowledge_chunks(vector(1536), int, float, text, text) from public;
grant execute on function public.match_ai_knowledge_chunks(vector(1536), int, float, text, text) to authenticated;
grant execute on function public.match_ai_knowledge_chunks(vector(1536), int, float, text, text) to service_role;

-- 2) Chat history (memory)
create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_sessions_user_idx
  on public.ai_chat_sessions (user_id, updated_at desc);

create index if not exists ai_chat_messages_session_idx
  on public.ai_chat_messages (session_id, created_at asc);

alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

-- Sessions: user owns own data; coach/admin can read student sessions.
drop policy if exists "ai_chat_sessions_select_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_select_own"
on public.ai_chat_sessions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "ai_chat_sessions_write_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_write_own"
on public.ai_chat_sessions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "ai_chat_sessions_update_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_update_own"
on public.ai_chat_sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "ai_chat_sessions_delete_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_delete_own"
on public.ai_chat_sessions
for delete
to authenticated
using (user_id = auth.uid());

-- Coach/Admin read access (optional analytics/support)
drop policy if exists "ai_chat_sessions_select_coach" on public.ai_chat_sessions;
create policy "ai_chat_sessions_select_coach"
on public.ai_chat_sessions
for select
to authenticated
using (public.is_admin() or (public.is_coach() and public.can_coach_student(user_id)));

-- Messages: enforce session ownership
drop policy if exists "ai_chat_messages_select_own" on public.ai_chat_messages;
create policy "ai_chat_messages_select_own"
on public.ai_chat_messages
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.ai_chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

drop policy if exists "ai_chat_messages_insert_own" on public.ai_chat_messages;
create policy "ai_chat_messages_insert_own"
on public.ai_chat_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.ai_chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

drop policy if exists "ai_chat_messages_select_coach" on public.ai_chat_messages;
create policy "ai_chat_messages_select_coach"
on public.ai_chat_messages
for select
to authenticated
using (public.is_admin() or (public.is_coach() and public.can_coach_student(user_id)));
