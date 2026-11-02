-- Bind every consent event to a patient owned by the authenticated therapist.
-- Also require the exact, current publication grant for case creation/publication.
-- This is additive and fail-closed; it does not change existing patient data.

CREATE OR REPLACE FUNCTION clinical_api.record_patient_consent(
  p_patient_id uuid,
  p_purpose text,
  p_status text,
  p_consent_version text,
  p_capture_method text,
  p_prior_event_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v_id uuid;
  v_latest clinical_private.patient_consent_events%rowtype;
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING errcode = '42501';
  END IF;

  IF p_purpose NOT IN ('clinical_care', 'public_case_publication')
    OR p_status NOT IN ('granted', 'withdrawn')
    OR p_capture_method NOT IN ('written', 'electronic', 'documented_verbal')
    OR length(trim(coalesce(p_consent_version, ''))) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Invalid consent details' USING errcode = '22023';
  END IF;

  -- A therapist may only record consent for a patient in their own caseload.
  IF NOT EXISTS (
    SELECT 1
    FROM clinical_private.patients p
    WHERE p.id = p_patient_id
      AND p.owner_id = (select auth.uid())
      AND p.archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Patient not found in your active caseload' USING errcode = '42501';
  END IF;

  SELECT ce.* INTO v_latest
  FROM clinical_private.patient_consent_events ce
  WHERE ce.patient_id = p_patient_id
    AND ce.owner_id = (select auth.uid())
    AND ce.purpose = p_purpose
  ORDER BY ce.event_sequence DESC
  LIMIT 1;

  IF p_status = 'withdrawn' THEN
    IF v_latest.id IS NULL
      OR v_latest.consent_status <> 'granted'
      OR p_prior_event_id IS DISTINCT FROM v_latest.id THEN
      RAISE EXCEPTION 'Withdrawal must reference the latest active consent grant'
        USING errcode = '22023';
    END IF;
  ELSIF p_prior_event_id IS NOT NULL THEN
    RAISE EXCEPTION 'A new consent grant cannot reference a prior event'
      USING errcode = '22023';
  END IF;

  INSERT INTO clinical_private.patient_consent_events (
    patient_id, owner_id, purpose, consent_status, consent_version,
    capture_method, prior_event_id
  )
  VALUES (
    p_patient_id, (select auth.uid()), p_purpose, p_status,
    trim(p_consent_version), p_capture_method, p_prior_event_id
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.create_case_draft(
  p_report_id uuid,
  p_publication_consent_event_id uuid,
  p_case_title text,
  p_condition_label text,
  p_age_band text,
  p_clinical_context text,
  p_intervention_summary text,
  p_outcome_summary text,
  p_evidence_reference text DEFAULT NULL,
  p_deidentified_confirmed boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO clinical_private.case_library_entries (
    owner_id, report_id, patient_id, publication_consent_event_id,
    case_title, condition_label, age_band, clinical_context,
    intervention_summary, outcome_summary, evidence_reference, deidentified_confirmed
  )
  SELECT
    (select auth.uid()), r.id, r.patient_id, ce.id,
    trim(p_case_title), trim(p_condition_label), p_age_band,
    trim(p_clinical_context), trim(p_intervention_summary), trim(p_outcome_summary),
    nullif(trim(p_evidence_reference), ''), coalesce(p_deidentified_confirmed, false)
  FROM clinical_private.clinical_reports r
  JOIN clinical_private.patient_consent_events ce
    ON ce.id = p_publication_consent_event_id
   AND ce.patient_id = r.patient_id
   AND ce.owner_id = r.owner_id
   AND ce.purpose = 'public_case_publication'
   AND ce.consent_status = 'granted'
  WHERE r.id = p_report_id
    AND r.owner_id = (select auth.uid())
    AND r.status = 'final'
    AND r.archived_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM clinical_private.patients p
      WHERE p.id = r.patient_id
        AND p.owner_id = r.owner_id
        AND p.archived_at IS NULL
    )
    AND NOT EXISTS (
      SELECT 1
      FROM clinical_private.patient_consent_events later
      WHERE later.patient_id = ce.patient_id
        AND later.owner_id = ce.owner_id
        AND later.purpose = ce.purpose
        AND later.event_sequence > ce.event_sequence
    )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.publish_approved_case(p_case_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'registry_role') = 'reviewer', false)
    OR coalesce(auth.role() = 'service_role', false)
  ) THEN
    RAISE EXCEPTION 'Registry reviewer permission required' USING errcode = '42501';
  END IF;

  UPDATE clinical_private.case_library_entries c
  SET status = 'published', published_at = now(), updated_at = now()
  WHERE c.id = p_case_id
    AND c.status = 'approved'
    AND EXISTS (
      SELECT 1
      FROM clinical_private.patient_consent_events ce
      JOIN clinical_private.patients p
        ON p.id = c.patient_id
       AND p.owner_id = c.owner_id
      WHERE ce.id = c.publication_consent_event_id
        AND ce.patient_id = c.patient_id
        AND ce.owner_id = c.owner_id
        AND ce.consent_status = 'granted'
        AND ce.purpose = 'public_case_publication'
        AND NOT EXISTS (
          SELECT 1
          FROM clinical_private.patient_consent_events later
          WHERE later.patient_id = ce.patient_id
            AND later.owner_id = ce.owner_id
            AND later.purpose = ce.purpose
            AND later.event_sequence > ce.event_sequence
        )
    );

  RETURN found;
END;
$function$;

CREATE OR REPLACE FUNCTION clinical_api.list_public_cases(
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  case_id uuid,
  case_title text,
  condition_label text,
  age_band text,
  clinical_context text,
  intervention_summary text,
  outcome_summary text,
  evidence_reference text,
  published_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT c.id, c.case_title, c.condition_label, c.age_band,
         c.clinical_context, c.intervention_summary, c.outcome_summary,
         c.evidence_reference, c.published_at
  FROM clinical_private.case_library_entries c
  WHERE c.status = 'published'
    AND EXISTS (
      SELECT 1
      FROM clinical_private.patient_consent_events ce
      JOIN clinical_private.patients p
        ON p.id = c.patient_id
       AND p.owner_id = c.owner_id
      WHERE ce.id = c.publication_consent_event_id
        AND ce.patient_id = c.patient_id
        AND ce.owner_id = c.owner_id
        AND ce.consent_status = 'granted'
        AND ce.purpose = 'public_case_publication'
        AND NOT EXISTS (
          SELECT 1
          FROM clinical_private.patient_consent_events later
          WHERE later.patient_id = ce.patient_id
            AND later.owner_id = ce.owner_id
            AND later.purpose = ce.purpose
            AND later.event_sequence > ce.event_sequence
        )
    )
    AND (
      nullif(trim(p_search), '') IS NULL
      OR c.case_title ILIKE '%' || trim(p_search) || '%'
      OR c.condition_label ILIKE '%' || trim(p_search) || '%'
    )
  ORDER BY c.published_at DESC
  LIMIT least(greatest(coalesce(p_limit, 20), 1), 50);
$function$;

COMMENT ON FUNCTION clinical_api.record_patient_consent(uuid,text,text,text,text,uuid)
IS 'Owner-scoped append-only consent event; withdrawals must reference the latest active grant.';
COMMENT ON FUNCTION clinical_api.create_case_draft(uuid,uuid,text,text,text,text,text,text,text,boolean)
IS 'Creates a case only when the current publication consent belongs to the same owner and patient as the final report.';
COMMENT ON FUNCTION clinical_api.publish_approved_case(uuid)
IS 'Publishes only when the case, patient, owner, and latest publication-consent grant all match.';
COMMENT ON FUNCTION clinical_api.list_public_cases(text,integer)
IS 'Public read surface returns only published cases with a matching current publication-consent grant.';

-- The browser-facing clinical_api RPCs are SECURITY INVOKER and deliberately
-- rely on RLS. The private schema remains absent from PostgREST's exposed
-- schemas, so grant only the minimum underlying privileges needed by those
-- RPCs; RLS remains the tenant boundary. No anon grants are made.
GRANT USAGE ON SCHEMA clinical_private TO authenticated;

GRANT SELECT ON
  clinical_private.audit_events,
  clinical_private.case_library_entries,
  clinical_private.clinical_interventions,
  clinical_private.clinical_outcomes,
  clinical_private.clinical_report_versions,
  clinical_private.clinical_reports,
  clinical_private.correction_requests,
  clinical_private.correction_resolution_events,
  clinical_private.patient_consent_events,
  clinical_private.patient_record_access_events,
  clinical_private.patients,
  clinical_private.therapist_memberships
TO authenticated;

GRANT INSERT ON
  clinical_private.case_library_entries,
  clinical_private.clinical_interventions,
  clinical_private.clinical_outcomes,
  clinical_private.clinical_reports,
  clinical_private.correction_requests,
  clinical_private.patient_consent_events,
  clinical_private.patients
TO authenticated;

GRANT UPDATE ON
  clinical_private.case_library_entries,
  clinical_private.clinical_interventions,
  clinical_private.clinical_outcomes,
  clinical_private.clinical_reports,
  clinical_private.patients
TO authenticated;

-- Repair two tautological predicates in earlier RLS policies. They must bind
-- the referenced patient/report/consent rows to the case being inserted.
DROP POLICY IF EXISTS verified_owner_creates_case_submissions
  ON clinical_private.case_library_entries;
CREATE POLICY verified_owner_creates_case_submissions
ON clinical_private.case_library_entries
FOR INSERT TO authenticated
WITH CHECK (
  owner_id = (select auth.uid())
  AND status = 'draft'
  AND EXISTS (
    SELECT 1 FROM clinical_private.clinical_reports r
    WHERE r.id = case_library_entries.report_id
      AND r.patient_id = case_library_entries.patient_id
      AND r.owner_id = (select auth.uid())
      AND r.status = 'final'
      AND r.archived_at IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM clinical_private.patients p
    WHERE p.id = case_library_entries.patient_id
      AND p.owner_id = (select auth.uid())
      AND p.archived_at IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM clinical_private.patient_consent_events ce
    WHERE ce.id = case_library_entries.publication_consent_event_id
      AND ce.patient_id = case_library_entries.patient_id
      AND ce.owner_id = (select auth.uid())
      AND ce.purpose = 'public_case_publication'
      AND ce.consent_status = 'granted'
      AND NOT EXISTS (
        SELECT 1 FROM clinical_private.patient_consent_events later
        WHERE later.patient_id = ce.patient_id
          AND later.owner_id = ce.owner_id
          AND later.purpose = ce.purpose
          AND later.event_sequence > ce.event_sequence
      )
  )
  AND EXISTS (
    SELECT 1 FROM clinical_private.therapist_memberships tm
    WHERE tm.user_id = (select auth.uid())
      AND tm.is_active
      AND tm.verification_status = 'verified'
  )
);

DROP POLICY IF EXISTS owner_submits_correction_requests
  ON clinical_private.correction_requests;
CREATE POLICY owner_submits_correction_requests
ON clinical_private.correction_requests
FOR INSERT TO authenticated
WITH CHECK (
  owner_id = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM clinical_private.patients p
    WHERE p.id = correction_requests.patient_id
      AND p.owner_id = (select auth.uid())
  )
  AND (
    report_id IS NULL
    OR EXISTS (
      SELECT 1 FROM clinical_private.clinical_reports r
      WHERE r.id = correction_requests.report_id
        AND r.patient_id = correction_requests.patient_id
        AND r.owner_id = (select auth.uid())
    )
  )
);
