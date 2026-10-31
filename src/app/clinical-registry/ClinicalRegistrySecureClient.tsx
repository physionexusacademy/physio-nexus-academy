"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { BookOpen, FileDown, LockKeyhole, LogOut, Plus, Printer, ShieldCheck, UserPlus, Users } from "lucide-react";
import { CLINICAL_REGISTRY_CONSENT_VERSION, getClinicalRegistryClient } from "@/lib/clinical-registry/client";

type Patient = { id: string; patient_reference: string; display_name: string; updated_at: string };
type Report = { report_id: string; patient_id: string; patient_reference: string; patient_display_name: string; category: string; condition: string; status: string; assessment_date: string; updated_at: string };
type TherapistStatus = { fullName?: string; professionalTitle?: string; credentials?: string[]; verificationStatus?: string; isActive?: boolean; verifiedAt?: string | null };
type ClinicalReport = { id: string; patient?: { patientReference?: string; displayName?: string }; category: string; condition: string; status: string; assessmentDate: string; initialAssessment?: Record<string, unknown>; followUpAssessments?: Record<string, unknown>[]; clinicalSummary?: string; dischargeStatus?: string; recommendations?: string[]; interventions?: Record<string, unknown>[]; outcomes?: Record<string, unknown>[] };
type CaseSubmission = { case_id: string; patient_id: string; case_title: string; status: string; reviewer_note?: string | null; submitted_at?: string | null; published_at?: string | null };
type PublicCase = { case_id: string; case_title: string; condition_label: string; age_band?: string | null; clinical_context: string; intervention_summary: string; outcome_summary: string; evidence_reference?: string | null };

export function ClinicalRegistrySecureClient() {
  const client = useMemo(() => getClinicalRegistryClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<TherapistStatus | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [patientReference, setPatientReference] = useState("");
  const [patientName, setPatientName] = useState("");
  const [consentMethod, setConsentMethod] = useState("written");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
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
    let mounted = true;
    client.auth.getSession().then(({ data }) => { if (mounted) setSession(data.session); });
    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) { setSession(nextSession); setMembership(null); setPatients([]); setReports([]); setSelectedPatient(null); setSelectedReport(null); }
    });
    return () => { mounted = false; authListener.subscription.unsubscribe(); };
  }, [client]);

  useEffect(() => {
    if (!client) return;
    loadPublicCases().catch((e: Error) => setError(e.message));
  }, [client, loadPublicCases]);

  useEffect(() => {
    if (!client || !session) return;
    loadMembership().catch((e: Error) => setError(e.message));
  }, [client, session, loadMembership]);

  const openReport = async (reportId: string) => {
    if (!client) return;
    setBusy(true); setError("");
    const { data, error: rpcError } = await client.rpc("get_my_report", { p_report_id: reportId });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    setSelectedReport((data ?? null) as ClinicalReport | null);
  };

  const signIn = async (event: FormEvent) => {
    event.preventDefault(); if (!client) return; setBusy(true); setError(""); setNotice("");
    const { error: authError } = await client.auth.signInWithPassword({ email, password });
    setBusy(false); if (authError) setError(authError.message);
  };

  const signUp = async () => {
    if (!client) return; setBusy(true); setError(""); setNotice("");
    const { data, error: authError } = await client.auth.signUp({ email, password });
    setBusy(false);
    if (authError) setError(authError.message);
    else setNotice(data.session ? "Account created. Therapist verification is still required before clinical records can be accessed." : "Account created. Check your email if confirmation is enabled. Therapist verification is still required before clinical records can be accessed.");
  };

  const registerPatient = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !consentConfirmed || !CLINICAL_REGISTRY_CONSENT_VERSION) return;
    setBusy(true); setError(""); setNotice("");
    const { data: patientId, error: patientError } = await client.rpc("create_patient", { p_patient_reference: patientReference, p_display_name: patientName });
    if (patientError) { setBusy(false); setError(patientError.message); return; }
    const { error: consentError } = await client.rpc("record_patient_consent", {
      p_patient_id: patientId, p_purpose: "clinical_care", p_status: "granted",
      p_consent_version: CLINICAL_REGISTRY_CONSENT_VERSION, p_capture_method: consentMethod, p_prior_event_id: null
    });
    setBusy(false);
    if (consentError) { setError(`Patient record was created, but consent could not be saved. Do not create a clinical report until consent is recorded. ${consentError.message}`); return; }
    setPatientReference(""); setPatientName(""); setConsentConfirmed(false);
    setNotice("Patient record and clinical-care consent event saved.");
    await loadPatients();
  };

  const createReport = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedPatient) return;
    setBusy(true); setError("");
    const { data, error: rpcError } = await client.rpc("create_report", { p_patient_id: selectedPatient.id, p_category: category, p_condition: condition });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    setCondition(""); await loadReports(selectedPatient.id); await openReport(data as string);
  };

  const saveAssessment = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(assessmentJson); } catch { setError("Initial assessment must be valid JSON."); return; }
    setBusy(true); setError("");
    const { error: rpcError } = await client.rpc("save_initial_assessment", { p_report_id: selectedReport.id, p_assessment: parsed });
    setBusy(false); if (rpcError) { setError(rpcError.message); return; } await openReport(selectedReport.id);
  };

  const addFollowUp = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(followUpJson); } catch { setError("Follow-up assessment must be valid JSON."); return; }
    setBusy(true); setError("");
    const { error: rpcError } = await client.rpc("add_followup_assessment", { p_report_id: selectedReport.id, p_assessment: parsed });
    setBusy(false); if (rpcError) { setError(rpcError.message); return; } await openReport(selectedReport.id);
  };

  const addIntervention = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    setBusy(true); setError("");
    const { error: rpcError } = await client.rpc("add_intervention", { p_report_id: selectedReport.id, p_intervention: interventionText });
    setBusy(false); if (rpcError) { setError(rpcError.message); return; } setInterventionText(""); await openReport(selectedReport.id);
  };

  const addOutcome = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !selectedReport) return;
    const value = Number(outcomeValue); if (!Number.isFinite(value)) { setError("Enter a valid numeric outcome value."); return; }
    setBusy(true); setError("");
    const { error: rpcError } = await client.rpc("add_outcome", { p_report_id: selectedReport.id, p_measure_code: outcomeCode, p_measure_name: outcomeName, p_value: value, p_direction: outcomeDirection });
    setBusy(false); if (rpcError) { setError(rpcError.message); return; } setOutcomeName(""); setOutcomeCode(""); setOutcomeValue(""); await openReport(selectedReport.id);
  };

  const finaliseReport = async () => {
    if (!client || !selectedReport) return; setBusy(true); setError("");
    const { error: rpcError } = await client.rpc("finalise_report", { p_report_id: selectedReport.id });
    setBusy(false); if (rpcError) { setError(rpcError.message); return; }
    await openReport(selectedReport.id); if (selectedPatient) await loadReports(selectedPatient.id);
  };

  const exportPatient = async () => {
    if (!client || !selectedPatient) return; setBusy(true); setError("");
    const { data, error: rpcError } = await client.rpc("export_my_patient_record", { p_patient_id: selectedPatient.id });
    setBusy(false); if (rpcError) { setError(rpcError.message); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `clinical-record-${selectedPatient.patient_reference}.json`; anchor.click(); URL.revokeObjectURL(url);
  };

  const submitCaseForReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!client || !selectedPatient || !selectedReport || !CLINICAL_REGISTRY_CONSENT_VERSION || !publicationConsentConfirmed || !deidentifiedConfirmed) return;
    setBusy(true); setError(""); setNotice("");
    const { data: consentId, error: consentError } = await client.rpc("record_patient_consent", {
      p_patient_id: selectedPatient.id, p_purpose: "public_case_publication", p_status: "granted",
      p_consent_version: CLINICAL_REGISTRY_CONSENT_VERSION, p_capture_method: consentMethod, p_prior_event_id: null
    });
    if (consentError) { setBusy(false); setError(consentError.message); return; }
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
    const { error: applyError } = await client.rpc("apply_own_report_correction", { p_request_id: requestId });
    setBusy(false);
    if (applyError) { setError(`Correction request saved but could not be applied: ${applyError.message}`); return; }
    setCorrectionReason(""); setNotice("Correction applied by the owning therapist. The original change history remains in the audit trail.");
    await openReport(selectedReport.id);
  };
  const withdrawPublishedCase = async (submission: CaseSubmission) => {
    if (!client || !CLINICAL_REGISTRY_CONSENT_VERSION) return; setBusy(true); setError("");
    const { error: consentError } = await client.rpc("record_patient_consent", {
      p_patient_id: submission.patient_id, p_purpose: "public_case_publication", p_status: "withdrawn",
      p_consent_version: CLINICAL_REGISTRY_CONSENT_VERSION, p_capture_method: consentMethod, p_prior_event_id: null
    });
    if (consentError) { setBusy(false); setError(consentError.message); return; }
    const { error: rpcError } = await client.rpc("withdraw_public_case", { p_case_id: submission.case_id });
    setBusy(false); if (rpcError) { setError(rpcError.message); return; }
    await loadCaseSubmissions(); await loadPublicCases();
    setNotice("Publication consent withdrawal was recorded and the case was removed from the public library.");
  };
  if (!client) return <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-800"><section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><ShieldCheck className="text-teal-700" size={30}/><h1 className="mt-4 text-2xl font-bold text-[#173653]">PNA Clinical Registry</h1><p className="mt-3 text-sm leading-6 text-slate-600">The isolated Registry service is not configured yet. This workspace will not connect to or reuse the PNA website database.</p><p className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">Required environment settings: NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL, NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY and an institution-approved NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION. No patient data can be entered until these are configured.</p></section></main>;

  if (!session) return <main className="min-h-screen bg-[#f5f8fb] px-5 py-16 text-slate-800"><section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="text-teal-700" size={30}/><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Physio Nexus Academy</p><h1 className="text-2xl font-bold text-[#173653]">Clinical Registry</h1></div></div><p className="mt-3 text-sm leading-6 text-slate-500">Sign in to your private clinical workspace. Each therapist can access only their own records.</p><form onSubmit={signIn} className="mt-6 space-y-3"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Professional email" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"/><input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"/><button disabled={busy} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?"Please wait…":"Sign in"}</button></form><button onClick={signUp} disabled={busy || !email || password.length<8} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">Create therapist account</button>{error&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}{notice&&<p className="mt-4 rounded-xl bg-teal-50 p-3 text-xs text-teal-800">{notice}</p>}<p className="mt-5 flex items-center gap-2 text-[11px] text-slate-400"><LockKeyhole size={13}/> Private Registry database · separate from the PNA website database</p></section></main>;

  const verified = membership?.verificationStatus === "verified" && membership?.isActive === true;

  return <main className="min-h-screen bg-[#f5f8fb] px-3 py-5 text-slate-800 sm:px-6 sm:py-8">\n    <style jsx global>{`@media print { @page { margin: 14mm; } body * { visibility: hidden !important; } #registry-report-print, #registry-report-print * { visibility: visible !important; } #registry-report-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: 0 !important; box-shadow: none !important; padding: 0 !important; } #registry-report-print .no-print { display: none !important; } #registry-report-print pre { max-height: none !important; overflow: visible !important; white-space: pre-wrap !important; background: white !important; border: 1px solid #dbe3ea !important; } }`}</style>
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Physio Nexus Academy</p><h1 className="mt-1 text-2xl font-bold text-[#173653]">Clinical Registry</h1><p className="mt-1 text-xs text-slate-500">Private therapist-owned clinical documentation</p></div><button onClick={()=>client.auth.signOut()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><LogOut size={14}/> Sign out</button></header>
      {error&&<p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p className="mb-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
      {!verified ? <section className="rounded-2xl border border-amber-200 bg-white p-6"><ShieldCheck size={28} className="text-amber-600"/><h2 className="mt-3 text-lg font-bold text-[#173653]">Therapist verification pending</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Your account is authenticated, but a Registry operator must verify your professional credentials and activate your membership before patient records become available. You cannot verify or activate your own account.</p><p className="mt-4 text-xs text-slate-500">{membership?.fullName ? `${membership.fullName} · ${membership.professionalTitle ?? ""}` : "No therapist membership has been provisioned for this account yet."}</p></section> : <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Users size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">My patients</h2></div><p className="mt-1 text-[11px] text-slate-400">Only records owned by your therapist account are listed.</p><div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{patients.map(p=><button key={p.id} onClick={()=>{setSelectedPatient(p);setSelectedReport(null);loadReports(p.id).catch((e:Error)=>setError(e.message));}} className={`w-full rounded-xl border p-3 text-left ${selectedPatient?.id===p.id?"border-teal-500 bg-teal-50":"border-slate-100 hover:bg-slate-50"}`}><p className="text-sm font-semibold">{p.display_name}</p><p className="mt-1 text-[10px] text-slate-500">{p.patient_reference}</p></button>)}{patients.length===0&&<p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No patient records yet.</p>}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><UserPlus size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">Register patient</h2></div>{!CLINICAL_REGISTRY_CONSENT_VERSION?<p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Patient registration is disabled until the institution-approved consent version is configured.</p>:<form onSubmit={registerPatient} className="mt-4 space-y-3"><input required value={patientReference} onChange={e=>setPatientReference(e.target.value)} placeholder="Patient reference / code" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><input required value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="Patient display name (private)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><select value={consentMethod} onChange={e=>setConsentMethod(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"><option value="written">Written consent</option><option value="electronic">Electronic consent</option><option value="documented_verbal">Documented verbal consent</option></select><label className="flex items-start gap-2 text-[11px] leading-5 text-slate-600"><input type="checkbox" checked={consentConfirmed} onChange={e=>setConsentConfirmed(e.target.checked)} className="mt-1"/> I have obtained and documented clinical-care consent using the institution-approved form.</label><button disabled={busy||!consentConfirmed} className="w-full rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40">Save patient and consent</button></form>}</section>
        </aside>
        <section className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold text-[#173653]">Clinical reports</h2><p className="mt-1 text-[11px] text-slate-400">{selectedPatient?`${selectedPatient.display_name} · ${selectedPatient.patient_reference}`:"Select a patient to view reports."}</p></div>{selectedPatient&&<button onClick={exportPatient} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><FileDown size={14}/> Export record</button>}</div>
            {selectedPatient&&<form onSubmit={createReport} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"><option>Musculoskeletal</option><option>Neurological</option><option>Cardiorespiratory</option><option>Sports Rehabilitation</option><option>Paediatrics</option><option>Other</option></select><input required value={condition} onChange={e=>setCondition(e.target.value)} placeholder="Condition / diagnosis" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white"><Plus size={14}/> New report</button></form>}
            <div className="mt-4 space-y-2">{reports.map(r=><button key={r.report_id} onClick={()=>openReport(r.report_id)} className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-left ${selectedReport?.id===r.report_id?"border-teal-500 bg-teal-50":"border-slate-100 hover:bg-slate-50"}`}><span><span className="block text-sm font-semibold">{r.condition}</span><span className="mt-1 block text-[10px] text-slate-500">{r.category} · {r.assessment_date}</span></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold">{r.status}</span></button>)}{selectedPatient&&reports.length===0&&<p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No reports for this patient yet.</p>}</div>
          </section>
          {selectedReport&&<section className="rounded-2xl border border-slate-200 bg-white p-5" id="registry-report-print"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Clinical report</p><h2 className="mt-1 text-xl font-bold text-[#173653]">{selectedReport.condition}</h2><p className="mt-1 text-xs text-slate-500">{selectedReport.patient?.displayName} · {selectedReport.patient?.patientReference} · {selectedReport.category} · {selectedReport.assessmentDate}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Status: {selectedReport.status}</p></div><div className="no-print flex gap-2"><button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"><Printer size={14}/> Print</button>{selectedReport.status==="draft"&&<button onClick={finaliseReport} disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Finalise</button>}</div></div>
            {(selectedReport.clinicalSummary || selectedReport.dischargeStatus || (selectedReport.recommendations?.length ?? 0) > 0) && <section className="mt-5 rounded-xl border border-slate-100 p-4"><h3 className="text-xs font-bold text-[#173653]">Clinical summary and plan</h3>{selectedReport.clinicalSummary&&<p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-700">{selectedReport.clinicalSummary}</p>}{selectedReport.dischargeStatus&&<p className="mt-2 text-xs"><strong>Discharge status:</strong> {selectedReport.dischargeStatus}</p>}{(selectedReport.recommendations?.length??0)>0&&<ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">{selectedReport.recommendations?.map((item,i)=><li key={i}>{item}</li>)}</ul>}</section>}\n            <div className="mt-4 grid gap-4 md:grid-cols-2"><div><h3 className="text-xs font-bold text-[#173653]">Initial assessment</h3><pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.initialAssessment??{},null,2)}</pre></div><div><h3 className="text-xs font-bold text-[#173653]">Follow-ups</h3><pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.followUpAssessments??[],null,2)}</pre></div><div><h3 className="text-xs font-bold text-[#173653]">Interventions</h3><pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.interventions??[],null,2)}</pre></div><div><h3 className="text-xs font-bold text-[#173653]">Outcomes</h3><pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-5">{JSON.stringify(selectedReport.outcomes??[],null,2)}</pre></div></div>
            {selectedReport.status==="draft"&&<div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 xl:grid-cols-2"><form onSubmit={saveAssessment} className="space-y-2"><h3 className="text-xs font-bold">Save initial assessment (JSON)</h3><textarea value={assessmentJson} onChange={e=>setAssessmentJson(e.target.value)} rows={7} className="w-full rounded-xl border border-slate-200 p-3 font-mono text-[11px]"/><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Save assessment</button></form><form onSubmit={addFollowUp} className="space-y-2"><h3 className="text-xs font-bold">Add follow-up (JSON)</h3><textarea value={followUpJson} onChange={e=>setFollowUpJson(e.target.value)} rows={7} className="w-full rounded-xl border border-slate-200 p-3 font-mono text-[11px]"/><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Add follow-up</button></form><form onSubmit={addIntervention} className="space-y-2"><h3 className="text-xs font-bold">Record intervention</h3><input required value={interventionText} onChange={e=>setInterventionText(e.target.value)} placeholder="Intervention / technique" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Save intervention</button></form><form onSubmit={addOutcome} className="space-y-2"><h3 className="text-xs font-bold">Record outcome</h3><input required value={outcomeCode} onChange={e=>setOutcomeCode(e.target.value)} placeholder="Measure code (e.g. NPRS)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><input required value={outcomeName} onChange={e=>setOutcomeName(e.target.value)} placeholder="Measure name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><input required type="number" step="any" value={outcomeValue} onChange={e=>setOutcomeValue(e.target.value)} placeholder="Measured value" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"/><select value={outcomeDirection} onChange={e=>setOutcomeDirection(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"><option value="lower_is_better">Lower is better</option><option value="higher_is_better">Higher is better</option><option value="descriptive">Descriptive</option></select><button disabled={busy} className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Save outcome</button></form></div>}
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
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Only a final report can be submitted. Publication requires separate patient consent and an independent reviewer decision.</p>
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
              <button disabled={busy||!publicationConsentConfirmed||!deidentifiedConfirmed} className="rounded-xl bg-teal-700 px-4 py-3 text-xs font-bold text-white disabled:opacity-40 md:col-span-2">Submit case for independent review</button>
            </form>
          </section>}
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><BookOpen size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">My case submissions</h2></div><div className="mt-3 space-y-2">{caseSubmissions.map(c=><div key={c.case_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3"><div><p className="text-xs font-semibold">{c.case_title}</p><p className="mt-1 text-[10px] text-slate-500">{c.status}{c.reviewer_note?` · ${c.reviewer_note}`:""}</p></div>{c.status!=="withdrawn"&&<button disabled={busy||!CLINICAL_REGISTRY_CONSENT_VERSION} onClick={()=>withdrawPublishedCase(c)} className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-semibold text-red-700">Withdraw consent & case</button>}</div>)}{caseSubmissions.length===0&&<p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">No case submissions yet.</p>}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><BookOpen size={17} className="text-teal-700"/><h2 className="font-bold text-[#173653]">Public Case Library</h2></div><p className="mt-1 text-[11px] text-slate-400">Only independently reviewed, published, de-identified cases appear here.</p><div className="mt-3 space-y-3">{publicCases.map(c=><article key={c.case_id} className="rounded-xl border border-slate-100 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#173653]">{c.case_title}</h3><span className="text-[10px] text-slate-500">{c.condition_label} · {c.age_band??"Age not reported"}</span></div><p className="mt-2 text-xs leading-5 text-slate-600">{c.clinical_context}</p><p className="mt-2 text-xs leading-5 text-slate-600"><strong>Intervention:</strong> {c.intervention_summary}</p><p className="mt-2 text-xs leading-5 text-slate-600"><strong>Outcome:</strong> {c.outcome_summary}</p>{c.evidence_reference&&<a href={c.evidence_reference} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-teal-700 underline">Evidence reference</a>}</article>)}{publicCases.length===0&&<p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">No published cases available yet.</p>}</div></section>
        </section>
      </div>}
      <footer className="mt-8 flex items-center gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400"><LockKeyhole size={12}/> Separate Registry database · Owner-scoped access · Audit trail enabled</footer>
    </div>
  </main>;
}
