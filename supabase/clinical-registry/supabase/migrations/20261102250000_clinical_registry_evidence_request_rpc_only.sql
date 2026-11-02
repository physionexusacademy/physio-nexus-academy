-- Restrict evidence-row creation to the validated owner-scoped RPC.
begin;

CREATE OR REPLACE FUNCTION clinical_api.create_consent_evidence_request(p_purpose text, p_patient_id uuid, p_patient_reference text, p_consent_version text, p_declared_sha256 text, p_content_type text, p_declared_size_bytes bigint)
 RETURNS TABLE(evidence_id uuid, object_path text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_id uuid := gen_random_uuid(); v_owner uuid := auth.uid();
v_reference text := trim(coalesce(p_patient_reference, '')); v_path text;
begin
  if v_owner is null or coalesce(auth.role() = 'authenticated', false) is not true then
    raise exception 'Authenticated therapist session required' using errcode = '42501';
  end if;
  if p_purpose not in ('clinical_care','public_case_publication')
    or length(v_reference) not between 2 and 64
    or length(trim(coalesce(p_consent_version,''))) not between 1 and 40
    or coalesce(p_declared_sha256,'') !~ '^[0-9a-f]{64}$'
    or p_content_type not in ('application/pdf','image/jpeg','image/png')
    or p_declared_size_bytes not between 1 and 10485760 then
    raise exception 'Invalid consent evidence metadata' using errcode = '22023';
  end if;
  if not exists (select 1 from clinical_private.therapist_memberships tm
    where tm.user_id=v_owner and tm.is_active and tm.verification_status='verified') then
    raise exception 'Verified active therapist membership required' using errcode = '42501';
  end if;
  if p_purpose='clinical_care' and p_patient_id is not null then
    raise exception 'Clinical-care consent must be collected before creating the patient record' using errcode = '22023';
  end if;
  if p_purpose='public_case_publication' and not exists (
    select 1 from clinical_private.patients p where p.id=p_patient_id
      and p.owner_id=v_owner and p.patient_reference=v_reference and p.archived_at is null
  ) then raise exception 'Patient not found in your active caseload' using errcode = '42501'; end if;
  v_path := v_owner::text || '/' || v_id::text || '/signed-consent';
  insert into clinical_private.patient_consent_evidence(
    id,owner_id,patient_id,patient_reference,purpose,consent_version,
    object_path,declared_sha256,content_type,declared_size_bytes
  ) values(v_id,v_owner,p_patient_id,v_reference,p_purpose,trim(p_consent_version),
    v_path,p_declared_sha256,p_content_type,p_declared_size_bytes);
  return query select v_id,v_path;
end;
$function$;

revoke insert on clinical_private.patient_consent_evidence from authenticated;

commit;
