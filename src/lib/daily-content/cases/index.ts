import type { ClinicalCase } from "@/lib/clinical-cases";

// Automation-safe registry for future daily Clinical Case Lab content.
// Each new case should be created as a separate dated file.

// DAILY_CASE_IMPORTS_START
import { case20261001Copd } from "./2026-10-01-copd-exertional-desaturation";
// DAILY_CASE_IMPORTS_END

export const modularClinicalCases: ClinicalCase[] = [
  // DAILY_CASE_SPREADS_START
  case20261001Copd,
  // DAILY_CASE_SPREADS_END
];
