-- Add narrow indexes for the 27 foreign keys identified by Supabase's performance advisor.
-- These indexes support joins and parent-row updates/deletes; no unused index is dropped.
begin;

create index if not exists idx_fk_audit_events_actor_id on clinical_private.audit_events (actor_id);
create index if not exists idx_fk_case_library_entries_patient_id on clinical_private.case_library_entries (patient_id);
create index if not exists idx_fk_case_library_entries_publication_consent_event_id on clinical_private.case_library_entries (publication_consent_event_id);
create index if not exists idx_fk_case_library_entries_report_id on clinical_private.case_library_entries (report_id);
create index if not exists idx_fk_case_workflow_authorizations_actor_id on clinical_private.case_workflow_authorizations (actor_id);
create index if not exists idx_fk_case_workflow_authorizations_case_id on clinical_private.case_workflow_authorizations (case_id);
create index if not exists idx_fk_clinical_report_versions_owner_id on clinical_private.clinical_report_versions (owner_id);
create index if not exists idx_fk_consent_evidence_reviews_evidence_id on clinical_private.consent_evidence_reviews (evidence_id);
create index if not exists idx_fk_consent_evidence_reviews_reviewer_id on clinical_private.consent_evidence_reviews (reviewer_id);
create index if not exists idx_fk_correction_requests_patient_id on clinical_private.correction_requests (patient_id);
create index if not exists idx_fk_correction_requests_report_id on clinical_private.correction_requests (report_id);
create index if not exists idx_fk_correction_resolution_events_owner_id on clinical_private.correction_resolution_events (owner_id);
create index if not exists idx_fk_patient_consent_events_evidence_id on clinical_private.patient_consent_events (evidence_id);
create index if not exists idx_fk_patient_consent_events_owner_id on clinical_private.patient_consent_events (owner_id);
create index if not exists idx_fk_patient_consent_events_prior_event_id on clinical_private.patient_consent_events (prior_event_id);
create index if not exists idx_fk_patient_consent_evidence_patient_id on clinical_private.patient_consent_evidence (patient_id);
create index if not exists idx_fk_patient_consent_evidence_verified_by on clinical_private.patient_consent_evidence (verified_by);
create index if not exists idx_fk_patient_record_access_events_patient_id on clinical_private.patient_record_access_events (patient_id);
create index if not exists idx_fk_patient_record_access_events_report_id on clinical_private.patient_record_access_events (report_id);
create index if not exists idx_fk_report_correction_authorizations_actor_id on clinical_private.report_correction_authorizations (actor_id);
create index if not exists idx_fk_report_correction_authorizations_report_id on clinical_private.report_correction_authorizations (report_id);
create index if not exists idx_fk_retention_review_events_reviewed_by on clinical_private.retention_review_events (reviewed_by);
create index if not exists idx_fk_therapist_memberships_verified_by on clinical_private.therapist_memberships (verified_by);
create index if not exists idx_fk_therapist_operator_audit_events_actor_id on clinical_private.therapist_operator_audit_events (actor_id);
create index if not exists idx_fk_therapist_operator_audit_events_request_id on clinical_private.therapist_operator_audit_events (request_id);
create index if not exists idx_fk_therapist_operator_audit_events_target_user_id on clinical_private.therapist_operator_audit_events (target_user_id);
create index if not exists idx_fk_therapist_verification_requests_reviewed_by on clinical_private.therapist_verification_requests (reviewed_by);

commit;
