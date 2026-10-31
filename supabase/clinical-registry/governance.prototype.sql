-- PNA Clinical Registry governance and public Case Library prototype.
-- LOCAL REVIEW ONLY. Apply after private-schema.prototype.sql and api-functions.prototype.sql.
-- Never apply to the existing PNA website Supabase project.

begin;

-- Append-only consent history. Clinical-care consent and public-case publication
-- consent are separate purposes; withdrawal is recorded as a new event.
create table if not exists clinical_private.patient_consent_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references clinical_private.patients(id) on delete restrict,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  purpose text not null check (purpose in ('clinical_care','public_case_publication')),
  consent_status text not null check (consent_status in ('granted','withdrawn')),
  consent_version text not null check (length(trim(consent_version)) between 1 and 40),
  capture_method text not null check (capture_method in ('written','electronic','documented_verbal')),
  captured_at timestamptz not null default now(),
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
    and (prior_event_id is null or exists (
      select 1 from clinical_private.patient_consent_events prior
      where prior.id = prior_event_id and prior.patient_id = patient_id
        and prior.owner_id = (select auth.uid()) and prior.purpose = purpose
    ))
  );
revoke all on clinical_private.patient_consent_events from public, anon;
grant select, insert on clinical_private.patient_consent_events to authenticated;

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
          and later.captured_at > ce.captured_at
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
    elsif v_withdraw_rpc and old.status = 'published' and new.status = 'withdrawn'
      and old.owner_id = (select auth.uid()) then
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
as $
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
$$;

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
  where id = p_case_id and owner_id = (select auth.uid()) and status = 'published';
  return found;
end;
$function$;

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
drop trigger if exists audit_events_immutable on clinical_private.audit_events;
create trigger audit_events_immutable before update or delete on clinical_private.audit_events
for each row execute function clinical_private.prevent_audit_mutation();

revoke all on clinical_private.audit_events from public, anon, authenticated;
grant select on clinical_private.audit_events to authenticated;
revoke all on all functions in schema clinical_api from public, anon;
grant execute on function clinical_api.record_patient_consent(uuid,text,text,text,text,uuid) to authenticated;
grant execute on function clinical_api.request_record_correction(uuid,uuid,text,uuid,text,jsonb) to authenticated;
grant execute on function clinical_api.submit_case_for_review(uuid) to authenticated;
grant execute on function clinical_api.withdraw_public_case(uuid) to authenticated;
grant execute on function clinical_api.review_case_submission(uuid,text,text) to authenticated;
grant execute on function clinical_api.publish_approved_case(uuid) to authenticated;
grant execute on function clinical_api.list_public_cases(text,integer) to anon, authenticated;
grant execute on function clinical_api.list_retention_candidates(date) to service_role;
commit;
