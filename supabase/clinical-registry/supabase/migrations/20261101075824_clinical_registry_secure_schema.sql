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
create schema if not exists clinical_api;
revoke all on schema clinical_api from public, anon;
grant usage on schema clinical_api to authenticated;

create or replace function clinical_api.list_my_patients(p_search text default null)
returns table (
  id uuid,
  patient_reference text,
  display_name text,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id, p.patient_reference, p.display_name, p.updated_at
  from clinical_private.patients p
  where p.owner_id = (select auth.uid())
    and p.archived_at is null
    and (
      nullif(trim(p_search), '') is null
      or p.patient_reference ilike '%' || trim(p_search) || '%'
      or p.display_name ilike '%' || trim(p_search) || '%'
    )
  order by p.updated_at desc
  limit 100;
$$;

create or replace function clinical_api.create_patient(
  p_patient_reference text,
  p_display_name text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  insert into clinical_private.patients (owner_id, patient_reference, display_name)
  values ((select auth.uid()), trim(p_patient_reference), trim(p_display_name))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function clinical_api.list_my_reports(p_patient_id uuid default null)
returns table (
  report_id uuid,
  patient_id uuid,
  patient_reference text,
  patient_display_name text,
  category text,
  condition text,
  status text,
  assessment_date date,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select r.id, r.patient_id, p.patient_reference, p.display_name,
         r.category, r.condition, r.status, r.assessment_date, r.updated_at
  from clinical_private.clinical_reports r
  join clinical_private.patients p on p.id = r.patient_id
  where r.owner_id = (select auth.uid())
    and r.archived_at is null
    and p.archived_at is null
    and (p_patient_id is null or r.patient_id = p_patient_id)
  order by r.updated_at desc
  limit 200;
$$;

create or replace function clinical_api.create_report(
  p_patient_id uuid,
  p_category text,
  p_condition text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  insert into clinical_private.clinical_reports
    (patient_id, owner_id, category, condition)
  values
    (p_patient_id, (select auth.uid()), trim(p_category), trim(p_condition))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function clinical_api.get_my_report(p_report_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', r.id,
    'patient', jsonb_build_object(
      'id', p.id,
      'patientReference', p.patient_reference,
      'displayName', p.display_name
    ),
    'category', r.category,
    'condition', r.condition,
    'status', r.status,
    'assessmentDate', r.assessment_date,
    'initialAssessment', r.initial_assessment,
    'followUpAssessments', r.follow_up_assessments,
    'clinicalSummary', r.clinical_summary,
    'dischargeStatus', r.discharge_status,
    'recommendations', to_jsonb(r.recommendations),
    'interventions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'date', i.intervention_date, 'intervention', i.intervention,
        'bodyRegion', i.body_region, 'techniqueOrParameters', i.technique_or_parameters,
        'dosage', i.dosage, 'response', i.response, 'homeAdvice', i.home_advice
      ) order by i.intervention_date, i.created_at)
      from clinical_private.clinical_interventions i
      where i.report_id = r.id
    ), '[]'::jsonb),
    'outcomes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id, 'date', o.measured_at, 'measureCode', o.measure_code,
        'measureName', o.measure_name, 'value', o.value, 'unit', o.unit,
        'scaleMinimum', o.scale_minimum, 'scaleMaximum', o.scale_maximum,
        'direction', o.direction
      ) order by o.measured_at, o.created_at)
      from clinical_private.clinical_outcomes o
      where o.report_id = r.id
    ), '[]'::jsonb),
    'createdAt', r.created_at,
    'updatedAt', r.updated_at
  )
  from clinical_private.clinical_reports r
  join clinical_private.patients p on p.id = r.patient_id
  where r.id = p_report_id
    and r.owner_id = (select auth.uid())
    and r.archived_at is null;
$$;

create or replace function clinical_api.save_initial_assessment(
  p_report_id uuid,
  p_assessment jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_assessment) <> 'object' then
    raise exception 'Assessment must be a JSON object' using errcode = '22023';
  end if;
  update clinical_private.clinical_reports
  set initial_assessment = p_assessment, updated_at = now()
  where id = p_report_id and owner_id = (select auth.uid())
    and status = 'draft' and archived_at is null;
  return found;
end;
$$;

create or replace function clinical_api.add_followup_assessment(
  p_report_id uuid,
  p_assessment jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_assessment) <> 'object' then
    raise exception 'Follow-up assessment must be a JSON object' using errcode = '22023';
  end if;
  update clinical_private.clinical_reports
  set follow_up_assessments = follow_up_assessments || jsonb_build_array(p_assessment),
      updated_at = now()
  where id = p_report_id and owner_id = (select auth.uid())
    and status = 'draft' and archived_at is null;
  return found;
end;
$$;

create or replace function clinical_api.add_intervention(
  p_report_id uuid,
  p_intervention text,
  p_body_region text default null,
  p_technique_or_parameters text default null,
  p_dosage text default null,
  p_response text default null,
  p_home_advice text default null,
  p_intervention_date date default current_date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into clinical_private.clinical_interventions (
    report_id, intervention, body_region, technique_or_parameters,
    dosage, response, home_advice, intervention_date
  )
  select r.id, trim(p_intervention), p_body_region, p_technique_or_parameters,
         p_dosage, p_response, p_home_advice, p_intervention_date
  from clinical_private.clinical_reports r
  where r.id = p_report_id and r.owner_id = (select auth.uid())
    and r.status = 'draft' and r.archived_at is null
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function clinical_api.add_outcome(
  p_report_id uuid,
  p_measure_code text,
  p_measure_name text,
  p_value numeric,
  p_direction text,
  p_unit text default null,
  p_scale_minimum numeric default null,
  p_scale_maximum numeric default null,
  p_measured_at date default current_date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into clinical_private.clinical_outcomes (
    report_id, measure_code, measure_name, value, direction,
    unit, scale_minimum, scale_maximum, measured_at
  )
  select r.id, trim(p_measure_code), trim(p_measure_name), p_value, p_direction,
         p_unit, p_scale_minimum, p_scale_maximum, p_measured_at
  from clinical_private.clinical_reports r
  where r.id = p_report_id and r.owner_id = (select auth.uid())
    and r.status = 'draft' and r.archived_at is null
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function clinical_api.finalise_report(p_report_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update clinical_private.clinical_reports r
  set status = 'final', finalised_at = now(), updated_at = now()
  where r.id = p_report_id
    and r.owner_id = (select auth.uid())
    and r.status = 'draft'
    and r.archived_at is null
    and exists (
      select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid())
        and tm.is_active and tm.verification_status = 'verified'
    );
  return found;
end;
$$;

create or replace function clinical_api.archive_my_report(p_report_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update clinical_private.clinical_reports
  set status = 'archived', archived_at = now(), updated_at = now()
  where id = p_report_id and owner_id = (select auth.uid())
    and archived_at is null;
  return found;
end;
$$;

create or replace function clinical_api.archive_my_patient(p_patient_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update clinical_private.patients
  set archived_at = now(), updated_at = now()
  where id = p_patient_id and owner_id = (select auth.uid())
    and archived_at is null
    and not exists (
      select 1 from clinical_private.clinical_reports r
      where r.patient_id = p_patient_id and r.status <> 'archived'
    );
  return found;
end;
$$;


-- Owner-scoped editing and export RPCs. Private tables remain outside the
-- PostgREST exposed-schema list; these functions are the application boundary.
create or replace function clinical_api.update_patient(
  p_patient_id uuid, p_patient_reference text, p_display_name text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $update_patient$
begin
  update clinical_private.patients
  set patient_reference = trim(p_patient_reference),
      display_name = trim(p_display_name),
      updated_at = now()
  where id = p_patient_id and owner_id = (select auth.uid())
    and archived_at is null;
  return found;
end;
$update_patient$;

create or replace function clinical_api.update_report_details(
  p_report_id uuid,
  p_category text,
  p_condition text,
  p_clinical_summary text,
  p_discharge_status text,
  p_recommendations text[]
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $update_report$
begin
  update clinical_private.clinical_reports
  set category = trim(p_category),
      condition = trim(p_condition),
      clinical_summary = nullif(trim(p_clinical_summary), ''),
      discharge_status = nullif(trim(p_discharge_status), ''),
      recommendations = coalesce(p_recommendations, '{}'::text[]),
      updated_at = now()
  where id = p_report_id and owner_id = (select auth.uid())
    and status = 'draft' and archived_at is null;
  return found;
end;
$update_report$;

create or replace function clinical_api.update_intervention(
  p_intervention_id uuid,
  p_intervention text,
  p_body_region text default null,
  p_technique_or_parameters text default null,
  p_dosage text default null,
  p_response text default null,
  p_home_advice text default null,
  p_intervention_date date default current_date
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $update_intervention$
begin
  update clinical_private.clinical_interventions i
  set intervention = trim(p_intervention),
      body_region = p_body_region,
      technique_or_parameters = p_technique_or_parameters,
      dosage = p_dosage,
      response = p_response,
      home_advice = p_home_advice,
      intervention_date = p_intervention_date,
      updated_at = now()
  where i.id = p_intervention_id
    and exists (select 1 from clinical_private.clinical_reports r
      where r.id = i.report_id and r.owner_id = (select auth.uid())
        and r.status = 'draft' and r.archived_at is null);
  return found;
end;
$update_intervention$;

create or replace function clinical_api.update_outcome(
  p_outcome_id uuid,
  p_measure_code text,
  p_measure_name text,
  p_value numeric,
  p_direction text,
  p_unit text default null,
  p_scale_minimum numeric default null,
  p_scale_maximum numeric default null,
  p_measured_at date default current_date
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $update_outcome$
begin
  update clinical_private.clinical_outcomes o
  set measure_code = trim(p_measure_code),
      measure_name = trim(p_measure_name),
      value = p_value,
      direction = p_direction,
      unit = p_unit,
      scale_minimum = p_scale_minimum,
      scale_maximum = p_scale_maximum,
      measured_at = p_measured_at
  where o.id = p_outcome_id
    and exists (select 1 from clinical_private.clinical_reports r
      where r.id = o.report_id and r.owner_id = (select auth.uid())
        and r.status = 'draft' and r.archived_at is null);
  return found;
end;
$update_outcome$;

create or replace function clinical_api.export_my_patient_record(p_patient_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $export_patient$
  select jsonb_build_object(
    'patient', jsonb_build_object(
      'id', p.id,
      'patientReference', p.patient_reference,
      'displayName', p.display_name,
      'createdAt', p.created_at,
      'updatedAt', p.updated_at
    ),
    'reports', coalesce((
      select jsonb_agg(clinical_api.get_my_report(r.id) order by r.assessment_date desc, r.created_at desc)
      from clinical_private.clinical_reports r
      where r.patient_id = p.id and r.owner_id = (select auth.uid())
        and r.archived_at is null
    ), '[]'::jsonb)
  )
  from clinical_private.patients p
  where p.id = p_patient_id and p.owner_id = (select auth.uid())
    and p.archived_at is null;
$export_patient$;

create or replace function clinical_api.my_therapist_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $therapist_status$
  select jsonb_build_object(
    'fullName', tm.full_name,
    'professionalTitle', tm.professional_title,
    'credentials', to_jsonb(tm.credentials),
    'registrationLabel', tm.registration_label,
    'verificationStatus', tm.verification_status,
    'isActive', tm.is_active,
    'verifiedAt', tm.verified_at
  )
  from clinical_private.therapist_memberships tm
  where tm.user_id = (select auth.uid())
$therapist_status$;
revoke all on all functions in schema clinical_api from public, anon;
grant execute on all functions in schema clinical_api to authenticated;

-- Append-only consent history. Clinical-care consent and public-case publication
-- consent are separate purposes; withdrawal is recorded as a new event.
create table if not exists clinical_private.patient_consent_events (
  id uuid primary key default gen_random_uuid(),
  event_sequence bigint generated always as identity unique,
  patient_id uuid not null references clinical_private.patients(id) on delete restrict,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  purpose text not null check (purpose in ('clinical_care','public_case_publication')),
  consent_status text not null check (consent_status in ('granted','withdrawn')),
  consent_version text not null check (length(trim(consent_version)) between 1 and 40),
  capture_method text not null check (capture_method in ('written','electronic','documented_verbal')),
  captured_at timestamptz not null default clock_timestamp(),
  prior_event_id uuid references clinical_private.patient_consent_events(id) on delete restrict,
  check (prior_event_id is null or prior_event_id <> id)
);

create index if not exists consent_patient_purpose_date_idx
  on clinical_private.patient_consent_events(patient_id, purpose, captured_at desc);

alter table clinical_private.patient_consent_events enable row level security;
alter table clinical_private.patient_consent_events force row level security;
create policy owner_reads_consent_history on clinical_private.patient_consent_events
  for select to authenticated using (owner_id = (select auth.uid()));
create policy verified_owner_records_consent on clinical_private.patient_consent_events
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and exists (select 1 from clinical_private.patients p
      where p.id = patient_id and p.owner_id = (select auth.uid()))
    and exists (select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified')
  );
revoke all on clinical_private.patient_consent_events from public, anon;
grant select, insert on clinical_private.patient_consent_events to authenticated;

create or replace function clinical_private.validate_consent_prior_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $consent_prior_guard$
begin
  if new.prior_event_id is not null and not exists (
    select 1 from clinical_private.patient_consent_events prior
    where prior.id = new.prior_event_id
      and prior.patient_id = new.patient_id
      and prior.owner_id = new.owner_id
      and prior.purpose = new.purpose
  ) then
    raise exception 'Consent event reference must belong to the same patient and purpose' using errcode = '42501';
  end if;
  return new;
end;
$consent_prior_guard$;
drop trigger if exists consent_prior_event_guard on clinical_private.patient_consent_events;
create trigger consent_prior_event_guard before insert on clinical_private.patient_consent_events
for each row execute function clinical_private.validate_consent_prior_event();
-- Consent is required before a new clinical report can be created.
create or replace function clinical_private.require_current_care_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from clinical_private.patient_consent_events ce
    where ce.patient_id = new.patient_id
      and ce.owner_id = new.owner_id
      and ce.purpose = 'clinical_care'
      and ce.consent_status = 'granted'
      and not exists (
        select 1 from clinical_private.patient_consent_events later
        where later.patient_id = ce.patient_id
          and later.owner_id = ce.owner_id
          and later.purpose = ce.purpose
          and later.event_sequence > ce.event_sequence
      )
  ) then
    raise exception 'Current clinical-care consent is required before creating a report'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists reports_require_care_consent on clinical_private.clinical_reports;
create trigger reports_require_care_consent
before insert on clinical_private.clinical_reports
for each row execute function clinical_private.require_current_care_consent();

-- Append-only correction requests. Actual record correction is performed only
-- after a separately authorised review; the original clinical record is not erased.
create table if not exists clinical_private.correction_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  patient_id uuid not null references clinical_private.patients(id) on delete restrict,
  report_id uuid references clinical_private.clinical_reports(id) on delete restrict,
  target_type text not null check (target_type in ('patient','report','intervention','outcome')),
  target_id uuid not null,
  reason text not null check (length(trim(reason)) between 5 and 2000),
  requested_changes jsonb not null check (jsonb_typeof(requested_changes) = 'object'),
  requested_at timestamptz not null default now(),
  check ((target_type = 'patient' and report_id is null)
      or (target_type <> 'patient' and report_id is not null))
);
create index if not exists correction_requests_owner_date_idx
  on clinical_private.correction_requests(owner_id, requested_at desc);
alter table clinical_private.correction_requests enable row level security;
alter table clinical_private.correction_requests force row level security;
create policy owner_reads_correction_requests on clinical_private.correction_requests
  for select to authenticated using (owner_id = (select auth.uid()));
create policy owner_submits_correction_requests on clinical_private.correction_requests
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and exists (select 1 from clinical_private.patients p
      where p.id = patient_id and p.owner_id = (select auth.uid()))
    and (report_id is null or exists (
      select 1 from clinical_private.clinical_reports r
      where r.id = report_id and r.patient_id = patient_id
        and r.owner_id = (select auth.uid())
    ))
  );
revoke all on clinical_private.correction_requests from public, anon;
grant select, insert on clinical_private.correction_requests to authenticated;

create table if not exists clinical_private.correction_resolution_events (
  id uuid primary key default gen_random_uuid(),
  correction_request_id uuid not null unique references clinical_private.correction_requests(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  resolution text not null check (resolution in ('applied')) ,
  resolution_summary text not null check (length(trim(resolution_summary)) between 5 and 1000),
  occurred_at timestamptz not null default clock_timestamp()
);
alter table clinical_private.correction_resolution_events enable row level security;
alter table clinical_private.correction_resolution_events force row level security;
create policy owner_reads_correction_resolutions on clinical_private.correction_resolution_events
  for select to authenticated using (owner_id = (select auth.uid()));
create policy owner_records_correction_resolution on clinical_private.correction_resolution_events
  for insert to authenticated with check (owner_id = (select auth.uid()) and exists (
    select 1 from clinical_private.correction_requests cr
    where cr.id = correction_request_id and cr.owner_id = (select auth.uid())
  ));
revoke all on clinical_private.correction_resolution_events from public, anon;
grant select, insert on clinical_private.correction_resolution_events to authenticated;
-- Public case library staging table. It stores only deliberately de-identified
-- narrative fields. It never exposes patient IDs, report IDs, therapist IDs,
-- patient references, contact details or raw assessments.
create table if not exists clinical_private.case_library_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  report_id uuid not null references clinical_private.clinical_reports(id) on delete restrict,
  patient_id uuid not null references clinical_private.patients(id) on delete restrict,
  publication_consent_event_id uuid not null references clinical_private.patient_consent_events(id) on delete restrict,
  case_title text not null check (length(trim(case_title)) between 5 and 180),
  condition_label text not null check (length(trim(condition_label)) between 2 and 160),
  age_band text check (age_band in ('child','adolescent','18-29','30-44','45-59','60-74','75+','not_reported')),
  clinical_context text not null check (length(trim(clinical_context)) between 20 and 5000),
  intervention_summary text not null check (length(trim(intervention_summary)) between 20 and 5000),
  outcome_summary text not null check (length(trim(outcome_summary)) between 20 and 5000),
  evidence_reference text,
  deidentified_confirmed boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft','submitted','approved','rejected','published','withdrawn')),
  reviewer_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists case_library_publication_idx
  on clinical_private.case_library_entries(published_at desc)
  where status = 'published';
create index if not exists case_library_owner_idx
  on clinical_private.case_library_entries(owner_id, updated_at desc);

alter table clinical_private.case_library_entries enable row level security;
alter table clinical_private.case_library_entries force row level security;
create policy owner_reads_own_case_submissions on clinical_private.case_library_entries
  for select to authenticated using (owner_id = (select auth.uid()));
create policy verified_owner_creates_case_submissions on clinical_private.case_library_entries
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and status = 'draft'
    and exists (select 1 from clinical_private.clinical_reports r
      where r.id = report_id and r.patient_id = patient_id
        and r.owner_id = (select auth.uid()) and r.status = 'final')
    and exists (select 1 from clinical_private.patients p
      where p.id = patient_id and p.owner_id = (select auth.uid()))
    and exists (select 1 from clinical_private.patient_consent_events ce
      where ce.id = publication_consent_event_id
        and ce.patient_id = patient_id and ce.owner_id = (select auth.uid())
        and ce.purpose = 'public_case_publication'
        and ce.consent_status = 'granted')
    and exists (select 1 from clinical_private.therapist_memberships tm
      where tm.user_id = (select auth.uid()) and tm.is_active
        and tm.verification_status = 'verified')
  );
create policy owner_updates_own_case_drafts on clinical_private.case_library_entries
  for update to authenticated using (
    owner_id = (select auth.uid()) and status = 'draft'
  ) with check (
    owner_id = (select auth.uid()) and status = 'draft'
  );
revoke all on clinical_private.case_library_entries from public, anon;
grant select, insert, update on clinical_private.case_library_entries to authenticated;

-- RPC boundary for creating and listing owner-owned case submissions.
create or replace function clinical_api.create_case_draft(
  p_report_id uuid, p_publication_consent_event_id uuid,
  p_case_title text, p_condition_label text, p_age_band text,
  p_clinical_context text, p_intervention_summary text, p_outcome_summary text,
  p_evidence_reference text default null, p_deidentified_confirmed boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $create_case_draft$
declare
  v_id uuid;
begin
  insert into clinical_private.case_library_entries(
    owner_id, report_id, patient_id, publication_consent_event_id,
    case_title, condition_label, age_band, clinical_context,
    intervention_summary, outcome_summary, evidence_reference, deidentified_confirmed
  )
  select (select auth.uid()), r.id, r.patient_id, p_publication_consent_event_id,
    trim(p_case_title), trim(p_condition_label), p_age_band,
    trim(p_clinical_context), trim(p_intervention_summary), trim(p_outcome_summary),
    nullif(trim(p_evidence_reference), ''), coalesce(p_deidentified_confirmed, false)
  from clinical_private.clinical_reports r
  where r.id = p_report_id and r.owner_id = (select auth.uid())
    and r.status = 'final' and r.archived_at is null
  returning id into v_id;
  return v_id;
end;
$create_case_draft$;

create or replace function clinical_api.list_my_case_submissions()
returns table(case_id uuid, patient_id uuid, case_title text, status text, reviewer_note text,
  submitted_at timestamptz, reviewed_at timestamptz, published_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $list_my_cases$
  select c.id, c.patient_id, c.case_title, c.status, c.reviewer_note,
    c.submitted_at, c.reviewed_at, c.published_at
  from clinical_private.case_library_entries c
  where c.owner_id = (select auth.uid())
  order by c.updated_at desc
  limit 100
$list_my_cases$;
-- Prevent a therapist from changing review/publication state directly.
create or replace function clinical_private.guard_case_library_workflow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer boolean := coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
    or coalesce(auth.role() = 'service_role', false);
  v_submit_rpc boolean := current_setting('app.registry_submission_rpc', true) = 'on';
  v_withdraw_rpc boolean := current_setting('app.registry_withdraw_rpc', true) = 'on';
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'New case submissions must start as draft' using errcode = '42501';
    end if;
  elsif not v_reviewer then
    if v_submit_rpc and old.status = 'draft' and new.status = 'submitted' then
      null;
    elsif v_withdraw_rpc and old.status in ('draft','submitted','approved','published')
      and new.status = 'withdrawn' and old.owner_id = (select auth.uid()) then
      null;
    elsif old.status <> 'draft' or new.status <> 'draft'
      or new.owner_id <> old.owner_id
      or new.report_id <> old.report_id
      or new.patient_id <> old.patient_id
      or new.publication_consent_event_id <> old.publication_consent_event_id then
      raise exception 'Only an authorised reviewer can change case workflow state'
        using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists case_library_workflow_guard on clinical_private.case_library_entries;
create trigger case_library_workflow_guard
before insert or update on clinical_private.case_library_entries
for each row execute function clinical_private.guard_case_library_workflow();

-- Only the owner may submit a de-identification attested draft for review.
create or replace function clinical_api.submit_case_for_review(p_case_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $submit$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  perform set_config('app.registry_submission_rpc', 'on', true);
  update clinical_private.case_library_entries
  set status = 'submitted', submitted_at = now(), updated_at = now()
  where id = p_case_id and owner_id = (select auth.uid())
    and status = 'draft' and deidentified_confirmed;
  return found;
end;
$submit$;

-- Reviewer role must be assigned in trusted app_metadata by the Registry
-- operator; ordinary user-editable metadata is not accepted.
create or replace function clinical_api.review_case_submission(
  p_case_id uuid, p_decision text, p_reviewer_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
    or coalesce(auth.role() = 'service_role', false)
  ) then
    raise exception 'Registry reviewer permission required' using errcode = '42501';
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected' using errcode = '22023';
  end if;
  update clinical_private.case_library_entries
  set status = p_decision, reviewer_note = left(p_reviewer_note, 2000),
      reviewed_at = now(), updated_at = now()
  where id = p_case_id and status = 'submitted';
  return found;
end;
$$;

create or replace function clinical_api.publish_approved_case(p_case_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
    or coalesce(auth.role() = 'service_role', false)
  ) then
    raise exception 'Registry reviewer permission required' using errcode = '42501';
  end if;
  update clinical_private.case_library_entries
  set status = 'published', published_at = now(), updated_at = now()
  where id = p_case_id and status = 'approved'
    and exists (
      select 1 from clinical_private.patient_consent_events ce
      where ce.id = publication_consent_event_id
        and ce.consent_status = 'granted'
        and ce.purpose = 'public_case_publication'
        and not exists (
          select 1 from clinical_private.patient_consent_events later
          where later.patient_id = ce.patient_id and later.owner_id = ce.owner_id
            and later.purpose = ce.purpose and later.captured_at > ce.captured_at
        )
    );
  return found;
end;
$$;



-- Validate correction target linkage and keep requests immutable.
create or replace function clinical_private.validate_correction_target()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.target_type = 'patient' and new.target_id <> new.patient_id then
    raise exception 'Patient correction target must match patient_id' using errcode = '22023';
  elsif new.target_type = 'report' and not exists (
    select 1 from clinical_private.clinical_reports r
    where r.id = new.target_id and r.id = new.report_id and r.patient_id = new.patient_id
      and r.owner_id = new.owner_id
  ) then
    raise exception 'Report correction target does not match the owned report' using errcode = '42501';
  elsif new.target_type = 'intervention' and not exists (
    select 1 from clinical_private.clinical_interventions i
    join clinical_private.clinical_reports r on r.id = i.report_id
    where i.id = new.target_id and i.report_id = new.report_id
      and r.patient_id = new.patient_id and r.owner_id = new.owner_id
  ) then
    raise exception 'Intervention correction target does not match the owned report' using errcode = '42501';
  elsif new.target_type = 'outcome' and not exists (
    select 1 from clinical_private.clinical_outcomes o
    join clinical_private.clinical_reports r on r.id = o.report_id
    where o.id = new.target_id and o.report_id = new.report_id
      and r.patient_id = new.patient_id and r.owner_id = new.owner_id
  ) then
    raise exception 'Outcome correction target does not match the owned report' using errcode = '42501';
  end if;
  return new;
end;
$function$;
drop trigger if exists correction_target_guard on clinical_private.correction_requests;
create trigger correction_target_guard before insert on clinical_private.correction_requests
for each row execute function clinical_private.validate_correction_target();

create or replace function clinical_private.reject_immutable_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  raise exception 'This Registry history is append-only' using errcode = '42501';
end;
$function$;
drop trigger if exists consent_events_immutable on clinical_private.patient_consent_events;
create trigger consent_events_immutable before update or delete on clinical_private.patient_consent_events
for each row execute function clinical_private.reject_immutable_change();
drop trigger if exists correction_requests_immutable on clinical_private.correction_requests;
create trigger correction_requests_immutable before update or delete on clinical_private.correction_requests
for each row execute function clinical_private.reject_immutable_change();

create or replace function clinical_api.withdraw_public_case(p_case_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
begin
  perform set_config('app.registry_withdraw_rpc', 'on', true);
  update clinical_private.case_library_entries
  set status = 'withdrawn', updated_at = now()
  where id = p_case_id and owner_id = (select auth.uid())
    and status in ('draft','submitted','approved','published');
  return found;
end;
$function$;

create or replace function clinical_api.apply_own_report_correction(p_request_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $apply_report_correction$
declare
  v_request clinical_private.correction_requests%rowtype;
  v_changes jsonb;
  v_invalid_keys text[];
  v_recommendations text[];
begin
  select * into v_request
  from clinical_private.correction_requests
  where id = p_request_id and owner_id = (select auth.uid())
    and target_type = 'report' and report_id is not null;
  if not found then
    raise exception 'Owned report correction request not found' using errcode = '42501';
  end if;
  v_changes := v_request.requested_changes;
  select array_agg(k) into v_invalid_keys
  from jsonb_object_keys(v_changes) as keys(k)
  where k not in ('category','condition','clinical_summary','discharge_status','recommendations');
  if coalesce(cardinality(v_invalid_keys),0) > 0 or v_changes = '{}'::jsonb then
    raise exception 'Correction contains no permitted fields or contains unsupported fields' using errcode = '22023';
  end if;
  if v_changes ? 'recommendations' then
    if jsonb_typeof(v_changes -> 'recommendations') <> 'array' then
      raise exception 'Recommendations correction must be a JSON array' using errcode = '22023';
    end if;
    select coalesce(array_agg(value), '{}'::text[]) into v_recommendations
    from jsonb_array_elements_text(v_changes -> 'recommendations') as elements(value);
  end if;
  update clinical_private.clinical_reports
  set category = case when v_changes ? 'category' then trim(v_changes ->> 'category') else category end,
      condition = case when v_changes ? 'condition' then trim(v_changes ->> 'condition') else condition end,
      clinical_summary = case when v_changes ? 'clinical_summary' then nullif(trim(v_changes ->> 'clinical_summary'),'') else clinical_summary end,
      discharge_status = case when v_changes ? 'discharge_status' then nullif(trim(v_changes ->> 'discharge_status'),'') else discharge_status end,
      recommendations = case when v_changes ? 'recommendations' then v_recommendations else recommendations end,
      updated_at = now()
  where id = v_request.target_id and owner_id = (select auth.uid()) and archived_at is null;
  if not found then
    raise exception 'Report cannot be corrected because it is missing or archived' using errcode = '42501';
  end if;
  insert into clinical_private.correction_resolution_events(
    correction_request_id, owner_id, resolution, resolution_summary
  ) values (p_request_id, (select auth.uid()), 'applied', 'Applied by the owning therapist; changed fields are recorded in the audit trail.');
  return true;
end;
$apply_report_correction$;

create or replace function clinical_private.prevent_correction_resolution_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $correction_resolution_guard$
begin
  raise exception 'Correction resolution history is append-only' using errcode = '42501';
end;
$correction_resolution_guard$;
drop trigger if exists correction_resolution_immutable on clinical_private.correction_resolution_events;
create trigger correction_resolution_immutable before update or delete on clinical_private.correction_resolution_events
for each row execute function clinical_private.prevent_correction_resolution_mutation();
-- Trusted operator-only therapist provisioning. The service-role key must stay server-side.
create or replace function clinical_api.provision_verified_therapist(
  p_user_id uuid, p_full_name text, p_professional_title text,
  p_credentials text[] default '{}', p_registration_label text default null,
  p_registration_number text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $provision_therapist$
begin
  if coalesce(auth.role() = 'service_role', false) is not true then
    raise exception 'Registry operator service role required' using errcode = '42501';
  end if;
  insert into clinical_private.therapist_memberships(
    user_id, full_name, professional_title, credentials, registration_label,
    registration_number, verification_status, is_active, verified_at, verified_by
  ) values (
    p_user_id, trim(p_full_name), trim(p_professional_title),
    coalesce(p_credentials, '{}'::text[]), p_registration_label, p_registration_number,
    'verified', true, now(), auth.uid()
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    professional_title = excluded.professional_title,
    credentials = excluded.credentials,
    registration_label = excluded.registration_label,
    registration_number = excluded.registration_number,
    verification_status = 'verified',
    is_active = true,
    verified_at = now(),
    verified_by = auth.uid(),
    updated_at = now();
  return true;
end;
$provision_therapist$;

create or replace function clinical_api.set_therapist_active(p_user_id uuid, p_is_active boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $set_therapist_active$
begin
  if coalesce(auth.role() = 'service_role', false) is not true then
    raise exception 'Registry operator service role required' using errcode = '42501';
  end if;
  update clinical_private.therapist_memberships
  set is_active = p_is_active, updated_at = now()
  where user_id = p_user_id and verification_status = 'verified';
  return found;
end;
$set_therapist_active$;
-- Authenticated RPCs for consent capture and correction requests. The private
-- tables themselves are never exposed through PostgREST.
create or replace function clinical_api.record_patient_consent(
  p_patient_id uuid,
  p_purpose text,
  p_status text,
  p_consent_version text,
  p_capture_method text,
  p_prior_event_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_id uuid;
begin
  if p_purpose not in ('clinical_care','public_case_publication')
    or p_status not in ('granted','withdrawn')
    or p_capture_method not in ('written','electronic','documented_verbal') then
    raise exception 'Invalid consent details' using errcode = '22023';
  end if;
  insert into clinical_private.patient_consent_events(
    patient_id, owner_id, purpose, consent_status, consent_version,
    capture_method, prior_event_id
  )
  values (
    p_patient_id, (select auth.uid()), p_purpose, p_status,
    trim(p_consent_version), p_capture_method, p_prior_event_id
  )
  returning id into v_id;
  return v_id;
end;
$function$;

create or replace function clinical_api.request_record_correction(
  p_patient_id uuid,
  p_report_id uuid,
  p_target_type text,
  p_target_id uuid,
  p_reason text,
  p_requested_changes jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_id uuid;
begin
  insert into clinical_private.correction_requests(
    owner_id, patient_id, report_id, target_type, target_id, reason, requested_changes
  )
  values (
    (select auth.uid()), p_patient_id, p_report_id, p_target_type, p_target_id,
    trim(p_reason), p_requested_changes
  )
  returning id into v_id;
  return v_id;
end;
$function$;

-- Public read surface contains only approved-for-publication, manually reviewed
-- de-identified fields. SECURITY DEFINER is constrained to this fixed projection.
create or replace function clinical_api.list_public_cases(
  p_search text default null, p_limit integer default 20
)
returns table (
  case_id uuid,
  case_title text,
  condition_label text,
  age_band text,
  clinical_context text,
  intervention_summary text,
  outcome_summary text,
  evidence_reference text,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.case_title, c.condition_label, c.age_band,
         c.clinical_context, c.intervention_summary, c.outcome_summary,
         c.evidence_reference, c.published_at
  from clinical_private.case_library_entries c
  where c.status = 'published'
    and exists (
      select 1 from clinical_private.patient_consent_events ce
      where ce.id = c.publication_consent_event_id
        and ce.consent_status = 'granted'
        and ce.purpose = 'public_case_publication'
        and not exists (
          select 1 from clinical_private.patient_consent_events later
          where later.patient_id = ce.patient_id and later.owner_id = ce.owner_id
            and later.purpose = ce.purpose and later.captured_at > ce.captured_at
        )
    )
    and (
      nullif(trim(p_search), '') is null
      or c.case_title ilike '%' || trim(p_search) || '%'
      or c.condition_label ilike '%' || trim(p_search) || '%'
    )
  order by c.published_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;


-- Retention is deliberately policy-driven and review-only. No automatic
-- deletion is enabled until the Registry operator documents the applicable
-- legal/ethics retention basis for the deployment jurisdiction.
create table if not exists clinical_private.registry_retention_rules (
  record_type text primary key check (record_type in ('patient','report')),
  retention_days integer check (retention_days is null or retention_days between 1 and 36500),
  legal_basis text,
  active boolean not null default false,
  configured_at timestamptz,
  check (not active or (retention_days is not null and length(trim(coalesce(legal_basis,''))) >= 10))
);
create table if not exists clinical_private.retention_review_events (
  id bigint generated always as identity primary key,
  record_type text not null check (record_type in ('patient','report')),
  record_id uuid not null,
  reviewed_by uuid references auth.users(id) on delete restrict,
  decision text not null check (decision in ('retain','export_then_restrict','erase_after_authorisation')),
  rationale text not null check (length(trim(rationale)) between 10 and 2000),
  occurred_at timestamptz not null default now()
);
alter table clinical_private.registry_retention_rules enable row level security;
alter table clinical_private.registry_retention_rules force row level security;
alter table clinical_private.retention_review_events enable row level security;
alter table clinical_private.retention_review_events force row level security;
revoke all on clinical_private.registry_retention_rules,
  clinical_private.retention_review_events from public, anon, authenticated;
grant usage on schema clinical_private to service_role;
grant usage on schema clinical_api to anon, authenticated, service_role;
grant all on clinical_private.registry_retention_rules,
  clinical_private.retention_review_events to service_role;

create or replace function clinical_api.list_retention_candidates(p_as_of date default current_date)
returns table(record_type text, record_id uuid, owner_id uuid, archived_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if coalesce(auth.role() = 'service_role', false) is not true then
    raise exception 'Registry service role required' using errcode = '42501';
  end if;
  return query
    select 'patient'::text, p.id, p.owner_id, p.archived_at
    from clinical_private.patients p
    join clinical_private.registry_retention_rules rr
      on rr.record_type = 'patient' and rr.active
    where p.archived_at is not null
      and p.archived_at <= (p_as_of::timestamptz - make_interval(days => rr.retention_days))
    union all
    select 'report'::text, r.id, r.owner_id, r.archived_at
    from clinical_private.clinical_reports r
    join clinical_private.registry_retention_rules rr
      on rr.record_type = 'report' and rr.active
    where r.archived_at is not null
      and r.archived_at <= (p_as_of::timestamptz - make_interval(days => rr.retention_days));
end;
$function$;

-- Immutable audit events record only changed column names, never clinical values.
create or replace function clinical_private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_old jsonb;
  v_new jsonb;
  v_changed text[];
  v_entity_id uuid;
begin
  -- Trusted local bootstrap/service operations without a user JWT are not
  -- attributed to a therapist. Authenticated clinical mutations are recorded.
  if v_actor is null then
    return new;
  end if;
  v_new := to_jsonb(new);
  v_entity_id := (v_new ->> 'id')::uuid;
  if tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    select coalesce(array_agg(k order by k), '{}'::text[])
      into v_changed
    from jsonb_object_keys(v_new) as keys(k)
    where v_old -> k is distinct from v_new -> k
      and k not in ('updated_at');
  else
    select coalesce(array_agg(k order by k), '{}'::text[])
      into v_changed
    from jsonb_object_keys(v_new) as keys(k)
    where k not in ('updated_at');
  end if;
  insert into clinical_private.audit_events(actor_id, action, entity_table, entity_id, changed_fields)
  values (v_actor, tg_op, tg_table_name, v_entity_id, v_changed);
  return new;
end;
$$;

create or replace function clinical_private.prevent_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Audit events are append-only' using errcode = '42501';
end;
$$;

drop trigger if exists audit_patients on clinical_private.patients;
create trigger audit_patients after insert or update on clinical_private.patients
for each row execute function clinical_private.audit_row_change();
drop trigger if exists audit_reports on clinical_private.clinical_reports;
create trigger audit_reports after insert or update on clinical_private.clinical_reports
for each row execute function clinical_private.audit_row_change();
drop trigger if exists audit_interventions on clinical_private.clinical_interventions;
create trigger audit_interventions after insert or update on clinical_private.clinical_interventions
for each row execute function clinical_private.audit_row_change();
drop trigger if exists audit_outcomes on clinical_private.clinical_outcomes;
create trigger audit_outcomes after insert or update on clinical_private.clinical_outcomes
for each row execute function clinical_private.audit_row_change();
drop trigger if exists audit_case_library on clinical_private.case_library_entries;
create trigger audit_case_library after insert or update on clinical_private.case_library_entries
for each row execute function clinical_private.audit_row_change();
drop trigger if exists audit_events_immutable on clinical_private.audit_events;
create trigger audit_events_immutable before update or delete on clinical_private.audit_events
for each row execute function clinical_private.prevent_audit_mutation();

revoke all on clinical_private.audit_events from public, anon, authenticated;
grant select on clinical_private.audit_events to authenticated;
revoke all on all functions in schema clinical_api from public, anon;
grant execute on function clinical_api.record_patient_consent(uuid,text,text,text,text,uuid) to authenticated;
grant execute on function clinical_api.request_record_correction(uuid,uuid,text,uuid,text,jsonb) to authenticated;
grant execute on function clinical_api.apply_own_report_correction(uuid) to authenticated;
grant execute on function clinical_api.provision_verified_therapist(uuid,text,text,text[],text,text) to service_role;
grant execute on function clinical_api.set_therapist_active(uuid,boolean) to service_role;
grant execute on function clinical_api.create_case_draft(uuid,uuid,text,text,text,text,text,text,text,boolean) to authenticated;
grant execute on function clinical_api.list_my_case_submissions() to authenticated;
grant execute on function clinical_api.submit_case_for_review(uuid) to authenticated;
grant execute on function clinical_api.withdraw_public_case(uuid) to authenticated;
grant execute on function clinical_api.review_case_submission(uuid,text,text) to authenticated;
grant execute on function clinical_api.publish_approved_case(uuid) to authenticated;
grant execute on function clinical_api.list_public_cases(text,integer) to anon, authenticated;
grant execute on function clinical_api.list_retention_candidates(date) to service_role;
commit;
