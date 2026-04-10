-- ============================================================
-- PlanningPerm — Supabase schema
-- Run this in the Supabase SQL editor (Database > SQL editor)
--
-- If you get "already exists" errors, run the DROP lines first.
-- ============================================================

-- Drop old table if it exists (safe to re-run)
drop table if exists public.projects cascade;

-- Projects table
-- Projects are saved when a user submits their email on the loading screen.
-- user_email is set at save time; auth session is established via magic link.
create table public.projects (
  id              uuid        primary key default gen_random_uuid(),
  user_email      text        not null,
  project_data    jsonb       not null,
  assessment_data jsonb       not null,
  payment_id      text        unique,   -- optional: Paddle transaction ID (nullable)
  created_at      timestamptz default now()
);

-- Index for quick lookup by email
create index projects_user_email_idx on public.projects (user_email);

-- Row-level security
alter table public.projects enable row level security;

drop policy if exists "Users can view own projects" on public.projects;

-- Authenticated users can view their own projects
create policy "Users can view own projects"
  on public.projects for select
  using (user_email = (auth.jwt() ->> 'email'));

-- Service role bypasses RLS automatically.
-- API routes use the service role key for:
--   - Inserting new projects (POST /api/auth/save-project)
--   - Fetching a project by UUID (GET /api/projects/[id]) — public access by UUID
