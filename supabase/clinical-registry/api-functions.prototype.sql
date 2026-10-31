-- Narrow PostgREST RPC boundary for the private Clinical Registry schema.
-- LOCAL REVIEW ONLY. Apply only after the private schema prototype has been
-- reviewed and converted into a CLI-generated migration.
-- Expose clinical_api in Supabase API settings; NEVER expose clinical_private.

begin;
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

revoke all on all functions in schema clinical_api from public, anon;
grant execute on all functions in schema clinical_api to authenticated;
commit;
