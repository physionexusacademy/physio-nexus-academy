begin;

-- An operator must never approve, reject, deactivate or reactivate their own
-- therapist membership. A second independently authorised operator must do it.
create or replace function clinical_api.review_therapist_verification_request(
  p_request_id uuid,
  p_decision text,
  p_evidence_reference text,
  p_reason text,
  p_identity_verified boolean,
  p_registration_verified boolean
)
returns boolean
language plpgsql security definer set search_path = ''
as $operator_review$
declare
  v_actor uuid := auth.uid();
  v_request clinical_private.therapist_verification_requests%rowtype;
begin
  if v_actor is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_role('operator');
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
  if v_actor = v_request.user_id then
    raise exception 'Operators cannot review their own therapist application; an independent operator is required'
      using errcode = '42501';
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
$operator_review$;

create or replace function clinical_api.set_therapist_membership_active(
  p_user_id uuid, p_is_active boolean, p_reason text
)
returns boolean
language plpgsql security definer set search_path = ''
as $operator_activation$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  perform clinical_private.require_registry_role('operator');
  if length(trim(coalesce(p_reason,''))) not between 5 and 2000 then
    raise exception 'A reason of at least five characters is required' using errcode = '22023';
  end if;
  if v_actor = p_user_id then
    raise exception 'Operators cannot change their own therapist membership; an independent operator is required'
      using errcode = '42501';
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
$operator_activation$;

revoke all on function clinical_api.review_therapist_verification_request(uuid,text,text,text,boolean,boolean) from public, anon, authenticated;
revoke all on function clinical_api.set_therapist_membership_active(uuid,boolean,text) from public, anon, authenticated;
grant execute on function clinical_api.review_therapist_verification_request(uuid,text,text,text,boolean,boolean) to authenticated;
grant execute on function clinical_api.set_therapist_membership_active(uuid,boolean,text) to authenticated;

commit;
