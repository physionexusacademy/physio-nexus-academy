-- Physio Nexus Academy — Workshop Final Assessment
-- Additive migration. Existing registrations and quiz data are not modified.

alter table public.workshops
  add column if not exists assessment_open boolean not null default false;

create table if not exists public.workshop_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  registration_id uuid not null references public.workshop_registrations(id) on delete cascade,
  score smallint,
  total_questions smallint not null default 30,
  elapsed_ms integer,
  status text not null default 'started'
    check (status in ('started','submitted','expired')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workshop_id, registration_id)
);

create index if not exists idx_workshop_assessment_attempts_workshop
  on public.workshop_assessment_attempts(workshop_id);

create index if not exists idx_workshop_assessment_attempts_status
  on public.workshop_assessment_attempts(status);

create index if not exists idx_workshop_assessment_attempts_registration
  on public.workshop_assessment_attempts(registration_id);

create index if not exists idx_workshop_assessment_attempts_submitted
  on public.workshop_assessment_attempts(workshop_id, score desc, elapsed_ms asc);

alter table public.workshop_assessment_attempts enable row level security;

grant select, insert, update, delete
  on table public.workshop_assessment_attempts to service_role;

revoke all on table public.workshop_assessment_attempts from anon, authenticated;
