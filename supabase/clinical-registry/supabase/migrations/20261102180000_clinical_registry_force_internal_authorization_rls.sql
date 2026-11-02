begin;
alter table clinical_private.case_workflow_authorizations force row level security;
alter table clinical_private.report_correction_authorizations force row level security;
commit;