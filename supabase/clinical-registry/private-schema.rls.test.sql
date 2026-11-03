-- Clinical Registry private-schema RLS and workflow security tests (91 assertions)
-- pgTAP security tests for the private Clinical Registry prototype.
-- Run only against a disposable local Supabase database with synthetic UUIDs.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;
select plan(93);
select ok((select relrowsecurity and relforcerowsecurity
  from pg_class where oid='clinical_private.case_workflow_authorizations'::regclass),
  'case workflow authorization table has forced deny-by-default RLS');
select ok(not has_function_privilege('authenticated','clinical_api.create_patient(text,text)','EXECUTE'),
  'legacy patient creation RPC is not executable by authenticated therapists');
select ok(not has_table_privilege('authenticated','clinical_private.patients','INSERT'),
  'authenticated therapists cannot directly insert patient rows');
select ok(not has_function_privilege('authenticated','clinical_api.record_patient_consent(uuid,text,text,text,text,uuid)','EXECUTE'),
  'legacy consent-grant RPC is not executable by authenticated therapists');
select ok(not has_table_privilege('authenticated','clinical_private.patient_consent_events','INSERT'),
  'authenticated therapists cannot directly create consent grants');
select ok(
  to_regclass('clinical_private.patient_consent_evidence') is null
    and to_regclass('clinical_private.consent_evidence_reviews') is null,
  'signed consent upload tables and policies are removed'
);
select ok((select relrowsecurity and relforcerowsecurity
  from pg_class where oid='clinical_private.report_correction_authorizations'::regclass),
  'report correction authorization table has forced deny-by-default RLS');
select ok(
  (select qual ilike '%is_current_registry_reviewer_aal2%'
     and qual ilike '%owner_id%'
     and with_check ilike '%is_current_registry_reviewer_aal2%'
     and with_check ilike '%owner_id%'
   from pg_policies
   where schemaname='clinical_private'
     and tablename='case_library_entries'
     and policyname='case_owner_or_reviewer_updates_workflow'),
  'case workflow UPDATE policy requires a current reviewer with AAL2'
);
select ok(
  (select qual ilike '%is_current_registry_reviewer_aal2%'
       and qual ilike '%owner_id%'
     from pg_policies
     where schemaname='clinical_private'
       and tablename='case_library_entries'
       and policyname='case_owner_or_reviewer_reads_submissions'),
  'case workflow SELECT policy makes submitted rows visible only to current AAL2 reviewers'
);
select is(
  (select count(*)::int from pg_policies
   where schemaname='clinical_private'
     and tablename='case_library_entries'
     and cmd in ('SELECT','UPDATE')),
  2,
  'case library owner and reviewer access is consolidated to one SELECT and one UPDATE policy'
);

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
   'registry-pending@example.invalid','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()),
  ('10000000-0000-4000-8000-000000000004',
   '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'registry-operator@example.invalid','',now(),'{"provider":"email","providers":["email"],"registry_role":"operator"}'::jsonb,'{"registry_test_role":"operator"}'::jsonb,now(),now()),
  ('10000000-0000-4000-8000-000000000005',
   '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'registry-unconfirmed@example.invalid','',null,'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()),
  ('10000000-0000-4000-8000-000000000006',
   '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'registry-reviewer@example.invalid','',now(),'{"provider":"email","providers":["email"],"registry_role":"reviewer"}'::jsonb,'{}'::jsonb,now(),now())
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

select ok(not exists (
  select 1 from pg_policies
  where schemaname='storage' and tablename='objects'
    and policyname in ('consent_evidence_owner_upload','consent_evidence_owner_or_reviewer_download')
), 'signed consent upload tables and policies are removed');


set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

select throws_ok(
  $final_report_insert$insert into clinical_private.clinical_reports
    (patient_id, owner_id, category, condition, status, finalised_at)
    values ('20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      'Musculoskeletal','Forged final report','final',now())$final_report_insert$,
  '42501', null, 'new clinical reports cannot be inserted as final');
select throws_ok(
  $archived_report_insert$insert into clinical_private.clinical_reports
    (patient_id, owner_id, category, condition, status, archived_at)
    values ('20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      'Musculoskeletal','Forged archived report','archived',now())$archived_report_insert$,
  '42501', null, 'new clinical reports cannot be inserted as archived');

select ok(has_function_privilege('authenticated',
  'clinical_api.create_patient_with_consent_attestation(text,text,text,boolean)','EXECUTE'),
  'authenticated therapists can create patients through the consent attestation RPC');
select ok(has_function_privilege('authenticated',
  'clinical_api.record_publication_consent_attestation(uuid,text,boolean)','EXECUTE'),
  'authenticated therapists can record separate publication consent attestations');
select ok(not has_function_privilege('anon',
  'clinical_api.create_patient_with_consent_attestation(text,text,text,boolean)','EXECUTE'),
  'anonymous users cannot create patients through the consent attestation RPC');
select ok(to_regprocedure('clinical_api.create_consent_evidence_request(text,uuid,text,text,text,text,bigint)') is null
  and to_regprocedure('clinical_api.review_consent_evidence(uuid,text,text)') is null,
  'signed consent file upload RPCs are removed');

select throws_ok(
  $consent_owner$select clinical_api.record_publication_consent_attestation(
    '20000000-0000-4000-8000-000000000002','test-public-v1',true)$consent_owner$,
  '42501', null, 'therapist cannot record publication consent for another therapist patient');


select throws_ok(
  $false_care_consent$select clinical_api.create_patient_with_consent_attestation(
    'TEST-A-ATOMIC','Synthetic Atomic Patient','test-v1',false
  )$false_care_consent$,
  '22023', null, 'patient creation requires explicit written-consent attestation');
create temporary table registry_test_attested_patient as
select clinical_api.create_patient_with_consent_attestation(
  'TEST-A-ATOMIC','Synthetic Atomic Patient','test-v1',true
) as patient_id;
select is((select count(*)::int from clinical_private.patients p
  join registry_test_attested_patient created on created.patient_id=p.id), 1,
  'lightweight consent attestation creates a private patient and clinical-care event');
select is((select count(*)::int from clinical_private.patient_consent_events ce
  join registry_test_attested_patient created on created.patient_id=ce.patient_id
  where ce.purpose='clinical_care' and ce.consent_status='granted'), 1,
  'patient creation atomically records the lightweight clinical-care consent event');

select is((select count(*)::int from clinical_private.patients), 2,
  'therapist A reads only their own patient records, including the attested patient');
select is((select count(*)::int from clinical_private.clinical_reports), 1,
  'therapist A reads only their own report');
with changed as (
  update clinical_private.patients
  set display_name = 'Unauthorised cross-tenant edit'
  where id = '20000000-0000-4000-8000-000000000002'
  returning id
)
select is((select count(*)::int from changed), 0,
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
select ok(clinical_api.create_report(
  '20000000-0000-4000-8000-000000000001',
  'Musculoskeletal','Draft report created through the Registry RPC'
) is not null, 'verified therapist can create a new report through the normal RPC');

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

select ok(clinical_api.record_publication_consent_attestation(
  '20000000-0000-4000-8000-000000000001','test-public-v1',true
) is not null, 'publication consent attestation is owner-scoped and idempotent');
select is((select count(*)::int from clinical_private.patient_consent_events
  where patient_id='20000000-0000-4000-8000-000000000001'
    and purpose='public_case_publication' and consent_status='granted'), 1,
  'publication consent attestation creates one minimal audit event');
select is(clinical_api.record_publication_consent_attestation(
  '20000000-0000-4000-8000-000000000001','test-public-v1',true
), (select id from clinical_private.patient_consent_events
    where patient_id='20000000-0000-4000-8000-000000000001'
      and purpose='public_case_publication' and consent_status='granted'
    order by event_sequence desc limit 1),
  'publication consent attestation is owner-scoped and idempotent');

select is(clinical_api.create_case_draft(
  '30000000-0000-4000-8000-000000000001',
  (select id from clinical_private.patient_consent_events
   where patient_id = '20000000-0000-4000-8000-000000000001'
     and purpose = 'clinical_care' order by event_sequence desc limit 1),
  'Invalid case using care consent','Shoulder pain','30-44',
  'Synthetic de-identified clinical context with no direct identifiers.',
  'Synthetic intervention summary describing a staged rehabilitation plan.',
  'Synthetic outcome summary describing measurable functional improvement.',
  null,true
), null::uuid, 'case draft cannot use clinical-care consent as publication consent');

select is(clinical_api.create_case_draft(
  '30000000-0000-4000-8000-000000000001',
  (select id from clinical_private.patient_consent_events
   where patient_id = '20000000-0000-4000-8000-000000000002'
     and purpose = 'clinical_care' order by event_sequence desc limit 1),
  'Invalid cross-owner case','Shoulder pain','30-44',
  'Synthetic de-identified clinical context with no direct identifiers.',
  'Synthetic intervention summary describing a staged rehabilitation plan.',
  'Synthetic outcome summary describing measurable functional improvement.',
  null,true
), null::uuid, 'case draft cannot use another therapist consent event');


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

select clinical_api.create_case_draft(
  '30000000-0000-4000-8000-000000000001',
  (select id from clinical_private.patient_consent_events
   where patient_id = '20000000-0000-4000-8000-000000000001'
     and purpose = 'public_case_publication'
   order by event_sequence desc limit 1),
  'Stale reviewer trigger draft','Shoulder pain','30-44',
  'Synthetic draft used to test current-role enforcement in the workflow trigger.',
  'Synthetic intervention summary for trigger regression testing.',
  'Synthetic outcome summary for trigger regression testing.',
  'https://example.invalid/trigger-test',true
);

select throws_ok(
  $test_sql$select clinical_api.review_case_submission(
    (select id from clinical_private.case_library_entries
     where case_title = 'Synthetic shoulder rehabilitation case'),
    'approved', null)$test_sql$,
  '42501', null, 'ordinary therapist cannot approve a case');
select throws_ok(
  $review_queue_access$select count(*) from clinical_api.list_cases_for_review()$review_queue_access$,
  '42501', null, 'ordinary therapist cannot access the reviewer queue');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000006',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated","app_metadata":{"registry_role":"reviewer"}}', true);
select throws_ok(
  $reviewer_aal1$select count(*) from clinical_api.list_cases_for_review()$reviewer_aal1$,
  '42501', null, 'reviewer cannot read protected queues without an AAL2 session');
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"reviewer"}}', true);
reset role;
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'registry_role'
where id = '10000000-0000-4000-8000-000000000006';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000006',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"reviewer"}}', true);
select throws_ok(
  $revoked_role_stale_jwt$select count(*) from clinical_api.list_cases_for_review()$revoked_role_stale_jwt$,
  '42501', null, 'stale reviewer JWT cannot retain access after the live Auth role is revoked');
select ok(to_regclass('clinical_private.patient_consent_evidence') is null,
  'signed consent upload tables and policies are removed');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"reviewer"}}',true);
select throws_ok(
  $revoked_role_trigger$update clinical_private.case_library_entries
    set status = 'approved'
    where case_title = 'Stale reviewer trigger draft'$revoked_role_trigger$,
  '42501', null, 'stale reviewer JWT cannot bypass the case workflow trigger after role revocation');
reset role;
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"registry_role":"reviewer"}'::jsonb
where id = '10000000-0000-4000-8000-000000000006';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000006',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"reviewer"}}', true);
reset role;
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"registry_role":"reviewer"}'::jsonb
where id = '10000000-0000-4000-8000-000000000006';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000006',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"reviewer"}}', true);

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000006',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"reviewer"}}',true);
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

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
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

select is((select count(*)::int from clinical_api.list_my_report_versions(
  '30000000-0000-4000-8000-000000000001')), 2,
  'report finalisation and correction each create an owner-readable immutable pre-update snapshot');
select ok((select change_reason like '%Synthetic correction test with clear rationale%'
  from clinical_api.list_my_report_versions(
    '30000000-0000-4000-8000-000000000001')
  order by revision_number desc limit 1),
  'clinician-entered correction rationale is preserved in the immutable report version');
select throws_ok(
  $version_mutation$update clinical_private.clinical_report_versions
    set change_reason = 'tampered'
    where report_id = '30000000-0000-4000-8000-000000000001'$version_mutation$,
  '42501', null, 'therapist cannot mutate immutable report history');
select ok(clinical_api.log_report_print_request(
  '30000000-0000-4000-8000-000000000001'
), 'owner can log a report print/PDF request');
select is((select count(*)::int from clinical_api.list_my_record_access_events(
  '20000000-0000-4000-8000-000000000001')
  where action = 'report_print_requested'), 1,
  'report print/PDF request is visible in the owner access history');
select ok((clinical_api.export_my_patient_record(
  '20000000-0000-4000-8000-000000000001') -> 'patient' ->> 'id') =
  '20000000-0000-4000-8000-000000000001',
  'patient JSON export returns the owner patient record');
select is((select count(*)::int from clinical_api.list_my_record_access_events(
  '20000000-0000-4000-8000-000000000001')
  where action = 'patient_json_export'), 1,
  'patient JSON export is audit-logged');
select throws_ok(
  $foreign_print$select clinical_api.log_report_print_request(
    '30000000-0000-4000-8000-000000000002')$foreign_print$,
  '42501', null, 'therapist cannot create access logs for another therapist report');

-- The RPC resolves and links the latest grant server-side when prior_event_id
-- is omitted by the browser client. event_sequence makes withdrawal win.
select clinical_api.withdraw_verified_patient_consent(
  '20000000-0000-4000-8000-000000000001',
  'public_case_publication','test-public-v1'
);
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

select clinical_api.withdraw_verified_patient_consent(
  '20000000-0000-4000-8000-000000000001',
  'clinical_care','test-v1'
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

-- Therapist onboarding requests: applicants can submit and read only their own
-- status; they cannot inspect the private queue or activate their membership.
select ok((clinical_api.submit_therapist_verification_request(
  'Synthetic Pending Therapist','Physiotherapist',array['DPT'],
  'Synthetic Registration Council','SYN-REG-003','Synthetic Teaching Clinic'
) ->> 'submitted')::boolean, 'pending therapist can submit a verification application');
select is(clinical_api.my_therapist_verification_request() ->> 'status',
  'pending', 'applicant can read their own verification status');
select throws_ok(
  $onboarding_sql$select count(*) from clinical_private.therapist_verification_requests$onboarding_sql$,
  '42501', null, 'applicant cannot read the private verification queue');
select throws_ok(
  $onboarding_sql$select clinical_api.set_therapist_active(
    '10000000-0000-4000-8000-000000000003', true)$onboarding_sql$,
  '42501', null, 'applicant cannot activate their own therapist membership');


-- Trusted therapist operator workflow. Only an explicitly assigned
-- app_metadata role can inspect applications, approve or deactivate members.
select throws_ok(
  $operator_queue_denied$select count(*) from clinical_api.list_therapist_verification_queue()$operator_queue_denied$,
  '42501', null, 'ordinary therapist cannot inspect therapist verification queue');
select throws_ok(
  $operator_review_denied$select clinical_api.review_therapist_verification_request(
    '90000000-0000-4000-8000-000000000099',
    'approved','REG-REF-1','Attempted self approval',true,true)$operator_review_denied$,
  '42501', null, 'ordinary therapist cannot approve a therapist verification request');
select throws_ok(
  $operator_activate_denied$select clinical_api.set_therapist_membership_active(
    '10000000-0000-4000-8000-000000000003',true,'Attempted self activation')$operator_activate_denied$,
  '42501', null, 'ordinary therapist cannot activate membership through operator RPC');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated","app_metadata":{"registry_role":"operator"}}',true);
select throws_ok(
  $operator_aal1$select count(*) from clinical_api.list_therapist_verification_queue()$operator_aal1$,
  '42501', null, 'operator cannot inspect identity-verification queue without an AAL2 session');
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"operator"}}',true);
select is((select count(*)::int from clinical_api.list_therapist_verification_queue()), 1,
  'trusted operator can view pending verification applications');
select throws_ok(
  $operator_evidence_required$select clinical_api.review_therapist_verification_request(
    (select item.request_id
     from clinical_api.list_therapist_verification_queue() as item limit 1),
    'approved',null,'Verified identity and registration',true,true)$operator_evidence_required$,
  '22023', null, 'operator approval requires a regulator evidence reference');
select ok(clinical_api.review_therapist_verification_request(
  (select item.request_id
   from clinical_api.list_therapist_verification_queue() as item limit 1),
  'approved','https://regulator.example.invalid/verification/SYN-REG-003',
  'Identity and current professional registration independently verified',true,true
), 'trusted operator can approve an independently verified therapist');
select is((select count(*)::int from clinical_api.list_verified_therapist_memberships()), 3,
  'operator can view verified therapist membership directory');
select is((select count(*)::int from clinical_api.list_my_therapist_operator_audit()
  where action = 'approved'), 1,
  'operator approval creates an actor-attributed immutable audit event');

insert into clinical_private.therapist_verification_requests(
  user_id, full_name, professional_title, credentials,
  registration_label, registration_number, status
) values (
  '10000000-0000-4000-8000-000000000004',
  'Synthetic Operator Applicant','Physiotherapist',array['DPT'],
  'TEST','OPERATOR-SELF-001','pending'
);
select throws_ok(
  $operator_self_approval$select clinical_api.review_therapist_verification_request(
    (select id from clinical_private.therapist_verification_requests
     where user_id='10000000-0000-4000-8000-000000000004'),
    'approved','https://regulator.example.invalid/verification/SELF',
    'Attempted self approval',true,true)$operator_self_approval$,
  '42501', null, 'operator cannot approve their own therapist application');
select throws_ok(
  $operator_self_manage$select clinical_api.set_therapist_membership_active(
    '10000000-0000-4000-8000-000000000004',true,
    'Attempted self activation')$operator_self_manage$,
  '42501', null, 'operator cannot activate or manage their own therapist membership');
select ok(clinical_api.set_therapist_membership_active(
  '10000000-0000-4000-8000-000000000003',false,
  'Temporary suspension pending credential recheck'
), 'operator can deactivate a verified therapist with a reason');
select is((select count(*)::int from clinical_api.list_my_therapist_operator_audit()
  where action = 'deactivated'), 1,
  'operator deactivation is recorded in the audit trail');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select throws_ok(
  $reactivation_denied$select clinical_api.set_therapist_membership_active(
    '10000000-0000-4000-8000-000000000003',true,'Self reactivation attempt')$reactivation_denied$,
  '42501', null, 'deactivated therapist cannot reactivate their own membership');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal2","app_metadata":{"registry_role":"operator"}}',true);
select ok(clinical_api.set_therapist_membership_active(
  '10000000-0000-4000-8000-000000000003',true,
  'Registration rechecked and access restored'
), 'operator can reactivate a verified therapist with a reason');
select is((select count(*)::int from clinical_api.list_my_therapist_operator_audit()
  where action = 'reactivated'), 1,
  'operator reactivation is recorded in the audit trail');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select set_config('request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*)::int from clinical_private.patients), 0,
  'pending therapist still cannot access patient data before operator approval');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000005',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000005","role":"authenticated"}',true);
select throws_ok(
  $unconfirmed_email$select clinical_api.submit_therapist_verification_request(
    'Unconfirmed Applicant','Physiotherapist',array['DPT'],
    'Registration Body','UNCONFIRMED-005',null)$unconfirmed_email$,
  '42501', null, 'unconfirmed email cannot submit a professional verification request');

set local role anon;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"role":"anon"}',true);
select throws_ok(
  $onboarding_sql$select count(*) from clinical_private.patients$onboarding_sql$,
  '42501', null, 'anonymous role cannot access private schema');
select throws_ok(
  $onboarding_sql$select clinical_api.submit_therapist_verification_request(
    'Anonymous Applicant','Physiotherapist',array[]::text[],
    'Registration Body','ANON-001',null)$onboarding_sql$,
  '42501', null, 'anonymous role cannot submit therapist verification request');

reset role;
select * from finish();
rollback;