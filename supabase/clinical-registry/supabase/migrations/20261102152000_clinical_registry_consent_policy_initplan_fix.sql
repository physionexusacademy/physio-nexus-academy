begin;
drop policy if exists consent_evidence_owner_or_reviewer_read
  on clinical_private.patient_consent_evidence;
create policy consent_evidence_owner_or_reviewer_read
on clinical_private.patient_consent_evidence
for select to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
);

drop policy if exists consent_evidence_reviewer_update
  on clinical_private.patient_consent_evidence;
create policy consent_evidence_reviewer_update
on clinical_private.patient_consent_evidence
for update to authenticated
using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'registry_role') = 'reviewer', false))
with check (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'registry_role') = 'reviewer', false));

commit;