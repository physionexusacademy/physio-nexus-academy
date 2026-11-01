begin;

-- Trusted Registry operators are explicitly assigned in Auth app_metadata by a
-- project owner. Applicants, therapists and case reviewers cannot grant this role.
create table if not exists clinical_private.therapist_operator_audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id) on delete restrict,
  target_user_id uuid not null references auth.users(id) on delete restrict,
  request_id uuid references clinical_private.therapist_verification_requests(id) on delete restrict,
  action text not null check (action in ('approved','rejected','deactivated','reactivated')),
  evidence_reference text,
  reason text not null check (length(trim(reason)) between 5 and 2000),
  occurred_at timestamptz not null default now()
);

alter table clinical_private.therapist_operator_audit_events enable row level security;
alter table clinical_private.therapist_operator_audit_events force row level security;
revoke all on clinical_private.therapist_operator_audit_events from public, anon, authenticated, service_role;

create or replace function clinical_private.guard_therapist_operator_audit_immutable()
returns trigger language plpgsql security definer set search_path = ''
as $audit_guard$
begin
  raise exception 'Therapist operator audit events are append-only' using errcode = '42501';
end;
$audit_guard$;

drop trigger if exists therapist_operator_audit_immutable on clinical_private.therapist_operator_audit_events;
create trigger therapist_operator_audit_immutable
before update or delete on clinical_private.therapist_operator_audit_events
for each row execute function clinical_private.guard_therapist_operator_audit_immutable();

create or replace function clinical_api.list_therapist_verification_queue()
returns table (
  request_id uuid, user_id uuid, full_name text, professional_title text,
  credentials text[], registration_label text, registration_number text,
  institution_or_clinic text, status text, submitted_at timestamptz,
  reviewed_at timestamptz, reviewer_note text
)
language plpgsql stable security definer set search_path = ''
as $operator_queue$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'registry_role' = 'operator', false) is not true then
    raise exception 'Registry operator permission required' using errcode = '42501';
  end if;
  return query
  select r.id, r.user_id, r.full_name, r.professional_title, r.credentials,
    r.registration_label, r.registration_number, r.institution_or_clinic,
    r.status, r.submitted_at, r.reviewed_at, r.reviewer_note
  from clinical_private.therapist_verification_requests r
  where r.status in ('pending','under_review')
  order by r.submitted_at asc
  limit 100;
end;
$operator_queue$;

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
$operator_activation$;

revoke all on function clinical_api.list_therapist_verification_queue() from public, anon, authenticated;
revoke all on function clinical_api.review_therapist_verification_request(uuid,text,text,text,boolean,boolean) from public, anon, authenticated;
revoke all on function clinical_api.set_therapist_membership_active(uuid,boolean,text) from public, anon, authenticated;
grant execute on function clinical_api.list_therapist_verification_queue() to authenticated;
grant execute on function clinical_api.review_therapist_verification_request(uuid,text,text,text,boolean,boolean) to authenticated;
grant execute on function clinical_api.set_therapist_membership_active(uuid,boolean,text) to authenticated;

commit;
