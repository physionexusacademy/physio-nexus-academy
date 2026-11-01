-- Harden transaction-scoped workflow authorization tables.
-- These rows are only accessed by tightly scoped SECURITY DEFINER workflow
-- functions; no direct client role should be able to read or write them.
ALTER TABLE clinical_private.case_workflow_authorizations
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE clinical_private.report_correction_authorizations
  ENABLE ROW LEVEL SECURITY;

-- Trigger/helper functions in this non-exposed schema are not API endpoints.
-- Triggers continue to invoke their functions without client EXECUTE grants.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA clinical_private
  FROM PUBLIC, anon, authenticated;

-- Keep future helper functions private by default as well.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA clinical_private
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
