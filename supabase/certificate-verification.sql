-- ═════════════════════════════════════════════════════════════════════
-- PNA CERTIFICATE VERIFICATION SYSTEM
-- Apply once in Supabase SQL Editor before enabling the UI.
-- Public users cannot list certificate records; exact-ID verification only.
-- ═════════════════════════════════════════════════════════════════════

create or replace function generate_certificate_id()
returns text
language sql
volatile
set search_path = public
as $$
  select
    'PNA-' ||
    to_char(current_date, 'YY') ||
    '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
$$;

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique default generate_certificate_id(),
  participant_name text not null check (length(trim(participant_name)) > 0),
  workshop_id uuid not null references workshops(id) on delete restrict,
  workshop_registration_id uuid unique references workshop_registrations(id) on delete set null,
  status text not null default 'valid' check (status in ('valid', 'revoked')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_certificates_workshop on certificates(workshop_id);
create index if not exists idx_certificates_status on certificates(status);
create index if not exists idx_certificates_participant_name on certificates(participant_name);

alter table certificates enable row level security;

drop policy if exists "Admin read certificates" on certificates;
create policy "Admin read certificates" on certificates
  for select using (is_admin());

drop policy if exists "Admin insert certificates" on certificates;
create policy "Admin insert certificates" on certificates
  for insert with check (is_admin());

drop policy if exists "Admin update certificates" on certificates;
create policy "Admin update certificates" on certificates
  for update using (is_admin()) with check (is_admin());

drop policy if exists "Admin delete certificates" on certificates;
create policy "Admin delete certificates" on certificates
  for delete using (is_admin());

create or replace function verify_certificate(p_certificate_id text)
returns table (
  certificate_id text,
  participant_name text,
  workshop_title text,
  start_date date,
  end_date date,
  contact_hours numeric,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.certificate_id,
    c.participant_name,
    w.title as workshop_title,
    w.start_date,
    w.end_date,
    w.cpd_hours as contact_hours,
    c.status
  from certificates c
  join workshops w on w.id = c.workshop_id
  where upper(c.certificate_id) = upper(trim(p_certificate_id))
  limit 1;
$$;

revoke all on function verify_certificate(text) from public;
grant execute on function verify_certificate(text) to anon, authenticated;
