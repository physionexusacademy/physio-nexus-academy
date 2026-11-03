/**
 * PNA Clinical Registry — report data contract.
 *
 * This module contains types and pure calculations only. It does not read or
 * persist patient data. Report payloads must be assembled server-side from
 * records the signed-in therapist is authorised to access.
 */

export type ReportStatus = "draft" | "final";
export type OutcomeDirection = "lower_is_better" | "higher_is_better" | "descriptive";

export interface TherapistIdentity {
  fullName: string;
  professionalTitle: string;
  credentials: string[];
  registrationLabel?: string;
  registrationNumber?: string;
  verificationStatus: "pending" | "verified" | "rejected";
}

export interface PatientReportIdentity {
  patientReference: string;
  displayName: string;
  ageAtAssessment?: number;
  sexOrGender?: string;
}

export interface ClinicalAssessmentSection {
  assessmentDate: string;
  presentingComplaint?: string;
  historyOfPresentCondition?: string;
  relevantMedicalHistory?: string;
  medicationsAndPrecautions?: string;
  redFlagScreening?: string;
  objectiveFindings?: string;
  clinicalImpression?: string;
  functionalLimitations?: string;
  goals?: string[];
}

export interface InterventionEntry {
  date: string;
  intervention: string;
  bodyRegion?: string;
  techniqueOrParameters?: string;
  dosage?: string;
  response?: string;
  homeAdvice?: string;
}

export interface OutcomeMeasurement {
  date: string;
  measureCode: string;
  measureName: string;
  value: number;
  unit?: string;
  scaleMinimum?: number;
  scaleMaximum?: number;
  direction: OutcomeDirection;
}

export interface ClinicalReportPayload {
  schemaVersion: 1;
  reportId: string;
  status: ReportStatus;
  generatedAt: string;
  therapist: TherapistIdentity;
  patient: PatientReportIdentity;
  category: string;
  condition: string;
  initialAssessment?: ClinicalAssessmentSection;
  followUpAssessments: ClinicalAssessmentSection[];
  interventions: InterventionEntry[];
  outcomes: OutcomeMeasurement[];
  clinicalSummary?: string;
  dischargeStatus?: string;
  recommendations?: string[];
  disclaimer: string;
}

export interface OutcomeComparison {
  measureCode: string;
  measureName: string;
  baseline: OutcomeMeasurement;
  latest: OutcomeMeasurement;
  absoluteChange: number;
  directionLabel: "improved" | "worsened" | "unchanged" | "descriptive";
  percentageChange?: number;
}

/**
 * Compare the earliest and latest saved values for each measure.
 * Values are never fabricated or interpolated. Measures with different
 * units/scales are never combined. The result describes numerical direction,
 * not clinical significance or causation.
 */
export function compareOutcomes(
  measurements: OutcomeMeasurement[],
): OutcomeComparison[] {
  const grouped = new Map<string, OutcomeMeasurement[]>();

  for (const item of measurements) {
    if (!Number.isFinite(item.value) || !item.measureCode || !item.date) continue;
    const group = grouped.get(item.measureCode) ?? [];
    group.push(item);
    grouped.set(item.measureCode, group);
  }

  const comparisons: OutcomeComparison[] = [];
  for (const [measureCode, entries] of grouped) {
    if (entries.length < 2) continue;
    const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const baseline = ordered[0];
    const latest = ordered[ordered.length - 1];

    // A code must represent one consistent scale and interpretation.
    if (
      baseline.unit !== latest.unit ||
      baseline.scaleMinimum !== latest.scaleMinimum ||
      baseline.scaleMaximum !== latest.scaleMaximum ||
      baseline.direction !== latest.direction
    ) continue;

    const absoluteChange = latest.value - baseline.value;
    const directionLabel =
      baseline.direction === "descriptive"
        ? "descriptive"
        : absoluteChange === 0
          ? "unchanged"
          : (baseline.direction === "lower_is_better"
              ? absoluteChange < 0
              : absoluteChange > 0)
            ? "improved"
            : "worsened";

    comparisons.push({
      measureCode,
      measureName: latest.measureName,
      baseline,
      latest,
      absoluteChange,
      directionLabel,
      ...(baseline.value !== 0
        ? { percentageChange: (absoluteChange / Math.abs(baseline.value)) * 100 }
        : {}),
    });
  }

  return comparisons.sort((a, b) => a.measureName.localeCompare(b.measureName));
}

/** Validate essential report fields before rendering or printing. */
export function validateReportPayload(
  report: ClinicalReportPayload,
): string[] {
  const errors: string[] = [];
  if (!report.reportId.trim()) errors.push("A report reference is required.");
  if (!report.therapist.fullName.trim()) errors.push("Therapist name is required.");
  if (!report.patient.patientReference.trim()) errors.push("Patient reference is required.");
  if (!report.condition.trim()) errors.push("Clinical condition is required.");
  if (report.status === "final" && report.therapist.verificationStatus !== "verified") {
    errors.push("A final report requires a verified therapist identity.");
  }
  if (report.patient.ageAtAssessment !== undefined &&
      (!Number.isInteger(report.patient.ageAtAssessment) ||
       report.patient.ageAtAssessment < 0 ||
       report.patient.ageAtAssessment > 120)) {
    errors.push("Patient age must be a valid age in years.");
  }
  for (const outcome of report.outcomes) {
    if (!Number.isFinite(outcome.value)) {
      errors.push(`Outcome value for ${outcome.measureName} must be numeric.`);
    }
    if (outcome.scaleMinimum !== undefined && outcome.value < outcome.scaleMinimum) {
      errors.push(`Outcome value for ${outcome.measureName} is below its scale.`);
    }
    if (outcome.scaleMaximum !== undefined && outcome.value > outcome.scaleMaximum) {
      errors.push(`Outcome value for ${outcome.measureName} is above its scale.`);
    }
  }
  return errors;
}
