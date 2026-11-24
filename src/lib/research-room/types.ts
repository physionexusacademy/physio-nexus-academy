/** Research Room: shared types. Plain data, no React and no database, so the same code runs on the server, in the browser and in node tests. */
export type Arm = "ai" | "no_ai";
export type Region = "low_back" | "neck";
export type Bilingual = { en: string; ru: string };

export type EligibilityItem = { id: string; kind: "include" | "exclude"; en: string; ru: string };
export type OutcomePlanItem = { instrument: string; version: number; schedule: "standard" | "intensive" | "single" };

/** The rules of a study. The database re-checks the parts it depends on (age, pain bands, regions, eligibility, outcome plan). */
export type StudyConfig = {
  regions: Region[];
  age_min: number;
  age_max: number;
  /** Lowest baseline pain score (NPRS 0–10) that can be enrolled. */
  min_nprs: number;
  /** Each cut point starts a new pain band, e.g. min 3 and [6] gives the bands "3-5" and "6-10". */
  strata_cuts: number[];
  eligibility: EligibilityItem[];
  outcome_plan: OutcomePlanItem[];
  primary: { instrument: string; timepoint: "w12" };
  target_per_arm: number;
  notify: Bilingual;
};

export type SequenceRow = { stratum: string; position: number; arm: Arm };

export type StudyRecord = {
  id: string;
  code: string;
  title: string;
  version: string;
  status: "draft" | "recruiting" | "closed";
  config: StudyConfig;
  ethics_ref: string | null;
  ethics_date: string | null;
  registry_id: string | null;
  consent_version: string | null;
  sequence_source: "independent" | "generated" | null;
  frozen_at: string | null;
  frozen_hash: string | null;
  closed_at: string | null;
};

export type StudyOverview = {
  study: StudyRecord | null;
  list?: { stratum: string; total: number; left: number }[];
  flow?: { screened: number; excluded: number; declined: number; allocated: number; allocated_ai: number; allocated_no_ai: number; deviations: number };
  exclusion_reasons?: { reason: string; n: number }[];
};

export type QueueEntry = {
  id: string; reference_code: string; full_name: string; age_years: number; sex: string | null; city: string | null; phone: string | null;
  preferred_language: "en" | "ru"; created_at: string; screened: "eligible" | "excluded" | "declined" | null;
};
export type StudyQueue = { recruiting: boolean; waiting: QueueEntry[] };

export type StudyLog = {
  screening: { reference_code: string; full_name: string; outcome: string; reasons: string[]; baseline_nprs: number | null; screened_at: string }[];
  allocations: { reference_code: string; full_name: string; stratum: string; arm: Arm; allocated_at: string }[];
};

export type StudyPatient =
  | { enrolled: false }
  | { enrolled: true; arm: Arm; stratum: string; allocated_at: string; deviations: { received_ai: "on" | "off"; reason: string; recorded_at: string }[] };

export type ConsentMethod = "in_person_written" | "remote_recorded" | "verbal_witnessed";
