import { CAMERA_SPECS, MOVEMENT_TYPES, VALIDATED_TYPES, movementTypeOf, type CameraSpec, type Metric, type PointRef } from "../src/lib/formcheck/index.ts";
import { loadLibrary, MOVE_THRESHOLD_DEG } from "./formcheck-library.ts";

/**
 * Writes docs/camera-form-check/03-exercise-camera-decisions.md from the specs and the library. The document is generated so that it can never disagree with the code:
 * `npm run validate:formcheck` fails when the file is stale, `npm run build:formcheck-decisions` rewrites it.
 */
const ref = (p: PointRef): string => {
  if (typeof p !== "string") return `middle of ${ref(p.mid[0])} and ${ref(p.mid[1])}`;
  const [which, part] = p.includes(":") ? p.split(":") : ["", p];
  const name = part.replace(/([A-Z])/g, " $1").toLowerCase().replace(/^(left|right) /, "$1 ");
  return which === "near" ? `near-side ${name}` : which === "far" ? `far-side ${name}` : which === "tested" ? `exercised-side ${name}` : which === "other" ? `other-side ${name}` : name;
};
const unit = (m: Metric): string => (m.kind === "offset" || m.kind === "dist" ? "a fraction of the stated length" : "degrees");
function describe(m: Metric): string {
  const sign = m.abs ? " (size only, either way)" : "";
  switch (m.kind) {
    case "joint": return `angle at the ${ref(m.b)} between the ${ref(m.a)} and the ${ref(m.c)}${sign}`;
    case "incline": return `line from the ${ref(m.from)} to the ${ref(m.to)} against the ${m.ref}${m.byFacing ? ", positive towards the way the person faces" : ""}${sign}`;
    case "tilt": return `line from the ${ref(m.a)} to the ${ref(m.b)} against the horizontal${sign}`;
    case "offset": return `how far the ${ref(m.b)} is ${m.axis === "y" ? "above" : "ahead of"} the ${ref(m.a)}, as a fraction of the length ${ref(m.scale[0])} to ${ref(m.scale[1])}${sign}`;
    case "dist": return `distance ${ref(m.a)} to ${ref(m.b)}, as a fraction of the length ${ref(m.scale[0])} to ${ref(m.scale[1])}${sign}`;
    case "rotation": return `turn about the long axis from how much narrower the ${ref(m.a)}-to-${ref(m.b)} width looks than in the person's own neutral position${sign}`;
    case "head": return `head ${m.axis} from the face model${sign}`;
    case "diff": return `${describe(m.a)} minus ${describe(m.b)}${sign}`;
  }
}

const POSTURE: Record<string, string> = { seated: "Sitting", standing: "Standing", supine: "Lying on the back", prone: "Lying face down or in a plank", "side-lying": "Lying on the side", quadruped: "On hands and knees" };
const VIEW: Record<string, string> = { side: "side", front: "front", feet: "feet end", head: "head end" };
const range = (r: [number, number]) => (r[0] === r[1] ? `${r[0]}` : `${r[0]} to ${r[1]}`);
const cell = (s: string) => s.replace(/\|/g, "/").replace(/\n/g, " ");

export function renderDecisions(root = process.cwd()): string {
  const library = new Map(loadLibrary(root).map((e) => [e.id, e]));
  const lines: string[] = [];
  const out = (s = "") => lines.push(s);
  const count = (spec: CameraSpec, c: string) => spec.joints.filter((j) => j.role === "mover" && j.coverage === c).length;
  const metricOf = (spec: CameraSpec, id: string, pass: 1 | 2 = 1) => (pass === 2 ? spec.second?.metrics : spec.metrics)?.find((m) => m.id === id);

  out("# Camera decisions for the 27 neck and back exercises");
  out();
  out("*Generated from `src/lib/formcheck/specs-*.ts` and the exercise library's own motion data by `npm run build:formcheck-decisions`. Do not edit by hand: `npm run validate:formcheck` fails when this file is out of date.*");
  out();
  out("## How to read this");
  out();
  out("**One decision per exercise.** For each of the 27 neck and back exercises this records where the phone goes (view, orientation, distance, lens height), what the camera must see, what it counts or times, how it covers every joint that moves in the exercise, which cues it gives, and what it cannot do. The check that no moving joint is left out runs in CI: a joint that moves by at least " + MOVE_THRESHOLD_DEG + " degrees in the exercise's own 3D demonstration must be listed in its spec.");
  out();
  out("**Views.** *Side*: the person's side to the phone (nodding, bending forwards and backwards, limb angles). *Front*: facing the phone (side bends, turns). *Feet end* / *head end*: the phone on the floor beyond the feet or the head of a person lying down, looking along the body; a turn of the trunk about its long axis then shows as the shoulder line (or the knee line) turning in the picture, which is the clearest way to see it.");
  out();
  out("**Tier A / tier B.** Tier A: the person sits or stands, the view the pose model was built for. Tier B: lying, face down, on the side or on all fours: counts, timers and position cues first; an angle only if validated.");
  out();
  out("**Feasibility.** *standard*: an upright person, front or side. *to-confirm*: a lying, face-down, end-on or all-fours view. These are design decisions until the feasibility trial shows that the pose model finds the person in that view on real phones; the fall-back for each is written in its Limits line.");
  out();
  out("**Joint coverage.** *measured*: a metric reads the joint's own angle, or a simple, direct stand-in for it (the stand-in is stated). *tracked*: the movement is followed (a position, a count) but the joint's own angle is not read. *not measurable*: one camera cannot see it; the tool says so rather than guess. A 2D picture of a 3D body measures angles in the picture plane; every angle is shown only after validation (below).");
  out();
  out("**Everything is provisional.** The targets, bands and thresholds are starting values taken from each exercise's own demonstration and dosage; the validation study and the feasibility trial replace them with measured values. Hold times are the library's own dosage.");
  out();

  out("## Summary");
  out();
  out("| # | Exercise | Region | Position | Tier | Phone | Distance m | Lens cm | Face model | Counted by | Moving joints: measured / tracked / not measurable | 2nd pass |");
  out("|---|---|---|---|---|---|---|---|---|---|---|---|");
  CAMERA_SPECS.forEach((spec, i) => {
    const lib = library.get(spec.id)!;
    const primary = metricOf(spec, spec.primary.metric)!;
    const by = `${spec.primary.mode === "reps" ? "reps" : spec.primary.mode === "hold-reach" ? "timer (reach)" : "timer (steady)"}: ${spec.primary.metric}`;
    out(`| ${i + 1} | ${cell(lib.name)} (\`${spec.id}\`) | ${spec.region} | ${POSTURE[spec.posture]}${spec.sided ? ", one side at a time" : ""} | ${spec.tier} | ${VIEW[spec.placement.view]}, ${spec.placement.orientation} | ${range(spec.placement.distanceM)} | ${range(spec.placement.heightCm)} | ${spec.needFace ?? "no"} | ${by} | ${count(spec, "measured")} / ${count(spec, "tracked")} / ${count(spec, "not_measurable")} | ${spec.second ? VIEW[spec.second.placement.view] : ""} |`);
    void primary;
  });
  out();

  out("## Movement types and the validation battery");
  out();
  out("A number is shown to a patient only for a *movement type* that has passed the pre-specified rules of the validation study (protocol section 10.7). Exercises that measure the same type share the decision. The protocol's eight-movement battery covers the types marked below; the others stay at counts, timers and position cues until a later study adds them. **Validated today: " + (Object.keys(VALIDATED_TYPES).length ? Object.keys(VALIDATED_TYPES).join(", ") : "none") + ".**");
  out();
  out("| Movement type | In the battery (no.) | Reference | Exercises that use it (primary or measured joint) |");
  out("|---|---|---|---|");
  const usage = new Map<string, Set<string>>();
  for (const spec of CAMERA_SPECS) {
    const add = (metricId: string) => { const t = movementTypeOf(spec, metricId); if (t) (usage.get(t) ?? usage.set(t, new Set()).get(t)!).add(spec.id); };
    add(spec.primary.metric);
    for (const j of spec.joints) if (j.coverage === "measured" && j.metric) add(j.metric);
  }
  for (const [id, type] of Object.entries(MOVEMENT_TYPES)) {
    out(`| ${type.label} (\`${id}\`) | ${type.battery ?? "not in the battery"} | ${type.reference} | ${[...(usage.get(id) ?? [])].join(", ") || "(only watched or tracked)"} |`);
  }
  out();

  out("## What one camera cannot see, across all 27");
  out();
  const cannot = new Map<string, string[]>();
  for (const spec of CAMERA_SPECS) for (const j of spec.joints) if (j.coverage === "not_measurable") { const why = j.why ?? ""; (cannot.get(why) ?? cannot.set(why, []).get(why)!).push(`${spec.id} (${j.joint} ${j.axes.join("/")})`); }
  for (const [why, where] of [...cannot].sort((a, b) => b[1].length - a[1].length)) out(`- ${why} — ${where.length} case${where.length === 1 ? "" : "s"}: ${where.join("; ")}`);
  out();

  out("## Per exercise");
  CAMERA_SPECS.forEach((spec, i) => {
    const lib = library.get(spec.id)!;
    out();
    out(`### ${i + 1}. ${lib.name} — \`${spec.id}\``);
    out();
    out(`*${spec.region}, tier ${spec.tier}, ${POSTURE[spec.posture].toLowerCase()}${spec.sided ? ", one side at a time" : ""}, feasibility: ${spec.feasibility}. The library's own demonstration is shown from the ${lib.view || "n/a"} (${lib.position || "n/a"}).*`);
    out();
    out(`**Phone.** ${VIEW[spec.placement.view]} view, ${spec.placement.orientation}, ${range(spec.placement.distanceM)} m away, lens ${range(spec.placement.heightCm)} cm above the floor, framing: ${spec.placement.subject.replace(/-/g, " ")}.`);
    out();
    out(`> ${spec.placement.how.en}`);
    out(`> *${spec.placement.how.ru}*`);
    out();
    out(`**Must be visible:** ${spec.need.map(ref).join(", ")}.${spec.needFace ? ` Face model: ${spec.needFace}.` : ""}`);
    if (spec.second) {
      out();
      out(`**Second pass (${VIEW[spec.second.placement.view]} view, ${spec.second.placement.orientation}, ${range(spec.second.placement.distanceM)} m, lens ${range(spec.second.placement.heightCm)} cm):** ${spec.second.why.en} Must be visible: ${spec.second.need.map(ref).join(", ")}.`);
    }
    out();
    const p = spec.primary;
    const pm = metricOf(spec, p.metric)!;
    out(`**Counts or times:** ${p.mode === "reps" ? "repetitions" : p.mode === "hold-reach" ? "how long the position is held at or beyond the target" : "how long the position stays within the band"} of \`${p.metric}\` = ${describe(pm)}. ${p.reference === "baseline" ? "Zero is the person's own neutral position; the target is the change from it" : "Rest and target are readings"}: ${p.mode === "hold-steady" ? `band of ${p.target}` : `${p.rest} to ${p.target}`} (${unit(pm)}${p.abs ? ", either direction" : ""})${p.holdMs ? `, hold ${p.holdMs / 1000} s` : ""}${p.movementsPerRep ? `, ${p.movementsPerRep} movements make one repetition` : ""}. Library dosage: ${[lib.dosage.sets && `${lib.dosage.sets} sets`, lib.dosage.reps && `${lib.dosage.reps} reps`, lib.dosage.holdSeconds && `${lib.dosage.holdSeconds} s hold`, lib.dosage.durationSeconds && `${lib.dosage.durationSeconds} s`].filter(Boolean).join(", ") || "n/a"}.`);
    out();
    out("**Metrics**");
    out();
    for (const m of spec.metrics) out(`- \`${m.id}\`: ${describe(m)}`);
    if (spec.second) for (const m of spec.second.metrics) out(`- \`${m.id}\` (second pass): ${describe(m)}`);
    out();
    out("**Joints.** Every joint that moves in the demonstration (marked ●) and the joints watched for a compensation (○).");
    out();
    out("| | Joint | Axes | Coverage | Metric (movement type) | How / why |");
    out("|---|---|---|---|---|---|");
    for (const j of spec.joints) {
      const type = j.metric ? movementTypeOf(spec, j.metric) : null;
      out(`| ${j.role === "mover" ? "●" : "○"} | ${j.joint} | ${j.axes.join(", ")} | ${j.coverage.replace("_", " ")}${j.pass === 2 ? " (2nd pass)" : ""} | ${j.metric ? `\`${j.metric}\`${type ? ` (\`${type}\`)` : ""}` : ""} | ${cell(j.why ?? "")} |`);
    }
    out();
    if (spec.cues.length) {
      out("**Cues** (each is checked by the wording rules: never more range or effort, never over pain, no medical judgement)");
      out();
      out("| Id | When | English | Roman Urdu |");
      out("|---|---|---|---|");
      for (const c of spec.cues) out(`| \`${c.id}\` | \`${c.metric}\` ${c.when === "change_over" ? "changes by more than" : "stays below"} ${c.value} for ${c.forMs} ms${c.pass === 2 ? " (2nd pass)" : ""} | ${c.text.en} | ${c.text.ru} |`);
      out();
    } else {
      out("**Cues:** none (a count and a timer only).");
      out();
    }
    out(`**Limits.** ${spec.limits.en}`);
    out();
    out(`*${spec.limits.ru}*`);
  });

  out();
  out("## Cue sentences to record");
  out();
  out("Every cue sentence, once each, for the English and Roman Urdu recordings (the same studio pipeline as the exercise voice; recordings are made when the sentences are final).");
  out();
  out("| English | Roman Urdu | Used by |");
  out("|---|---|---|");
  const sentences = new Map<string, { ru: string; ids: string[] }>();
  for (const spec of CAMERA_SPECS) for (const c of spec.cues) { const e = sentences.get(c.text.en) ?? { ru: c.text.ru, ids: [] }; e.ids.push(c.id); sentences.set(c.text.en, e); }
  for (const [en, { ru, ids }] of sentences) out(`| ${en} | ${ru} | ${ids.join(", ")} |`);
  out();
  out(`${sentences.size} distinct sentences.`);
  out();
  return lines.join("\n");
}
