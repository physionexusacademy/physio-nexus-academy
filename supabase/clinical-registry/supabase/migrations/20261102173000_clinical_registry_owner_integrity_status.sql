begin;
drop function if exists clinical_api.list_my_consent_evidence();
create function clinical_api.list_my_consent_evidence()
returns table(
  evidence_id uuid,
  purpose text,
  patient_reference text,
  consent_version text,
  status text,
  submitted_at timestamptz,
  verified_at timestamptz,
  reviewer_note text,
  integrity_verified_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $function$
  select e.id, e.purpose, e.patient_reference, e.consent_version,
         e.status, e.submitted_at, e.verified_at, e.reviewer_note,
         e.integrity_verified_at
  from clinical_private.patient_consent_evidence e
  where e.owner_id = (select auth.uid())
  order by e.created_at desc
  limit 100;
$function$;
revoke all on function clinical_api.list_my_consent_evidence() from public, anon;
grant execute on function clinical_api.list_my_consent_evidence() to authenticated;
commit;