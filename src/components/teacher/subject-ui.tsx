import { Activity, Atom, Baby, Brain, Dumbbell, FlaskConical, GraduationCap, Hand, Microscope, Siren, Stethoscope, Wind, Zap, type LucideIcon } from "lucide-react";
import type { SubjectIcon } from "@/lib/teacher/subjects";

export const subjectIcons: Record<SubjectIcon, LucideIcon> = {
  atom: Atom,
  brain: Brain,
  stethoscope: Stethoscope,
  hand: Hand,
  activity: Activity,
  wind: Wind,
  zap: Zap,
  baby: Baby,
  dumbbell: Dumbbell,
  flask: FlaskConical,
  microscope: Microscope,
  siren: Siren,
  cap: GraduationCap,
};
