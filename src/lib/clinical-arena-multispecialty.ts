import { createMultidisciplinaryCases, type Template } from "./clinical-arena-multispecialty-core";
import { neuroTemplates } from "./clinical-arena-neuro";
import { pediatricTemplates } from "./clinical-arena-pediatrics";
import { cardiopulmTemplates } from "./clinical-arena-cardiopulm";
import { mobilityVestibularTemplates } from "./clinical-arena-mobility-vestibular";
import { specialistTemplates } from "./clinical-arena-specialist";

/** 60 authored clinical decision blueprints × 5 functionally different encounters = 300 patient cases. */
export const multidisciplinaryTemplates:Template[]=[
 ...neuroTemplates,
 ...pediatricTemplates,
 ...cardiopulmTemplates,
 ...mobilityVestibularTemplates,
 ...specialistTemplates,
];
const built=createMultidisciplinaryCases(multidisciplinaryTemplates);
export const multidisciplinaryCases=built.cases;
export const multidisciplinaryFlows=built.flows;
export const multidisciplinaryExams=built.exams;
export const multidisciplinaryRegions=built.regionById;
