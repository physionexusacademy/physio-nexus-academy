-- Weekly Clinical Quiz
-- Applied to production on 2026-09-27.
-- Static quiz questions stay in code; only small attempt records are stored here.

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null,
  full_name text not null check (char_length(trim(full_name)) between 2 and 80),
  email text not null check (lower(email) ~ '^[a-z0-9._%+\-]+@gmail\.com$'),
  email_key text not null,
  score smallint,
  total_questions smallint not null default 5 check (total_questions between 1 and 50),
  elapsed_ms integer check (elapsed_ms is null or elapsed_ms >= 0),
  status text not null default 'started' check (status in ('started','submitted','expired')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists quiz_attempts_one_gmail_per_quiz_idx
  on public.quiz_attempts (quiz_id, email_key);

create index if not exists quiz_attempts_leaderboard_idx
  on public.quiz_attempts (quiz_id, status, score desc, elapsed_ms asc);

alter table public.quiz_attempts enable row level security;

-- Public browser clients never query this table directly.
-- Quiz actions run server-side with the service role.
revoke all on table public.quiz_attempts from anon, authenticated;
grant all on table public.quiz_attempts to service_role;
