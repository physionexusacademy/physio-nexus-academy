begin;

alter table clinical_private.patient_consent_evidence
  add column if not exists verified_sha256 text,
  add column if not exists actual_size_bytes bigint,
  add column if not exists integrity_verified_at timestamptz;

alter table clinical_private.patient_consent_evidence
  drop constraint if exists patient_consent_evidence_integrity_check;
alter table clinical_private.patient_consent_evidence
  add constraint patient_consent_evidence_integrity_check
  check (
    (verified_sha256 is null and actual_size_bytes is null and integrity_verified_at is null)
    or
    (
      verified_sha256 is not null
      and verified_sha256 ~ '^[0-9a-f]{64}$'
      and actual_size_bytes is not null
      and actual_size_bytes between 1 and 10485760
      and integrity_verified_at is not null
      and verified_sha256 = declared_sha256
      and actual_size_bytes = declared_size_bytes
    )
  );

drop index if exists clinical_private.consent_evidence_review_queue_idx;
create index consent_evidence_review_queue_idx
  on clinical_private.patient_consent_evidence(submitted_at)
  where status = 'pending_review' and integrity_verified_at is not null;

create or replace function clinical_api.get_consent_evidence_integrity_request(
  p_evidence_id uuid
)
returns table(
  owner_id uuid,
  object_path text,
  declared_sha256 text,
  content_type text,
  declared_size_bytes bigint
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.role() <> 'service_role' then
    raise exception 'Server-side integrity verifier required' using errcode = '42501';
  end if;

  return query
    select e.owner_id, e.object_path, e.declared_sha256,
           e.content_type, e.declared_size_bytes
    from clinical_private.patient_consent_evidence e
    join clinical_private.therapist_memberships tm
      on tm.user_id = e.owner_id
     and tm.is_active
     and tm.verification_status = 'verified'
    where e.id = p_evidence_id
      and e.status = 'pending_review'
      and e.integrity_verified_at is null;
  if not found then
    raise exception 'Pending consent evidence for an active verified therapist was not found'
      using errcode = 'P0002';
  end if;
end;
$function$;

create or replace function clinical_api.record_consent_evidence_integrity(
  p_evidence_id uuid,
  p_owner_id uuid,
  p_actual_sha256 text,
  p_actual_size_bytes bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_e clinical_private.patient_consent_evidence%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Server-side integrity verifier required' using errcode = '42501';
  end if;

  select * into v_e
  from clinical_private.patient_consent_evidence
  where id = p_evidence_id
    and owner_id = p_owner_id
    and status = 'pending_review'
  for update;

  if not found then
    raise exception 'Pending consent evidence not found' using errcode = 'P0002';
  end if;

  if p_actual_sha256 !~ '^[0-9a-f]{64}$'
    or p_actual_sha256 <> v_e.declared_sha256
    or p_actual_size_bytes <> v_e.declared_size_bytes
    or p_actual_size_bytes not between 1 and 10485760 then
    raise exception 'Uploaded file integrity does not match the declared evidence'
      using errcode = '22023';
  end if;

  update clinical_private.patient_consent_evidence
  set verified_sha256 = p_actual_sha256,
      actual_size_bytes = p_actual_size_bytes,
      integrity_verified_at = clock_timestamp()
  where id = p_evidence_id;

  return true;
end;
$function$;

revoke all on function clinical_api.get_consent_evidence_integrity_request(uuid)
  from public, anon, authenticated;
revoke all on function clinical_api.record_consent_evidence_integrity(uuid,uuid,text,bigint)
  from public, anon, authenticated;
grant execute on function clinical_api.get_consent_evidence_integrity_request(uuid)
  to service_role;
grant execute on function clinical_api.record_consent_evidence_integrity(uuid,uuid,text,bigint)
  to service_role;

create or replace function clinical_api.review_consent_evidence(
  p_evidence_id uuid,
  p_decision text,
  p_note text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_e clinical_private.patient_consent_evidence%rowtype;
begin
  if not coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false) then
    raise exception 'Registry reviewer permission required' using errcode = '42501';
  end if;
  if p_decision not in ('verified','rejected')
    or length(trim(coalesce(p_note,''))) not between 5 and 2000 then
    raise exception 'A decision and review note are required' using errcode = '22023';
  end if;
  select * into v_e from clinical_private.patient_consent_evidence
  where id = p_evidence_id and status = 'pending_review'
  for update;
  if not found then
    raise exception 'Pending consent evidence not found' using errcode = 'P0002';
  end if;

  if v_e.integrity_verified_at is null
    or v_e.verified_sha256 is distinct from v_e.declared_sha256
    or v_e.actual_size_bytes is distinct from v_e.declared_size_bytes then
    raise exception 'Server-side file integrity verification is required before review'
      using errcode = '22023';
  end if;

  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'clinical-consent-evidence'
      and o.name = v_e.object_path
  ) then
    raise exception 'The signed document has not been uploaded' using errcode = '22023';
  end if;

  update clinical_private.patient_consent_evidence
  set status = p_decision,
      verified_at = case when p_decision = 'verified' then clock_timestamp() else null end,
      verified_by = case when p_decision = 'verified' then auth.uid() else null end,
      reviewer_note = trim(p_note)
  where id = p_evidence_id;

  insert into clinical_private.consent_evidence_reviews(evidence_id, reviewer_id, decision, note)
  values (p_evidence_id, auth.uid(), p_decision, trim(p_note));

  if p_decision = 'verified' and v_e.purpose = 'public_case_publication' then
    insert into clinical_private.patient_consent_events(
      patient_id, owner_id, purpose, consent_status, consent_version,
      capture_method, evidence_id
    ) values (
      v_e.patient_id, v_e.owner_id, v_e.purpose, 'granted',
      v_e.consent_version, 'written', v_e.id
    );
  end if;
  return true;
end;
$function$;

drop function if exists clinical_api.list_consent_evidence_for_review();
create function clinical_api.list_consent_evidence_for_review()
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
  submitted_at timestamptz,
  verified_sha256 text,
  actual_size_bytes bigint,
  integrity_verified_at timestamptz
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
           e.submitted_at, e.verified_sha256, e.actual_size_bytes, e.integrity_verified_at
    from clinical_private.patient_consent_evidence e
    where e.status = 'pending_review'
      and e.integrity_verified_at is not null
      and e.verified_sha256 = e.declared_sha256
      and e.actual_size_bytes = e.declared_size_bytes
    order by e.submitted_at asc
    limit 100;
end;
$function$;

revoke all on function clinical_api.list_consent_evidence_for_review()
  from public, anon, authenticated;
grant execute on function clinical_api.list_consent_evidence_for_review()
  to authenticated;

comment on column clinical_private.patient_consent_evidence.verified_sha256 is
  'SHA-256 computed server-side from the bytes downloaded from private Storage; never client writable.';
comment on column clinical_private.patient_consent_evidence.integrity_verified_at is
  'Timestamp when the server independently matched uploaded object bytes to the declared evidence metadata. Does not establish consent authenticity or legal validity.';

commit;