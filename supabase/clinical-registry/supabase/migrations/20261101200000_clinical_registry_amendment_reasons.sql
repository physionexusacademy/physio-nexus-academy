begin;

-- Attach the clinician-entered correction rationale to the immutable snapshot.
-- The correction request is created immediately before the authorised update in
-- the same transaction; no client-settable session flag is trusted here.
create or replace function clinical_private.capture_clinical_report_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $version_capture$
declare
  v_revision integer;
  v_snapshot jsonb;
  v_change_reason text;
begin
  if auth.uid() is null or auth.uid() <> old.owner_id then
    raise exception 'Only the report owner can create a report version' using errcode = '42501';
  end if;

  select coalesce(max(v.revision_number), 0) + 1
    into v_revision
  from clinical_private.clinical_report_versions v
  where v.report_id = old.id;

  select 'Correction applied: ' || left(cr.reason, 1900)
    into v_change_reason
  from clinical_private.correction_requests cr
  where cr.target_type = 'report'
    and cr.target_id = old.id
    and cr.report_id = old.id
    and cr.owner_id = old.owner_id
    and not exists (
      select 1 from clinical_private.correction_resolution_events re
      where re.correction_request_id = cr.id
    )
  order by cr.requested_at desc, cr.id desc
  limit 1;

  v_change_reason := coalesce(
    v_change_reason,
    'Automatic pre-update snapshot (assessment, follow-up, or finalisation)'
  );

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
    old.id, old.owner_id, v_revision, v_change_reason, v_snapshot
  );
  return new;
end;
$version_capture$;

commit;
