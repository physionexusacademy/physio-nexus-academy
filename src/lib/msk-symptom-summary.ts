import { commonHistoryOptions, featureLabels, redFlags, type ImagingNotice, type RegionConfig, type ScoredCondition } from "./msk-symptom-checker.ts";

/**
 * A plain-text summary the person can copy and show a clinician. It lists exactly what they answered, the screening
 * patterns that fit, and the safety answers — with the same "screening, not diagnosis" wording as the screen.
 */
export function buildSummaryText(input: {
  region: Pick<RegionConfig, "label" | "medical">;
  selected: Set<string>;
  pain: number | null;
  results: ScoredCondition[];
  priority: { label: string };
  imaging: ImagingNotice | null;
  flagIds: Set<string>;
  date?: Date;
}): string {
  const label = (id: string) => featureLabels.get(id) ?? id;
  const pick = (options: { id: string; label: string }[]) => options.find((o) => input.selected.has(o.id))?.label;
  const lines: string[] = [];
  lines.push("PNA MSK symptom screening — summary");
  lines.push(`Date: ${(input.date ?? new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`);
  lines.push(`Main area: ${input.region.label} (${input.region.medical})`);
  lines.push("");
  lines.push("What I reported");
  for (const [title, value] of [
    ["Age", pick(commonHistoryOptions.age)],
    ["Started", pick(commonHistoryOptions.onset)],
    ["Duration", pick(commonHistoryOptions.duration)],
    ["Effect on daily life", pick(commonHistoryOptions.impact)],
  ] as const) if (value) lines.push(`- ${title}: ${value}`);
  if (input.pain !== null) lines.push(`- Pain right now: ${input.pain}/10`);
  const reported = [...input.selected].filter((id) => !/^(age_|onset_|duration_|impact_)/.test(id)).map(label);
  for (const item of reported) lines.push(`- ${item}`);
  lines.push("");
  const flags = redFlags.filter((flag) => input.flagIds.has(flag.id));
  lines.push(flags.length ? "Safety warnings I selected" : "Safety warnings: none selected");
  for (const flag of flags) lines.push(`- ${flag.label}`);
  if (!flags.length) {
    lines.push("");
    lines.push(`Next step: ${input.priority.label}`);
    if (input.imaging) lines.push(`Fracture screening: ${input.imaging.title} (${input.imaging.criteria.join("; ")})`);
    lines.push("");
    lines.push("Patterns that fit my answers (screening only, not a diagnosis)");
    if (!input.results.length) lines.push("- No single pattern stood out");
    for (const r of input.results) lines.push(`- ${r.condition.name} — reported ${r.matchedCount} of ${r.featureCount} typical features`);
  }
  lines.push("");
  lines.push("This summary comes from a screening tool at physionexusacademy.com. It does not replace examination or medical diagnosis.");
  return lines.join("\n");
}
