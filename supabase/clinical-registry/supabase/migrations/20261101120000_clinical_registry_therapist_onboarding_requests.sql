begin;

-- Applicants may submit a verification request, but cannot read or alter the
-- private queue, approve themselves, or activate their own membership.
create table if not exists clinical_private.therapist_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  professional_title text not null check (length(trim(professional_title)) between 2 and 120),
  credentials text[] not null default '{}'::text[],
  registration_label text,
  registration_number text,
  institution_or_clinic text,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table clinical_private.therapist_verification_requests enable row level security;
alter table clinical_private.therapist_verification_requests force row level security;
revoke all on clinical_private.therapist_verification_requests from public, anon, authenticated;
grant usage on schema clinical_api to authenticated;

create or replace function clinical_api.submit_therapist_verification_request(
  p_full_name text,
  p_professional_title text,
  p_credentials text[],
  p_registration_label text,
  p_registration_number text,
  p_institution_or_clinic text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $submit_verification$
declare
  v_user_id uuid := auth.uid();
  v_status text;
begin
  if v_user_id is null or coalesce(auth.role() = 'authenticated', false) is not true then
    raise exception 'Authenticated account required' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_full_name,''))) not between 2 and 160
     or length(trim(coalesce(p_professional_title,''))) not between 2 and 120
     or length(trim(coalesce(p_registration_label,''))) not between 2 and 80
     or length(trim(coalesce(p_registration_number,''))) not between 2 and 100 then
    raise exception 'Complete professional identity and registration details are required' using errcode = '22023';
  end if;
  if exists (
    select 1 from clinical_private.therapist_memberships tm
    where tm.user_id = v_user_id and tm.verification_status = 'verified' and tm.is_active
  ) then
    raise exception 'This account is already an active verified therapist' using errcode = '23505';
  end if;

  insert into clinical_private.therapist_verification_requests(
    user_id, full_name, professional_title, credentials, registration_label,
    registration_number, institution_or_clinic, status, submitted_at,
    reviewed_at, reviewed_by, reviewer_note, updated_at
  ) values (
    v_user_id, trim(p_full_name), trim(p_professional_title),
    coalesce(p_credentials, '{}'::text[]), trim(p_registration_label),
    trim(p_registration_number), nullif(trim(coalesce(p_institution_or_clinic,'')), ''),
    'pending', now(), null, null, null, now()
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    professional_title = excluded.professional_title,
    credentials = excluded.credentials,
    registration_label = excluded.registration_label,
    registration_number = excluded.registration_number,
    institution_or_clinic = excluded.institution_or_clinic,
    status = case
      when clinical_private.therapist_verification_requests.status = 'rejected' then 'pending'
      else clinical_private.therapist_verification_requests.status
    end,
    submitted_at = case
      when clinical_private.therapist_verification_requests.status = 'rejected' then now()
      else clinical_private.therapist_verification_requests.submitted_at
    end,
    reviewed_at = case
      when clinical_private.therapist_verification_requests.status = 'rejected' then null
      else clinical_private.therapist_verification_requests.reviewed_at
    end,
    reviewed_by = case
      when clinical_private.therapist_verification_requests.status = 'rejected' then null
      else clinical_private.therapist_verification_requests.reviewed_by
    end,
    reviewer_note = case
      when clinical_private.therapist_verification_requests.status = 'rejected' then null
      else clinical_private.therapist_verification_requests.reviewer_note
    end,
    updated_at = now()
  returning status into v_status;

  return jsonb_build_object('status', v_status, 'submitted', true);
end;
$submit_verification$;

create or replace function clinical_api.my_therapist_verification_request()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $my_verification$
  select jsonb_build_object(
    'status', r.status,
    'submittedAt', r.submitted_at,
    'reviewedAt', r.reviewed_at,
    'reviewerNote', r.reviewer_note
  )
  from clinical_private.therapist_verification_requests r
  where r.user_id = auth.uid()
$my_verification$;

revoke all on function clinical_api.submit_therapist_verification_request(text,text,text[],text,text,text) from public, anon;
revoke all on function clinical_api.my_therapist_verification_request() from public, anon;
grant execute on function clinical_api.submit_therapist_verification_request(text,text,text[],text,text,text) to authenticated;
grant execute on function clinical_api.my_therapist_verification_request() to authenticated;

commit;
