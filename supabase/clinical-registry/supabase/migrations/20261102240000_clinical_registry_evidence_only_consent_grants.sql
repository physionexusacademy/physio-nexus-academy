-- Consent grants must originate from integrity-verified signed evidence and reviewer approval.
-- Therapists retain only the narrow, append-only withdrawal path.
begin;

revoke all on function clinical_api.record_patient_consent(uuid, text, text, text, text, uuid)
  from public, anon, authenticated;
revoke insert on clinical_private.patient_consent_events from authenticated;

CREATE OR REPLACE FUNCTION clinical_api.withdraw_verified_patient_consent(p_patient_id uuid, p_purpose text, p_consent_version text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_latest clinical_private.patient_consent_events%rowtype;
  v_id uuid;
begin
  if auth.uid() is null or coalesce(auth.role() = 'authenticated', false) is not true then
    raise exception 'Authenticated therapist session required' using errcode = '42501';
  end if;
  if p_purpose not in ('clinical_care','public_case_publication')
    or length(trim(coalesce(p_consent_version,''))) not between 1 and 40 then
    raise exception 'Invalid withdrawal request' using errcode = '22023';
  end if;
  if not exists (
    select 1 from clinical_private.therapist_memberships tm
    where tm.user_id = (select auth.uid())
      and tm.is_active and tm.verification_status = 'verified'
  ) then
    raise exception 'Active verified therapist membership required' using errcode = '42501';
  end if;
  select ce.* into v_latest
  from clinical_private.patient_consent_events ce
  join clinical_private.patients p on p.id = ce.patient_id and p.owner_id = ce.owner_id
  where ce.patient_id = p_patient_id
    and ce.owner_id = auth.uid()
    and ce.purpose = p_purpose
  order by ce.event_sequence desc
  order by ce.event_sequence desc
  limit 1
  for update;
  if v_latest.id is null or v_latest.consent_status <> 'granted' then
    raise exception 'No current consent grant exists for withdrawal' using errcode = '22023';
  end if;
  insert into clinical_private.patient_consent_events(
    patient_id, owner_id, purpose, consent_status, consent_version,
    capture_method, prior_event_id, evidence_id
  ) values (
    p_patient_id, auth.uid(), p_purpose, 'withdrawn',
    trim(p_consent_version), 'written', v_latest.id, v_latest.evidence_id
  ) returning id into v_id;
  return v_id;
end;
$function$


commit;
