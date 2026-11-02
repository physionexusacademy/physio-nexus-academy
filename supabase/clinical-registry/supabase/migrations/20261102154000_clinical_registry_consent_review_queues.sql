begin;

create or replace function clinical_api.list_my_consent_evidence()
returns table(
  evidence_id uuid,
  purpose text,
  patient_reference text,
  consent_version text,
  status text,
  submitted_at timestamptz,
  verified_at timestamptz,
  reviewer_note text
)
language sql
stable
security invoker
set search_path = ''
as $function$
  select e.id, e.purpose, e.patient_reference, e.consent_version,
         e.status, e.submitted_at, e.verified_at, e.reviewer_note
  from clinical_private.patient_consent_evidence e
  where e.owner_id = (select auth.uid())
  order by e.created_at desc
  limit 100;
$function$;

create or replace function clinical_api.list_consent_evidence_for_review()
returns table(
  evidence_id uuid,
  owner_id uuid,
  patient_reference text,
  purpose text,
  consent_version text,
  object_path text,
  content_type text,
  declared_size_bytes bigint,
  declared_sha256 text,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'registry_role') = 'reviewer', false) then
    raise exception 'Registry reviewer permission required' using errcode = '42501';
  end if;
  return query
    select e.id, e.owner_id, e.patient_reference, e.purpose, e.consent_version,
           e.object_path, e.content_type, e.declared_size_bytes, e.declared_sha256,
           e.submitted_at
    from clinical_private.patient_consent_evidence e
    where e.status = 'pending_review'
    order by e.submitted_at asc
    limit 100;
end;
$function$;

create or replace function clinical_api.get_current_publication_consent_event(p_patient_id uuid)
returns uuid
language sql
stable
security invoker
set search_path = ''
as $function$
  select ce.id
  from clinical_private.patient_consent_events ce
  join clinical_private.patients p
    on p.id = ce.patient_id and p.owner_id = ce.owner_id
  where ce.patient_id = p_patient_id
    and ce.owner_id = (select auth.uid())
    and ce.purpose = 'public_case_publication'
    and ce.consent_status = 'granted'
    and not exists (
      select 1 from clinical_private.patient_consent_events later
      where later.patient_id = ce.patient_id
        and later.owner_id = ce.owner_id
        and later.purpose = ce.purpose
        and later.event_sequence > ce.event_sequence
    )
  order by ce.event_sequence desc
  limit 1;
$function$;

revoke all on function clinical_api.list_my_consent_evidence() from public, anon;
revoke all on function clinical_api.list_consent_evidence_for_review() from public, anon, authenticated;
revoke all on function clinical_api.get_current_publication_consent_event(uuid) from public, anon;
grant execute on function clinical_api.list_my_consent_evidence() to authenticated;
grant execute on function clinical_api.list_consent_evidence_for_review() to authenticated;
grant execute on function clinical_api.get_current_publication_consent_event(uuid) to authenticated;

commit;