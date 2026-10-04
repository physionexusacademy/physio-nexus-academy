import type { ClinicalCase } from "@/lib/clinical-cases";
// DAILY_CASE_IMPORTS_START 
import { case20261001Copd } from "./2026-10-01-copd-exertional-desaturation";
import { case20261002Sports } from "./2026-10-02-runner-anterior-knee-pain";
import { case20261003Shoulder } from "./2026-10-03-overhead-athlete-shoulder";
import { case20261004Falls } from "./2026-10-04-recurrent-falls-orthostatic-symptoms";
import { case20261005Pelvic } from "./2026-10-05-postpartum-running-stress-incontinence";
// DAILY_CASE_IMPORTS_END 
export const modularClinicalCases: ClinicalCase[] = [
  // DAILY_CASE_SPREADS_START 
  case20261005Pelvic,
  case20261004Falls, 
  case20261003Shoulder,
  case20261002Sports,
  case20261001Copd,
  // DAILY_CASE_SPREADS_END 
];