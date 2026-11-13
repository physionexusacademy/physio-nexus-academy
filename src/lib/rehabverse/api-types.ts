/** Shapes returned by the RehabVerse database functions (see supabase/migrations/20261114120000_rehabverse.sql). */

export type AssessmentStatus =
  | "submitted" | "needs_clinical_assessment" | "in_review" | "cleared_for_programme" | "programme_created" | "closed";
export type FlagLevel = "none" | "urgent" | "emergency";
export type ProgrammeStatus = "draft" | "active" | "paused" | "completed" | "discontinued";
export type SessionStatus = "locked" | "unlocked" | "awaiting_review" | "reviewed" | "cancelled";
export type UnlockMode = "admin_approval" | "auto_after_feedback";
export type Timepoint = "before" | "during" | "immediately_after" | "later_same_day" | "24h" | "48h";
export type FollowupPoint = "later_same_day" | "24h" | "48h";
export type ReviewDecision = "progress" | "maintain" | "regress" | "modify" | "reassess" | "pause" | "discontinue" | "auto_continue";

export type PatientSummary = { id: string; reference_code: string; full_name: string; preferred_language: "en" | "ru"; age_years: number };

export type OverviewSession = {
  id: string; day_number: number; title: string; status: SessionStatus;
  available_from: string | null; released_at: string | null; patient_note: string | null; exercise_count: number | null;
  feedback_submitted_at: string | null; review_message: string | null;
};
export type Overview = {
  patient: PatientSummary | null;
  assessments?: { id: string; status: AssessmentStatus; red_flag_level: FlagLevel; regions: string[]; pain_now: number; submitted_at: string }[];
  unread_notifications?: number;
  programme?: {
    id: string; title: string; goal: string | null; status: ProgrammeStatus; pause_reason: string | null; errp_schedule: FollowupPoint[];
    approved_at: string | null; unlock_mode: UnlockMode; min_hours_between_sessions: number;
  };
  sessions?: OverviewSession[];
};

export type SessionExercise = {
  id: string; position: number; exercise_id: string; exercise_title: string; sets: number | null; reps: number | null;
  hold_seconds: number | null; rest_seconds: number | null; duration_seconds: number | null; side: "both" | "left" | "right" | "alternate";
  frequency: string | null; precautions: string | null; notes: string | null;
};
export type SessionDetail = {
  access: "locked" | "done" | "paused" | "scheduled" | "open";
  programme: { id: string; title: string; status: ProgrammeStatus; errp_schedule: FollowupPoint[] };
  session: { id: string; day_number: number; title: string; status: SessionStatus; available_from: string | null; patient_note: string | null };
  exercises: SessionExercise[];
  feedback: { submitted_at: string; completion: "all" | "partial" | "none"; pain_before: number | null; pain_during: number | null; pain_after: number | null; difficulty: number | null } | null;
  followups: { timepoint: FollowupPoint; pain: number; recorded_at: string }[];
  review_message: string | null;
};

export type HistoryDay = {
  session_id: string; day_number: number; title: string; status: SessionStatus; released_at: string | null;
  completion: "all" | "partial" | "none" | null; submitted_at: string | null; difficulty: number | null;
  observations: { timepoint: Timepoint; pain: number; function_score: number | null; symptom_response: "better" | "same" | "worse" | null; recorded_at: string }[];
};
export type History = { days: HistoryDay[]; baseline_pain: number | null };

export type Notification = {
  id: string; kind: string; severity: "info" | "attention" | "urgent"; title: string; body: string | null;
  data?: Record<string, unknown>; link: string | null; read_at: string | null; created_at: string;
};

export type Inbox = {
  assessments: { id: string; patient_id: string; reference_code: string; full_name: string; status: AssessmentStatus; red_flag_level: FlagLevel; regions: string[]; pain_now: number; submitted_at: string }[];
  awaiting_review: { session_id: string; programme_id: string; patient_id: string; reference_code: string; full_name: string; day_number: number; title: string; programme_status: ProgrammeStatus; submitted_at: string; pain_after: number | null }[];
  programmes: { id: string; patient_id: string; reference_code: string; full_name: string; title: string; status: ProgrammeStatus; created_at: string; days_total: number; days_done: number }[];
  adverse_events: { id: string; patient_id: string; reference_code: string; full_name: string; severity: "mild" | "moderate" | "severe"; status: string; flag_ids: string[]; created_at: string }[];
  notifications: Notification[];
  unread_notifications: number;
};

export type AdminAssessment = {
  id: string; patient_id: string; status: AssessmentStatus; regions: string[]; symptoms: string[]; pain_now: number; pain_worst: number | null; pain_best: number | null;
  duration: string | null; onset: string | null; possible_cause: string | null; aggravating: string | null; relieving: string | null;
  functional_limitations: string | null; previous_treatment: string | null; medical_conditions: string | null; medications: string | null;
  other_symptoms: string | null; own_words: string | null; red_flag_ids: string[]; red_flag_level: FlagLevel; submitted_at: string;
  clearance_note: string | null; admin_notes: string | null; reviewed_at: string | null;
};
export type AdminSessionBundle = {
  session: { id: string; day_number: number; title: string; status: SessionStatus; patient_note: string | null; available_from: string | null; released_at: string | null; release_mode: string | null; reviewed_at: string | null };
  exercises: SessionExercise[];
  feedback: {
    id: string; completion: "all" | "partial" | "none"; pain_before: number | null; pain_during: number | null; pain_after: number | null; difficulty: number | null;
    unusual_symptoms: boolean; unusual_text: string | null; safety_flag_ids: string[]; notes: string | null; submitted_at: string;
  } | null;
  completions: { session_exercise_id: string; done: boolean; sets_done: number | null; reps_done: number | null; difficulty: number | null; pain_during: number | null; note: string | null }[];
  observations: { timepoint: Timepoint; pain: number | null; function_score: number | null; symptom_response: "better" | "same" | "worse" | null; new_symptoms: boolean | null; flag_ids: string[]; note: string | null; recorded_at: string }[];
  reviews: { id: string; decision: ReviewDecision; notes: string | null; patient_message: string | null; suggestion: unknown; created_at: string; reviewer_id: string | null }[];
};
export type AdminProgramme = {
  programme: {
    id: string; title: string; goal: string | null; status: ProgrammeStatus; unlock_mode: UnlockMode; min_hours_between_sessions: number;
    auto_unlock_max_pain: number; errp_schedule: FollowupPoint[]; pause_reason: string | null; approved_at: string | null; created_at: string; assessment_id: string | null;
  };
  sessions: AdminSessionBundle[];
};
export type AdminPatient = {
  patient: { id: string; reference_code: string; full_name: string; email: string | null; age_years: number; sex: string | null; phone: string | null; city: string | null; preferred_language: "en" | "ru"; created_at: string };
  assessments: AdminAssessment[];
  programmes: AdminProgramme[];
  adverse_events: { id: string; severity: "mild" | "moderate" | "severe"; status: "open" | "reviewed" | "closed"; source: string; description: string; action_taken: string | null; flag_ids: string[]; created_at: string; session_id: string | null }[];
  audit: { id: number; at: string; action: string; entity: string; details: Record<string, unknown> | null; actor_role: string | null }[];
};
export type AdminPatientRow = { id: string; reference_code: string; full_name: string; city: string | null; created_at: string; programme_status: ProgrammeStatus | null };

/** What the programme builder sends to rehab_admin_save_plan. */
export type PlanPayload = {
  title: string; goal?: string; unlock_mode: UnlockMode; min_hours_between_sessions: number; auto_unlock_max_pain: number; errp_schedule: FollowupPoint[];
  sessions: { id?: string; day_number: number; title: string; patient_note?: string; exercises: PlanExercise[] }[];
};
export type PlanExercise = {
  exercise_id: string; exercise_title: string; sets?: number; reps?: number; hold_seconds?: number; rest_seconds?: number; duration_seconds?: number;
  side: "both" | "left" | "right" | "alternate"; frequency?: string; precautions?: string; notes?: string;
};
