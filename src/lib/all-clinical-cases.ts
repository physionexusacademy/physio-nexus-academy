import { clinicalCases as legacyClinicalCases, type ClinicalCase } from "@/lib/clinical-cases";
import { modularClinicalCases } from "@/lib/daily-content/cases";

export const clinicalCases: ClinicalCase[] = [
  ...modularClinicalCases,
  ...legacyClinicalCases.filter(
    (legacy) => !modularClinicalCases.some((daily) => daily.slug === legacy.slug)
  ),
];

export function getClinicalCase(slug: string) {
  return clinicalCases.find((item) => item.slug === slug);
}
