-- ============================================================
-- PlanningPerm — Supabase schema
-- Run this in the Supabase SQL editor (Database > SQL editor)
--
-- If you get "already exists" errors, run the DROP lines first.
-- ============================================================

-- Drop old table if it exists with wrong schema (safe to re-run)
drop table if exists public.projects cascade;

-- Projects table: stores paid reports permanently
create table public.projects (
  id              uuid        primary key default gen_random_uuid(),
  user_email      text        not null,
  project_data    jsonb       not null,
  assessment_data jsonb       not null,
  payment_id      text        unique,   -- Paddle transaction ID
  created_at      timestamptz default now()
);

-- Index for quick lookup by email
create index projects_user_email_idx on public.projects (user_email);

-- Row-level security: users can only read their own projects
alter table public.projects enable row level security;

drop policy if exists "Users can view own projects" on public.projects;

create policy "Users can view own projects"
  on public.projects for select
  using (user_email = (auth.jwt() ->> 'email'));

-- Service role bypasses RLS automatically — no insert policy needed for API routes
