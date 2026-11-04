-- Reviewers need row visibility as well as UPDATE permission.
-- PostgreSQL applies SELECT policies when deciding which rows an UPDATE can target.
-- Keep this restricted to live, AAL2 reviewer sessions; the workflow trigger
-- remains the authoritative state-transition guard.
drop policy if exists reviewer_reads_case_workflow
  on clinical_private.case_library_entries;
create policy reviewer_reads_case_workflow
on clinical_private.case_library_entries
for select to authenticated
using (clinical_private.is_current_registry_reviewer_aal2());
