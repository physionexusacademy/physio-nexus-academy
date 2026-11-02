begin;

create or replace function clinical_api.record_publication_consent_attestation(
  p_patient_id uuid, p_consent_version text, p_written_consent_confirmed boolean
)
returns uuid
language plpgsql security definer set search_path = ''
as $function$
declare
  v_owner uuid := (select auth.uid());
  v_version text := trim(coalesce(p_consent_version, ''));
  v_latest clinical_private.patient_consent_events%rowtype;
  v_event_id uuid;
begin
  if v_owner is null then
    raise exception 'Authenticated therapist session required' using errcode = '42501';
  end if;
  if coalesce(p_written_consent_confirmed, false) is not true
    or length(v_version) not between 1 and 40 then
    raise exception 'Separate written publication consent must be confirmed' using errcode = '22023';
  end if;
  if not exists (
    select 1 from clinical_private.therapist_memberships tm
    where tm.user_id = v_owner and tm.is_active and tm.verification_status = 'verified'
  ) then
    raise exception 'Active verified therapist membership required' using errcode = '42501';
  end if;
  perform 1 from clinical_private.patients p
  where p.id = p_patient_id and p.owner_id = v_owner and p.archived_at is null
  for update;
  if not found then
    raise exception 'Patient not found in your active caseload' using errcode = '42501';
  end if;
  select ce.* into v_latest
  from clinical_private.patient_consent_events ce
  where ce.patient_id = p_patient_id and ce.owner_id = v_owner
    and ce.purpose = 'public_case_publication'
  order by ce.event_sequence desc limit 1 for update;
  if v_latest.id is not null and v_latest.consent_status = 'granted'
    and v_latest.consent_version = v_version then
    return v_latest.id;
  end if;
  insert into clinical_private.patient_consent_events(
    patient_id, owner_id, purpose, consent_status, consent_version, capture_method, prior_event_id
  ) values (
    p_patient_id, v_owner, 'public_case_publication', 'granted', v_version, 'written',
    case when v_latest.id is null then null else v_latest.id end
  ) returning id into v_event_id;
  return v_event_id;
end;
$function$;

create or replace function clinical_api.withdraw_verified_patient_consent(
  p_patient_id uuid, p_purpose text, p_consent_version text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_owner uuid := (select auth.uid());
  v_latest clinical_private.patient_consent_events%rowtype;
  v_id uuid;
begin
  if v_owner is null then
    raise exception 'Authenticated therapist session required' using errcode = '42501';
  end if;
  if p_purpose not in ('clinical_care','public_case_publication')
    or length(trim(coalesce(p_consent_version,''))) not between 1 and 40 then
    raise exception 'Invalid withdrawal request' using errcode = '22023';
  end if;
  if not exists (
    select 1 from clinical_private.therapist_memberships tm
    where tm.user_id = v_owner and tm.is_active and tm.verification_status = 'verified'
  ) then
    raise exception 'Active verified therapist membership required' using errcode = '42501';
  end if;
  select ce.* into v_latest
  from clinical_private.patient_consent_events ce
  join clinical_private.patients p on p.id = ce.patient_id and p.owner_id = ce.owner_id
  where ce.patient_id = p_patient_id and ce.owner_id = v_owner and ce.purpose = p_purpose
  order by ce.event_sequence desc limit 1 for update;
  if v_latest.id is null or v_latest.consent_status <> 'granted' then
    raise exception 'No current consent grant exists for withdrawal' using errcode = '22023';
  end if;
  insert into clinical_private.patient_consent_events(
    patient_id, owner_id, purpose, consent_status, consent_version, capture_method, prior_event_id
  ) values (
    p_patient_id, v_owner, p_purpose, 'withdrawn', trim(p_consent_version), 'written', v_latest.id
  ) returning id into v_id;
  return v_id;
end;
$function$;

revoke all on function clinical_api.get_consent_evidence_integrity_request(uuid) from public, anon, authenticated, service_role;
revoke all on function clinical_api.record_consent_evidence_integrity(uuid,uuid,text,bigint) from public, anon, authenticated, service_role;
drop function if exists clinical_api.get_consent_evidence_integrity_request(uuid);
drop function if exists clinical_api.record_consent_evidence_integrity(uuid,uuid,text,bigint);

commit;
