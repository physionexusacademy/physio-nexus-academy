-- pgTAP security tests for the private Clinical Registry prototype.
-- Run only against a disposable local Supabase database with synthetic UUIDs.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;
select plan(17);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('10000000-0000-4000-8000-000000000001',
   '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'registry-a@example.invalid','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()),
  ('10000000-0000-4000-8000-000000000002',
   '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'registry-b@example.invalid','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()),
  ('10000000-0000-4000-8000-000000000003',
   '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'registry-pending@example.invalid','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now())
on conflict (id) do nothing;

insert into clinical_private.therapist_memberships
  (user_id, full_name, professional_title, verification_status, is_active, verified_at)
values
  ('10000000-0000-4000-8000-000000000001','Synthetic Therapist A','Physiotherapist','verified',true,now()),
  ('10000000-0000-4000-8000-000000000002','Synthetic Therapist B','Physiotherapist','verified',true,now()),
  ('10000000-0000-4000-8000-000000000003','Synthetic Pending Therapist','Physiotherapist','pending',false,null)
on conflict (user_id) do update set
  verification_status = excluded.verification_status,
  is_active = excluded.is_active,
  verified_at = excluded.verified_at;

insert into clinical_private.patients
  (id, owner_id, patient_reference, display_name)
values
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','TEST-A-001','Synthetic Patient A'),
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','TEST-B-001','Synthetic Patient B')
on conflict (id) do nothing;

insert into clinical_private.patient_consent_events
  (patient_id, owner_id, purpose, consent_status, consent_version, capture_method)
values
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','clinical_care','granted','test-v1','written'),
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','public_case_publication','granted','test-public-v1','written'),
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','clinical_care','granted','test-v1','written')
on conflict (id) do nothing;

insert into clinical_private.clinical_reports
  (id, patient_id, owner_id, category, condition)
values
  ('30000000-0000-4000-8000-000000000001',
   '20000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000001','Musculoskeletal','Synthetic condition A'),
  ('30000000-0000-4000-8000-000000000002',
   '20000000-0000-4000-8000-000000000002',
   '10000000-0000-4000-8000-000000000002','Musculoskeletal','Synthetic condition B')
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select is((select count(*)::int from clinical_private.patients), 1,
  'therapist A reads only their own patient');
select is((select count(*)::int from clinical_private.clinical_reports), 1,
  'therapist A reads only their own report');

update clinical_private.patients
set display_name = 'Synthetic Patient A corrected'
where id = '20000000-0000-4000-8000-000000000001';
select is((select count(*)::int from clinical_private.audit_events
  where actor_id = '10000000-0000-4000-8000-000000000001'
    and entity_table = 'patients'), 1,
  'authenticated patient change creates an audit event');

update clinical_private.clinical_reports
set status = 'final', finalised_at = now()
where id = '30000000-0000-4000-8000-000000000001';

insert into clinical_private.case_library_entries (
  owner_id, report_id, patient_id, publication_consent_event_id,
  case_title, condition_label, age_band, clinical_context,
  intervention_summary, outcome_summary, evidence_reference,
  deidentified_confirmed
) values (
  '10000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  (select id from clinical_private.patient_consent_events
   where patient_id = '20000000-0000-4000-8000-000000000001'
     and purpose = 'public_case_publication'
   order by captured_at desc limit 1),
  'Synthetic shoulder rehabilitation case',
  'Shoulder pain','30-44',
  'Synthetic de-identified clinical context with no direct identifiers.',
  'Synthetic intervention summary describing a staged rehabilitation plan.',
  'Synthetic outcome summary describing measurable functional improvement.',
  'https://example.invalid/evidence', true
);

select ok(clinical_api.submit_case_for_review(
  (select id from clinical_private.case_library_entries
   where case_title = 'Synthetic shoulder rehabilitation case')
), 'owner can submit a de-identified case draft');

select throws_ok(
  $test_sql$select clinical_api.review_case_submission(
    (select id from clinical_private.case_library_entries
     where case_title = 'Synthetic shoulder rehabilitation case'),
    'approved', null)$test_sql$,
  '42501', null, 'ordinary therapist cannot approve a case');

select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"registry_role":"reviewer"}}', true);
select ok(clinical_api.review_case_submission(
  (select id from clinical_private.case_library_entries
   where case_title = 'Synthetic shoulder rehabilitation case'),
  'approved', 'Synthetic reviewer check'
), 'trusted reviewer can approve submitted case');
select ok(clinical_api.publish_approved_case(
  (select id from clinical_private.case_library_entries
   where case_title = 'Synthetic shoulder rehabilitation case')
), 'trusted reviewer can publish approved case');
select is((select count(*)::int from clinical_api.list_public_cases(null, 20)), 1,
  'published de-identified case appears in public read surface');

select clinical_api.request_record_correction(
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'report',
  '30000000-0000-4000-8000-000000000001',
  'Synthetic correction test with clear rationale',
  '{"clinical_summary":"Corrected synthetic clinical summary"}'::jsonb
);
select ok(clinical_api.apply_own_report_correction(
  (select id from clinical_private.correction_requests
   where target_id = '30000000-0000-4000-8000-000000000001'
   order by requested_at desc limit 1)
), 'owning therapist can apply a report correction');
select is((select clinical_summary from clinical_private.clinical_reports
  where id = '30000000-0000-4000-8000-000000000001'),
  'Corrected synthetic clinical summary',
  'report correction is applied and auditable');

select clinical_api.record_patient_consent(
  '20000000-0000-4000-8000-000000000001',
  'clinical_care','withdrawn','test-v1','written',null
);
select throws_ok(
  $consent_sql$insert into clinical_private.clinical_reports
    (patient_id, owner_id, category, condition)
    values ('20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001','Musculoskeletal','Consent withdrawn')$consent_sql$,
  '42501', null, 'withdrawn care consent blocks new report creation');
select is((select count(*)::int from clinical_private.patients
  where id = '20000000-0000-4000-8000-000000000002'), 0,
  'therapist A cannot read therapist B patient');
select throws_ok(
  $$update clinical_private.patients
    set owner_id = '10000000-0000-4000-8000-000000000002'
    where id = '20000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'therapist A cannot transfer patient ownership');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*)::int from clinical_private.patients), 1,
  'therapist B reads only their own patient');
select is((select count(*)::int from clinical_private.clinical_reports), 1,
  'therapist B reads only their own report');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*)::int from clinical_private.patients), 0,
  'pending and inactive therapist cannot read patient records');

set local role anon;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"role":"anon"}',true);
select throws_ok(
  $$select count(*) from clinical_private.patients$$,
  '42501', null, 'anonymous role cannot access private schema');

reset role;
select * from finish();
rollback;
