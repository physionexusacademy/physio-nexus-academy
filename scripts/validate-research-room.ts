import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_CONFIG, checkStudyConfig, flowSummary, generateSequence, makeRng, maxImbalance, parseSequenceCsv, reasonLabel, sequenceToCsv, strataOf, stratumFor,
  type StudyConfig, type StudyOverview,
} from "../src/lib/research-room/index.ts";
import { instrumentFor } from "../src/lib/outcomes/instruments.ts";

/**
 * Research Room, phase 1: the allocation-list maker and reader, the pain bands, the study rules and the flow numbers, plus a read of the screens and actions to
 * check the safeguards are wired (the list is never shown, the arm is never chosen by hand, recruiting needs ethics). The database side is tested by
 * validate-research-room-db.mjs.
 */
let checks = 0;
const ok = (c: boolean, m: string) => { checks++; assert.ok(c, m); };
const eq = (a: unknown, b: unknown, m: string) => { checks++; assert.deepEqual(a, b, m); };
const throws = (f: () => unknown, m: string) => { checks++; assert.throws(f, () => true, m); };
const read = (p: string) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

/* ---------- random numbers ---------- */
{
  const a = makeRng("seed-1"), b = makeRng("seed-1"), c = makeRng("seed-2");
  const xs = Array.from({ length: 50 }, () => a()), ys = Array.from({ length: 50 }, () => b()), zs = Array.from({ length: 50 }, () => c());
  eq(xs, ys, "the same seed gives the same numbers");
  ok(JSON.stringify(xs) !== JSON.stringify(zs), "another seed gives other numbers");
  ok(xs.every((v) => v >= 0 && v < 1), "numbers are in [0, 1)");
  const mean = Array.from({ length: 4000 }, makeRng("mean")).reduce((s, v) => s + v, 0) / 4000;
  ok(mean > 0.47 && mean < 0.53, "the numbers are spread evenly");
}

/* ---------- pain bands ---------- */
eq(strataOf(DEFAULT_CONFIG), ["3-5", "6-10"], "default pain bands");
eq(strataOf({ min_nprs: 3, strata_cuts: [5, 7] }), ["3-4", "5-6", "7-10"], "three bands");
eq(strataOf({ min_nprs: 1, strata_cuts: [] }), ["1-10"], "no cut points gives one band");
eq(strataOf({ min_nprs: 3, strata_cuts: [7, 5] }), ["3-4", "5-6", "7-10"], "cut points are sorted");
eq([2, 3, 5, 6, 10].map((n) => stratumFor(DEFAULT_CONFIG, n)), [null, "3-5", "3-5", "6-10", "6-10"], "scores map to bands at the edges");
eq([stratumFor(DEFAULT_CONFIG, 11), stratumFor(DEFAULT_CONFIG, -1), stratumFor(DEFAULT_CONFIG, 4.5)], [null, null, null], "invalid scores have no band");

/* ---------- allocation lists ---------- */
{
  const strata = strataOf(DEFAULT_CONFIG);
  const rows = generateSequence({ seed: "unit", strata, perStratum: 60 });
  for (const s of strata) {
    const mine = rows.filter((r) => r.stratum === s);
    ok(mine.length >= 60, `${s}: at least the rows asked for`);
    eq(mine.map((r) => r.position), mine.map((_, i) => i + 1), `${s}: positions run 1, 2, 3 ...`);
    ok(mine.every((r) => r.arm === "ai" || r.arm === "no_ai"), `${s}: arms are ai or no_ai`);
    // every complete block is balanced: the running difference returns to zero at the end of each block of 4 or 6
    let d = 0, zeros = 0;
    for (const r of mine) { d += r.arm === "ai" ? 1 : -1; if (d === 0) zeros++; }
    eq(d, 0, `${s}: the list ends balanced`);
    ok(zeros >= mine.length / 6, `${s}: the arms rebalance at least once per block`);
  }
  ok(maxImbalance(rows) <= 3, "the arms never differ by more than half the largest block (3)");
  eq(generateSequence({ seed: "unit", strata, perStratum: 60 }), rows, "the same seed rebuilds the same list");
  ok(JSON.stringify(generateSequence({ seed: "other", strata, perStratum: 60 })) !== JSON.stringify(rows), "another seed gives another list");
  // each group has its own stream: group lists are not copies of each other
  ok(JSON.stringify(rows.filter((r) => r.stratum === "3-5").map((r) => r.arm)) !== JSON.stringify(rows.filter((r) => r.stratum === "6-10").map((r) => r.arm)), "groups have independent lists");
  // fairness over many seeds: the first allocation is not biased toward one arm
  let firstAi = 0;
  for (let i = 0; i < 400; i++) if (generateSequence({ seed: "s" + i, strata: ["3-5"], perStratum: 4 })[0].arm === "ai") firstAi++;
  ok(firstAi > 160 && firstAi < 240, `the first allocation is not biased (${firstAi} of 400 were ai)`);
  // block sizes vary, so the end of a block cannot be guessed
  const sizes = new Set<number>();
  { let run = 0, d2 = 0; for (const r of rows.filter((x) => x.stratum === "3-5")) { run++; d2 += r.arm === "ai" ? 1 : -1; if (d2 === 0) { sizes.add(run); run = 0; } } }
  ok(sizes.has(4) && sizes.has(6), "blocks of 4 and 6 both occur");
  throws(() => generateSequence({ seed: "", strata, perStratum: 20 }), "an empty seed is refused");
  throws(() => generateSequence({ seed: "x", strata: [], perStratum: 20 }), "no groups is refused");
  throws(() => generateSequence({ seed: "x", strata, perStratum: 2 }), "too few rows is refused");
  throws(() => generateSequence({ seed: "x", strata, perStratum: 20, blockSizes: [3] }), "an odd block size is refused");
}

/* ---------- reading a list prepared elsewhere ---------- */
{
  const strata = ["3-5", "6-10"];
  const good = "stratum,position,arm\n3-5,1,ai\n3-5,2,no_ai\n3-5,3,no_ai\n3-5,4,ai\n6-10,1,no_ai\n6-10,2,ai\n6-10,3,ai\n6-10,4,no_ai\n";
  const parsed = parseSequenceCsv(good, strata);
  eq([parsed.problems, parsed.rows.length], [[], 8], "a good file is accepted");
  eq(parseSequenceCsv(sequenceToCsv(parsed.rows), strata).rows, parsed.rows, "a list survives a round trip through CSV");
  ok(parseSequenceCsv("a,b\n1,2\n", strata).problems[0].includes("name the columns"), "the header is required");
  ok(parseSequenceCsv(good.replace("6-10,2", "9-9,2"), strata).problems[0].includes("not one of"), "an unknown group is refused");
  ok(parseSequenceCsv(good.replace("3-5,2,no_ai", "3-5,1,no_ai"), strata).problems[0].includes("repeated"), "a repeated position is refused");
  ok(parseSequenceCsv(good.replace("3-5,3,no_ai", "3-5,5,no_ai"), strata).problems.some((p) => p.includes("no gap")), "a gap is refused");
  ok(parseSequenceCsv(good.replace("ai\n6-10,1", "yes\n6-10,1"), strata).problems[0].includes('"ai" or "no_ai"'), "an unknown arm is refused");
  ok(parseSequenceCsv("stratum,position,arm\n3-5,1,ai\n3-5,2,ai\n3-5,3,ai\n3-5,4,ai\n3-5,5,ai\n3-5,6,ai\n6-10,1,ai\n6-10,2,no_ai\n", strata).warnings.length > 0, "a badly unbalanced group gets a warning");
  eq(parseSequenceCsv("stratum,position,arm\n3-5,1,ai\n", strata).problems.some((p) => p.includes("6-10")), true, "a group with no rows is refused");
  eq(parseSequenceCsv("stratum,position,arm\r\n3-5,1,A\r\n", ["3-5"], { A: "ai" }).rows.length, 1, "arm codes can be mapped when the statistician used letters");
}

/* ---------- the study rules ---------- */
{
  eq(checkStudyConfig(DEFAULT_CONFIG), [], "the defaults are valid");
  const bad = (patch: Partial<StudyConfig>) => checkStudyConfig({ ...DEFAULT_CONFIG, ...patch });
  ok(bad({ age_min: 15 }).length > 0, "under 18 is refused");
  ok(bad({ age_max: 10 }).length > 0, "a reversed age range is refused");
  ok(bad({ min_nprs: 10 }).length > 0, "the lowest pain score is at most 9");
  ok(bad({ strata_cuts: [3] }).length > 0, "a cut point at the lowest score is refused");
  ok(bad({ strata_cuts: [6, 5] }).length > 0, "cut points must rise");
  ok(bad({ strata_cuts: [4, 5, 6, 7] }).length > 0, "at most 3 cut points");
  ok(bad({ regions: [] }).length > 0, "a region is required");
  ok(bad({ eligibility: [] }).length > 0, "eligibility questions are required");
  ok(bad({ eligibility: [{ id: "A", kind: "include", en: "Some wording", ru: "" }] }).length > 0, "a bad question id is refused");
  ok(bad({ eligibility: [{ id: "a1", kind: "include", en: "Some wording", ru: "" }, { id: "a1", kind: "exclude", en: "Other wording", ru: "" }] }).length > 0, "a repeated question id is refused");
  ok(bad({ outcome_plan: [] }).length > 0, "an outcome plan is required");
  ok(bad({ primary: { instrument: "ndi", timepoint: "w12" } }).length > 0, "the primary outcome must be in the plan");
  ok(bad({ target_per_arm: -1 }).length > 0, "a negative target is refused");
  // the default plan only names instruments that exist at that version, and the primary one is the RMDQ-24
  for (const item of DEFAULT_CONFIG.outcome_plan) ok(instrumentFor(item.instrument, item.version) !== null, `${item.instrument} exists at version ${item.version}`);
  for (const item of DEFAULT_CONFIG.outcome_plan) ok(instrumentFor(item.instrument, item.version)?.status === "ready", `${item.instrument} is cleared for patients, so the default study can start`);
  eq(DEFAULT_CONFIG.primary, { instrument: "rmdq24", timepoint: "w12" }, "the RMDQ-24 at 12 weeks is the primary outcome");
  eq(DEFAULT_CONFIG.regions, ["low_back"], "the RMDQ is a back questionnaire, so the default population is low back pain only");
  for (const item of DEFAULT_CONFIG.eligibility) ok(item.en.length > 5 && item.ru.length > 5, `eligibility "${item.id}" has English and Roman Urdu wording`);
  ok(DEFAULT_CONFIG.eligibility.some((e) => e.kind === "exclude" && /red flag/i.test(e.en)), "red flags exclude");
  ok(DEFAULT_CONFIG.outcome_plan.length >= 2 && DEFAULT_CONFIG.outcome_plan.some((o) => o.instrument === "nprs"), "NPRS is followed too");
}

/* ---------- reasons and flow numbers ---------- */
eq(reasonLabel("not_smartphone", DEFAULT_CONFIG).startsWith("Does not meet"), true, "an unmet inclusion is explained");
eq(reasonLabel("red_flag", DEFAULT_CONFIG).startsWith("Excluded"), true, "an exclusion is explained");
eq(reasonLabel("pain_below_minimum"), "Baseline pain below the minimum", "fixed reasons have plain wording");
{
  const o = (flow: NonNullable<StudyOverview["flow"]>): StudyOverview => ({ study: null, flow });
  ok(flowSummary(o({ screened: 10, excluded: 2, declined: 1, allocated: 7, allocated_ai: 4, allocated_no_ai: 3, deviations: 0 })).consistent, "numbers that add up are consistent");
  ok(!flowSummary(o({ screened: 10, excluded: 2, declined: 1, allocated: 6, allocated_ai: 4, allocated_no_ai: 2, deviations: 0 })).consistent, "numbers that do not add up are flagged");
  ok(!flowSummary(o({ screened: 10, excluded: 2, declined: 1, allocated: 7, allocated_ai: 4, allocated_no_ai: 2, deviations: 0 })).consistent, "arms that do not add up to the total are flagged");
  eq(flowSummary({ study: null }).lines, [], "no flow before anyone is screened");
}

/* ---------- the screens and actions are wired as designed ---------- */
{
  const actions = read("src/app/admin/(dashboard)/rehabverse/research-room/actions.ts");
  ok(/randomBytes\(24\)/.test(actions) && !/Math\.random/.test(actions), "actions: the placeholder list uses a cryptographic seed, never Math.random");
  const gen = actions.slice(actions.indexOf("export async function generateListAction"), actions.indexOf("export async function importListAction"));
  ok(/p_source: "generated"/.test(gen) && !/seed[^)]*\)\s*;?\s*return \{[^}]*seed/.test(gen) && /return \{ ok: true, rows: r\.rows \}/.test(gen), "actions: a generated list is marked as not independent and the seed is not returned");
  const imp = actions.slice(actions.indexOf("export async function importListAction"), actions.indexOf("export async function startRecruitingAction"));
  ok(/p_source: "independent"/.test(imp) && /parseSequenceCsv\(csv, strataOf/.test(imp) && !/arm/.test(imp.slice(imp.indexOf("return { ok: true"))), "actions: an imported list is checked and only counts come back");
  const start = actions.slice(actions.indexOf("export async function startRecruitingAction"), actions.indexOf("export async function closeStudyAction"));
  ok(/inst\.status !== "ready"/.test(start) && /not cleared for patients/.test(start), "actions: recruiting cannot start while an instrument in the plan is not cleared for patients");
  ok(/rehab_admin_study_enrol/.test(actions) && !/ai_assist|set_ai_assist/.test(actions.replace(/overrideAiAction[\s\S]*$/, "")), "actions: the arm is never sent by the app, only the screening and consent");
  ok(/rehab_admin_study_override_ai/.test(actions), "actions: the only way to change a participant's AI setting is the logged override");
  const enrol = actions.slice(actions.indexOf("export async function enrolAction"), actions.indexOf("export async function screenOutAction"));
  ok(!/arm\s*[:=]\s*"/.test(enrol.replace(/arm: "ai" \| "no_ai"/g, "")), "actions: enrolment takes no arm argument");

  const seq = read("src/components/rehabverse/research-room/SequencePanel.tsx");
  ok(!/\.arm\b/.test(seq) && !/no_ai/.test(seq.replace(/<code>ai<\/code> and <code>no_ai<\/code>/g, "")), "screen: the allocation list panel never shows an arm");
  const api = read("src/lib/rehabverse/api.ts");
  ok(!/rehab_study_sequence/.test(api + read("src/app/admin/(dashboard)/rehabverse/research-room/page.tsx")), "app: nothing reads the list table directly");
  const mig = read("supabase/migrations/20261202120000_rehab_research_room.sql");
  const body = (name: string, next: string) => mig.slice(mig.indexOf(`function public.${name}`), mig.indexOf(`function public.${next}`));
  const readers = body("rehab_admin_study_overview", "rehab_admin_study_queue") + body("rehab_admin_study_queue", "rehab_admin_study_patient") + body("rehab_admin_study_patient", "rehab_admin_study_log");
  ok(readers.length > 500 && !/\bseq\b|\bsq\b/.test(readers) && (readers.match(/rehab_study_sequence/g) ?? []).length === 1 && /count\(\*\) filter \(where used_at is null\)/.test(readers), "database: the screens read only counts from the list (rows left per group), never an arm");
  ok(/revoke all on public\.rehab_study_sequence from anon, authenticated/.test(mig) && /enable row level security/.test(mig), "database: the list table cannot be read through the API");

  const patientPage = read("src/components/rehabverse/admin/AdminPatientRecord.tsx");
  ok(/study\?\.enrolled \? <StudyArmCard/.test(patientPage) && /: <AiAssistSwitch/.test(patientPage), "patient record: a participant sees the locked arm card instead of the free AI switch");
  const inbox = read("src/components/rehabverse/admin/AccountRequests.tsx");
  ok(/studyRecruiting \? \(\s*<Link href="\/admin\/rehabverse\/research-room"/.test(inbox), "inbox: while a study is recruiting, Approve becomes 'Screen and enrol'");
  const enrolUi = read("src/components/rehabverse/research-room/EnrolPanel.tsx");
  ok(/!complete \|\| pending/.test(enrolUi) && /config\.eligibility\.every\(\(e\) => e\.id in answers\)/.test(enrolUi) && /nprs !== null/.test(enrolUi) && /given &&/.test(enrolUi), "enrolment: every question, the pain score and consent must be filled before the button works");
  ok(/consentVersion/.test(enrolUi) && /obtained_at/.test(enrolUi) && /verbal_witnessed/.test(enrolUi), "enrolment: consent version, time and method are recorded");
  const setup = read("src/components/rehabverse/research-room/StudySetup.tsx");
  ok(/disabled=\{pending \|\| missing\.length > 0\}/.test(setup) && /ethics approval number and date/.test(setup), "set-up: the start button is disabled until ethics, consent version and list exist");
  ok(/Rules fingerprint/.test(setup) && /frozen/.test(setup), "set-up: the frozen rules and their fingerprint are shown");
  ok(/studyRecruiting/.test(read("src/app/admin/(dashboard)/rehabverse/page.tsx")) && /Research Room/.test(read("src/app/admin/(dashboard)/rehabverse/page.tsx")), "inbox: links to the Research Room");
  ok(/requireAdmin\(\)/.test(read("src/app/admin/(dashboard)/rehabverse/research-room/page.tsx")), "page: staff only");
  ok(/rehab_admin_study_/.test(api) && (api.match(/rehab_admin_study_/g) ?? []).length >= 4, "api: the reading functions are staff-only database functions");
}

/* ---------- phase 2: symmetric measurement, blinded assessor, history review ---------- */
{
  const day = read("src/components/rehabverse/DaySession.tsx");
  const hook = day.slice(day.indexOf("function useDayEngagement"), day.indexOf("export function DaySession("));
  ok(hook.length > 300 && !/\bai\b/.test(hook), "engagement: the day-page record never reads the AI switch, so both arms are logged by the same code");
  ok(/useDayEngagement\(session\.id, access === "open"/.test(day), "engagement: every open day is recorded, whatever the arm");
  ok(/logEngagementAction\("exercise_done", data\.session\.id, e\.exercise_id, secondsOn\(e\.exercise_id\)\)/.test(day), "engagement: exercises ticked in the daily feedback are recorded with their time on screen");
  const pa = read("src/app/rehabverse/actions.ts");
  ok(/await logEngagement\("feedback_sent", sessionId\)/.test(pa) && /await logEngagement\("outcome_sent"\)/.test(pa), "engagement: feedback and questionnaires are recorded by the server");
  ok(/catch \{\s*\/\* the record is for research/.test(pa), "engagement: a failed record never blocks the patient");
  const assessor = read("src/components/rehabverse/research-room/AssessorRoom.tsx") + read("src/app/rehabverse/assessor-actions.ts");
  ok(!/\barm\b|ai_assist|no_ai|stratum|rehab_admin_/.test(assessor.replace(/\/\*\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")), "assessor: the page and its actions never touch the arm, the AI switch or staff functions");
  ok(/p_collected_by: "assessor"/.test(assessor) && /rehab_assessor_plan/.test(assessor), "assessor: records are checked against the participant's plan and saved as collected by the assessor");
  ok(/robots: \{ index: false/.test(read("src/app/rehabverse/assessor/page.tsx")), "assessor: the page is not indexed");
  const mig2 = read("supabase/migrations/20261204120000_rehab_research_phase2.sql");
  const queueFn = mig2.slice(mig2.indexOf("function public.rehab_assessor_queue"), mig2.indexOf("function public.rehab_assessor_plan"));
  ok(queueFn.length > 300 && !/\.arm\b|ai_assist|stratum|sequence/.test(queueFn), "database: the assessor's list is built without the arm, the AI switch or the list");
  const requireAssessor = mig2.slice(mig2.indexOf("function public.rehab__require_assessor"), mig2.indexOf("function public.rehab_assessor_queue"));
  ok(/admin cannot be the blinded assessor/.test(mig2) && /role in \('owner', 'admin'\)/.test(requireAssessor) && /raise exception 'rehab: not authorised'/.test(requireAssessor), "database: an admin can never act as the assessor");
  const review = read("src/components/rehabverse/admin/HistoryReview.tsx");
  ok(/performance\.now\(\) - opened\.current/.test(review) && /aiOrganised \? \{ seconds, \.\.\.counts, note \} : \{ seconds, note \}/.test(review), "history review: the time is recorded for every patient, the AI counts only for an AI history");
  ok(/via_ai := exists \(select 1 from public\.rehab_ai_conversations/.test(mig2), "database: whether a history was organised by the AI is decided by the database");
  const record = read("src/components/rehabverse/admin/AdminPatientRecord.tsx");
  ok(/<HistoryReview patientId=\{patient\.id\}/.test(record) && /<EngagementPanel patientId=\{patient\.id\} \/>/.test(record), "patient record: shows the review form and the activity record");
  ok(/<AssessorPanel \/>/.test(read("src/app/admin/(dashboard)/rehabverse/research-room/page.tsx")), "research room: the assessor can be named");
}

console.log(`Research Room: ${checks} checks passed (allocation lists, pain bands, study rules, flow numbers, safeguards wired).`);
