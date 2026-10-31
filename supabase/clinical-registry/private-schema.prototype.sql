-- PNA Clinical Registry: isolated private-record schema prototype.
-- LOCAL REVIEW ONLY. This is not a Supabase migration.
-- Generate the migration with the installed CLI after local review; never
-- apply this prototype to the live PNA website project.

begin;
create schema if not exists clinical_private;
revoke all on schema clinical_private from public, anon;
grant usage on schema clinical_private to authenticated;

create table if not exists clinical_private.therapist_memberships (
  user_id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  professional_title text not null check (length(trim(professional_title)) between 2 and 120),
  credentials text[] not null default '{}',
  registration_label text,
  registration_number text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','rejected')),
  is_active boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (verification_status <> 'verified' or verified_at is not null)
);

create table if not exists clinical_private.patients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  patient_reference text not null check (length(trim(patient_reference)) between 2 and 64),
  display_name text not null check (length(trim(display_name)) between 1 and 160),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, patient_reference)
);

create table if not exists clinical_private.clinical_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references clinical_private.patients(id) on delete restrict,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  category text not null check (length(trim(category)) between 2 and 100),
  condition text not null check (length(trim(condition)) between 2 and 180),
  status text not null default 'draft' check (status in ('draft','final','archived')),
  assessment_date date not null default current_date,
  initial_assessment jsonb not null default '{}'::jsonb,
  follow_up_assessments jsonb not null default '[]'::jsonb
    check (jsonb_typeof(follow_up_assessments) = 'array'),
  clinical_summary text,
  discharge_status text,
  recommendations text[] not null default '{}',
  finalised_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (status <> 'final' or finalised_at is not null)
);

create table if not exists clinical_private.clinical_interventions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references clinical_private.clinical_reports(id) on delete restrict,
  intervention_date date not null default current_date,
  intervention text not null check (length(trim(intervention)) between 2 and 240),
  body_region text,
  technique_or_parameters text,
  dosage text,
  response text,
  home_advice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinical_private.clinical_outcomes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references clinical_private.clinical_reports(id) on delete restrict,
  measured_at date not null default current_date,
  measure_code text not null check (length(trim(measure_code)) between 2 and 80),
  measure_name text not null check (length(trim(measure_name)) between 2 and 160),
  value numeric not null,
  unit text,
  scale_minimum numeric,
  scale_maximum numeric,
  direction text not null check (direction in ('lower_is_better','higher_is_better','descriptive')),
  created_at timestamptz not null default now(),
  check (scale_minimum is null or scale_maximum is null or scale_minimum <= scale_maximum),
  check (scale_minimum is null or value >= scale_minimum),
  check (scale_maximum is null or value <= scale_maximum)
);

create table if not exists clinical_private.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('INSERT','UPDATE')),
  entity_table text not null,
  entity_id uuid not null,
  changed_fields text[] not null default '{}',
  occurred_at timestamptz not null default now()
);

create index if not exists patients_owner_updated_idx
  on clinical_private.patients (owner_id, updated_at desc) where archived_at is null;
create index if not exists reports_owner_updated_idx
  on clinical_private.clinical_reports (owner_id, updated_at desc) where archived_at is null;
create index if not exists reports_patient_date_idx
  on clinical_private.clinical_reports (patient_id, assessment_date desc);
create index if not exists interventions_report_date_idx
  on clinical_private.clinical_interventions (report_id, intervention_date desc);
create index if not exists outcomes_report_measure_date_idx
  on clinical_private.clinical_outcomes (report_id, measure_code, measured_at);

alter table clinical_private.therapist_memberships enable row level security;
alter table clinical_private.therapist_memberships force row level security;
alter table clinical_private.patients enable row level security;
alter table clinical_private.patients force row level security;
alter table clinical_private.clinical_reports enable row level security;
alter table clinical_private.clinical_reports force row level security;
alter table clinical_private.clinical_interventions enable row level security;
alter table clinical_private.clinical_interventions force row level security;
alter table clinical_private.clinical_outcomes enable row level security;
alter table clinical_private.clinical_outcomes force row level security;
alter table clinical_private.audit_events enable row level security;
alter table clinical_private.audit_events force row level security;

create policy therapist_reads_own_membership on clinical_private.therapist_memberships
  for select to authenticated using (user_id = (select auth.uid()));

create policy verified_therapist_reads_own_patients on clinical_private.patients
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified'
    )
  );
create policy verified_therapist_creates_own_patients on clinical_private.patients
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified'
    )
  );
create policy verified_therapist_updates_own_patients on clinical_private.patients
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified'
    )
  ) with check (
    owner_id = (select auth.uid()) and exists (
      select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified'
    )
  );

create policy verified_therapist_reads_own_reports on clinical_private.clinical_reports
  for select to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified'
    )
  );
create policy verified_therapist_creates_own_reports on clinical_private.clinical_reports
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and exists (select 1 from clinical_private.patients p
      where p.id = patient_id and p.owner_id = (select auth.uid()))
    and exists (select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified')
  );
create policy verified_therapist_updates_own_reports on clinical_private.clinical_reports
  for update to authenticated using (
    owner_id = (select auth.uid()) and exists (
      select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified'
    )
  ) with check (
    owner_id = (select auth.uid())
    and exists (select 1 from clinical_private.patients p
      where p.id = patient_id and p.owner_id = (select auth.uid()))
    and exists (select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified')
  );

create policy owner_reads_interventions on clinical_private.clinical_interventions
  for select to authenticated using (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  ));
create policy owner_inserts_interventions on clinical_private.clinical_interventions
  for insert to authenticated with check (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  ));
create policy owner_updates_interventions on clinical_private.clinical_interventions
  for update to authenticated using (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  )) with check (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  ));

create policy owner_reads_outcomes on clinical_private.clinical_outcomes
  for select to authenticated using (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  ));
create policy owner_inserts_outcomes on clinical_private.clinical_outcomes
  for insert to authenticated with check (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  ));
create policy owner_updates_outcomes on clinical_private.clinical_outcomes
  for update to authenticated using (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  )) with check (exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = report_id and r.owner_id = (select auth.uid())
  ));

create policy therapist_reads_own_audit_events on clinical_private.audit_events
  for select to authenticated using (actor_id = (select auth.uid()));

revoke all on all tables in schema clinical_private from public, anon;
grant select on clinical_private.therapist_memberships to authenticated;
grant select, insert, update on clinical_private.patients to authenticated;
grant select, insert, update on clinical_private.clinical_reports to authenticated;
grant select, insert, update on clinical_private.clinical_interventions to authenticated;
grant select, insert, update on clinical_private.clinical_outcomes to authenticated;
grant select on clinical_private.audit_events to authenticated;
grant usage, select on all sequences in schema clinical_private to authenticated;
commit;
