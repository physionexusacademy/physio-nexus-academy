import assert from "node:assert/strict";

/** Student accounts: outbox gating, de-duplication, levels and plain-language insights. DB rules: scripts/student-local/test-db.mjs. */
const store = new Map<string, string>();
const events: string[] = [];
const fakeWindow = {
  localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); } },
  dispatchEvent: (e: Event) => { events.push(e.type); return true; },
};
const fakeDocument = { cookie: "" };
Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
Object.defineProperty(globalThis, "document", { configurable: true, value: fakeDocument });

const { recordLearningActivity } = await import("../src/lib/unified-progress.ts");
const { hasStudentSession, pendingCount } = await import("../src/lib/student/outbox.ts");
const { levelFor, levels } = await import("../src/lib/student/levels.ts");
const { buildInsights } = await import("../src/lib/student/insights.ts");

/* 1. Visitors queue nothing. */
assert.equal(hasStudentSession(), false);
recordLearningActivity("pna-teacher", 20, "lesson:a", "Lesson A");
assert.equal(pendingCount(), 0, "anonymous visitors must never queue activity for sync");

fakeDocument.cookie = "sb-abcdefgh-auth-token-code-verifier=xyz";
assert.equal(hasStudentSession(), false, "the password-reset code-verifier cookie is not a session");
fakeDocument.cookie = "sb-abcdefgh-auth-token=; other=1";
assert.equal(hasStudentSession(), false, "an empty session cookie is not a session");
fakeDocument.cookie = "sb-abcdefgh-auth-token.0=base64-part; sb-abcdefgh-auth-token.1=more";
assert.equal(hasStudentSession(), true, "a chunked session cookie is a session");
fakeDocument.cookie = "";

/* 2. Signed-in students queue every activity once, with the same key the device uses. */
fakeDocument.cookie = "sb-abcdefgh-auth-token=base64-xyz; other=1";
assert.equal(hasStudentSession(), true);
recordLearningActivity("skills-lab", 30, "skill:b", "Skill B");
recordLearningActivity("skills-lab", 30, "skill:b", "Skill B");
assert.equal(pendingCount(), 1, "a replayed activity must not be queued twice");
const queued = JSON.parse(store.get("pna-student-outbox-v1") ?? "[]");
assert.equal(queued[0].source, "skills-lab");
assert.equal(queued[0].xp, 30);
assert.ok(queued[0].event_key && queued[0].label === "Skill B" && !Number.isNaN(Date.parse(queued[0].occurred_at)));
assert.ok(events.includes("pna-student-outbox-changed"));

recordLearningActivity("virtual-patient", 40, "case:c1", "VP case", 83.6);
recordLearningActivity("daily-challenge", 20, "daily:d1", "Daily", Number.NaN);
const withScore = JSON.parse(store.get("pna-student-outbox-v1") ?? "[]");
assert.equal(withScore.find((e: { source: string }) => e.source === "virtual-patient").score, 84, "scores are rounded to whole percentages");
assert.equal("score" in withScore.find((e: { source: string }) => e.source === "daily-challenge"), false, "a missing or invalid score is left out");

/* 3. Levels. */
assert.equal(levelFor(0).current.name, "New Student");
assert.equal(levelFor(100).current.name, "Rising Clinician");
assert.equal(levelFor(99).toNext, 1);
assert.equal(levelFor(2500).next, null);
assert.equal(levelFor(5000).percent, 100);
assert.equal(levels.length, 5);

/* 4. Insights are honest about an empty record and notice real patterns. */
const empty = buildInsights({ profile: null }, "2026-11-13");
assert.ok(empty.some((i) => i.tone === "tip" && /starts your streak/.test(i.text)));
const full = buildInsights({
  profile: null,
  streak: { current: 4, best: 6 },
  by_day: [{ day: "2026-11-13", xp: 60, events: 3 }, { day: "2026-11-12", xp: 30, events: 1 }, { day: "2026-11-05", xp: 20, events: 1 }],
  by_source: [
    { source: "pna-teacher", xp: 80, events: 3, xp_7d: 80, last_day: "2026-11-13", avg_score: null },
    { source: "skills-lab", xp: 30, events: 1, xp_7d: 10, last_day: "2026-11-01", avg_score: 70 },
  ],
}, "2026-11-13");
assert.ok(full.some((i) => i.title === "Today is recorded" && /4-day streak/.test(i.text)));
assert.ok(full.some((i) => /Strongest area: PNA Teacher/.test(i.title)));
assert.ok(full.some((i) => i.title === "You have not tried Virtual Patient yet"), "an area never tried is suggested first");
const stale = buildInsights({
  profile: null,
  by_source: [
    { source: "pna-teacher", xp: 80, events: 3, xp_7d: 80, last_day: "2026-11-13", avg_score: null },
    { source: "skills-lab", xp: 30, events: 1, xp_7d: 0, last_day: "2026-11-01", avg_score: 70 },
    { source: "virtual-patient", xp: 40, events: 1, xp_7d: 40, last_day: "2026-11-12", avg_score: 80 },
    { source: "daily-challenge", xp: 40, events: 2, xp_7d: 40, last_day: "2026-11-12", avg_score: 60 },
  ],
}, "2026-11-13");
assert.ok(stale.some((i) => /Clinical Skills Lab: 12 days since/.test(i.title)), "the longest-neglected area is called out with its idle time");

console.log("Student account checks passed (outbox gating and dedupe, levels, insights).");
