"use client";

import dynamic from "next/dynamic";
import type { TeacherLang, TeacherWidgetKey } from "@/lib/teacher/types";
import { ConvexConcaveWidget } from "./ConvexConcaveWidget";
import { MaitlandGradesWidget } from "./MaitlandGradesWidget";
import { SensitivitySpecificityWidget } from "./SensitivitySpecificityWidget";
import { HealingTimelineWidget } from "./HealingTimelineWidget";
import { PainInputsWidget } from "./PainInputsWidget";
import { LesionLocatorWidget } from "./LesionLocatorWidget";
import { GaitCycleWidget } from "./GaitCycleWidget";
import { RpeScaleWidget } from "./RpeScaleWidget";

// The newer expert widgets load only when a lesson shows them, so the lesson hub stays light.
const CordLesionLab = dynamic(() => import("./CordLesionLab").then((m) => m.CordLesionLab), { ssr: false });
const StrokeTerritories = dynamic(() => import("./StrokeTerritories").then((m) => m.StrokeTerritories), { ssr: false });
const BppvEpley = dynamic(() => import("./BppvEpley").then((m) => m.BppvEpley), { ssr: false });
const TardieuCatch = dynamic(() => import("./TardieuCatch").then((m) => m.TardieuCatch), { ssr: false });
const MilestoneTimeline = dynamic(() => import("./MilestoneTimeline").then((m) => m.MilestoneTimeline), { ssr: false });
const PrimitiveReflexes = dynamic(() => import("./PrimitiveReflexes").then((m) => m.PrimitiveReflexes), { ssr: false });
const GmfcsExplorer = dynamic(() => import("./GmfcsExplorer").then((m) => m.GmfcsExplorer), { ssr: false });

export function TeacherWidget({ widget, lang }: { widget: TeacherWidgetKey; lang: TeacherLang }) {
  switch (widget) {
    case "convex-concave":
      return <ConvexConcaveWidget lang={lang} />;
    case "maitland-grades":
      return <MaitlandGradesWidget lang={lang} />;
    case "sensitivity-specificity":
      return <SensitivitySpecificityWidget lang={lang} />;
    case "healing-timeline":
      return <HealingTimelineWidget lang={lang} />;
    case "pain-inputs":
      return <PainInputsWidget lang={lang} />;
    case "lesion-locator":
      return <LesionLocatorWidget lang={lang} />;
    case "gait-cycle":
      return <GaitCycleWidget lang={lang} />;
    case "rpe-scale":
      return <RpeScaleWidget lang={lang} />;
    case "cord-lesion-lab":
      return <CordLesionLab lang={lang} />;
    case "stroke-territories":
      return <StrokeTerritories lang={lang} />;
    case "bppv-epley":
      return <BppvEpley lang={lang} />;
    case "tardieu-catch":
      return <TardieuCatch lang={lang} />;
    case "milestone-timeline":
      return <MilestoneTimeline lang={lang} />;
    case "primitive-reflexes":
      return <PrimitiveReflexes lang={lang} />;
    case "gmfcs-explorer":
      return <GmfcsExplorer lang={lang} />;
    default:
      return null;
  }
}
