"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { BookOpen, FileDown, LockKeyhole, LogOut, Plus, Printer, ShieldCheck, UserPlus, Users } from "lucide-react";
import { CLINICAL_REGISTRY_CONSENT_VERSION, getClinicalRegistryClient } from "@/lib/clinical-registry/client";

type Patient = { id: string; patient_reference: string; display_name: string; updated_at: string };
type Report = { report_id: string; patient_id: string; patient_reference: string; patient_display_name: string; category: string; condition: string; status: string; assessment_date: string; updated_at: string };
type TherapistStatus = { fullName?: string; professionalTitle?: string; credentials?: string[]; verificationStatus?: string; isActive?: boolean; verifiedAt?: string | null };
type ReportVersion = { version_id: string; revision_number: number; change_reason: string; snapshot: Record<string, unknown>; created_at: string };
type RecordAccessEvent = { action: string; report_id?: string | null; occurred_at: string };
type ClinicalReport = { id: string; patient?: { patientReference?: string; displayName?: string }; category: string; condition: string; status: string; assessmentDate: string; initialAssessment?: Record<string, unknown>; followUpAssessments?: Record<string, unknown>[]; clinicalSummary?: string; dischargeStatus?: string; recommendations?: string[]; interventions?: Record<string, unknown>[]; outcomes?: Record<string, unknown>[] };
type CaseSubmission = { case_id: string; patient_id: string; case_title: string; status: string; reviewer_note?: string | null; submitted_at?: string | null; published_at?: string | null };
type PublicCase = { case_id: string; case_title: string; condition_label: string; age_band?: string | null; clinical_context: string; intervention_summary: string; outcome_summary: string; evidence_reference?: string | null };
type ReviewerCase = { case_id: string; case_title: string; condition_label: string; age_band?: string | null; clinical_context: string; intervention_summary: string; outcome_summary: string; evidence_reference?: string | null; status: "submitted" | "approved"; reviewer_note?: string | null; submitted_at?: string | null; reviewed_at?: string | null };
type TherapistVerificationApplication = { request_id: string; user_id: string; full_name: string; professional_title: string; credentials: string[]; registration_label?: string | null; registration_number?: string | null; institution_or_clinic?: string | null; status: string; submitted_at: string; };
type VerifiedTherapist = { user_id: string; full_name: string; professional_title: string; registration_label?: string | null; registration_number?: string | null; is_active: boolean; verified_at?: string | null };
type ConsentEvidence = { evidence_id: string; purpose: "clinical_care" | "public_case_publication"; patient_reference: string; consent_version: string; status: "pending_review" | "verified" | "rejected" | "withdrawn"; submitted_at: string; verified_at?: string | null; reviewer_note?: string | null; integrity_verified_at?: string | null };
type ConsentReviewItem = { evidence_id: string; owner_id: string; patient_reference: string; purpose: "clinical_care" | "public_case_publication"; consent_version: string; object_path: string; content_type: string; declared_size_bytes: number; declared_sha256: string; submitted_at: string; verified_sha256: string; actual_size_bytes: number; integrity_verified_at: string };

// Fail closed until an institution-approved signed-consent evidence and reviewer-verification workflow is implemented and independently tested.
const SIGNED_CONSENT_FORM_APPROVED = false; // Enable only after the institution/ethics-approved form and version are supplied.
const SIGNED_CONSENT_EVIDENCE_WORKFLOW_READY = false;

export function ClinicalRegistrySecureClient() {
  const client = useMemo(() => getClinicalRegistryClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<TherapistStatus | null>(null);
  const [verificationRequest, setVerificationRequest] = useState<{status:string;submittedAt?:string;reviewedAt?:string;reviewerNote?:string|null}|null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantTitle, setApplicantTitle] = useState("Physiotherapist");
  const [applicantCredentials, setApplicantCredentials] = useState("DPT");
  const [registrationLabel, setRegistrationLabel] = useState("AHPC");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [institution, setInstitution] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([]);
  const [recordAccessEvents, setRecordAccessEvents] = useState<RecordAccessEvent[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [aalLevel, setAalLevel] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [patientReference, setPatientReference] = useState("");
  const [patientName, setPatientName] = useState("");
  const [consentEvidenceList, setConsentEvidenceList] = useState<ConsentEvidence[]>([]);
  const [consentReviewQueue, setConsentReviewQueue] = useState<ConsentReviewItem[]>([]);
  const [consentEvidencePurpose, setConsentEvidencePurpose] = useState<"clinical_care" | "public_case_publication">("clinical_care");
  const [consentEvidenceFile, setConsentEvidenceFile] = useState<File | null>(null);
  const [consentReviewNote, setConsentReviewNote] = useState("");
  const [category, setCategory] = useState("Musculoskeletal");
  const [condition, setCondition] = useState("");
  const [assessmentJson, setAssessmentJson] = useState('{\n  "subjective": "",\n  "objective": "",\n  "painScore": null\n}');
  const [followUpJson, setFollowUpJson] = useState('{\n  "date": "",\n  "subjective": "",\n  "objective": "",\n  "painScore": null\n}');
  const [interventionText, setInterventionText] = useState("");
  const [outcomeName, setOutcomeName] = useState("");
  const [outcomeCode, setOutcomeCode] = useState("");
  const [outcomeValue, setOutcomeValue] = useState("");
  const [outcomeDirection, setOutcomeDirection] = useState("lower_is_better");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [caseSubmissions, setCaseSubmissions] = useState<CaseSubmission[]>([]);
  const [publicCases, setPublicCases] = useState<PublicCase[]>([]);
  const [reviewerCases, setReviewerCases] = useState<ReviewerCase[]>([]);
  const [operatorQueue, setOperatorQueue] = useState<TherapistVerificationApplication[]>([]);
  const [operatorMemberships, setOperatorMemberships] = useState<VerifiedTherapist[]>([]);
  const [operatorReason, setOperatorReason] = useState("");
  const [operatorEvidence, setOperatorEvidence] = useState("");
  const [operatorIdentityVerified, setOperatorIdentityVerified] = useState(false);
  const [operatorRegistrationVerified, setOperatorRegistrationVerified] = useState(false);
  const [reviewerNote, setReviewerNote] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [caseCondition, setCaseCondition] = useState("");
  const [caseAgeBand, setCaseAgeBand] = useState("30-44");
  const [caseContext, setCaseContext] = useState("");
  const [caseIntervention, setCaseIntervention] = useState("");
  const [caseOutcome, setCaseOutcome] = useState("");
  const [caseEvidence, setCaseEvidence] = useState("");
  const [publicationConsentConfirmed, setPublicationConsentConfirmed] = useState(false);
  const [deidentifiedConfirmed, setDeidentifiedConfirmed] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionJson, setCorrectionJson] = useState('{\n  "clinical_summary": "",\n  "discharge_status": "",\n  "recommendations": []\n}');

  const loadPatients = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_my_patients", { p_search: null });
    if (rpcError) throw rpcError;
    setPatients((data ?? []) as Patient[]);
  }, [client]);

  const loadReports = useCallback(async (patientId: string) => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_my_reports", { p_patient_id: patientId });
    if (rpcError) throw rpcError;
    setReports((data ?? []) as Report[]);
  }, [client]);

  const loadMyConsentEvidence = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_my_consent_evidence");
    if (rpcError) throw rpcError;
    setConsentEvidenceList((data ?? []) as ConsentEvidence[]);
  }, [client]);

  const loadConsentReviewQueue = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_consent_evidence_for_review");
    if (rpcError) throw rpcError;
    setConsentReviewQueue((data ?? []) as ConsentReviewItem[]);
  }, [client]);

  const loadCaseSubmissions = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_my_case_submissions");
    if (rpcError) throw rpcError;
    setCaseSubmissions((data ?? []) as CaseSubmission[]);
  }, [client]);

  const loadPublicCases = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_public_cases", { p_search: null, p_limit: 20 });
    if (rpcError) throw rpcError;
    setPublicCases((data ?? []) as PublicCase[]);
  }, [client]);

  const loadReviewerCases = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_cases_for_review");
    if (rpcError) throw rpcError;
    setReviewerCases((data ?? []) as ReviewerCase[]);
  }, [client]);
  const loadOperatorData = useCallback(async () => {
    if (!client) return;
    const [queue, members] = await Promise.all([
      client.rpc("list_therapist_verification_queue"),
      client.rpc("list_verified_therapist_memberships")
    ]);
    if (queue.error) throw queue.error;
    if (members.error) throw members.error;
    setOperatorQueue((queue.data ?? []) as TherapistVerificationApplication[]);
    setOperatorMemberships((members.data ?? []) as VerifiedTherapist[]);
  }, [client]);

  const reviewTherapistApplication = async (requestId: string, decision: "approved" | "rejected") => {
    if (!client) return;
    if (operatorReason.trim().length < 5) { setError("Enter a clear decision reason (at least five characters)."); return; }
    if (decision === "approved" && (!operatorIdentityVerified || !operatorRegistrationVerified || operatorEvidence.trim().length < 3)) {
      setError("Approval requires identity verification, regulator verification and an evidence reference."); return;
    }
    setBusy(true); setError(""); setNotice("");
    const { data, error: rpcError } = await client.rpc("review_therapist_verification_request", {
      p_request_id: requestId, p_decision: decision, p_evidence_reference: operatorEvidence.trim() || null,
      p_reason: operatorReason.trim(), p_identity_verified: operatorIdentityVerified,
      p_registration_verified: operatorRegistrationVerified
    });
    if (rpcError) { setBusy(false); setError(rpcError.message); return; }
    if (!data) { setBusy(false); setError("This application is no longer pending. Refresh the queue."); return; }
    await loadOperatorData();
    setOperatorReason(""); setOperatorEvidence(""); setOperatorIdentityVerified(false); setOperatorRegistrationVerified(false);
    setBusy(false); setNotice(decision === "approved" ? "Therapist approved and membership activated. The decision was audit-logged." : "Application rejected with an audit-logged reason.");
  };

  const setTherapistActive = async (userId: string, active: boolean) => {
    if (!client) return;
    if (operatorReason.trim().length < 5) { setError("Enter a reason of at least five characters."); return; }
    setBusy(true); setError(""); setNotice("");
    const { data, error: rpcError } = await client.rpc("set_therapist_membership_active", {
      p_user_id: userId, p_is_active: active, p_reason: operatorReason.trim()
    });
    if (rpcError) { setBusy(false); setError(rpcError.message); return; }
    if (!data) { setBusy(false); setError("Verified membership not found. Refresh the directory."); return; }
    await loadOperatorData();
    setOperatorReason(""); setBusy(false);
    setNotice(active ? "Verified therapist reactivated. The decision was audit-logged." : "Therapist access deactivated. The decision was audit-logged.");
  };

  const loadVerificationRequest = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("my_therapist_verification_request");
    if (rpcError) throw rpcError;
    setVerificationRequest((data ?? null) as {status:string;submittedAt?:string;reviewedAt?:string;reviewerNote?:string|null}|null);
  }, [client]);

  const submitVerificationRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setBusy(true); setError(""); setNotice("");
    const credentials = applicantCredentials.split(",").map(value => value.trim()).filter(Boolean);
    const { data, error: rpcError } = await client.rpc("submit_therapist_verification_request", {
      p_full_name: applicantName.trim(), p_professional_title: applicantTitle.trim(),
      p_credentials: credentials, p_registration_label: registrationLabel.trim(),
      p_registration_number: registrationNumber.trim(), p_institution_or_clinic: institution.trim() || null
    });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!data) { setError("Your verification request was not saved. Please refresh and try again."); return; }
    setVerificationRequest({ status: data?.status ?? "pending", submittedAt: new Date().toISOString() });
    setNotice("Your professional verification request has been submitted securely. Clinical records remain locked until an authorized operator verifies your credentials.");
  };

  const loadMembership = useCallback(async () => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("my_therapist_status");
    if (rpcError) throw rpcError;
    setMembership((data ?? null) as TherapistStatus | null);
    if (data && (data as TherapistStatus).verificationStatus === "verified" && (data as TherapistStatus).isActive) {
      await loadPatients();
      await loadCaseSubmissions();
    }
  }, [client, loadPatients, loadCaseSubmissions]);

  useEffect(() => {
    if (!client) return;
    const recoveryErrorCode = new URL(window.location.href).searchParams.get("error_code");
    if (recoveryErrorCode) {
      setError(
        recoveryErrorCode === "otp_expired"
          ? "This password-reset link has expired. Request a new link and use it promptly."
          : "This password-reset link is invalid or has already been used. Request a new link."
      );
    }
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session && new URL(window.location.href).searchParams.get("recovery") === "1") {
        setRecoveryMode(true);
      }
    });
    const { data: authListener } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setError("");
        setNotice("");
      }
      if (event === "SIGNED_OUT") setRecoveryMode(false);
      setSession(nextSession); setMembership(null); setPatients([]); setReports([]); setSelectedPatient(null); setSelectedReport(null);
    });
    return () => { mounted = false; authListener.subscription.unsubscribe(); };
  }, [client]);

  useEffect(() => {
    if (!client || !session) {
      setAalLevel(null);
      setMfaRequired(false);
      setMfaFactorId("");
      return;
    }
    const role = session.user.app_metadata?.registry_role;
    if (role !== "operator" && role !== "reviewer") {
      setAalLevel(null);
      setMfaRequired(false);
      setMfaFactorId("");
      return;
    }
    let active = true;
    (async () => {
      const [assurance, factors] = await Promise.all([
        client.auth.mfa.getAuthenticatorAssuranceLevel(),
        client.auth.mfa.listFactors()
      ]);
      if (!active) return;
      if (assurance.error) throw assurance.error;
      if (factors.error) throw factors.error;
      // Reuse an existing TOTP factor. An earlier enrollment may have created an
      // unverified factor before the user scanned its QR code; enrolling again with
      // the same friendly name then fails with a duplicate-factor error.
      const totpFactors = factors.data?.totp ?? [];
      const existingTotp = totpFactors.find((factor) => factor.status === "verified")
        ?? totpFactors.find((factor) => factor.status === "unverified");
      setMfaFactorId(existingTotp?.id ?? "");
      setAalLevel(assurance.data?.currentLevel ?? null);
      setMfaRequired(!existingTotp || existingTotp.status !== "verified" || assurance.data?.currentLevel !== "aal2");
    })().catch((e: Error) => {
      if (active) {
        setMfaRequired(true);
        setError(`Privileged access requires authenticator MFA: ${e.message}`);
      }
    });
    return () => { active = false; };
  }, [client, session]);

  useEffect(() => {
    if (!client) return;
    loadPublicCases().catch((e: Error) => setError(e.message));
  }, [client, loadPublicCases]);

  useEffect(() => {
    if (!client || !session) return;
    loadMembership().catch((e: Error) => setError(e.message));
  }, [client, session, loadMembership]);

  useEffect(() => {
    if (!client || !session) { setVerificationRequest(null); return; }
    loadVerificationRequest().catch((e: Error) => setError(e.message));
  }, [client, session, loadVerificationRequest]);

  useEffect(() => {
    if (!client || !session || aalLevel !== "aal2" || mfaRequired || session.user.app_metadata?.registry_role !== "operator") {
      setOperatorQueue([]); setOperatorMemberships([]);
      return;
    }
    loadOperatorData().catch((e: Error) => setError(e.message));
  }, [client, session, aalLevel, mfaRequired, loadOperatorData]);

  useEffect(() => {
    if (!client || !session || aalLevel !== "aal2" || mfaRequired || session.user.app_metadata?.registry_role !== "reviewer") {
      setReviewerCases([]); setConsentReviewQueue([]);
      return;
    }
    loadReviewerCases().catch((e: Error) => setError(e.message));
    loadConsentReviewQueue().catch((e: Error) => setError(e.message));
  }, [client, session, aalLevel, mfaRequired, loadReviewerCases, loadConsentReviewQueue]);

  useEffect(() => {
    if (!client || !session || membership?.verificationStatus !== "verified" || !membership.isActive) {
      setConsentEvidenceList([]); return;
    }
    loadMyConsentEvidence().catch((e: Error) => setError(e.message));
  }, [client, session, membership, loadMyConsentEvidence]);

  const openReport = async (reportId: string) => {
    if (!client) return;
    setBusy(true); setError("");
    const [reportResult, versionsResult] = await Promise.all([
      client.rpc("get_my_report", { p_report_id: reportId }),
      client.rpc("list_my_report_versions", { p_report_id: reportId })
    ]);
    setBusy(false);
    if (reportResult.error) { setError(reportResult.error.message); return; }
    if (versionsResult.error) { setError(versionsResult.error.message); return; }
    setSelectedReport((reportResult.data ?? null) as ClinicalReport | null);
    setReportVersions((versionsResult.data ?? []) as ReportVersion[]);
  };

  const enrollRegistryMfa = async () => {
    if (!client) return;
    setBusy(true); setError(""); setNotice("");
    const { data, error: enrollError } = await client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "PNA Clinical Registry"
    });
    setBusy(false);
    if (enrollError) { setError(enrollError.message); return; }
    setMfaFactorId(data.id);
    setMfaQrCode(data.totp.qr_code);
    setMfaSecret(data.totp.secret);
    setNotice("Scan the QR code with an authenticator app, then request a verification challenge.");
  };

  const startRegistryMfaChallenge = async () => {
    if (!client || !mfaFactorId) { setError("Enroll an authenticator before continuing."); return; }
    setBusy(true); setError(""); setNotice("");
    const { data, error: challengeError } = await client.auth.mfa.challenge({ factorId: mfaFactorId });
    setBusy(false);
    if (challengeError) { setError(challengeError.message); return; }
    setMfaChallengeId(data.id);
    setNotice("Enter the current six-digit code from your authenticator app.");
  };

  const verifyRegistryMfa = async (event: FormEvent) => {
    event.preventDefault();
    if (!client || !mfaFactorId || !mfaChallengeId || !/^\d{6}$/.test(mfaCode.trim())) {
      setError("Enter the six-digit authenticator code.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    const { error: verifyError } = await client.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: mfaChallengeId,
      code: mfaCode.trim()
    });
    if (verifyError) { setBusy(false); setError(verifyError.message); return; }
    const [{ data: assurance, error: assuranceError }, { data: sessionData }] = await Promise.all([
      client.auth.mfa.getAuthenticatorAssuranceLevel(),
      client.auth.getSession()
    ]);
    setBusy(false);
    if (assuranceError) { setError(assuranceError.message); return; }
    setAalLevel(assurance.currentLevel ?? null);
    setSession(sessionData.session);
    setMfaCode(""); setMfaChallengeId("");
    setMfaRequired(assurance.currentLevel !== "aal2");
    if (assurance.currentLevel === "aal2") {
      setMfaQrCode(""); setMfaSecret("");
      setNotice("Multi-factor authentication verified. Privileged Registry access is now unlocked for this session.");
    } else {
      setError("The authenticator was verified, but the session has not reached AAL2. Sign in again and complete the MFA challenge.");
    }
  };

  const bootstrapFirstRegistryOperator = async () => {
    if (!client || session?.user.id !== "fc9992a5-557f-4b9e-83a4-6f560c9e4134" || session.user.email?.toLowerCase() !== "sajjadraza.dpt@gmail.com") {
      setError("This account is not eligible for first-operator provisioning.");
      return;
    }
    if (!window.confirm("Assign the first trusted Operator role to this verified Registry account? This will not approve your therapist application.")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { data, error: invokeError } = await client.functions.invoke("bootstrap-first-registry-operator", { body: {} });
      if (invokeError) throw invokeError;
      if (!data?.ok) throw new Error(data?.error ?? "The Operator role assignment was not confirmed.");
      setNotice(data.message ?? "Operator role assigned. Sign in again and complete authenticator MFA.");
      await client.auth.signOut();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Secure Operator provisioning failed.");
    } finally {
      setBusy(false);
    }
  };

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid professional email address.");
      return;
    }
    if (!password) {
      setError("Enter your password to continue.");
      return;
    }
    if (!client) {
      setError("The Registry authentication service is not configured. Please contact the Registry administrator.");
      return;
    }
    // Show immediate feedback so a blocked or unresponsive submit is never silent.
    setBusy(true);
    setNotice("Connecting securely to the Clinical Registry…");
    try {
      const { data, error: authError } = await client.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      // Set the returned session directly as well as listening for auth events.
      // This avoids leaving the sign-in form mounted if the browser auth event
      // is delayed or missed during hydration/navigation.
      if (!data.session) {
        const { data: refreshed, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!refreshed.session) {
          setError("Sign-in did not establish a browser session. Check that the account email is confirmed, then try again. If this continues, send the administrator the time of your attempt.");
          return;
        }
        setSession(refreshed.session);
      } else {
        setSession(data.session);
      }
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signUp = async () => {
    if (!client) return;
    if (password.length < 12) { setError("Use a password with at least 12 characters."); return; }
    setBusy(true); setError(""); setNotice("");
    const redirectTo = `${window.location.origin}/clinical-registry`;
    const { data, error: authError } = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    if (authError) setError(authError.message);
    else setNotice(data.session ? "Account created. Therapist verification is still required before clinical records can be accessed." : "Account created. Check your email if confirmation is enabled. Therapist verification is still required before clinical records can be accessed.");
  };

  const sendPasswordRecovery = async () => {
    if (!client || !email.trim()) { setError("Enter your professional email address first."); return; }
    setBusy(true); setError(""); setNotice("");
    const redirectTo = `${window.location.origin}/clinical-registry?recovery=1`;
    const { error: recoveryError } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setBusy(false);
    if (recoveryError) setError(recoveryError.message);
    else setNotice("If an account exists for this email, a password-reset link has been sent. Check your inbox and spam folder.");
  };

  const resendConfirmationEmail = async () => {
    if (!client || !email.trim()) { setError("Enter your professional email address first."); return; }
    setBusy(true); setError(""); setNotice("");
    const redirectTo = `${window.location.origin}/clinical-registry`;
    const { error: resendError } = await client.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    if (resendError) setError(resendError.message);
    else setNotice("If this account is awaiting confirmation, a new confirmation email has been sent. Check your inbox and spam folder.");
  };

  const updateRecoveredPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!client || newPassword.length < 12) { setError("Choose a password with at least 12 characters."); return; }
    setBusy(true); setError(""); setNotice("");
    const { error: updateError } = await client.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    await client.auth.signOut();
    setNewPassword(""); setRecoveryMode(false);
    setNotice("Password updated. Sign in again with your new password.");
  };

  const uploadConsentEvidence = async (event: FormEvent) => {
    event.preventDefault();
    if (!SIGNED_CONSENT_FORM_APPROVED) { setError("Consent upload is locked until the institution/ethics-approved form and version are supplied and reviewed."); return; }
    if (!client || !consentEvidenceFile || !CLINICAL_REGISTRY_CONSENT_VERSION) return;
    if (consentEvidenceFile.size < 1 || consentEvidenceFile.size > 10 * 1024 * 1024) { setError("Choose a PDF or image up to 10 MB."); return; }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(consentEvidenceFile.type)) { setError("Only PDF, JPG or PNG signed documents are accepted."); return; }
    if (consentEvidencePurpose === "clinical_care" && patientReference.trim().length < 2) { setError("Enter a non-identifying patient reference/code."); return; }
    if (consentEvidencePurpose === "public_case_publication" && !selectedPatient) { setError("Select the patient whose publication consent is being submitted."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const bytes = await consentEvidenceFile.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const declaredSha256 = Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, "0")).join("");
      const patientId = consentEvidencePurpose === "public_case_publication" ? selectedPatient?.id ?? null : null;
      const reference = consentEvidencePurpose === "public_case_publication" ? selectedPatient?.patient_reference ?? "" : patientReference.trim();
      const { data, error: requestError } = await client.rpc("create_consent_evidence_request", {
        p_purpose: consentEvidencePurpose, p_patient_id: patientId, p_patient_reference: reference,
        p_consent_version: CLINICAL_REGISTRY_CONSENT_VERSION, p_declared_sha256: declaredSha256,
        p_content_type: consentEvidenceFile.type, p_declared_size_bytes: consentEvidenceFile.size
      });
      if (requestError) throw requestError;
      const request = Array.isArray(data) ? data[0] : data;
      if (!request?.object_path) throw new Error("The secure evidence request was not created.");
      const { error: uploadError } = await client.storage.from("clinical-consent-evidence").upload(request.object_path, consentEvidenceFile, { contentType: consentEvidenceFile.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: integrityResult, error: integrityError } = await client.functions.invoke("verify-consent-evidence", { body: { evidence_id: request.evidence_id } });
      if (integrityError) throw integrityError;
      if (!integrityResult?.ok || integrityResult?.sha256_verified !== true || integrityResult?.size_verified !== true) {
        throw new Error("The server could not verify the uploaded document integrity. The evidence remains unverified.");
      }
      setConsentEvidenceFile(null); setNotice("Private document uploaded and its SHA-256, file signature and size independently verified by the server. An authorised reviewer must still inspect the original; this is not yet an approved consent grant.");
      await loadMyConsentEvidence();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Consent evidence upload failed.");
      await loadMyConsentEvidence().catch(() => undefined);
    }
    finally { setBusy(false); }
  };

  const retryConsentIntegrity = async (evidenceId: string) => {
    if (!client) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { data, error: integrityError } = await client.functions.invoke("verify-consent-evidence", { body: { evidence_id: evidenceId } });
      if (integrityError) throw integrityError;
      if (!data?.ok || data?.sha256_verified !== true || data?.size_verified !== true) {
        throw new Error("The server could not verify this upload. Check that the original file exists and matches the allowed format.");
      }
      setNotice("Server-side file integrity verification completed. An authorised reviewer must still inspect the original document.");
      await loadMyConsentEvidence();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Server-side integrity verification failed.");
      await loadMyConsentEvidence().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };

  const createPatientAfterConsent = async (evidenceId: string) => {
    if (!client || patientName.trim().length < 1) { setError("Enter the patient display name after consent verification."); return; }
    setBusy(true); setError(""); setNotice("");
    const { data: patientId, error: rpcError } = await client.rpc("create_patient_after_verified_consent", { p_evidence_id: evidenceId, p_display_name: patientName.trim() });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!patientId) { setError("Patient record was not created. Confirm that the care-consent evidence is verified, then refresh the queue."); return; }
    setPatientName(""); setPatientReference(""); setNotice("Patient record created against the verified clinical-care consent evidence.");
    await loadPatients(); await loadMyConsentEvidence();
  };

  const openConsentEvidence = async (path: string) => {
    if (!client) return;
    setBusy(true); setError("");
    const { data, error: downloadError } = await client.storage.from("clinical-consent-evidence").download(path);
    setBusy(false);
    if (downloadError || !data) { setError(downloadError?.message ?? "Could not download the private consent document."); return; }
    const url = URL.createObjectURL(data);
    const anchor = document.createElement("a"); anchor.href = url; anchor.target = "_blank"; anchor.rel = "noreferrer"; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const reviewConsentEvidence = async (evidenceId: string, decision: "verified" | "rejected") => {
    if (!client || consentReviewNote.trim().length < 5) { setError("Add a reviewer note of at least five characters."); return; }
    setBusy(true); setError(""); setNotice("");
    const { data, error: rpcError } = await client.rpc("review_consent_evidence", { p_evidence_id: evidenceId, p_decision: decision, p_note: consentReviewNote.trim() });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!data) { setError("Evidence could not be reviewed. Refresh the queue."); return; }
    setConsentReviewNote(""); await loadConsentReviewQueue();
    setNotice(decision === "verified" ? "Consent document marked verified. Publication consent was activated only for its matching patient." : "Consent evidence rejected with an audit record.");
  };

  const createReport = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedPatient) return;
    setBusy(true); setError("");
    const { data, error: rpcError } = await client.rpc("create_report", { p_patient_id: selectedPatient.id, p_category: category, p_condition: condition });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!data) { setError("The report was not created. Confirm that the selected patient is still active and belongs to your account."); return; }
    setCondition(""); await loadReports(selectedPatient.id); await openReport(data as string);
  };

  const saveAssessment = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(assessmentJson); } catch { setError("Initial assessment must be valid JSON."); return; }
    setBusy(true); setError("");
    const { data: saved, error: rpcError } = await client.rpc("save_initial_assessment", { p_report_id: selectedReport.id, p_assessment: parsed });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (saved !== true) { setError("The initial assessment was not saved. Confirm that this report is still an editable draft."); return; }
    await openReport(selectedReport.id);
  };

  const addFollowUp = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(followUpJson); } catch { setError("Follow-up assessment must be valid JSON."); return; }
    setBusy(true); setError("");
    const { data: saved, error: rpcError } = await client.rpc("add_followup_assessment", { p_report_id: selectedReport.id, p_assessment: parsed });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (saved !== true) { setError("The follow-up was not saved. Confirm that this report is still an editable draft."); return; }
    await openReport(selectedReport.id);
  };

  const addIntervention = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    setBusy(true); setError("");
    const { data: interventionId, error: rpcError } = await client.rpc("add_intervention", { p_report_id: selectedReport.id, p_intervention: interventionText });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!interventionId) { setError("The intervention was not saved. Confirm that this report is still an editable draft."); return; }
    setInterventionText(""); await openReport(selectedReport.id);
  };

  const addOutcome = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    const value = Number(outcomeValue); if (!Number.isFinite(value)) { setError("Enter a valid numeric outcome value."); return; }
    setBusy(true); setError("");
    const { data: outcomeId, error: rpcError } = await client.rpc("add_outcome", { p_report_id: selectedReport.id, p_measure_code: outcomeCode, p_measure_name: outcomeName, p_value: value, p_direction: outcomeDirection });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!outcomeId) { setError("The outcome was not saved. Confirm that this report is still an editable draft."); return; }
    setOutcomeName(""); setOutcomeCode(""); setOutcomeValue(""); await openReport(selectedReport.id);
  };

  const finaliseReport = async () => {
    if (!client || !selectedReport) return; setBusy(true); setError("");
    const { data: finalised, error: rpcError } = await client.rpc("finalise_report", { p_report_id: selectedReport.id });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (finalised !== true) { setError("The report was not finalised. Confirm that it is complete and still in draft status."); return; }
    await openReport(selectedReport.id); if (selectedPatient) await loadReports(selectedPatient.id);
  };

  const loadRecordAccessEvents = async (patientId: string) => {
    if (!client) return;
    const { data, error: rpcError } = await client.rpc("list_my_record_access_events", { p_patient_id: patientId });
    if (rpcError) throw rpcError;
    setRecordAccessEvents((data ?? []) as RecordAccessEvent[]);
  };

  const printReport = async () => {
    if (!client || !selectedReport) return;
    setBusy(true); setError("");
    const { data: accessLogged, error: auditError } = await client.rpc("log_report_print_request", { p_report_id: selectedReport.id });
    setBusy(false);
    if (auditError) { setError(`Print was not started because its access event could not be recorded: ${auditError.message}`); return; }
    if (accessLogged !== true) { setError("Print was not started because the report access event could not be confirmed. Refresh the report and try again."); return; }
    window.print();
  };

  const exportPatient = async () => {
    if (!client || !selectedPatient) return; setBusy(true); setError("");
    const { data, error: rpcError } = await client.rpc("export_my_patient_record", { p_patient_id: selectedPatient.id });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!data || typeof data !== "object") { setError("The patient record export returned no data. Confirm ownership and refresh the record."); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `clinical-record-${selectedPatient.patient_reference}.json`; anchor.click(); URL.revokeObjectURL(url);
    await loadRecordAccessEvents(selectedPatient.id);
  };

  const submitCaseForReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!SIGNED_CONSENT_EVIDENCE_WORKFLOW_READY) { setError("Case submission is disabled until separate signed publication consent can be securely verified by an authorised reviewer."); return; }
    if (!client || !selectedPatient || !selectedReport || !CLINICAL_REGISTRY_CONSENT_VERSION || !publicationConsentConfirmed || !deidentifiedConfirmed) return;
    setBusy(true); setError(""); setNotice("");
    const { data: consentId, error: consentError } = await client.rpc("get_current_publication_consent_event", { p_patient_id: selectedPatient.id });
    if (consentError || !consentId) { setBusy(false); setError(consentError?.message ?? "A separately uploaded and reviewer-verified publication consent is required before case submission."); return; }
    const { data: caseId, error: createError } = await client.rpc("create_case_draft", {
      p_report_id: selectedReport.id, p_publication_consent_event_id: consentId,
      p_case_title: caseTitle, p_condition_label: caseCondition, p_age_band: caseAgeBand,
      p_clinical_context: caseContext, p_intervention_summary: caseIntervention,
      p_outcome_summary: caseOutcome, p_evidence_reference: caseEvidence, p_deidentified_confirmed: true
    });
    if (createError || !caseId) { setBusy(false); setError(createError?.message ?? "Could not create case submission."); return; }
    const { data: submitted, error: submitError } = await client.rpc("submit_case_for_review", { p_case_id: caseId });
    setBusy(false);
    if (submitError || !submitted) { setError(submitError?.message ?? "Case draft saved, but it could not be submitted for review."); await loadCaseSubmissions(); return; }
    setCaseTitle(""); setCaseCondition(""); setCaseContext(""); setCaseIntervention(""); setCaseOutcome(""); setCaseEvidence("");
    setPublicationConsentConfirmed(false); setDeidentifiedConfirmed(false);
    setNotice("Case submitted for review. It will not appear publicly until an authorised reviewer approves and publishes it.");
    await loadCaseSubmissions();
  };

  const applyReportCorrection = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedPatient || !selectedReport) return;
    let changes: Record<string, unknown>;
    try { changes = JSON.parse(correctionJson); } catch { setError("Correction details must be valid JSON."); return; }
    setBusy(true); setError(""); setNotice("");
    const { data: requestId, error: requestError } = await client.rpc("request_record_correction", {
      p_patient_id: selectedPatient.id, p_report_id: selectedReport.id, p_target_type: "report",
      p_target_id: selectedReport.id, p_reason: correctionReason, p_requested_changes: changes
    });
    if (requestError || !requestId) { setBusy(false); setError(requestError?.message ?? "Could not save correction request."); return; }
    const { data: correctionApplied, error: applyError } = await client.rpc("apply_own_report_correction", { p_request_id: requestId });
    setBusy(false);
    if (applyError) { setError(`Correction request saved but could not be applied: ${applyError.message}`); return; }
    if (correctionApplied !== true) { setError("The correction request was saved but not applied. Refresh the report and review its status."); return; }
    setCorrectionReason(""); setNotice("Correction applied by the owning therapist. The original change history remains in the audit trail.");
    await openReport(selectedReport.id);
  };
  const withdrawPublishedCase = async (submission: CaseSubmission) => {
    if (!client || !CLINICAL_REGISTRY_CONSENT_VERSION) return; setBusy(true); setError("");
    const { data: currentConsentId, error: consentLookupError } = await client.rpc("get_current_publication_consent_event", {
      p_patient_id: submission.patient_id
    });
    if (consentLookupError) { setBusy(false); setError(consentLookupError.message); return; }
    if (currentConsentId) {
      const { data: withdrawalEventId, error: consentError } = await client.rpc("withdraw_verified_patient_consent", {
        p_patient_id: submission.patient_id,
        p_purpose: "public_case_publication",
        p_consent_version: CLINICAL_REGISTRY_CONSENT_VERSION
      });
      if (consentError) { setBusy(false); setError(consentError.message); return; }
      if (!withdrawalEventId) { setBusy(false); setError("Consent withdrawal could not be confirmed. Refresh the case before retrying."); return; }
    }
    const { data: withdrawn, error: rpcError } = await client.rpc("withdraw_public_case", { p_case_id: submission.case_id });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (withdrawn !== true) { setError("The case was not withdrawn. Refresh your submissions and try again."); return; }
    await loadCaseSubmissions(); await loadPublicCases();
    setNotice("Publication consent withdrawal was recorded and the case was removed from the public library.");
  };

  const reviewCaseSubmission = async (caseId: string, decision: "approved" | "rejected") => {
    if (!client) return;
    if (decision === "rejected" && !reviewerNote.trim()) {
      setError("Add a concise reason before rejecting a case.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    const { data: reviewed, error: rpcError } = await client.rpc("review_case_submission", {
      p_case_id: caseId, p_decision: decision, p_reviewer_note: reviewerNote.trim() || null
    });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (reviewed !== true) { setError("This case was not reviewed. It may no longer be awaiting review; refresh the queue."); return; }
    setReviewerNote("");
    setNotice(decision === "approved" ? "Case approved. It still requires a separate publication action." : "Case rejected with reviewer feedback.");
    await loadReviewerCases();
  };

  const publishReviewedCase = async (caseId: string) => {
    if (!client) return;
    setBusy(true); setError(""); setNotice("");
    const { data: published, error: rpcError } = await client.rpc("publish_approved_case", { p_case_id: caseId });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (published !== true) { setError("The case was not published. Confirm it is approved and still has valid publication consent."); return; }
    setNotice("Approved case published to the de-identified public Case Library.");
    await loadReviewerCases();
    await loadPublicCases();
  };
  if (!client) return <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-800"><section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><ShieldCheck className="text-teal-700" size={30}/><h1 className="mt-4 text-2xl font-bold text-[#173653]">PNA Clinical Registry</h1><p className="mt-3 text-sm leading-6 text-slate-600">The isolated Registry service is not configured yet. This workspace will not connect to or reuse the PNA website database.</p><p className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">Required environment settings: NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL, NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY (or the legacy NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY) and an institution-approved NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION. No patient data can be entered until these are configured.</p></section></main>;

  if (!recoveryMode && session && mfaRequired && (session.user.app_metadata?.registry_role === "operator" || session.user.app_metadata?.registry_role === "reviewer")) return <main className="min-h-screen bg-[#f5f8fb] px-5 py-16 text-slate-800"><section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="text-teal-700" size={30}/><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Physio Nexus Academy</p><h1 className="text-2xl font-bold text-[#173653]">Extra security required</h1></div></div><p className="mt-3 text-sm leading-6 text-slate-600">Reviewer and operator actions require a verified authenticator and an AAL2 session. Your privileged queues remain locked until this step is complete.</p>{!mfaFactorId ? <button type="button" onClick={enrollRegistryMfa} disabled={busy} className="mt-6 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?"Please wait…":"Set up authenticator MFA"}</button> : <><p className="mt-4 text-xs font-semibold text-slate-700">Authenticator factor detected: {mfaQrCode ? "Setup pending verification" : "Ready to verify"}</p>{mfaQrCode&&<div className="mt-4 rounded-xl border border-slate-200 p-3 text-center"><img src={mfaQrCode} alt="Authenticator setup QR code" className="mx-auto h-48 w-48"/><p className="mt-3 break-all text-xs text-slate-500">Manual setup key: <span className="font-mono font-semibold text-slate-800">{mfaSecret}</span></p></div>}<button type="button" onClick={startRegistryMfaChallenge} disabled={busy} className="mt-4 w-full rounded-xl border border-teal-700 px-4 py-3 text-sm font-bold text-teal-800 disabled:opacity-50">{busy?"Please wait…":mfaQrCode?"I've scanned the QR — send verification challenge":"Send authenticator challenge"}</button>{mfaChallengeId&&<form onSubmit={verifyRegistryMfa} className="mt-4 space-y-3"><input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={mfaCode} onChange={e=>setMfaCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6-digit authenticator code" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"/><button disabled={busy||mfaCode.length!==6} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?"Verifying…":"Verify and unlock privileged access"}</button></form>}</>}{error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}{notice&&<p role="status" className="mt-4 rounded-xl bg-teal-50 p-3 text-xs text-teal-800">{notice}</p>}<button type="button" onClick={()=>client?.auth.signOut()} className="mt-4 w-full px-2 py-2 text-xs font-semibold text-slate-500 underline">Sign out</button></section></main>;

  if (recoveryMode) return <main className="min-h-screen bg-[#f5f8fb] px-5 py-16 text-slate-800"><section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="text-teal-700" size={30}/><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Physio Nexus Academy</p><h1 className="text-2xl font-bold text-[#173653]">Set a new password</h1></div></div><p className="mt-3 text-sm leading-6 text-slate-500">Choose a new password for your Clinical Registry account. Your clinical records remain protected by therapist verification and ownership controls.</p><form onSubmit={updateRecoveredPassword} className="mt-6 space-y-3"><input required type="password" minLength={12} autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password (12+ characters)" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"/><button disabled={busy || newPassword.length<12} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?"Please wait…":"Update password"}</button></form>{error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}{notice&&<p role="status" className="mt-4 rounded-xl bg-teal-50 p-3 text-xs text-teal-800">{notice}</p>}</section></main>;

  if (!session) return <main className="min-h-screen bg-[#f5f8fb] px-5 py-16 text-slate-800"><section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="text-teal-700" size={30}/><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Physio Nexus Academy</p><h1 className="text-2xl font-bold text-[#173653]">Clinical Registry</h1></div></div><p className="mt-3 text-sm leading-6 text-slate-500">Sign in to your private clinical workspace. Each therapist can access only their own records.</p><form noValidate onSubmit={signIn} className="mt-6 space-y-3"><input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Professional email" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"/><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"/><button disabled={busy} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?"Please wait…":"Sign in"}</button></form><button onClick={signUp} disabled={busy || !email || password.length<12} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">Create therapist account</button><button type="button" onClick={sendPasswordRecovery} disabled={busy || !email.trim()} className="mt-2 w-full px-2 py-2 text-xs font-semibold text-teal-700 underline disabled:opacity-50">Forgot password? Send reset link</button><button type="button" onClick={resendConfirmationEmail} disabled={busy || !email.trim()} className="w-full px-2 py-2 text-xs font-semibold text-slate-600 underline disabled:opacity-50">Resend confirmation email</button>{error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}{notice&&<p className="mt-4 rounded-xl bg-teal-50 p-3 text-xs text-teal-800">{notice}</p>}<p className="mt-5 flex items-center gap-2 text-[11px] text-slate-400"><LockKeyhole size={13}/> Private Registry database · separate from the PNA website database</p><a href="/clinical-registry/library" className="mt-4 block text-center text-xs font-semibold text-teal-700 underline">Browse public Case Library</a></section></main>;

  const verified = membership?.verificationStatus === "verified" && membership?.isActive === true;

  return <main className="min-h-screen bg-[#f5f8fb] px-3 py-5 text-slate-800 sm:px-6 sm:py-8">
    <style jsx global>{`@media print { @page { margin: 14mm; } body * { visibility: hidden !important; } #registry-report-print, #registry-report-print * { visibility: visible !important; } #registry-report-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: 0 !important; box-shadow: none !important; padding: 0 !important; } #registry-report-print .no-print { display: none !important; } #registry-report-print pre { max-height: none !important; overflow: visible !important; white-space: pre-wrap !important; background: white !important; border: 1px solid #dbe3ea !important; } }`}</style>
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Physio Nexus Academy</p><h1 className="mt-1 text-2xl font-bold text-[#173653]">Clinical Registry</h1><p className="mt-1 text-xs text-slate-500">Private therapist-owned clinical documentation</p></div><div className="flex items-center gap-3"><a href="/clinical-registry/library" className="text-xs font-semibold text-teal-700 underline">Public Case Library</a><button onClick={()=>client.auth.signOut()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><LogOut size={14}/> Sign out</button></div></header>
      {error&&<p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p className="mb-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
      {session.user.id === "fc9992a5-557f-4b9e-83a4-6f560c9e4134" && session.user.email?.toLowerCase() === "sajjadraza.dpt@gmail.com" && !session.user.app_metadata?.registry_role && <section className="mb-5 rounded-2xl border border-teal-200 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">One-time secure setup</p>
        <h2 className="mt-1 text-lg font-bold text-[#173653]">Initialize the first Registry Operator</h2>
        <p className="mt-2 text-xs leading-5 text-slate-600">This restricted action verifies your signed-in account on the Registry server and assigns the first Operator role only if no other Operator exists. It does not approve your pending therapist application. Afterward, sign in again and complete authenticator MFA before privileged access is enabled.</p>
        <button type="button" onClick={bootstrapFirstRegistryOperator} disabled={busy} className="mt-4 rounded-xl bg-teal-700 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{busy ? "Verifying securely…" : "Set up first Registry Operator"}</button>
      </section>}
      {!verified ? <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <ShieldCheck size={28} className="text-teal-700"/>
          <h2 className="mt-3 text-lg font-bold text-[#173653]">Professional verification</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Submit your professional details for manual verification. Patient records remain inaccessible until an authorized Registry operator verifies your credentials and activates your membership.</p>
          {verificationRequest && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Application status: {verificationRequest.status.replace("_"," ")}</p>
            {verificationRequest.submittedAt && <p className="mt-1 text-[11px] text-amber-800">Submitted {new Date(verificationRequest.submittedAt).toLocaleDateString()}</p>}
            {verificationRequest.reviewedAt && <p className="mt-1 text-[11px] text-amber-800">Reviewed {new Date(verificationRequest.reviewedAt).toLocaleDateString()}</p>}
            {verificationRequest.reviewerNote && <p className="mt-2 text-xs leading-5 text-amber-950">Reviewer feedback: {verificationRequest.reviewerNote}</p>}
          </div>}
          {membership && <p className="mt-4 text-xs text-slate-500">Membership record: {membership.fullName ?? "Name not available"} · {membership.verificationStatus ?? "not verified"}</p>}
          <p className="mt-4 text-[11px] leading-5 text-slate-500">Submitting this form does not grant access, approve credentials, or assign privileged roles. Do not enter patient information here.</p>
        </div>
        <form onSubmit={submitVerificationRequest} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <h3 className="font-bold text-[#173653]">Therapist application</h3>
          <input required minLength={2} maxLength={160} value={applicantName} onChange={e=>setApplicantName(e.target.value)} placeholder="Full professional name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
          <input required minLength={2} maxLength={120} value={applicantTitle} onChange={e=>setApplicantTitle(e.target.value)} placeholder="Professional title" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
          <input value={applicantCredentials} onChange={e=>setApplicantCredentials(e.target.value)} placeholder="Credentials (comma separated)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
          <div className="grid grid-cols-2 gap-2">
            <input required minLength={2} maxLength={80} value={registrationLabel} onChange={e=>setRegistrationLabel(e.target.value)} placeholder="Registration body" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
            <input required minLength={2} maxLength={100} value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} placeholder="Registration number" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
          </div>
          <input maxLength={200} value={institution} onChange={e=>setInstitution(e.target.value)} placeholder="Institution / clinic (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
          <button disabled={busy || !applicantName.trim() || !applicantTitle.trim() || !registrationLabel.trim() || !registrationNumber.trim()} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-xs font-bold text-white disabled:opacity-40">{busy ? "Submitting…" : "Submit / update application"}</button>
        </form>
      </section> : <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Users size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">My patients</h2></div><p className="mt-1 text-[11px] text-slate-400">Only records owned by your therapist account are listed.</p><div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{patients.map(p=><button key={p.id} onClick={()=>{setSelectedPatient(p);setSelectedReport(null);loadReports(p.id).catch((e:Error)=>setError(e.message));loadRecordAccessEvents(p.id).catch((e:Error)=>setError(e.message));}} className={`w-full rounded-xl border p-3 text-left ${selectedPatient?.id===p.id?"border-teal-500 bg-teal-50":"border-slate-100 hover:bg-slate-50"}`}><p className="text-sm font-semibold">{p.display_name}</p><p className="mt-1 text-[10px] text-slate-500">{p.patient_reference}</p></button>)}{patients.length===0&&<p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No patient records yet.</p>}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><UserPlus size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">Signed consent evidence</h2></div><p className="mt-2 text-[11px] leading-5 text-slate-500">The original will stay in private storage; patient creation and publication consent require reviewer verification.</p><p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Uploads remain locked until the institution/ethics-approved consent form and its exact version are supplied. Do not upload a generic or unapproved form.</p><form onSubmit={uploadConsentEvidence} className="mt-4 space-y-3"><select value={consentEvidencePurpose} onChange={e=>setConsentEvidencePurpose(e.target.value as "clinical_care" | "public_case_publication")} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"><option value="clinical_care">Clinical-care consent (before patient registration)</option><option value="public_case_publication">Separate public case publication consent</option></select>{consentEvidencePurpose==="clinical_care"?<input required value={patientReference} onChange={e=>setPatientReference(e.target.value)} placeholder="Non-identifying patient reference / code" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>:<p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{selectedPatient?`Selected patient: ${selectedPatient.patient_reference}`:"Select a patient from My patients before uploading publication consent."}</p>}<input required type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>setConsentEvidenceFile(e.target.files?.[0]??null)} className="w-full text-xs"/><p className="text-[10px] text-slate-400">PDF, JPG or PNG · maximum 10 MB · no public link is created</p><button disabled={busy||!SIGNED_CONSENT_FORM_APPROVED||!consentEvidenceFile||!CLINICAL_REGISTRY_CONSENT_VERSION||(consentEvidencePurpose==="public_case_publication"&&!selectedPatient)} className="w-full rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40">Upload signed document for review</button></form>{consentEvidenceList.length>0&&<div className="mt-4 space-y-2 border-t border-slate-100 pt-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">My consent evidence</p>{consentEvidenceList.map(e=><div key={e.evidence_id} className="rounded-lg border border-slate-100 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">{e.purpose==="clinical_care"?"Clinical care":"Public case publication"} · {e.patient_reference}</p><span className="text-[10px] font-semibold text-slate-500">{e.status.replace("_"," ")}</span></div>{e.reviewer_note&&<p className="mt-1 text-[10px] text-slate-500">Reviewer: {e.reviewer_note}</p>}{e.status==="pending_review"&&e.integrity_verified_at&&<p className="mt-2 text-[10px] font-semibold text-emerald-700">File integrity verified {new Date(e.integrity_verified_at).toLocaleString()} · awaiting human review</p>}{e.status==="pending_review"&&!e.integrity_verified_at&&<button disabled={busy} onClick={()=>retryConsentIntegrity(e.evidence_id)} className="mt-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold disabled:opacity-40">Retry server integrity check</button>}{e.purpose==="clinical_care"&&e.status==="verified"&&<div className="mt-2 space-y-2"><input value={patientName} onChange={ev=>setPatientName(ev.target.value)} placeholder="Patient display name (only saved after verification)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"/><button disabled={busy||!patientName.trim()} onClick={()=>createPatientAfterConsent(e.evidence_id)} className="rounded-lg bg-teal-700 px-3 py-2 text-[10px] font-bold text-white disabled:opacity-40">Create patient using verified consent</button></div>}</div>)}</div>}</section>
        </aside>
        <section className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold text-[#173653]">Clinical reports</h2><p className="mt-1 text-[11px] text-slate-400">{selectedPatient?`${selectedPatient.display_name} · ${selectedPatient.patient_reference}`:"Select a patient to view reports."}</p></div>{selectedPatient&&<button onClick={exportPatient} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><FileDown size={14}/> Export record</button>}</div>
            {selectedPatient&&recordAccessEvents.length>0&&<div className="mt-3 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Record access history</p><div className="mt-2 space-y-1">{recordAccessEvents.slice(0,5).map((event,i)=><p key={`${event.action}-${event.occurred_at}-${i}`} className="text-[10px] text-slate-600">{event.action==="patient_json_export"?"JSON record export":event.action==="report_print_requested"?"Report print / PDF requested":event.action} · {new Date(event.occurred_at).toLocaleString()}</p>)}</div></div>}
            {selectedPatient&&<form onSubmit={createReport} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"><option>Musculoskeletal</option><option>Neurological</option><option>Cardiorespiratory</option><option>Sports Rehabilitation</option><option>Paediatrics</option><option>Other</option></select><input required value={condition} onChange={e=>setCondition(e.target.value)} placeholder="Condition / diagnosis" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white"><Plus size={14}/> New report</button></form>}
            <div className="mt-4 space-y-2">{reports.map(r=><button key={r.report_id} onClick={()=>openReport(r.report_id)} className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-left ${selectedReport?.id===r.report_id?"border-teal-500 bg-teal-50":"border-slate-100 hover:bg-slate-50"}`}><span><span className="block text-sm font-semibold">{r.condition}</span><span className="mt-1 block text-[10px] text-slate-500">{r.category} · {r.assessment_date}</span></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold">{r.status}</span></button>)}{selectedPatient&&reports.length===0&&<p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No reports for this patient yet.</p>}</div>
          </section>
          {selectedReport&&<section className="rounded-2xl border border-slate-200 bg-white p-5" id="registry-report-print"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Clinical report</p><h2 className="mt-1 text-xl font-bold text-[#173653]">{selectedReport.condition}</h2><p className="mt-1 text-xs text-slate-500">{selectedReport.patient?.displayName} · {selectedReport.patient?.patientReference} · {selectedReport.category} · {selectedReport.assessmentDate}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Status: {selectedReport.status}</p></div><div className="no-print flex gap-2"><button onClick={printReport} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><Printer size={14}/> Export PDF</button>{selectedReport.status==="draft"&&<button onClick={finaliseReport} disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Finalise</button>}</div></div>
            {reportVersions.length > 0 && <section className="mt-5 rounded-xl border border-slate-100 p-4 no-print"><h3 className="text-xs font-bold text-[#173653]">Version history</h3><p className="mt-1 text-[10px] leading-5 text-slate-500">Read-only snapshots captured automatically before report updates. Earlier versions are preserved; they cannot be edited or deleted.</p><div className="mt-3 space-y-2">{reportVersions.map(version=><details key={version.version_id} className="rounded-lg border border-slate-100 p-3"><summary className="cursor-pointer text-xs font-semibold">Revision {version.revision_number} · {new Date(version.created_at).toLocaleString()}</summary><p className="mt-2 text-[10px] text-slate-500">{version.change_reason}</p><pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-[10px] leading-5">{JSON.stringify(version.snapshot,null,2)}</pre></details>)}</div></section>}
            {(selectedReport.clinicalSummary || selectedReport.dischargeStatus || (selectedReport.recommendations?.length ?? 0) > 0) && <section className="mt-5 rounded-xl border border-slate-100 p-4"><h3 className="text-xs font-bold text-[#173653]">Clinical summary and plan</h3>{selectedReport.clinicalSummary&&<p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-700">{selectedReport.clinicalSummary}</p>}{selectedReport.dischargeStatus&&<p className="mt-2 text-xs"><strong>Discharge status:</strong> {selectedReport.dischargeStatus}</p>}{(selectedReport.recommendations?.length??0)>0&&<ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">{selectedReport.recommendations?.map((item,i)=><li key={i}>{item}</li>)}</ul>}</section>}
            <div className="mt-4 grid gap-4 md:grid-cols-2"><div><h3 className="text-xs font-bold text-[#173653]">Initial assessment</h3><pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.initialAssessment??{},null,2)}</pre></div><div><h3 className="text-xs font-bold text-[#173653]">Follow-ups</h3><pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.followUpAssessments??[],null,2)}</pre></div><div><h3 className="text-xs font-bold text-[#173653]">Interventions</h3><pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.interventions??[],null,2)}</pre></div><div><h3 className="text-xs font-bold text-[#173653]">Outcomes</h3><pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.outcomes??[],null,2)}</pre></div></div>
            {selectedReport.status==="draft"&&<div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 xl:grid-cols-2 no-print"><form onSubmit={saveAssessment} className="space-y-2"><h3 className="text-xs font-bold">Save initial assessment (JSON)</h3><textarea value={assessmentJson} onChange={e=>setAssessmentJson(e.target.value)} rows={7} className="w-full rounded-xl border border-slate-200 p-3 font-mono text-[11px]"/><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Save assessment</button></form><form onSubmit={addFollowUp} className="space-y-2"><h3 className="text-xs font-bold">Add follow-up (JSON)</h3><textarea value={followUpJson} onChange={e=>setFollowUpJson(e.target.value)} rows={7} className="w-full rounded-xl border border-slate-200 p-3 font-mono text-[11px]"/><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Add follow-up</button></form><form onSubmit={addIntervention} className="space-y-2"><h3 className="text-xs font-bold">Record intervention</h3><input required value={interventionText} onChange={e=>setInterventionText(e.target.value)} placeholder="Intervention / technique" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Save intervention</button></form><form onSubmit={addOutcome} className="space-y-2"><h3 className="text-xs font-bold">Record outcome</h3><input required value={outcomeCode} onChange={e=>setOutcomeCode(e.target.value)} placeholder="Measure code (e.g. NPRS)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><input required value={outcomeName} onChange={e=>setOutcomeName(e.target.value)} placeholder="Measure name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><input required type="number" step="any" value={outcomeValue} onChange={e=>setOutcomeValue(e.target.value)} placeholder="Measured value" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><select value={outcomeDirection} onChange={e=>setOutcomeDirection(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"><option value="lower_is_better">Lower is better</option><option value="higher_is_better">Higher is better</option><option value="descriptive">Descriptive</option></select><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Save outcome</button></form></div>}
          </section>}
          {selectedReport && selectedPatient && <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-[#173653]">Correct an existing report</h2>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Only you, as the record owner, can apply a correction. Changed fields are recorded in the audit trail; the original record is not silently erased.</p>
            <form onSubmit={applyReportCorrection} className="mt-3 space-y-3">
              <textarea required minLength={5} value={correctionReason} onChange={e=>setCorrectionReason(e.target.value)} placeholder="Reason for correction" rows={2} className="w-full rounded-xl border border-slate-200 p-3 text-xs"/>
              <textarea required value={correctionJson} onChange={e=>setCorrectionJson(e.target.value)} rows={6} className="w-full rounded-xl border border-slate-200 p-3 font-mono text-[11px]"/>
              <p className="text-[10px] text-slate-400">Permitted keys: category, condition, clinical_summary, discharge_status, recommendations.</p>
              <button disabled={busy} className="rounded-xl border border-teal-700 px-4 py-2.5 text-xs font-bold text-teal-800 disabled:opacity-40">Submit and apply owner correction</button>
            </form>
          </section>}
          {selectedReport?.status === "final" && selectedPatient && CLINICAL_REGISTRY_CONSENT_VERSION && <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2"><BookOpen size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">Submit de-identified case</h2></div>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Only a final report can be submitted. This is a staging workflow: the consent checkbox records therapist attestation only; it does not upload or verify a signed consent form. Do not submit real patient cases until PNA's approved signed-consent verification and human privacy-review process is active. Publication also requires separate patient consent and an independent reviewer decision.</p>
            <form onSubmit={submitCaseForReview} className="mt-4 grid gap-3 md:grid-cols-2">
              <input required value={caseTitle} onChange={e=>setCaseTitle(e.target.value)} placeholder="Case title" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
              <input required value={caseCondition} onChange={e=>setCaseCondition(e.target.value)} placeholder="Condition label" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
              <select value={caseAgeBand} onChange={e=>setCaseAgeBand(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"><option value="child">Child</option><option value="adolescent">Adolescent</option><option value="18-29">18–29</option><option value="30-44">30–44</option><option value="45-59">45–59</option><option value="60-74">60–74</option><option value="75+">75+</option><option value="not_reported">Not reported</option></select>
              <input value={caseEvidence} onChange={e=>setCaseEvidence(e.target.value)} placeholder="Evidence reference / DOI / URL (optional)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/>
              <textarea required minLength={20} value={caseContext} onChange={e=>setCaseContext(e.target.value)} placeholder="De-identified clinical context" rows={4} className="rounded-xl border border-slate-200 p-3 text-xs md:col-span-2"/>
              <textarea required minLength={20} value={caseIntervention} onChange={e=>setCaseIntervention(e.target.value)} placeholder="Intervention summary" rows={4} className="rounded-xl border border-slate-200 p-3 text-xs"/>
              <textarea required minLength={20} value={caseOutcome} onChange={e=>setCaseOutcome(e.target.value)} placeholder="Outcome summary" rows={4} className="rounded-xl border border-slate-200 p-3 text-xs"/>
              <label className="flex items-start gap-2 text-[11px] leading-5 text-slate-600 md:col-span-2"><input type="checkbox" checked={publicationConsentConfirmed} onChange={e=>setPublicationConsentConfirmed(e.target.checked)} className="mt-1"/> Separate patient consent for public educational case publication has been obtained and documented using the approved form.</label>
              <label className="flex items-start gap-2 text-[11px] leading-5 text-slate-600 md:col-span-2"><input type="checkbox" checked={deidentifiedConfirmed} onChange={e=>setDeidentifiedConfirmed(e.target.checked)} className="mt-1"/> I confirm this narrative is de-identified and contains no names, dates of birth, contact details, addresses, record numbers or other direct identifiers.</label>
              <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900 md:col-span-2">Submission is locked until signed publication consent can be securely verified by an authorised reviewer. This checkbox alone is not sufficient evidence.</p><button disabled className="rounded-xl bg-slate-300 px-4 py-3 text-xs font-bold text-slate-600 md:col-span-2">Submission unavailable — consent verification pending</button>
            </form>
          </section>}
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><BookOpen size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">My case submissions</h2></div><div className="mt-3 space-y-2">{caseSubmissions.map(c=><div key={c.case_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3"><div><p className="text-xs font-semibold">{c.case_title}</p><p className="mt-1 text-[10px] text-slate-500">{c.status}{c.reviewer_note?` · ${c.reviewer_note}`:""}</p></div>{c.status!=="withdrawn"&&<button disabled={busy||!CLINICAL_REGISTRY_CONSENT_VERSION} onClick={()=>withdrawPublishedCase(c)} className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-semibold text-red-700">Withdraw consent & case</button>}</div>)}{caseSubmissions.length===0&&<p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">No case submissions yet.</p>}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><BookOpen size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">Public Case Library</h2></div><p className="mt-1 text-[11px] text-slate-400">Only independently reviewed, published, de-identified cases appear here.</p><div className="mt-3 space-y-3">{publicCases.map(c=><article key={c.case_id} className="rounded-xl border border-slate-100 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#173653]">{c.case_title}</h3><span className="text-[10px] text-slate-500">{c.condition_label} · {c.age_band??"Age not reported"}</span></div><p className="mt-2 text-xs leading-5 text-slate-600">{c.clinical_context}</p><p className="mt-2 text-xs leading-5 text-slate-600"><strong>Intervention:</strong> {c.intervention_summary}</p><p className="mt-2 text-xs leading-5 text-slate-600"><strong>Outcome:</strong> {c.outcome_summary}</p>{c.evidence_reference&&/^https?:\/\//i.test(c.evidence_reference)&&<a href={c.evidence_reference} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-teal-700 underline">Evidence reference</a>}</article>)}{publicCases.length===0&&<p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">No published cases available yet.</p>}</div></section>
        </section>
      </div>}

      {session.user.app_metadata?.registry_role === "operator" && <section className="mt-5 rounded-2xl border border-amber-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Restricted operator access</p><h2 className="mt-1 text-lg font-bold text-[#173653]">Therapist verification console</h2><p className="mt-1 text-xs text-slate-500">Verify identity and current registration independently. No patient records are exposed in this console.</p></div>
          <button onClick={()=>loadOperatorData().catch((e:Error)=>setError(e.message))} disabled={busy} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">Refresh</button>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <label className="block text-xs font-semibold text-slate-700">Decision / access-change reason</label>
          <textarea value={operatorReason} onChange={e=>setOperatorReason(e.target.value)} rows={2} maxLength={2000} placeholder="Record the reason for approval, rejection, deactivation or reactivation" className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs"/>
        </div>
        <div className="mt-4 space-y-3">
          {operatorQueue.map(item=><article key={item.request_id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-bold text-[#173653]">{item.full_name}</h3><p className="mt-1 text-xs text-slate-600">{item.professional_title} · {item.credentials?.join(", ") || "Credentials not specified"}</p><p className="mt-1 text-xs text-slate-600">{item.registration_label}: {item.registration_number}</p><p className="mt-1 text-[11px] text-slate-500">{item.institution_or_clinic || "Institution not provided"} · Submitted {new Date(item.submitted_at).toLocaleDateString()}</p><p className="mt-1 break-all text-[10px] text-slate-400">Account: {item.user_id}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">{item.status}</span></div>
            <input value={operatorEvidence} onChange={e=>setOperatorEvidence(e.target.value)} placeholder="Regulator verification evidence / reference (required for approval)" className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"/>
            <label className="mt-3 flex items-start gap-2 text-xs text-slate-600"><input type="checkbox" checked={operatorIdentityVerified} onChange={e=>setOperatorIdentityVerified(e.target.checked)} className="mt-0.5"/> Identity independently checked against reliable identification.</label>
            <label className="mt-2 flex items-start gap-2 text-xs text-slate-600"><input type="checkbox" checked={operatorRegistrationVerified} onChange={e=>setOperatorRegistrationVerified(e.target.checked)} className="mt-0.5"/> Current registration independently verified with the named regulator.</label>
            <div className="mt-3 flex flex-wrap gap-2"><button disabled={busy||!operatorIdentityVerified||!operatorRegistrationVerified||!operatorEvidence.trim()||operatorReason.trim().length<5} onClick={()=>reviewTherapistApplication(item.request_id,"approved")} className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Approve & activate</button><button disabled={busy||operatorReason.trim().length<5} onClick={()=>reviewTherapistApplication(item.request_id,"rejected")} className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-40">Reject with reason</button></div>
          </article>)}
          {operatorQueue.length===0 && <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No pending therapist applications.</p>}
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-sm font-bold text-[#173653]">Verified therapist access</h3><p className="mt-1 text-[11px] text-slate-500">Deactivation immediately blocks access to private clinical records. Reactivation is limited to previously verified accounts.</p><div className="mt-3 space-y-2">
          {operatorMemberships.map(item=><div key={item.user_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3"><div><p className="text-xs font-semibold text-slate-800">{item.full_name}</p><p className="mt-1 text-[10px] text-slate-500">{item.registration_label}: {item.registration_number} · {item.is_active?"Active":"Deactivated"}</p></div><button disabled={busy||operatorReason.trim().length<5} onClick={()=>setTherapistActive(item.user_id,!item.is_active)} className="rounded-lg border border-slate-300 px-3 py-2 text-[10px] font-semibold">{item.is_active?"Deactivate access":"Reactivate access"}</button></div>)}
          {operatorMemberships.length===0 && <p className="text-xs text-slate-500">No verified memberships found.</p>}
        </div></div>
      </section>}
      {session.user.app_metadata?.registry_role === "reviewer" && <section className="mt-5 rounded-2xl border border-teal-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Restricted access</p><h2 className="mt-1 text-lg font-bold text-[#173653]">Case reviewer console</h2><p className="mt-1 text-xs text-slate-500">Only de-identified submissions are shown. Patient identifiers and private clinical-record links are not returned by the reviewer queue.</p></div>
          <button onClick={()=>loadReviewerCases().catch((e:Error)=>setError(e.message))} disabled={busy} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">Refresh queue</button>
        </div>
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wide text-teal-700">Restricted evidence review</p><h2 className="mt-1 font-bold text-[#173653]">Signed consent verification queue</h2><p className="mt-1 text-[11px] text-slate-500">Inspect the original private document and verify its version, patient reference, purpose and signatures before deciding.</p></div><button onClick={()=>loadConsentReviewQueue().catch((e:Error)=>setError(e.message))} disabled={busy} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">Refresh evidence</button></div><div className="mt-3 space-y-3">{consentReviewQueue.map(item=><article key={item.evidence_id} className="rounded-xl border border-slate-100 p-3"><p className="text-xs font-semibold">{item.purpose==="clinical_care"?"Clinical-care consent":"Public-case publication consent"} · {item.patient_reference}</p><p className="mt-1 text-[10px] text-slate-500">Submitted {new Date(item.submitted_at).toLocaleString()} · {item.content_type} · {Math.round(item.declared_size_bytes/1024)} KB</p><p className="mt-1 text-[10px] font-semibold text-emerald-700">Server integrity verified {new Date(item.integrity_verified_at).toLocaleString()} · SHA-256 {item.verified_sha256.slice(0,12)}…</p><button onClick={()=>openConsentEvidence(item.object_path)} disabled={busy} className="mt-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold">Open private signed document</button><textarea value={consentReviewNote} onChange={e=>setConsentReviewNote(e.target.value)} rows={2} maxLength={2000} placeholder="Reviewer verification note (required)" className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-xs"/><div className="mt-2 flex gap-2"><button disabled={busy||consentReviewNote.trim().length<5} onClick={()=>reviewConsentEvidence(item.evidence_id,"verified")} className="rounded-lg bg-teal-700 px-3 py-2 text-[10px] font-bold text-white disabled:opacity-40">Verify consent</button><button disabled={busy||consentReviewNote.trim().length<5} onClick={()=>reviewConsentEvidence(item.evidence_id,"rejected")} className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-semibold text-red-700 disabled:opacity-40">Reject evidence</button></div></article>)}{consentReviewQueue.length===0&&<p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">No consent documents awaiting review.</p>}</div></section>
        <div className="mt-4 space-y-3">
          {reviewerCases.map(item=><article key={item.case_id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-bold text-[#173653]">{item.case_title}</h3><p className="mt-1 text-[10px] text-slate-500">{item.condition_label} · {item.age_band ?? "Age not reported"} · Submitted {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "date unavailable"}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold">{item.status}</span></div>
            <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-700">{item.clinical_context}</p>
            <p className="mt-2 text-xs leading-5 text-slate-700"><strong>Intervention:</strong> {item.intervention_summary}</p>
            <p className="mt-2 text-xs leading-5 text-slate-700"><strong>Outcome:</strong> {item.outcome_summary}</p>
            {item.evidence_reference && /^https?:\/\//i.test(item.evidence_reference) && <a href={item.evidence_reference} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-teal-700 underline">Open evidence reference</a>}
            {item.reviewer_note && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><strong>Previous reviewer note:</strong> {item.reviewer_note}</p>}
            {item.status === "submitted" && <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              <textarea value={reviewerNote} onChange={e=>setReviewerNote(e.target.value)} rows={2} maxLength={2000} placeholder="Reviewer note (required when rejecting)" className="w-full rounded-xl border border-slate-200 p-3 text-xs"/>
              <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={()=>reviewCaseSubmission(item.case_id,"approved")} className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Approve</button><button disabled={busy||!reviewerNote.trim()} onClick={()=>reviewCaseSubmission(item.case_id,"rejected")} className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Reject with reason</button></div>
            </div>}
            {item.status === "approved" && <div className="mt-3 border-t border-slate-100 pt-3"><p className="mb-2 text-[11px] text-slate-500">Approved cases are not public until this separate action is completed.</p><button disabled={busy} onClick={()=>publishReviewedCase(item.case_id)} className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Publish to public library</button></div>}
          </article>)}
          {reviewerCases.length===0 && <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No submitted or approved cases are awaiting reviewer action.</p>}
        </div>
      </section>}
      <footer className="mt-8 flex items-center gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400"><LockKeyhole size={12}/> Separate Registry database · Owner-scoped access · Audit trail enabled</footer>
    </div>
  </main>;
}
