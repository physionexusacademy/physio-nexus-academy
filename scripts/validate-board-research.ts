import assert from "node:assert/strict";
import { assess, sortBoard, type BoardRow } from "../src/lib/board/rules.ts";
import { csvCell, toCsv } from "../src/lib/research/csv.ts";
import { RESEARCH_TABLES, columnsOf, dictionaryCsv, dictionaryRows, isResearchTable, tableTitle } from "../src/lib/research/dictionary.ts";

/**
 * The therapist board's traffic lights (fixed rules, each with its reason) and the research export's safeguards: CSV that a spreadsheet cannot run as a formula,
 * a data dictionary for every column, and no column that could identify a person. (The database side, consent and the audit log are in validate-rehabverse-db.mjs.)
 */
let checks = 0;
const failures: string[] = [];
const ok = (condition: boolean, message: string) => { checks++; if (!condition) failures.push(message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; try { assert.deepEqual(actual, expected); } catch { failures.push(`${message} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`); } };

/* ---------- CSV ---------- */
eq(csvCell(null), "", "null is an empty cell");
eq([csvCell(5), csvCell(-2.5), csvCell(true), csvCell(false)], ["5", "-2.5", "true", "false"], "numbers and booleans are written as they are (a negative number is not treated as a formula)");
eq(csvCell("plain"), "plain", "plain text is unchanged");
eq(csvCell("a,b"), '"a,b"', "a comma means quotes");
eq(csvCell('say "hi"'), '"say ""hi"""', "a quote is doubled");
eq(csvCell("line1\nline2"), '"line1\nline2"', "a line break means quotes");
for (const text of ["=SUM(A1:A9)", "+1+1", "-1+1", "@cmd", "\tx", "\rx"]) ok(csvCell(text).startsWith("'") || csvCell(text).startsWith('"\''), `a cell starting with ${JSON.stringify(text[0])} is neutralised`);
eq(csvCell({ a: 1, b: [2] }), '"{""a"":1,""b"":[2]}"', "an object is written as JSON");
eq(csvCell(Number.NaN), "", "NaN is empty");
eq(toCsv([{ a: 1, b: "x,y" }, { a: null, b: "=bad" }], ["a", "b"]), 'a,b\r\n1,"x,y"\r\n,\'=bad\r\n', "a table: header, rows, CRLF, columns in the given order, missing columns empty");
eq(toCsv([], ["a", "b"]), "a,b\r\n", "an empty export still has its header");
eq(toCsv([{ b: 2, a: 1, extra: "ignored" }], ["a", "b"]), "a,b\r\n1,2\r\n", "only the listed columns are written");

/* ---------- the data dictionary ---------- */
eq([...RESEARCH_TABLES].sort(), ["adverse_events", "daily_feedback", "outcomes", "participants", "screening"], "five export tables");
ok(isResearchTable("outcomes") && !isResearchTable("patients") && !isResearchTable("outcomes; drop table x"), "only the listed tables are accepted");
const IDENTIFYING = /^(full_name|name|email|phone|city|address|user_id|id|patient_id|notes?|own_words|description|unusual_text|clearance_note|date_of_birth|dob|age_years|created_at|submitted_at)$/;
for (const table of RESEARCH_TABLES) {
  const cols = columnsOf(table);
  ok(cols.length >= 6 && new Set(cols).size === cols.length, `${table}: columns are unique`);
  ok(cols[0] === "study_id", `${table}: starts with the study id`);
  ok(tableTitle(table).length > 3, `${table}: has a title`);
  for (const [name, type, description] of dictionaryRows(table)) {
    ok(/^[a-z0-9_]+$/.test(name), `${table}.${name}: a plain column name`);
    ok(["text", "integer", "number", "boolean", "json"].includes(type), `${table}.${name}: a known type (${type})`);
    ok(description.length > 8, `${table}.${name}: described`);
    ok(!IDENTIFYING.test(name), `${table}.${name}: not a column that identifies a person or carries free text`);
  }
}
const dict = dictionaryCsv();
ok(dict.startsWith("table,column,type,description\r\n") && dict.split("\r\n").length === RESEARCH_TABLES.reduce((n, t) => n + columnsOf(t).length, 0) + 2, "the dictionary CSV has one line per column");

/* ---------- the board ---------- */
const NOW = new Date("2026-12-10T09:00:00Z");
const ago = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const base: BoardRow = {
  id: "p1", reference_code: "RV-AAAAAA", full_name: "Test Patient", age_years: 40, sex: null, city: null, created_at: ago(30), research_consent: false, ai_assist: "off",
  assessment_id: "a1", assessment_status: "programme_created", red_flag_level: "none", regions: ["lumbar"], baseline_pain: 6, assessment_submitted_at: ago(28), assessment_reviewed_at: ago(26),
  programme_id: "g1", programme_status: "active", pause_reason: null, programme_approved_at: ago(26), days_total: 10, days_released: 5, days_done: 5, days_awaiting_review: 0, awaiting_since: null,
  last_feedback_at: ago(1), last_pain_after: 3, open_adverse_events: 0, outcome_plan: null, outcome_responses: [],
};
const row = (over: Partial<BoardRow>): BoardRow => ({ ...base, ...over });
const A = (over: Partial<BoardRow>) => assess(row(over), NOW);
const plan = (anchorDaysAgo: number) => ({ items: [{ instrument: "nprs", version: 1, schedule: "standard" as const }], anchor_at: ago(anchorDaysAgo) });
const nprsRows = (...v: number[]) => v.map((primary, i) => ({ instrument: "nprs", timepoint: ["baseline", "w2", "w6", "w12"][i], primary, collected_by: "patient" }));

eq(A({}).level, "green", "an active patient doing well is green");
eq(A({ open_adverse_events: 1 }).level, "red", "an open adverse event is red");
ok(/open adverse event/.test(A({ open_adverse_events: 2 }).reasons[0].text) && /2 open adverse events/.test(A({ open_adverse_events: 2 }).reasons[0].text), "...and says how many");
eq(A({ assessment_status: "needs_clinical_assessment", red_flag_level: "emergency", programme_id: null, programme_status: null }).level, "red", "a safety warning that needs a clinical assessment is red");
eq(A({ programme_status: "paused", pause_reason: "Dizziness reported" }).reasons.map((r) => r.text), ["Programme paused: Dizziness reported"], "a paused programme is red with its reason");
eq(A({ outcome_plan: plan(30), outcome_responses: nprsRows(4, 7) }).reasons.map((r) => r.text), ["Pain is worse than at the start (4 to 7 out of 10)"], "pain worse by the outcome rules is red");
ok(A({ outcome_plan: plan(30), outcome_responses: nprsRows(7, 3) }).good.includes("Pain better (7 to 3)"), "pain better is noted as good news");
eq(A({ outcome_plan: plan(30), outcome_responses: nprsRows(6, 5) }).level, "amber", "no important pain change after four weeks is amber");
ok(/after 4 weeks/.test(A({ outcome_plan: plan(30), outcome_responses: nprsRows(6, 5) }).reasons[0].text), "...and says for how long");
eq(A({ outcome_plan: plan(10), outcome_responses: nprsRows(6, 5) }).level, "green", "...but not before four weeks");
eq(A({ assessment_status: "submitted", programme_id: null, programme_status: null, assessment_submitted_at: ago(3) }).reasons.map((r) => r.text), ["Assessment waiting 3 days"], "an assessment waiting three days is amber");
eq(A({ assessment_status: "submitted", programme_id: null, programme_status: null, assessment_submitted_at: ago(1) }).level, "green", "...but not after one day");
eq(A({ days_awaiting_review: 2, awaiting_since: ago(3) }).reasons.map((r) => r.text), ["2 days awaiting your review for 3 days"], "days awaiting review for more than a day are amber");
eq(A({ last_feedback_at: ago(7), days_released: 6, days_done: 4 }).reasons.map((r) => r.text), ["No activity for 7 days"], "no activity for a week while days are open is amber");
eq(A({ last_feedback_at: ago(7), days_released: 5, days_done: 5 }).level, "green", "...but not when everything released is done");
const late = A({ outcome_plan: plan(40), outcome_responses: [{ instrument: "nprs", timepoint: "baseline", primary: 5, collected_by: "patient" }] });
ok(late.level === "amber" && late.reasons.some((r) => /questionnaire.* late/.test(r.text)), "questionnaires that are late are amber");
eq(A({ outcome_plan: { items: [{ instrument: "back_function_tests", version: 1, schedule: "standard" }], anchor_at: ago(40) }, outcome_responses: [] }).reasons.map((r) => r.text).filter((t) => /measurement/.test(t)), ["2 measurements overdue"], "the physiotherapist's own overdue measurements are counted (start and 2 weeks; 6 weeks is not due yet)");
// red wins over amber, and the reasons are all kept
const both = A({ open_adverse_events: 1, last_feedback_at: ago(9), days_released: 6, days_done: 4 });
ok(both.level === "red" && both.reasons.length === 2 && both.reasons[0].level === "red", "red wins and every reason is kept");
eq([A({ assessment_id: null, assessment_status: null, programme_id: null, programme_status: null }).stage, A({}).stage, A({ programme_status: "completed" }).stage, A({ programme_status: null, assessment_status: "cleared_for_programme", programme_id: null }).stage], ["No assessment yet", "Programme running", "Programme completed", "Cleared for a programme"], "the stage is named in plain words");
eq(A({ days_released: 10, days_done: 9 }).adherence, 90, "adherence is days done over days released");
eq(A({ days_released: 0, days_done: 0 }).adherence, null, "...and empty when nothing was released");
// sorting
const items = [row({ id: "g", created_at: ago(5) }), row({ id: "a", created_at: ago(9), last_feedback_at: ago(8), days_released: 6, days_done: 4 }), row({ id: "r2", created_at: ago(3), open_adverse_events: 1 }), row({ id: "r1", created_at: ago(7), open_adverse_events: 1, programme_status: "paused" })].map((r) => ({ row: r, attention: assess(r, NOW) }));
eq(sortBoard(items).map((i) => i.row.id), ["r1", "r2", "a", "g"], "red first (more reasons first), then amber, then green");
ok(!("full_name" in A({})), "the attention result carries no personal data of its own");

if (failures.length) {
  console.error(failures.map((f) => `✗ ${f}`).join("\n"));
  console.error(`\n${failures.length} of ${checks} checks failed.`);
  process.exit(1);
}
console.log(`Board and research export: ${checks} checks passed.`);
