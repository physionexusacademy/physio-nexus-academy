import { clinicalCases as priorClinicalCases } from "./clinical-cases";
export type { ClinicalCase, ClinicalCaseReference } from "./clinical-cases";
import { clinicalCases20260929 } from "./daily-case-2026-09-29";

export const clinicalCases = [...priorClinicalCases, ...clinicalCases20260929];

export function getClinicalCase(slug: string) {
  return clinicalCases.find((item) => item.slug === slug);
}
