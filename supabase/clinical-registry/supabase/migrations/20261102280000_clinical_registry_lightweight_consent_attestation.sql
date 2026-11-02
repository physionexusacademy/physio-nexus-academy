begin;

create or replace function clinical_api.create_patient_with_consent_attestation(
  p_patient_reference text, p_display_name text, p_consent_version text,
  p_written_consent_confirmed boolean
)
returns uuid
language plpgsql security definer set search_path = ''
as $function$
declare
  v_owner uuid := (select auth.uid());
  v_patient_id uuid;
  v_reference text := trim(coalesce(p_patient_reference, ''));
  v_display_name text := trim(coalesce(p_display_name, ''));
  v_version text := trim(coalesce(p_consent_version, ''));
begin
  if v_owner is null then
    raise exception 'Authenticated therapist session required' using errcode = '42501';
  end if;
  if coalesce(p_written_consent_confirmed, false) is not true then
    raise exception 'Confirm that written clinical-care consent has been obtained and retained securely' using errcode = '22023';
  end if;
  if length(v_reference) not between 2 and 64
    or length(v_display_name) not between 1 and 160
    or length(v_version) not between 1 and 40 then
    raise exception 'Valid patient reference, display name and consent version are required' using errcode = '22023';
  end if;
  if not exists (
    select 1 from clinical_private.therapist_memberships tm
    where tm.user_id = v_owner and tm.is_active and tm.verification_status = 'verified'
  ) then
    raise exception 'Active verified therapist membership required' using errcode = '42501';
  end if;
  insert into clinical_private.patients(owner_id, patient_reference, display_name)
  values (v_owner, v_reference, v_display_name)
  returning id into v_patient_id;
  insert into clinical_private.patient_consent_events(
    patient_id, owner_id, purpose, consent_status, consent_version, capture_method
  ) values (v_patient_id, v_owner, 'clinical_care', 'granted', v_version, 'written');
  return v_patient_id;
end;
$function$;

revoke all on function clinical_api.create_patient_with_consent_attestation(text,text,text,boolean) from public, anon;
grant execute on function clinical_api.create_patient_with_consent_attestation(text,text,text,boolean) to authenticated;

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
  if v_latest.id is not null and v_latest.consent_status = 'granted' then
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

revoke all on function clinical_api.record_publication_consent_attestation(uuid,text,boolean) from public, anon;
grant execute on function clinical_api.record_publication_consent_attestation(uuid,text,boolean) to authenticated;

-- Revoke and remove the unused file-upload and reviewer RPCs first.
revoke all on function clinical_api.create_consent_evidence_request(text,uuid,text,text,text,text,bigint) from public, anon, authenticated;
revoke all on function clinical_api.review_consent_evidence(uuid,text,text) from public, anon, authenticated;
revoke all on function clinical_api.create_patient_after_verified_consent(uuid,text) from public, anon, authenticated;
revoke all on function clinical_api.list_my_consent_evidence() from public, anon, authenticated;
revoke all on function clinical_api.list_consent_evidence_for_review() from public, anon, authenticated;

drop function if exists clinical_api.create_consent_evidence_request(text,uuid,text,text,text,text,bigint);
drop function if exists clinical_api.review_consent_evidence(uuid,text,text);
drop function if exists clinical_api.create_patient_after_verified_consent(uuid,text);
drop function if exists clinical_api.list_my_consent_evidence();
drop function if exists clinical_api.list_consent_evidence_for_review();

drop policy if exists consent_evidence_owner_upload on storage.objects;
drop policy if exists consent_evidence_owner_or_reviewer_download on storage.objects;

do $$
begin
  if exists (select 1 from storage.objects where bucket_id = 'clinical-consent-evidence') then
    raise exception 'Consent evidence bucket is not empty; stop and review existing files before removal.';
  end if;
  -- The empty bucket is retained because Supabase Storage protects direct
  -- deletion from SQL. All client upload/download policies are removed.
end
$$;

alter table clinical_private.patient_consent_events
  drop constraint if exists patient_consent_events_evidence_id_fkey;
alter table clinical_private.patient_consent_events
  drop column if exists evidence_id;

drop table if exists clinical_private.consent_evidence_reviews;
drop table if exists clinical_private.patient_consent_evidence;

commit;
