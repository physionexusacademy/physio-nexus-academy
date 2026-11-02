-- Require AAL2 for every human reviewer/operator action. Service-role automation
-- remains exempt only on RPCs that explicitly support service_role.
begin;

create or replace function clinical_private.require_registry_aal2()
returns void
language plpgsql
stable
security invoker
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null
    or coalesce((select auth.jwt() ->> 'aal') = 'aal2', false) is not true then
    raise exception 'Multi-factor authentication (AAL2) is required for privileged Registry actions'
      using errcode = '42501';
  end if;
end;
$function$;

revoke all on function clinical_private.require_registry_aal2() from public, anon, authenticated;

CREATE OR REPLACE FUNCTION clinical_api.list_cases_for_review()
 RETURNS TABLE(case_id uuid, case_title text, condition_label text, age_band text, clinical_context text, intervention_summary text, outcome_summary text, evidence_reference text, status text, reviewer_note text, submitted_at timestamp with time zone, reviewed_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false) is not true then
    raise exception 'Registry reviewer permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_aal2();

  return query
  select c.id, c.case_title, c.condition_label, c.age_band,
    c.clinical_context, c.intervention_summary, c.outcome_summary,
    c.evidence_reference, c.status, c.reviewer_note,
    c.submitted_at, c.reviewed_at
  from clinical_private.case_library_entries c
  where c.status in ('submitted','approved')
  order by c.submitted_at asc nulls last, c.updated_at asc
  limit 100;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.list_consent_evidence_for_review()
 RETURNS TABLE(evidence_id uuid, owner_id uuid, patient_reference text, purpose text, consent_version text, object_path text, content_type text, declared_size_bytes bigint, declared_sha256 text, submitted_at timestamp with time zone, verified_sha256 text, actual_size_bytes bigint, integrity_verified_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if not coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'registry_role') = 'reviewer', false) then
   raise exception 'Registry reviewer permission required' using errcode = '42501';
 end if;
  perform clinical_private.require_registry_aal2();
 return query select e.id, e.owner_id, e.patient_reference, e.purpose, e.consent_version,
   e.object_path, e.content_type, e.declared_size_bytes, e.declared_sha256,
   e.submitted_at, e.verified_sha256, e.actual_size_bytes, e.integrity_verified_at
 from clinical_private.patient_consent_evidence e
 where e.status = 'pending_review' and e.integrity_verified_at is not null
   and e.verified_sha256 = e.declared_sha256 and e.actual_size_bytes = e.declared_size_bytes
 order by e.submitted_at asc limit 100;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.list_my_therapist_operator_audit()
 RETURNS TABLE(target_user_id uuid, action text, evidence_reference text, reason text, occurred_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_aal2();
  return query
  select a.target_user_id, a.action, a.evidence_reference, a.reason, a.occurred_at
  from clinical_private.therapist_operator_audit_events a
  where a.actor_id = auth.uid()
  order by a.occurred_at desc
  limit 100;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.list_therapist_verification_queue()
 RETURNS TABLE(request_id uuid, user_id uuid, full_name text, professional_title text, credentials text[], registration_label text, registration_number text, institution_or_clinic text, status text, submitted_at timestamp with time zone, reviewed_at timestamp with time zone, reviewer_note text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_aal2();
  return query
  select r.id, r.user_id, r.full_name, r.professional_title, r.credentials,
    r.registration_label, r.registration_number, r.institution_or_clinic,
    r.status, r.submitted_at, r.reviewed_at, r.reviewer_note
  from clinical_private.therapist_verification_requests r
  where r.status in ('pending','under_review')
  order by r.submitted_at asc
  limit 100;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.list_verified_therapist_memberships()
 RETURNS TABLE(user_id uuid, full_name text, professional_title text, registration_label text, registration_number text, verification_status text, is_active boolean, verified_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_aal2();
  return query
  select tm.user_id, tm.full_name, tm.professional_title,
    tm.registration_label, tm.registration_number,
    tm.verification_status, tm.is_active, tm.verified_at
  from clinical_private.therapist_memberships tm
  where tm.verification_status = 'verified'
  order by tm.full_name
  limit 200;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.publish_approved_case(p_case_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NOT (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
    OR coalesce(auth.role() = 'service_role', false)
  ) THEN
    RAISE EXCEPTION 'Registry reviewer permission required' USING errcode = '42501';
  END IF;
  if auth.role() <> 'service_role' then
    perform clinical_private.require_registry_aal2();
  end if;

  UPDATE clinical_private.case_library_entries c
  SET status = 'published', published_at = now(), updated_at = now()
  WHERE c.id = p_case_id
    AND c.status = 'approved'
    AND EXISTS (
      SELECT 1
      FROM clinical_private.patient_consent_events ce
      JOIN clinical_private.patients p
        ON p.id = c.patient_id
       AND p.owner_id = c.owner_id
      WHERE ce.id = c.publication_consent_event_id
        AND ce.patient_id = c.patient_id
        AND ce.owner_id = c.owner_id
        AND ce.consent_status = 'granted'
        AND ce.purpose = 'public_case_publication'
        AND NOT EXISTS (
          SELECT 1
          FROM clinical_private.patient_consent_events later
          WHERE later.patient_id = ce.patient_id
            AND later.owner_id = ce.owner_id
            AND later.purpose = ce.purpose
            AND later.event_sequence > ce.event_sequence
        )
    );

  RETURN found;
END;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.review_case_submission(p_case_id uuid, p_decision text, p_reviewer_note text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
    or coalesce(auth.role() = 'service_role', false)
  ) then
    raise exception 'Registry reviewer permission required' using errcode = '42501';
  end if;
  if auth.role() <> 'service_role' then
    perform clinical_private.require_registry_aal2();
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected' using errcode = '22023';
  end if;
  update clinical_private.case_library_entries
  set status = p_decision, reviewer_note = left(p_reviewer_note, 2000),
      reviewed_at = now(), updated_at = now()
  where id = p_case_id and status = 'submitted';
  return found;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.review_consent_evidence(p_evidence_id uuid, p_decision text, p_note text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_e clinical_private.patient_consent_evidence%rowtype;
begin
  if not coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false) then
    raise exception 'Registry reviewer permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_aal2();
  if p_decision not in ('verified','rejected') or length(trim(coalesce(p_note,''))) not between 5 and 2000 then
    raise exception 'A decision and review note are required' using errcode = '22023';
  end if;
  select * into v_e from clinical_private.patient_consent_evidence
  where id = p_evidence_id and status = 'pending_review' for update;
  if not found then raise exception 'Pending consent evidence not found' using errcode = 'P0002'; end if;
  if v_e.integrity_verified_at is null
    or v_e.verified_sha256 is distinct from v_e.declared_sha256
    or v_e.actual_size_bytes is distinct from v_e.declared_size_bytes then
    raise exception 'Server-side file integrity verification is required before review' using errcode = '22023';
  end if;
  if not exists (select 1 from storage.objects o
    where o.bucket_id = 'clinical-consent-evidence' and o.name = v_e.object_path) then
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
      patient_id, owner_id, purpose, consent_status, consent_version, capture_method, evidence_id
    ) values (v_e.patient_id, v_e.owner_id, v_e.purpose, 'granted', v_e.consent_version, 'written', v_e.id);
  end if;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.review_therapist_verification_request(p_request_id uuid, p_decision text, p_evidence_reference text, p_reason text, p_identity_verified boolean, p_registration_verified boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor uuid := auth.uid();
  v_request clinical_private.therapist_verification_requests%rowtype;
begin
  if v_actor is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_aal2();
  if p_decision not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_reason,''))) not between 5 and 2000 then
    raise exception 'A reason of at least five characters is required' using errcode = '22023';
  end if;
  if p_decision = 'approved' and (
    p_identity_verified is not true
    or p_registration_verified is not true
    or length(trim(coalesce(p_evidence_reference,''))) < 3
  ) then
    raise exception 'Approval requires identity verification, regulator verification and an evidence reference' using errcode = '22023';
  end if;

  select * into v_request
  from clinical_private.therapist_verification_requests
  where id = p_request_id
  for update;
  if not found or v_request.status not in ('pending','under_review') then
    return false;
  end if;

  update clinical_private.therapist_verification_requests
  set status = p_decision, reviewed_at = now(), reviewed_by = v_actor,
      reviewer_note = trim(p_reason), updated_at = now()
  where id = p_request_id;

  if p_decision = 'approved' then
    insert into clinical_private.therapist_memberships(
      user_id, full_name, professional_title, credentials,
      registration_label, registration_number, verification_status,
      is_active, verified_at, verified_by
    ) values (
      v_request.user_id, v_request.full_name, v_request.professional_title,
      coalesce(v_request.credentials, '{}'::text[]), v_request.registration_label,
      v_request.registration_number, 'verified', true, now(), v_actor
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      professional_title = excluded.professional_title,
      credentials = excluded.credentials,
      registration_label = excluded.registration_label,
      registration_number = excluded.registration_number,
      verification_status = 'verified', is_active = true,
      verified_at = now(), verified_by = v_actor, updated_at = now();
  else
    update clinical_private.therapist_memberships
    set verification_status = 'rejected', is_active = false,
        updated_at = now()
    where user_id = v_request.user_id;
  end if;

  insert into clinical_private.therapist_operator_audit_events(
    actor_id, target_user_id, request_id, action, evidence_reference, reason
  ) values (
    v_actor, v_request.user_id, v_request.id, p_decision,
    nullif(trim(coalesce(p_evidence_reference,'')), ''), trim(p_reason)
  );
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.set_therapist_membership_active(p_user_id uuid, p_is_active boolean, p_reason text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_aal2();
  if length(trim(coalesce(p_reason,''))) not between 5 and 2000 then
    raise exception 'A reason of at least five characters is required' using errcode = '22023';
  end if;
  update clinical_private.therapist_memberships
  set is_active = p_is_active, updated_at = now()
  where user_id = p_user_id and verification_status = 'verified';
  if not found then return false; end if;
  insert into clinical_private.therapist_operator_audit_events(
    actor_id, target_user_id, action, reason
  ) values (
    v_actor, p_user_id,
    case when p_is_active then 'reactivated' else 'deactivated' end,
    trim(p_reason)
  );
  return true;
end;
$function$;

-- Storage downloads are a separate authorization surface from the reviewer RPCs.
-- Owners may retrieve their own evidence; reviewers must also hold an AAL2 session.
drop policy if exists consent_evidence_owner_or_reviewer_download on storage.objects;
create policy consent_evidence_owner_or_reviewer_download
on storage.objects for select to authenticated
using (
  bucket_id = 'clinical-consent-evidence'
  and exists (
    select 1
    from clinical_private.patient_consent_evidence e
    where e.object_path = objects.name
      and (
        e.owner_id = (select auth.uid())
        or (
          coalesce((select auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
          and coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
        )
      )
  )
);

commit;
