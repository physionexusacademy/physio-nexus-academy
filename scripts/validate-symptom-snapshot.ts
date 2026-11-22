import assert from "node:assert/strict";
import {
  allConditionRules, commonHistoryOptions, getImagingNotice, regions, scoreConditions,
} from "../src/lib/msk-symptom-checker.ts";
import {
  CHECKER_ENGINE_VERSION, DURATION_TO_CHECKER, INTAKE_REGION_FOR_CHECKER, ONSET_TO_CHECKER, ageBandForYears, allowedAnswerIds, buildSnapshot, checkerAnswersFromIntake,
} from "../src/lib/symptom/snapshot.ts";
import { INTAKE_DURATION, INTAKE_REGIONS } from "../src/lib/rehabverse/intake.ts";

/**
 * The screening snapshot stored with a RehabVerse assessment: built on the server from raw answers, versioned, and never trusting the browser.
 * (The database side is tested in validate-rehabverse-db.mjs; the screens in the local browser tests.)
 */
let checks = 0;
const ok = (condition: boolean, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };

// The engine version is stable (same data, same version) and looks like a version.
ok(/^msk1-[0-9a-f]{8}$/.test(CHECKER_ENGINE_VERSION), "the engine version is msk1-<8 hex>");

// Every RehabVerse region and duration option has a mapping (or a documented reason not to).
const intakeRegionIds = new Set(INTAKE_REGIONS.map((region) => region.id));
for (const region of regions) ok(intakeRegionIds.has(INTAKE_REGION_FOR_CHECKER[region.id]), `checker region ${region.id} maps to a RehabVerse region`);
for (const duration of INTAKE_DURATION) ok(DURATION_TO_CHECKER[duration.id] !== undefined, `RehabVerse duration ${duration.id} maps to a checker band`);
const checkerIds = new Set([...commonHistoryOptions.duration, ...commonHistoryOptions.onset].map((o) => o.id));
for (const id of [...Object.values(DURATION_TO_CHECKER), ...Object.values(ONSET_TO_CHECKER)]) ok(checkerIds.has(id), `${id} is a real checker answer`);
// Cautious bands: acute and chronic are claimed only when certain.
eq(DURATION_TO_CHECKER["lt_1w"], "duration_acute", "under a week is certainly acute (under two weeks)");
eq([DURATION_TO_CHECKER["1_4w"], DURATION_TO_CHECKER["1_3m"]], ["duration_subacute", "duration_subacute"], "1–4 weeks and 1–3 months straddle a boundary, so they are never called acute or chronic");
eq([DURATION_TO_CHECKER["3_6m"], DURATION_TO_CHECKER["gt_6m"]], ["duration_chronic", "duration_chronic"], "three months or more is certainly past six weeks");
eq(ageBandForYears(25), "age_18_39", "age 25");
eq([ageBandForYears(39), ageBandForYears(40), ageBandForYears(59), ageBandForYears(60)], ["age_18_39", "age_40_59", "age_40_59", "age_60_plus"], "age bands change exactly at 40 and 60");

// Answers from an intake: a stable, unique list.
const answers = checkerAnswersFromIntake({ ageYears: 47, onset: "sudden", duration: "lt_1w", impact: "impact_moderate", location: "loc_knee_front", clues: ["clue_knee_cant_flex90"] });
eq([...answers].sort(), ["age_40_59", "clue_knee_cant_flex90", "duration_acute", "impact_moderate", "loc_knee_front", "onset_trauma"], "the intake becomes the checker's answer ids");
eq(checkerAnswersFromIntake({ ageYears: 30, onset: "after_surgery", duration: "unknown", impact: "impact_mild", location: "", clues: [] }).sort(), ["age_18_39", "impact_mild"], "answers with no equivalent add nothing");

// The snapshot: validation (never trusting the browser).
const bad = (input: Parameters<typeof buildSnapshot>[0], reason: string, message: string) => { const r = buildSnapshot(input); ok(!r.ok && r.reason === reason, message); };
bad({ region: "elbow-sleeve", answers: [] }, "region", "an unknown region is refused");
bad({ region: 7, answers: [] }, "region", "a non-text region is refused");
bad({ region: "knee", answers: "onset_trauma" }, "answers", "answers must be a list");
bad({ region: "knee", answers: ["onset_trauma", 5] }, "answers", "every answer must be text");
bad({ region: "knee", answers: ["clue_neck_c6_dist"] }, "answers", "an answer from another region is refused");
bad({ region: "knee", answers: ["made_up"] }, "answers", "an invented answer is refused");
bad({ region: "knee", answers: Array.from({ length: 61 }, (_, i) => `x${i}`) }, "answers", "an oversized list is refused");
bad({ region: "knee", answers: [], pain_now: 11 }, "pain", "pain above 10 is refused");
bad({ region: "knee", answers: [], pain_now: 2.5 }, "pain", "pain must be a whole number");
bad({ region: "knee", answers: [], pain_now: "5" }, "pain", "pain must be a number");

// The snapshot: content is exactly what the engine produces.
const knee = regions.find((r) => r.id === "knee")!;
const kneeAnswers = ["onset_trauma", "age_40_59", "duration_acute", "impact_high", knee.locations[0].id, ...knee.clues.slice(0, 4).map((c) => c.id), "clue_knee_no4steps"];
const built = buildSnapshot({ region: "knee", answers: [...kneeAnswers, kneeAnswers[0]], pain_now: 6, language: "ru", source: "handover" });
ok(built.ok, "a valid knee snapshot is built");
if (built.ok) {
  const snap = built.snapshot;
  eq(snap.answers, [...new Set(kneeAnswers)].sort(), "answers are de-duplicated and sorted (a stable record)");
  const expected = scoreConditions("knee", new Set(kneeAnswers)).slice(0, 3).map((r) => ({ id: r.condition.id, score: r.score, matched: r.matchedCount, total: r.featureCount }));
  eq(snap.top, expected, "the stored patterns are exactly the engine's top three for those answers");
  ok(snap.top.length <= 3, "at most three patterns are stored");
  eq(snap.priority, 2, "high impact is the prompt-assessment priority (2)");
  eq(snap.fracture_screen, getImagingNotice("knee", new Set(kneeAnswers)) !== null, "the fracture screen flag follows the engine");
  ok(snap.fracture_screen, "an acute knee injury that cannot take four steps trips the fracture screen");
  eq([snap.engine_version, snap.language, snap.source, snap.pain_now, snap.region], [CHECKER_ENGINE_VERSION, "ru", "handover", 6, "knee"], "version, language, source, pain and region are recorded");
}
const mild = buildSnapshot({ region: "neck", answers: ["impact_mild", "onset_gradual"], pain_now: null });
ok(mild.ok && mild.snapshot.priority === 0 && mild.snapshot.language === "en" && mild.snapshot.source === "checker" && mild.snapshot.pain_now === null, "defaults: monitor priority, English, from the checker, no pain");
const painPrompt = buildSnapshot({ region: "neck", answers: ["impact_mild"], pain_now: 9 });
ok(painPrompt.ok && painPrompt.snapshot.priority === 2, "pain of 8+ raises the priority like the checker does");
const noise = buildSnapshot({ region: "neck", answers: [], language: "fr", source: "x" });
ok(noise.ok && noise.snapshot.language === "en" && noise.snapshot.source === "checker" && noise.snapshot.top.length === 0, "unknown language and source fall back safely; no answers means no patterns");

// Every region's own answers are accepted and nothing else.
for (const region of regions) {
  const allowed = allowedAnswerIds(region.id);
  ok(region.locations.every((o) => allowed.has(o.id)) && region.clues.every((o) => allowed.has(o.id)), `${region.id}: its own locations and clues are accepted`);
  ok(!allowed.has("made_up"), `${region.id}: nothing else is accepted`);
}
ok(allConditionRules.every((rule) => regions.some((region) => region.id === rule.region)), "every pattern belongs to a known region");

console.log(`Screening snapshot: ${checks} checks passed.`);
