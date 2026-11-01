-- pgTAP security tests for the private Clinical Registry prototype.
-- Run only against a disposable local Supabase database with synthetic UUIDs.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;
select plan(33);

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

select ok(clinical_api.create_patient_with_care_consent(
  'TEST-A-ATOMIC','Synthetic Atomic Patient','test-v1','written'
) is not null, 'patient and care consent are created through one atomic RPC');
select is((select count(*)::int from clinical_private.patient_consent_events ce
  join clinical_private.patients p on p.id = ce.patient_id
  where p.patient_reference = 'TEST-A-ATOMIC'
    and ce.purpose = 'clinical_care' and ce.consent_status = 'granted'),
  1, 'atomic patient creation records exactly one care-consent event');

select is((select count(*)::int from clinical_private.patients), 2,
  'therapist A reads only their own patients (including atomic-consent registration)');
select is((select count(*)::int from clinical_private.clinical_reports), 1,
  'therapist A reads only their own report');
select is((with changed as (
  update clinical_private.patients
  set display_name = 'Unauthorised cross-tenant edit'
  where id = '20000000-0000-4000-8000-000000000002'
  returning id
) select count(*)::int from changed), 0,
  'therapist A cannot update therapist B patient records');
select ok(clinical_api.get_my_report(
  '30000000-0000-4000-8000-000000000002'
) is null, 'therapist A cannot retrieve therapist B clinical report');
select throws_ok(
  $cross_owner_report$insert into clinical_private.clinical_reports
    (patient_id, owner_id, category, condition)
    values (
      '20000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000001',
      'Musculoskeletal','Cross-tenant attempt'
    )$cross_owner_report$,
  '42501', null, 'therapist A cannot create a report against therapist B patient');

select throws_ok(
  $provision_sql$select clinical_api.provision_verified_therapist(
    '10000000-0000-4000-8000-000000000001',
    'Self verified','PT','{}'::text[],null,null)$provision_sql$,
  '42501', null, 'ordinary therapist cannot self-verify through operator RPC');

update clinical_private.patients
set display_name = 'Synthetic Patient A corrected'
where id = '20000000-0000-4000-8000-000000000001';
select is((select count(*)::int from clinical_private.audit_events
  where actor_id = '10000000-0000-4000-8000-000000000001'
    and entity_table = 'patients'
    and entity_id = '20000000-0000-4000-8000-000000000001'
    and action = 'UPDATE'), 1,
  'authenticated patient update creates its own audit event');

insert into clinical_private.clinical_interventions
  (id, report_id, intervention)
values
  ('40000000-0000-4000-8000-000000000001',
   '30000000-0000-4000-8000-000000000001','Synthetic mobilisation intervention');

update clinical_private.clinical_reports
set status = 'final', finalised_at = now()
where id = '30000000-0000-4000-8000-000000000001';

select throws_ok(
  $$update clinical_private.clinical_interventions
    set intervention = 'Tampered after finalisation'
    where id = '40000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'finalised report interventions cannot be edited directly');
select throws_ok(
  $$insert into clinical_private.clinical_interventions
    (report_id, intervention)
    values ('30000000-0000-4000-8000-000000000001','Late intervention')$$,
  '42501', null, 'new interventions cannot be added to a finalised report');
select throws_ok(
  $$update clinical_private.clinical_reports
    set clinical_summary = 'Unauthorised direct edit'
    where id = '30000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'finalised report content requires correction workflow');

select set_config('app.registry_report_correction','on',true);
select throws_ok(
  $$update clinical_private.clinical_reports
    set clinical_summary = 'Forged correction flag'
    where id = '30000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'client cannot forge correction authorisation with a custom setting');
select set_config('app.registry_report_correction','off',true);

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
   order by event_sequence desc limit 1),
  'Synthetic shoulder rehabilitation case',
  'Shoulder pain','30-44',
  'Synthetic de-identified clinical context with no direct identifiers.',
  'Synthetic intervention summary describing a staged rehabilitation plan.',
  'Synthetic outcome summary describing measurable functional improvement.',
  'https://example.invalid/evidence', true
);

select set_config('app.registry_submission_rpc','on',true);
select throws_ok(
  $update_sql$update clinical_private.case_library_entries
    set status = 'submitted', submitted_at = now()
    where case_title = 'Synthetic shoulder rehabilitation case'$update_sql$,
  '42501', null, 'client cannot forge case submission with a custom setting');
select set_config('app.registry_submission_rpc','off',true);
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
select throws_ok(
  $review_queue_access$select count(*) from clinical_api.list_cases_for_review()$review_queue_access$,
  '42501', null, 'ordinary therapist cannot access the reviewer queue');

select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"registry_role":"reviewer"}}', true);
select is((select count(*)::int from clinical_api.list_cases_for_review()), 1,
  'trusted reviewer sees the submitted de-identified case queue');
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

select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

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

-- Deliberately give the withdrawal the same wall-clock timestamp as the
-- grant. event_sequence, not timestamp precision, must make withdrawal win.
insert into clinical_private.patient_consent_events (
  patient_id, owner_id, purpose, consent_status, consent_version,
  capture_method, captured_at, prior_event_id
)
select ce.patient_id, ce.owner_id, ce.purpose, 'withdrawn',
       ce.consent_version, ce.capture_method, ce.captured_at, ce.id
from clinical_private.patient_consent_events ce
where ce.patient_id = '20000000-0000-4000-8000-000000000001'
  and ce.purpose = 'public_case_publication'
  and ce.consent_status = 'granted'
order by ce.event_sequence desc
limit 1;
select is((select count(*)::int from clinical_api.list_public_cases(null, 20)), 0,
  'publication consent withdrawal immediately hides public case');
select set_config('app.registry_withdraw_rpc','on',true);
-- The owner UPDATE policy intentionally hides non-draft rows, so a forged
-- update can affect zero rows without raising an exception. Assert the
-- published workflow state remains unchanged rather than expecting an error.
update clinical_private.case_library_entries
set status = 'withdrawn'
where case_title = 'Synthetic shoulder rehabilitation case';
select is((select status from clinical_private.case_library_entries
  where case_title = 'Synthetic shoulder rehabilitation case'),
  'published', 'client cannot forge case withdrawal with a custom setting');
select set_config('app.registry_withdraw_rpc','off',true);
select ok(clinical_api.withdraw_public_case(
  (select id from clinical_private.case_library_entries
   where case_title = 'Synthetic shoulder rehabilitation case')
), 'case owner can withdraw a published case');

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
