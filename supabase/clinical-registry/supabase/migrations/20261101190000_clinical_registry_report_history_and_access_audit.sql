begin;

-- Preserve the exact pre-update report state. Snapshots are private, owner-readable,
-- append-only, and include the related intervention/outcome rows at that revision.
create table if not exists clinical_private.clinical_report_versions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references clinical_private.clinical_reports(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  revision_number integer not null check (revision_number > 0),
  change_reason text not null default 'Automatic pre-update snapshot',
  snapshot jsonb not null,
  created_at timestamptz not null default clock_timestamp(),
  unique (report_id, revision_number)
);

alter table clinical_private.clinical_report_versions enable row level security;
alter table clinical_private.clinical_report_versions force row level security;
create policy owner_reads_report_versions on clinical_private.clinical_report_versions
  for select to authenticated using (owner_id = (select auth.uid()));
revoke all on clinical_private.clinical_report_versions from public, anon;
grant select on clinical_private.clinical_report_versions to authenticated;

create or replace function clinical_private.capture_clinical_report_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $version_capture$
declare
  v_revision integer;
  v_snapshot jsonb;
begin
  if auth.uid() is null or auth.uid() <> old.owner_id then
    raise exception 'Only the report owner can create a report version' using errcode = '42501';
  end if;

  select coalesce(max(v.revision_number), 0) + 1
    into v_revision
  from clinical_private.clinical_report_versions v
  where v.report_id = old.id;

  v_snapshot := jsonb_build_object(
    'report', to_jsonb(old),
    'interventions', coalesce((
      select jsonb_agg(to_jsonb(i) order by i.intervention_date, i.created_at)
      from clinical_private.clinical_interventions i where i.report_id = old.id
    ), '[]'::jsonb),
    'outcomes', coalesce((
      select jsonb_agg(to_jsonb(o) order by o.measured_at, o.created_at)
      from clinical_private.clinical_outcomes o where o.report_id = old.id
    ), '[]'::jsonb)
  );

  insert into clinical_private.clinical_report_versions(
    report_id, owner_id, revision_number, change_reason, snapshot
  ) values (
    old.id, old.owner_id, v_revision, 'Automatic pre-update snapshot', v_snapshot
  );
  return new;
end;
$version_capture$;

drop trigger if exists clinical_report_version_before_update on clinical_private.clinical_reports;
create trigger clinical_report_version_before_update
before update on clinical_private.clinical_reports
for each row execute function clinical_private.capture_clinical_report_version();

create or replace function clinical_private.prevent_report_version_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $version_immutable$
begin
  raise exception 'Clinical report versions are append-only' using errcode = '42501';
end;
$version_immutable$;

drop trigger if exists clinical_report_versions_immutable on clinical_private.clinical_report_versions;
create trigger clinical_report_versions_immutable
before update or delete on clinical_private.clinical_report_versions
for each row execute function clinical_private.prevent_report_version_mutation();

create or replace function clinical_api.list_my_report_versions(p_report_id uuid)
returns table (
  version_id uuid,
  revision_number integer,
  change_reason text,
  snapshot jsonb,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $list_report_versions$
  select v.id, v.revision_number, v.change_reason, v.snapshot, v.created_at
  from clinical_private.clinical_report_versions v
  where v.report_id = p_report_id and v.owner_id = (select auth.uid())
  order by v.revision_number desc
  limit 100;
$list_report_versions$;

create table if not exists clinical_private.patient_record_access_events (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null references clinical_private.patients(id) on delete restrict,
  report_id uuid references clinical_private.clinical_reports(id) on delete restrict,
  action text not null check (action in ('patient_json_export','report_print_requested')),
  occurred_at timestamptz not null default clock_timestamp()
);
create index if not exists patient_record_access_events_owner_date_idx
  on clinical_private.patient_record_access_events(actor_id, occurred_at desc);

alter table clinical_private.patient_record_access_events enable row level security;
alter table clinical_private.patient_record_access_events force row level security;
create policy owner_reads_own_record_access_events on clinical_private.patient_record_access_events
  for select to authenticated using (actor_id = (select auth.uid()));
revoke all on clinical_private.patient_record_access_events from public, anon;
grant select on clinical_private.patient_record_access_events to authenticated;

create or replace function clinical_api.list_my_record_access_events(p_patient_id uuid)
returns table (
  action text,
  report_id uuid,
  occurred_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $list_access_events$
  select e.action, e.report_id, e.occurred_at
  from clinical_private.patient_record_access_events e
  where e.patient_id = p_patient_id and e.actor_id = (select auth.uid())
  order by e.occurred_at desc
  limit 100;
$list_access_events$;

create or replace function clinical_api.log_report_print_request(p_report_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $log_print$
declare
  v_patient_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select r.patient_id into v_patient_id
  from clinical_private.clinical_reports r
  where r.id = p_report_id and r.owner_id = auth.uid()
    and r.archived_at is null;
  if not found then
    raise exception 'Owned clinical report not found' using errcode = '42501';
  end if;
  insert into clinical_private.patient_record_access_events(actor_id, patient_id, report_id, action)
  values (auth.uid(), v_patient_id, p_report_id, 'report_print_requested');
  return true;
end;
$log_print$;

create or replace function clinical_api.export_my_patient_record(p_patient_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $export_patient$
declare
  v_patient clinical_private.patients%rowtype;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into v_patient
  from clinical_private.patients p
  where p.id = p_patient_id and p.owner_id = auth.uid()
    and p.archived_at is null;
  if not found then
    raise exception 'Owned patient record not found' using errcode = '42501';
  end if;

  insert into clinical_private.patient_record_access_events(actor_id, patient_id, action)
  values (auth.uid(), v_patient.id, 'patient_json_export');

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
      where r.patient_id = p.id and r.owner_id = auth.uid()
        and r.archived_at is null
    ), '[]'::jsonb)
  ) into v_result
  from clinical_private.patients p
  where p.id = v_patient.id;
  return v_result;
end;
$export_patient$;

revoke all on function clinical_api.list_my_report_versions(uuid) from public, anon;
revoke all on function clinical_api.list_my_record_access_events(uuid) from public, anon;
revoke all on function clinical_api.log_report_print_request(uuid) from public, anon;
revoke all on function clinical_api.export_my_patient_record(uuid) from public, anon;
grant execute on function clinical_api.list_my_report_versions(uuid) to authenticated;
grant execute on function clinical_api.list_my_record_access_events(uuid) to authenticated;
grant execute on function clinical_api.log_report_print_request(uuid) to authenticated;
grant execute on function clinical_api.export_my_patient_record(uuid) to authenticated;

commit;
