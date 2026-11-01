-- Defense in depth: clinical_private is not a browser-facing API schema.
-- All client access must go through narrowly scoped clinical_api functions.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA clinical_private
  FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA clinical_private
  FROM anon, authenticated;

-- Preserve the same deny-by-default posture for future private objects.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA clinical_private
  REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA clinical_private
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated;
