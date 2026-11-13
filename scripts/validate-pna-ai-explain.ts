/**
 * Physio Nexus AI explanations: every PNA Teacher lesson and every condition guide must produce a complete,
 * readable explanation in English and Roman Urdu (built only from the site's own content).
 *   npm run validate:ai-explain
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { explainCondition, explainLesson, explanationText, isFaithfulRewrite, type ConditionJson, type LessonJson } from "../src/lib/pna-ai/explain.ts";

const root = process.cwd();
const lessonDir = path.join(root, "public/teacher-data/lessons");
const conditionDir = path.join(root, "public/conditions-data");
let lessons = 0, conditions = 0;

for (const file of fs.readdirSync(lessonDir)) {
  const lesson = JSON.parse(fs.readFileSync(path.join(lessonDir, file), "utf8")) as LessonJson;
  for (const lang of ["en", "ur"] as const) {
    for (const simple of [false, true]) {
      const e = explainLesson(lesson, lang, simple);
      const where = `${lesson.slug} (${lang}${simple ? ", simple" : ""})`;
      assert.ok(e.steps.length >= (simple ? 2 : 3), `${where}: too few steps (${e.steps.length})`);
      assert.ok(e.steps.every((s) => (s.text || s.list?.length) && s.label), `${where}: an empty step`);
      const text = explanationText(e);
      assert.ok(!/undefined|\[object|NaN/.test(text), `${where}: broken text`);
      assert.ok(text.length > 160 && text.length < (simple ? 1700 : 3400), `${where}: unexpected length ${text.length}`);
      assert.equal(e.href, `/learn/${lesson.slug}`);
    }
  }
  lessons++;
}
for (const file of fs.readdirSync(conditionDir)) {
  const condition = JSON.parse(fs.readFileSync(path.join(conditionDir, file), "utf8")) as ConditionJson;
  for (const lang of ["en", "ur"] as const) {
    for (const simple of [false, true]) {
      const e = explainCondition(condition, lang, simple);
      const where = `${condition.slug} (${lang}${simple ? ", simple" : ""})`;
      assert.ok(e.steps.length >= 3, `${where}: too few steps`);
      const text = explanationText(e);
      assert.ok(!/undefined|\[object|NaN/.test(text), `${where}: broken text`);
      assert.ok(e.steps.some((s) => /help first|doctor ko dikhayein/i.test(s.label)), `${where}: missing the warning-signs step`);
    }
  }
  conditions++;
}

// The optional Roman Urdu rewrite must not add numbers or links.
const source = "Stage 1: calf raises 3 x 8-15. Seek help for fever.";
assert.ok(isFaithfulRewrite(source, "Stage 1 mein calf raises 3 x 8-15 karein aur agar bukhar ho to doctor ko dikhayein, yeh ek ahem baat hai."), "faithful rewrite should pass");
assert.ok(!isFaithfulRewrite(source, "Stage 1 mein calf raises 5 x 20 karein aur agar bukhar ho to doctor ko dikhayein, yeh ek ahem baat hai."), "invented numbers must fail");
assert.ok(!isFaithfulRewrite(source, "Visit https://example.com for more about calf raises and the stage plan and the rest of it."), "links must fail");

console.log(`PNA AI explanations OK — ${lessons} lessons and ${conditions} conditions, English and Roman Urdu, normal and simple.`);
