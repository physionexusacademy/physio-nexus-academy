begin;

-- Signed-consent evidence foundation. The bucket is private; no public URL path exists.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clinical-consent-evidence',
  'clinical-consent-evidence',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']::text[];

create table if not exists clinical_private.patient_consent_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid references clinical_private.patients(id) on delete restrict,
  patient_reference text not null check (length(trim(patient_reference)) between 2 and 64),
  purpose text not null check (purpose in ('clinical_care','public_case_publication')),
  consent_version text not null check (length(trim(consent_version)) between 1 and 100),
  object_path text not null unique,
  declared_sha256 text not null check (declared_sha256 ~ '^[0-9a-f]{64}$'),
  content_type text not null check (content_type in ('application/pdf','image/jpeg','image/png')),
  declared_size_bytes bigint not null check (declared_size_bytes between 1 and 10485760),
  status text not null default 'pending_review'
    check (status in ('pending_review','verified','rejected','withdrawn')),
  submitted_at timestamptz not null default clock_timestamp(),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete restrict,
  reviewer_note text,
  created_at timestamptz not null default now(),
  check ((status = 'verified') = (verified_at is not null and verified_by is not null))
);

create index if not exists consent_evidence_owner_created_idx
  on clinical_private.patient_consent_evidence(owner_id, created_at desc);
create index if not exists consent_evidence_review_queue_idx
  on clinical_private.patient_consent_evidence(status, submitted_at)
  where status = 'pending_review';

create table if not exists clinical_private.consent_evidence_reviews (
  id bigint generated always as identity primary key,
  evidence_id uuid not null references clinical_private.patient_consent_evidence(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('verified','rejected')),
  note text not null check (length(trim(note)) between 5 and 2000),
  occurred_at timestamptz not null default clock_timestamp()
);

alter table clinical_private.patient_consent_evidence enable row level security;
alter table clinical_private.patient_consent_evidence force row level security;
alter table clinical_private.consent_evidence_reviews enable row level security;
alter table clinical_private.consent_evidence_reviews force row level security;

drop policy if exists consent_evidence_owner_or_reviewer_read
  on clinical_private.patient_consent_evidence;
create policy consent_evidence_owner_or_reviewer_read
on clinical_private.patient_consent_evidence
for select to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
);

drop policy if exists consent_evidence_verified_owner_insert
  on clinical_private.patient_consent_evidence;
create policy consent_evidence_verified_owner_insert
on clinical_private.patient_consent_evidence
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and status = 'pending_review'
  and verified_at is null
  and verified_by is null
  and exists (
    select 1 from clinical_private.therapist_memberships tm
    where tm.user_id = (select auth.uid())
      and tm.is_active and tm.verification_status = 'verified'
  )
  and (
    (purpose = 'clinical_care' and patient_id is null)
    or
    (purpose = 'public_case_publication' and exists (
      select 1 from clinical_private.patients p
      where p.id = patient_consent_evidence.patient_id
        and p.owner_id = (select auth.uid())
        and p.patient_reference = patient_consent_evidence.patient_reference
        and p.archived_at is null
    ))
  )
);

drop policy if exists consent_evidence_reviewer_update
  on clinical_private.patient_consent_evidence;
create policy consent_evidence_reviewer_update
on clinical_private.patient_consent_evidence
for update to authenticated
using (coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false))
with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false));

revoke all on clinical_private.patient_consent_evidence,
  clinical_private.consent_evidence_reviews from public, anon;
grant select, insert on clinical_private.patient_consent_evidence to authenticated;
grant select on clinical_private.patient_consent_evidence to authenticated;
revoke all on clinical_private.consent_evidence_reviews from public, anon, authenticated;

alter table clinical_private.patient_consent_events
  add column if not exists evidence_id uuid
  references clinical_private.patient_consent_evidence(id) on delete restrict;

-- Storage policies bind each uploaded object to a pre-created evidence row.
-- No overwrite or delete policy is granted; evidence is retained as an audit artefact.
drop policy if exists consent_evidence_owner_upload on storage.objects;
create policy consent_evidence_owner_upload
on storage.objects for insert to authenticated
with check (
  bucket_id = 'clinical-consent-evidence'
  and exists (
    select 1 from clinical_private.patient_consent_evidence e
    where e.object_path = name
      and e.owner_id = (select auth.uid())
      and e.status = 'pending_review'
  )
);

drop policy if exists consent_evidence_owner_or_reviewer_download on storage.objects;
create policy consent_evidence_owner_or_reviewer_download
on storage.objects for select to authenticated
using (
  bucket_id = 'clinical-consent-evidence'
  and exists (
    select 1 from clinical_private.patient_consent_evidence e
    where e.object_path = name
      and (
        e.owner_id = (select auth.uid())
        or coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
      )
  )
);

-- Authenticated users cannot forge consent grants through the legacy checkbox-only RPCs.
revoke execute on function clinical_api.record_patient_consent(uuid,text,text,text,text,uuid) from public, anon, authenticated;
revoke execute on function clinical_api.create_patient_with_care_consent(text,text,text,text) from public, anon, authenticated;

create or replace function clinical_api.create_consent_evidence_request(
  p_purpose text,
  p_patient_id uuid,
  p_patient_reference text,
  p_consent_version text,
  p_declared_sha256 text,
  p_content_type text,
  p_declared_size_bytes bigint
)
returns table(evidence_id uuid, object_path text)
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_id uuid := gen_random_uuid();
  v_owner uuid := auth.uid();
  v_reference text := trim(coalesce(p_patient_reference, ''));
  v_path text;
begin
  if v_owner is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_purpose not in ('clinical_care','public_case_publication')
    or length(v_reference) not between 2 and 64
    or length(trim(coalesce(p_consent_version,''))) not between 1 and 100
    or coalesce(p_declared_sha256,'') !~ '^[0-9a-f]{64}$'
    or p_content_type not in ('application/pdf','image/jpeg','image/png')
    or p_declared_size_bytes not between 1 and 10485760 then
    raise exception 'Invalid consent evidence metadata' using errcode = '22023';
  end if;
  if not exists (
    select 1 from clinical_private.therapist_memberships tm
    where tm.user_id = v_owner and tm.is_active and tm.verification_status = 'verified'
  ) then
    raise exception 'Verified active therapist membership required' using errcode = '42501';
  end if;
  if p_purpose = 'clinical_care' and p_patient_id is not null then
    raise exception 'Clinical-care consent must be collected before creating the patient record' using errcode = '22023';
  end if;
  if p_purpose = 'public_case_publication' and not exists (
    select 1 from clinical_private.patients p
    where p.id = p_patient_id and p.owner_id = v_owner
      and p.patient_reference = v_reference and p.archived_at is null
  ) then
    raise exception 'Patient not found in your active caseload' using errcode = '42501';
  end if;

  v_path := v_owner::text || '/' || v_id::text || '/signed-consent';
  insert into clinical_private.patient_consent_evidence(
    id, owner_id, patient_id, patient_reference, purpose, consent_version,
    object_path, declared_sha256, content_type, declared_size_bytes
  ) values (
    v_id, v_owner, p_patient_id, v_reference, p_purpose, trim(p_consent_version),
    v_path, p_declared_sha256, p_content_type, p_declared_size_bytes
  );
  return query select v_id, v_path;
end;
$function$;

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

create or replace function clinical_api.create_patient_after_verified_consent(
  p_evidence_id uuid,
  p_display_name text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_e clinical_private.patient_consent_evidence%rowtype;
  v_patient_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into v_e
  from clinical_private.patient_consent_evidence
  where id = p_evidence_id
    and owner_id = auth.uid()
    and purpose = 'clinical_care'
    and status = 'verified'
    and patient_id is null;
  if not found then
    raise exception 'Verified clinical-care consent evidence is required' using errcode = '42501';
  end if;
  insert into clinical_private.patients(owner_id, patient_reference, display_name)
  values (auth.uid(), v_e.patient_reference, trim(p_display_name))
  returning id into v_patient_id;
  insert into clinical_private.patient_consent_events(
    patient_id, owner_id, purpose, consent_status, consent_version,
    capture_method, evidence_id
  ) values (
    v_patient_id, auth.uid(), 'clinical_care', 'granted',
    v_e.consent_version, 'written', v_e.id
  );
  return v_patient_id;
end;
$function$;

create or replace function clinical_api.withdraw_verified_patient_consent(
  p_patient_id uuid,
  p_purpose text,
  p_consent_version text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_latest clinical_private.patient_consent_events%rowtype;
  v_id uuid;
begin
  if p_purpose not in ('clinical_care','public_case_publication')
    or length(trim(coalesce(p_consent_version,''))) not between 1 and 100 then
    raise exception 'Invalid withdrawal request' using errcode = '22023';
  end if;
  select ce.* into v_latest
  from clinical_private.patient_consent_events ce
  join clinical_private.patients p on p.id = ce.patient_id and p.owner_id = ce.owner_id
  where ce.patient_id = p_patient_id
    and ce.owner_id = auth.uid()
    and ce.purpose = p_purpose
  order by ce.event_sequence desc
  limit 1;
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
$function$;

revoke all on function clinical_api.create_consent_evidence_request(text,uuid,text,text,text,text,bigint) from public, anon;
revoke all on function clinical_api.review_consent_evidence(uuid,text,text) from public, anon, authenticated;
revoke all on function clinical_api.create_patient_after_verified_consent(uuid,text) from public, anon;
revoke all on function clinical_api.withdraw_verified_patient_consent(uuid,text,text) from public, anon;
grant execute on function clinical_api.create_consent_evidence_request(text,uuid,text,text,text,text,bigint) to authenticated;
grant execute on function clinical_api.review_consent_evidence(uuid,text,text) to authenticated;
grant execute on function clinical_api.create_patient_after_verified_consent(uuid,text) to authenticated;
grant execute on function clinical_api.withdraw_verified_patient_consent(uuid,text,text) to authenticated;

comment on table clinical_private.patient_consent_evidence is
  'Private signed-consent evidence metadata. Client-declared hash is not a server-verified integrity proof; reviewers must inspect the uploaded original.';
comment on function clinical_api.review_consent_evidence(uuid,text,text) is
  'Reviewer-only verification of an uploaded private consent document; records an immutable decision and creates a publication grant only after verification.';

commit;