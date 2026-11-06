"use client";

import type { TeacherLang, TeacherWidgetKey } from "@/lib/teacher/types";
import { ConvexConcaveWidget } from "./ConvexConcaveWidget";
import { MaitlandGradesWidget } from "./MaitlandGradesWidget";
import { SensitivitySpecificityWidget } from "./SensitivitySpecificityWidget";
import { HealingTimelineWidget } from "./HealingTimelineWidget";
import { PainInputsWidget } from "./PainInputsWidget";
import { LesionLocatorWidget } from "./LesionLocatorWidget";
import { GaitCycleWidget } from "./GaitCycleWidget";
import { RpeScaleWidget } from "./RpeScaleWidget";

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
    default:
      return null;
  }
}
