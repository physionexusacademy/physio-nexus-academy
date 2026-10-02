-- Physio Nexus Academy — Workshop Participant Portal
-- Additive migration only. No existing tables or rows are modified.

create table if not exists public.workshop_portal_sessions (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  registration_id uuid not null references public.workshop_registrations(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_workshop_portal_sessions_registration
  on public.workshop_portal_sessions(registration_id);

create index if not exists idx_workshop_portal_sessions_workshop
  on public.workshop_portal_sessions(workshop_id);

create index if not exists idx_workshop_portal_sessions_expires
  on public.workshop_portal_sessions(expires_at);

-- No public policies are created. Only the server-side service-role client
-- can validate participant sessions.
alter table public.workshop_portal_sessions enable row level security;
