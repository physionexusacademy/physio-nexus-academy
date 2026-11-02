-- Close legacy patient-creation paths that bypass signed-consent evidence.
begin;

create or replace function clinical_api.create_patient_after_verified_consent(
  p_evidence_id uuid,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_e clinical_private.patient_consent_evidence%rowtype;
  v_patient_id uuid;
  v_owner_id uuid := (select auth.uid());
begin
  if v_owner_id is null or coalesce(auth.role() = 'authenticated', false) is not true then
    raise exception 'Authenticated therapist session required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from clinical_private.therapist_memberships tm
    where tm.user_id = v_owner_id
      and tm.is_active
      and tm.verification_status = 'verified'
  ) then
    raise exception 'Active verified therapist membership required' using errcode = '42501';
  end if;

  select * into v_e
  from clinical_private.patient_consent_evidence e
  where e.id = p_evidence_id
    and e.owner_id = v_owner_id
    and e.purpose = 'clinical_care'
    and e.status = 'verified'
    and e.patient_id is null
    and e.integrity_verified_at is not null
    and e.verified_sha256 = e.declared_sha256
    and e.actual_size_bytes = e.declared_size_bytes
    and exists (
      select 1 from storage.objects o
      where o.bucket_id = 'clinical-consent-evidence'
        and o.name = e.object_path
    );
  if not found then
    raise exception 'Verified, integrity-checked clinical-care consent evidence is required'
      using errcode = '42501';
  end if;

  insert into clinical_private.patients(owner_id, patient_reference, display_name)
  values (v_owner_id, v_e.patient_reference, trim(p_display_name))
  returning id into v_patient_id;

  insert into clinical_private.patient_consent_events(
    patient_id, owner_id, purpose, consent_status, consent_version,
    capture_method, evidence_id
  ) values (
    v_patient_id, v_owner_id, 'clinical_care', 'granted',
    v_e.consent_version, 'written', v_e.id
  );

  return v_patient_id;
end;
$function$;

-- The old RPC and direct INSERT privilege are no longer valid creation paths.
revoke all on function clinical_api.create_patient(text, text) from public, anon, authenticated;
revoke all on function clinical_api.create_patient_with_care_consent(text, text, text, text)
  from public, anon, authenticated;
revoke insert on clinical_private.patients from authenticated;

commit;
