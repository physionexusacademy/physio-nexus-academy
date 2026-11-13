/**
 * Builds the Conditions & Treatment Guide from the two source libraries:
 *   src/lib/msk-injury-hub.ts (+ msk-expanded-conditions.ts, msk-clinical-stories.ts)  → injuries / MSK conditions
 *   src/lib/treatment-plans.ts + treatment-plan-guides.ts                              → treatment plans
 * Output (static assets, NOT bundled into the Cloudflare worker):
 *   public/conditions-data/<slug>.json          full guide for one condition (fetched in the browser)
 *   src/lib/conditions/generated/catalog.json   small catalogue used by the server pages (lists, SEO, sitemap)
 * Run after editing any source file:  npm run build:conditions-data
 * validate:conditions fails the deploy if the output is stale.
 */
import fs from "node:fs";
import path from "node:path";
import { mskConditions } from "../src/lib/msk-injury-hub.ts";
import { treatmentPlans } from "../src/lib/treatment-plans.ts";
import { treatmentPlanGuides } from "../src/lib/treatment-plan-guides.ts";
import { mskClinicalStories } from "../src/lib/msk-clinical-stories.ts";
import { licensedMSKIllustrations, getLicensedMSKImageUrl } from "../src/lib/licensed-msk-illustrations.ts";
import { getAtlasEntriesForCondition } from "../src/lib/clinical-visual-atlas.ts";
import { aliases } from "../src/lib/conditions/aliases.ts";
import { placement, renamedSlugs, areas, areaLabel, typeLabel, type AreaId } from "../src/lib/conditions/taxonomy.ts";
import type { CatalogItem, ConditionDetail, Stage, TestFull } from "../src/lib/conditions/types.ts";

const root = process.cwd();
const dataDir = path.join(root, "public/conditions-data");
const catalogFile = path.join(root, "src/lib/conditions/generated/catalog.json");
const keywordsFile = path.join(root, "src/lib/conditions/generated/keywords.json");

const uniq = (items: (string | undefined | null)[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const text = (raw ?? "").replace(/\s+/g, " ").trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
};
const stripPhase = (label: string) => label.replace(/^Phase\s*\d+\s*[—–-]\s*/i, "").trim();

const planFor = (slug: string) => treatmentPlans.find((p) => p.slug === slug || renamedSlugs[p.slug] === slug);
const slugs = uniq([...mskConditions.map((c) => c.slug), ...treatmentPlans.map((p) => renamedSlugs[p.slug] ?? p.slug)]);

const missing = slugs.filter((s) => !placement[s]);
const extra = Object.keys(placement).filter((s) => !slugs.includes(s));
if (missing.length || extra.length) {
  console.error("taxonomy mismatch. Missing placement:", missing, "placement without condition:", extra);
  process.exit(1);
}

const details: ConditionDetail[] = [];

for (const slug of slugs) {
  const hub = mskConditions.find((c) => c.slug === slug);
  const plan = planFor(slug);
  const planSlug = plan?.slug ?? slug;
  const guide = treatmentPlanGuides[planSlug];
  const [area, type] = placement[slug];
  const name = hub?.name ?? plan!.name;
  const summary = hub?.summary ?? plan!.summary;

  // ---- stages
  let stages: Stage[] = [];
  if (hub) {
    stages = hub.treatmentPhases.map((phase, i, all) => ({
      label: stripPhase(phase.phase),
      goal: phase.goal,
      when: i === 0 ? [] : uniq(all[i - 1].progression),
      do: uniq(phase.interventions),
      dose: uniq(phase.exerciseDose),
      moveOn: uniq(phase.progression),
    }));
  } else if (plan) {
    stages = [
      {
        label: "Start: assess and set up",
        goal: guide?.clinicalLogic?.[0] ?? plan.summary,
        when: [],
        do: uniq([...(guide?.firstSession ?? []), ...plan.assessment.slice(0, 2).map((a) => "Assess: " + a)]).slice(0, 7),
        dose: [],
        moveOn: uniq(plan.outcomeMeasures.slice(0, 4).map((m) => "Baseline recorded: " + m)),
      },
      {
        label: "Treat: build capacity",
        goal: guide?.clinicalLogic?.[1] ?? "Build the abilities the patient needs, at a dose they can recover from.",
        when: uniq(plan.outcomeMeasures.slice(0, 2).map((m) => "Baseline recorded: " + m)),
        do: uniq(plan.exercises),
        dose: uniq(guide?.exerciseDose ?? []),
        moveOn: uniq(plan.progression.slice(0, 3)),
      },
      {
        label: "Progress and self-manage",
        goal: guide?.clinicalLogic?.[2] ?? "Keep the gains going at home and in daily life.",
        when: uniq(plan.progression.slice(0, 2)),
        do: uniq(plan.homePlan),
        dose: uniq(guide?.progressionRules ?? plan.progression.slice(3)),
        moveOn: uniq(plan.outcomeMeasures.map((m) => "Re-measure: " + m)).slice(0, 4),
      },
    ];
  }

  // ---- quick
  const redFlags = uniq([...(hub?.redFlags ?? []), ...(plan?.redFlags ?? [])]).slice(0, 6);
  const firstSteps = uniq(hub ? hub.treatmentPhases[0]?.interventions.slice(0, 3) ?? [] : [...(guide?.firstSession ?? []), ...(plan?.exercises ?? [])].slice(0, 3));
  const looksLike = hub ? uniq(hub.symptoms).slice(0, 5) : uniq(plan!.assessment).slice(0, 5);
  const selfCare = uniq(plan?.homePlan ?? []).slice(0, 5);

  // ---- clinical
  const assess = uniq([...(hub?.signs ?? []), ...(plan?.assessment ?? [])]);
  const tests = (hub?.tests ?? []).map((t) => ({ name: t.name, purpose: t.purpose, positive: t.positive }));
  const measures = uniq(plan?.outcomeMeasures ?? []);
  const differentials = uniq(hub?.differentials ?? []);

  // ---- expert
  const testsFull: TestFull[] = (hub?.tests ?? []).map((t) => ({
    name: t.name, purpose: t.purpose, positive: t.positive, patientPosition: t.patientPosition, therapistPosition: t.therapistPosition,
    handPlacement: t.handPlacement, procedure: t.procedure, interpretation: t.interpretation, ...(t.clinicalNote ? { clinicalNote: t.clinicalNote } : {}),
  }));
  const story = mskClinicalStories[slug];
  const illustration = licensedMSKIllustrations[slug];
  const atlas = getAtlasEntriesForCondition(slug).slice(0, 4).map((e) => ({ label: e.shortTitle || e.title, href: `/clinical-visual-atlas/${e.slug}` }));

  const detail: ConditionDetail = {
    v: 1,
    slug,
    name,
    area,
    type,
    evidence: hub?.evidenceLevel ?? "",
    summary,
    ...(illustration ? { image: { url: getLicensedMSKImageUrl(slug), title: illustration.title, credit: `${illustration.source} (${illustration.license})` } } : {}),
    quick: { lookLabel: hub ? "What it can feel like" : "What gets checked", looksLike, redFlags, firstSteps, selfCare },
    clinical: { assess, tests, differentials, measures, stages, returnCriteria: uniq(hub?.returnCriteria ?? []) },
    expert: {
      logic: uniq(guide?.clinicalLogic ?? []),
      structures: uniq(hub?.involvedStructures ?? []),
      mechanism: uniq(hub?.mechanism ?? []),
      classification: uniq(hub?.classification ?? []),
      investigations: uniq(hub?.investigations ?? []),
      manual: uniq([...(hub?.manualTherapy ?? []), ...(plan?.manualTherapy ?? []), ...(guide?.manualApplication ?? [])]),
      modalities: uniq([...(hub?.modalities ?? []), ...(plan?.modalities ?? []), ...(guide?.modalityDose ?? [])]),
      dosing: hub ? uniq(guide?.exerciseDose ?? []) : [],
      progression: uniq([...(plan?.progression ?? []), ...(guide?.progressionRules ?? [])]),
      mistakes: uniq([...(hub?.commonMistakes ?? []), ...(guide?.commonMistakes ?? [])]),
      pearls: uniq(hub?.clinicalPearls ?? []),
      education: uniq(guide?.patientEducation ?? []),
      escalation: uniq(plan?.escalation ?? []),
      tests: testsFull,
      ...(story ? { story } : {}),
      refs: (hub?.references ?? []).map((r) => ({ title: r.title, url: r.url })),
    },
    links: atlas,
    related: [],
  };
  details.push(detail);
}

// Related conditions: same area first (other types), then same type — three suggestions.
for (const d of details) {
  const sameArea = details.filter((o) => o.slug !== d.slug && o.area === d.area);
  const sameType = details.filter((o) => o.slug !== d.slug && o.type === d.type && o.area !== d.area);
  d.related = [...sameArea.filter((o) => o.type === d.type), ...sameArea.filter((o) => o.type !== d.type), ...sameType].slice(0, 4).map((o) => o.slug);
}

const catalog: CatalogItem[] = details.map((d) => ({
  slug: d.slug,
  name: d.name,
  area: d.area,
  type: d.type,
  evidence: d.evidence,
  summary: d.summary,
  kind: (mskConditions.some((c) => c.slug === d.slug) ? (planFor(d.slug) ? "both" : "injury") : "plan") as CatalogItem["kind"],
  stages: d.clinical.stages.length,
  redFlags: d.quick.redFlags.slice(0, 3),
  firstSteps: d.quick.firstSteps.slice(0, 3),
  aka: aliases[d.slug] ?? "",
})).sort((a, b) => areas.findIndex((x) => x.id === a.area) - areas.findIndex((x) => x.id === (b.area as AreaId)) || a.name.localeCompare(b.name));

// Search words for Physio Nexus AI (server only; kept out of the catalogue the pages send to the browser).
const keywords: Record<string, string> = {};
for (const d of details) {
  const hubItem = mskConditions.find((c) => c.slug === d.slug);
  const planItem = planFor(d.slug);
  keywords[d.slug] = uniq([
    d.name, hubItem?.region, hubItem?.category, planItem?.category, ...(hubItem?.involvedStructures ?? []).slice(0, 5), ...(hubItem?.signs ?? []), d.slug.replace(/-/g, " "), areaLabel(d.area), typeLabel(d.type), ...d.quick.looksLike, ...d.clinical.differentials,
    ...d.clinical.tests.map((t) => t.name), ...d.clinical.measures, ...d.clinical.assess.slice(0, 4),
    ...d.clinical.stages.flatMap((s) => s.do.slice(0, 3)),
  ]).join(" ").slice(0, 1600);
}

// ---- write (or, with --check, compare with what is on disk)
const outputs = new Map<string, string>();
for (const d of details) outputs.set(path.join(dataDir, `${d.slug}.json`), JSON.stringify(d));
outputs.set(catalogFile, JSON.stringify(catalog));
outputs.set(keywordsFile, JSON.stringify(keywords));

if (process.argv.includes("--check")) {
  const stale: string[] = [];
  for (const [file, text] of outputs) if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) stale.push(path.relative(root, file));
  if (fs.existsSync(dataDir)) {
    const expected = new Set([...outputs.keys()]);
    for (const f of fs.readdirSync(dataDir)) if (!expected.has(path.join(dataDir, f))) stale.push(`public/conditions-data/${f} (no longer a condition)`);
  }
  if (stale.length) {
    console.error(`Conditions guide data is stale (${stale.length} files). Run: npm run build:conditions-data\n  ` + stale.slice(0, 10).join("\n  "));
    process.exit(1);
  }
  console.log(`Conditions guide data is up to date (${details.length} conditions).`);
} else {
  fs.mkdirSync(dataDir, { recursive: true });
  const keep = new Set(details.map((d) => `${d.slug}.json`));
  for (const f of fs.readdirSync(dataDir)) if (!keep.has(f)) fs.rmSync(path.join(dataDir, f));
  fs.mkdirSync(path.dirname(catalogFile), { recursive: true });
  let bytes = 0;
  for (const [file, text] of outputs) {
    fs.writeFileSync(file, text);
    if (file.startsWith(dataDir)) bytes += Buffer.byteLength(text);
  }
  console.log(`Conditions guide: ${details.length} conditions → public/conditions-data/ (${(bytes / 1024).toFixed(0)} KiB), catalogue ${(Buffer.byteLength(JSON.stringify(catalog)) / 1024).toFixed(0)} KiB (in worker).`);
}
