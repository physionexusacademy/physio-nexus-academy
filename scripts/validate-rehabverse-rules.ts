/**
 * RehabVerse decision-support rules: every rule fires when it should, the most cautious rule wins,
 * and the output is always labelled as decision support for the physiotherapist.
 *   npm run validate:rehabverse-rules
 */
import { RULE_CATALOGUE, DISCLAIMER, decisionSupport, type Suggestion } from "../src/lib/rehabverse/rules.ts";
import type { AdminSessionBundle } from "../src/lib/rehabverse/api-types.ts";

const failures: string[] = [];
const expect = (name: string, ok: boolean, detail = "") => {
  if (!ok) failures.push(`${name}${detail ? ": " + detail : ""}`);
};

type Fb = Partial<NonNullable<AdminSessionBundle["feedback"]>>;
type Obs = Partial<AdminSessionBundle["observations"][number]> & { timepoint: AdminSessionBundle["observations"][number]["timepoint"] };

function day(n: number, fb: Fb | null, obs: Obs[] = []): AdminSessionBundle {
  return {
    session: { id: `s${n}`, day_number: n, title: `Day ${n}`, status: "awaiting_review", patient_note: null, available_from: null, released_at: null, release_mode: null, reviewed_at: null },
    exercises: [], completions: [], reviews: [],
    feedback: fb === null ? null : {
      id: `f${n}`, completion: "all", pain_before: 2, pain_during: 3, pain_after: 2, difficulty: 3, unusual_symptoms: false, unusual_text: null,
      safety_flag_ids: [], notes: null, submitted_at: new Date().toISOString(), ...fb,
    },
    observations: obs.map((o) => ({ pain: 2, function_score: null, symptom_response: null, new_symptoms: false, flag_ids: [], note: null, recorded_at: new Date().toISOString(), ...o })),
  };
}

const cases: { name: string; bundle: AdminSessionBundle; previous?: AdminSessionBundle[]; expect: Suggestion; fired?: string[] }[] = [
  { name: "calm day", bundle: day(1, {}), expect: "progress", fired: ["R10"] },
  { name: "emergency flag", bundle: day(1, { safety_flag_ids: ["fb_chest"] }), expect: "pause_refer", fired: ["R1"] },
  { name: "urgent flag", bundle: day(1, { safety_flag_ids: ["fb_injury"] }), expect: "pause_refer", fired: ["R2"] },
  { name: "emergency beats an otherwise calm day", bundle: day(1, { safety_flag_ids: ["fb_neuro"], pain_after: 1, pain_during: 1 }), expect: "pause_refer" },
  { name: "unusual symptoms", bundle: day(1, { unusual_symptoms: true, unusual_text: "tingling" }), expect: "reassess", fired: ["R3"] },
  { name: "severe pain after", bundle: day(1, { pain_after: 8 }), expect: "reassess", fired: ["R4"] },
  { name: "severe pain during", bundle: day(1, { pain_during: 7 }), expect: "reassess", fired: ["R4"] },
  { name: "pain during above 5", bundle: day(1, { pain_during: 6, pain_after: 4 }), expect: "regress", fired: ["R6"] },
  { name: "pain after 3+ above before", bundle: day(1, { pain_before: 1, pain_during: 3, pain_after: 4 }), expect: "regress", fired: ["R6"] },
  { name: "worse at next day", bundle: day(1, {}, [{ timepoint: "24h", symptom_response: "worse", pain: 4 }]), expect: "regress", fired: ["R7"] },
  { name: "next-day pain not settled", bundle: day(1, { pain_before: 2 }, [{ timepoint: "24h", pain: 5, symptom_response: "same" }]), expect: "regress", fired: ["R7"] },
  { name: "worse at 24 h and 48 h", bundle: day(1, {}, [{ timepoint: "24h", symptom_response: "worse" }, { timepoint: "48h", symptom_response: "worse" }]), expect: "reassess", fired: ["R5"] },
  { name: "too difficult", bundle: day(1, { difficulty: 9 }), expect: "regress", fired: ["R8"] },
  { name: "partial completion", bundle: day(1, { completion: "partial" }), expect: "maintain", fired: ["R9"] },
  { name: "not done", bundle: day(1, { completion: "none", pain_before: null, pain_during: null, pain_after: null, difficulty: null }), expect: "maintain", fired: ["R9"] },
  { name: "moderate but acceptable pain, not calm", bundle: day(1, { pain_during: 5, pain_after: 4, pain_before: 3, difficulty: 6 }), expect: "maintain" },
  {
    name: "pain climbing over three days",
    previous: [day(1, { pain_after: 2 }), day(2, { pain_after: 3 })], bundle: day(3, { pain_before: 3, pain_during: 4, pain_after: 5 }),
    expect: "reassess", fired: ["R5"],
  },
  { name: "no feedback", bundle: day(1, null), expect: "maintain" },
];

for (const c of cases) {
  const out = decisionSupport(c.bundle, c.previous ?? []);
  expect(c.name, out.suggestion === c.expect, `got ${out.suggestion}, wanted ${c.expect}`);
  for (const id of c.fired ?? []) expect(c.name, out.rules.find((r) => r.id === id)?.fired === true, `rule ${id} should fire`);
  expect(`${c.name} (disclaimer)`, out.disclaimer === DISCLAIMER && out.disclaimer.toLowerCase().includes("not a diagnosis"));
  expect(`${c.name} (references)`, out.references.length >= 2);
  // Every output lists every rule so the reviewer can see what was checked.
  expect(`${c.name} (all rules listed)`, c.bundle.feedback === null || out.rules.length === RULE_CATALOGUE.length);
}

// A calm day without the next-day check-in must say it is provisional.
{
  const out = decisionSupport(day(1, {}), []);
  expect("calm day is provisional until follow-ups arrive", out.provisional.length > 0);
}
// Auto-approval is never an output: the engine only suggests, it never returns a "release" action.
expect("suggestions are advisory only", cases.every((c) => ["pause_refer", "reassess", "regress", "maintain", "progress"].includes(decisionSupport(c.bundle, c.previous ?? []).suggestion)));

if (failures.length) {
  console.error(`RehabVerse rules: ${failures.length} problem(s)\n` + failures.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`RehabVerse rules OK — ${cases.length} scenarios, ${RULE_CATALOGUE.length} rules`);
