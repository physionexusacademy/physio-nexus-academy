import type { TeacherLesson, TeacherLessonCard } from "../types.ts";
import { convexConcaveRule } from "./convex-concave-rule.ts";
import { maitlandGrades } from "./maitland-grades.ts";
import { sensitivitySpecificity } from "./sensitivity-specificity.ts";
import { umnVsLmn } from "./umn-vs-lmn.ts";
import { activePassiveInsufficiency } from "./active-passive-insufficiency.ts";
import { openVsClosedChain } from "./open-vs-closed-chain.ts";
import { tissueHealingPhases } from "./tissue-healing-phases.ts";
import { painScienceBasics } from "./pain-science-basics.ts";
import { dermatomesMyotomesReflexes } from "./dermatomes-myotomes-reflexes.ts";
import { redFlagsScreening } from "./red-flags-screening.ts";
import { exerciseDosage } from "./exercise-dosage.ts";
import { gaitCycle } from "./gait-cycle.ts";
import { subjectiveAssessmentSin } from "./subjective-assessment-sin.ts";
import { endFeelCapsularPatterns } from "./end-feel-capsular-patterns.ts";
import { muscleContractionTypes } from "./muscle-contraction-types.ts";
import { leversTorque } from "./levers-torque.ts";
import { scapulohumeralRhythm } from "./scapulohumeral-rhythm.ts";
import { tendinopathyLoadManagement } from "./tendinopathy-load-management.ts";
import { motorLearningNeuroplasticity } from "./motor-learning-neuroplasticity.ts";
import { balanceFallsAssessment } from "./balance-falls-assessment.ts";
import { tensUltrasoundEvidence } from "./tens-ultrasound-evidence.ts";
import { airwayClearanceAcbt } from "./airway-clearance-acbt.ts";

/** Display order on the PNA Teacher hub. */
export const teacherLessons: TeacherLesson[] = [
  // Movement science
  convexConcaveRule,
  activePassiveInsufficiency,
  muscleContractionTypes,
  leversTorque,
  openVsClosedChain,
  scapulohumeralRhythm,
  gaitCycle,
  // Tissue healing & exercise
  tissueHealingPhases,
  tendinopathyLoadManagement,
  exerciseDosage,
  // Assessment & clinical reasoning
  subjectiveAssessmentSin,
  endFeelCapsularPatterns,
  maitlandGrades,
  sensitivitySpecificity,
  redFlagsScreening,
  // Neurology
  dermatomesMyotomesReflexes,
  umnVsLmn,
  motorLearningNeuroplasticity,
  balanceFallsAssessment,
  // Pain, electrotherapy & cardiorespiratory
  painScienceBasics,
  tensUltrasoundEvidence,
  airwayClearanceAcbt,
];

export function getTeacherLesson(slug: string): TeacherLesson | undefined {
  return teacherLessons.find((lesson) => lesson.slug === slug);
}

export function toLessonCard(lesson: TeacherLesson, href = `/learn/${lesson.slug}`): TeacherLessonCard {
  return {
    href,
    slug: lesson.slug,
    title: lesson.title,
    hook: lesson.hook,
    area: lesson.area,
    level: lesson.level,
    bestFor: lesson.bestFor,
    minutes: lesson.minutes,
    flashcardCount: lesson.flashcards.length,
  };
}

export const teacherLessonCards: TeacherLessonCard[] = teacherLessons.map((lesson) => toLessonCard(lesson));
