/**
 * Conditions & Treatment Guide validator (runs in CI before every deploy).
 *   npm run validate:conditions
 * Fails when: the static data is stale, a guide is thin or inconsistent, an old address would 404,
 * the redirects are missing, or any page still links to a retired section.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { mskConditionIndex } from "../src/lib/msk-injury-index.ts";
import { treatmentPlans } from "../src/lib/treatment-plans.ts";
import { areas, types, placement, renamedSlugs } from "../src/lib/conditions/taxonomy.ts";
import type { CatalogItem, ConditionDetail } from "../src/lib/conditions/types.ts";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

// 1. Static data must match the source libraries.
execFileSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "scripts/build-conditions-data.ts", "--check"], { stdio: "inherit" });

const catalog = JSON.parse(read("src/lib/conditions/generated/catalog.json")) as CatalogItem[];
const slugs = catalog.map((c) => c.slug);
assert.equal(new Set(slugs).size, slugs.length, "duplicate condition slug");
assert.ok(catalog.length >= 48, `expected at least 48 conditions, found ${catalog.length}`);

// 2. Taxonomy
const areaIds = new Set(areas.map((a) => a.id));
const typeIds = new Set(types.map((t) => t.id));
for (const a of areas) assert.ok(catalog.some((c) => c.area === a.id), `area "${a.label}" has no condition`);
for (const slug of Object.keys(placement)) assert.ok(slugs.includes(slug), `placement for unknown condition ${slug}`);

// 3. Every guide is complete enough to be useful at all three depths.
for (const item of catalog) {
  const d = JSON.parse(read(`public/conditions-data/${item.slug}.json`)) as ConditionDetail;
  const where = item.slug;
  assert.ok(areaIds.has(item.area) && typeIds.has(item.type), `${where}: unknown area or type`);
  assert.ok(item.summary.length >= 60, `${where}: summary too short`);
  assert.ok(item.redFlags.length >= 1, `${where}: no red flags (quick level must warn)`);
  assert.ok(item.firstSteps.length >= 1, `${where}: no first steps`);
  assert.ok(d.quick.looksLike.length >= 1, `${where}: quick level has no description`);
  assert.ok(d.clinical.stages.length >= 2, `${where}: needs at least two plan stages`);
  d.clinical.stages.forEach((s, i) => {
    assert.ok(s.label && s.goal, `${where}: stage ${i + 1} missing label or goal`);
    assert.ok(s.do.length >= 1, `${where}: stage ${i + 1} has nothing to do`);
    if (i < d.clinical.stages.length - 1) assert.ok(s.moveOn.length >= 1, `${where}: stage ${i + 1} has no rule for moving on`);
    for (const line of [...s.do, ...s.dose, ...s.moveOn, ...s.when]) assert.ok(line.trim().length > 2, `${where}: empty line in stage ${i + 1}`);
  });
  if (d.expert.story) assert.equal(d.expert.story.options.length, 3, `${where}: story needs three choices`);
  assert.ok(d.expert.refs.length > 0 || item.kind === "plan", `${where}: injury guides must cite evidence`);
}

// 4. Every old address still lands on a guide (the redirect sends /msk-injuries/x and /treatment-plans/x to /conditions/x).
for (const old of mskConditionIndex.map((c) => c.slug)) assert.ok(slugs.includes(old), `old /msk-injuries/${old} would 404`);
for (const plan of treatmentPlans.map((p) => p.slug)) assert.ok(slugs.includes(renamedSlugs[plan] ?? plan), `old /treatment-plans/${plan} would 404`);

// 5. Redirects exist for the retired sections.
const config = read("next.config.js");
for (const needle of ["/knowledge-hub/:path*", "'/knowledge-hub'", "'/clinical-arena'", "'/msk-injuries/:slug'", "'/treatment-plans/:slug'", ...Object.keys(renamedSlugs).map((k) => `/treatment-plans/${k}`)]) {
  assert.ok(config.includes(needle), `next.config.js is missing a redirect for ${needle}`);
}

// 6. Nothing links to a retired section any more (redirects are only for outside links and bookmarks).
const retired = [/["'`(]\/knowledge-hub[/"'`?#)]/, /["'`(]\/clinical-arena["'`?#)]/, /["'`(]\/msk-injuries[/"'`?#)]/, /["'`(]\/treatment-plans[/"'`?#)]/];
const offenders: string[] = [];
(function walk(dir: string) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(rel); continue; }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    const text = read(rel);
    if (retired.some((re) => re.test(text))) offenders.push(rel);
  }
})("src");
assert.deepEqual(offenders, [], `these files still link to retired sections: ${offenders.join(", ")}`);
for (const gone of ["src/app/knowledge-hub", "src/app/clinical-arena", "src/app/msk-injuries", "src/app/treatment-plans"]) assert.ok(!fs.existsSync(path.join(root, gone)), `${gone} should be removed`);

// 7. Pages, sitemap and homepage are wired.
assert.ok(fs.existsSync(path.join(root, "src/app/conditions/page.tsx")) && fs.existsSync(path.join(root, "src/app/conditions/[slug]/page.tsx")), "conditions pages missing");
assert.ok(read("src/app/sitemap.ts").includes("conditionRoutes"), "sitemap must list every condition");
assert.ok(read("src/components/home/HomeDirectory.tsx").includes('href: "/conditions"'), "homepage directory must link to /conditions");

console.log(`Conditions guide checks passed: ${catalog.length} conditions, ${areas.length} areas, ${types.length} types, redirects and links verified.`);
