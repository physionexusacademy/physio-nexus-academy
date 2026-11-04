-- Consolidate owner and reviewer case-library access into one SELECT and one UPDATE policy.
-- This preserves both access paths while avoiding multiple permissive policies per command.
begin;

drop policy if exists owner_reads_own_case_submissions
  on clinical_private.case_library_entries;
drop policy if exists reviewer_reads_case_workflow
  on clinical_private.case_library_entries;
create policy case_owner_or_reviewer_reads_submissions
on clinical_private.case_library_entries
for select to authenticated
using (
  owner_id = (select auth.uid())
  or clinical_private.is_current_registry_reviewer_aal2()
);

drop policy if exists owner_updates_own_case_drafts
  on clinical_private.case_library_entries;
drop policy if exists reviewer_updates_case_workflow
  on clinical_private.case_library_entries;
create policy case_owner_or_reviewer_updates_workflow
on clinical_private.case_library_entries
for update to authenticated
using (
  (owner_id = (select auth.uid()) and status = 'draft')
  or clinical_private.is_current_registry_reviewer_aal2()
)
with check (
  (owner_id = (select auth.uid()) and status = 'draft')
  or clinical_private.is_current_registry_reviewer_aal2()
);

commit;
