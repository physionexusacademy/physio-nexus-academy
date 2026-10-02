import type { ClinicalCase } from "@/lib/clinical-cases";
// DAILY_CASE_IMPORTS_START 
import { case20261001Copd } from "./2026-10-01-copd-exertional-desaturation";
import { case20261002Sports } from "./2026-10-02-runner-anterior-knee-pain";
import { case20261003Shoulder } from "./2026-10-03-overhead-athlete-shoulder";
// DAILY_CASE_IMPORTS_END 
export const modularClinicalCases: ClinicalCase[] = [
  // DAILY_CASE_SPREADS_START 
  case20261003Shoulder,
  case20261002Sports,
  case20261001Copd,
  // DAILY_CASE_SPREADS_END 
];