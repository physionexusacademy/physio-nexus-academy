import type { ClinicalCase } from "@/lib/clinical-cases";
// DAILY_CASE_IMPORTS_START 
import { case20261001Copd } from "./2026-10-01-copd-exertional-desaturation";
import { case20261002Sports } from "./2026-10-02-runner-anterior-knee-pain";
import { case20261003Shoulder } from "./2026-10-03-overhead-athlete-shoulder";
import { case20261004Falls } from "./2026-10-04-recurrent-falls-orthostatic-symptoms";
import { case20261005Pelvic } from "./2026-10-05-postpartum-running-stress-incontinence";
import { case20261010Myelopathy } from "./2026-10-10-cervical-myelopathy";
import { case20261011Clubfoot } from "./2026-10-11-clubfoot-relapse";
import { case20261012HeartFailure } from "./2026-10-12-stable-heart-failure-exercise-readiness";
import { case20261013LateralElbow } from "./2026-10-13-lateral-elbow-tendinopathy";
import { case20261015PainFlare } from "./2026-10-15-persistent-pain-flare-plan";
// DAILY_CASE_IMPORTS_END 
export const modularClinicalCases: ClinicalCase[] = [
  // DAILY_CASE_SPREADS_START
  case20261015PainFlare,
  case20261013LateralElbow,
  case20261012HeartFailure,
  case20261011Clubfoot,
  case20261010Myelopathy, 
  case20261005Pelvic,
  case20261004Falls, 
  case20261003Shoulder,
  case20261002Sports,
  case20261001Copd,
  // DAILY_CASE_SPREADS_END 
];
