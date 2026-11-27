/**
 * Builds the "Related" links that join the site's sections together:
 *   condition guide  →  patient handout, atlas images, PNA Teacher lessons, Skills Lab, manual therapy guides
 *   and each of those  →  back to the condition guides that use it.
 *
 *   npm run build:related-data
 *
 * The choices below are curated by hand (which lesson really teaches the exam for this condition, which handout a patient with it should get).
 * Atlas images come from each atlas entry's own conditionSlugs, plus the regional anatomy reference when a condition has no image of its own.
 * Output: src/lib/related/generated/related.json (titles and links only, about 10 KiB gzip, so it can live in the worker).
 * validate:related fails the deploy if this file is stale or a link points at a page that does not exist.
 */
import fs from "node:fs";
import path from "node:path";
import { handouts } from "../src/lib/handouts.ts";
import { clinicalVisualAtlas } from "../src/lib/clinical-visual-atlas.ts";

const root = process.cwd();
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
type Cond = { slug: string; name: string; area: string };
const conditions: Cond[] = read("src/lib/conditions/generated/catalog.json");
const lessons: { slug: string; title: string; href: string }[] = read("public/teacher-data/index.json");
const skills: { slug: string; title: string }[] = read("src/lib/skills/generated/skills-index.json");
const mt: { regions: string[]; items: { slug: string; title: string; region: string; techniqueName: string; listed: boolean }[] } = read("public/manual-therapy-data/regions/index.json");

/** Per body area: what every condition in it shares (each condition can add more below). */
const AREA: Record<string, { lessons: string[]; skills: string[]; mt: string[]; atlasRef?: string }> = {
  neck: { lessons: ["clinical-rules-canadian-c-spine-nexus-wells", "cervical-manipulation-safety-screening"], skills: ["special-tests"], mt: ["Cervical"], atlasRef: "neck-anatomy-reference" },
  shoulder: { lessons: ["scapulohumeral-rhythm", "shoulder-cuff-tests-lag-signs"], skills: ["special-tests", "goniometry"], mt: ["Shoulder"], atlasRef: "shoulder-anatomy-reference" },
  arm: { lessons: ["mmt-upper-limb-substitutions"], skills: ["special-tests", "manual-muscle-testing"], mt: ["Elbow"], atlasRef: "elbow-anatomy-reference" },
  back: { lessons: ["red-flags-screening", "serious-pathology-masquerading-msk-pain"], skills: ["special-tests", "posture"], mt: ["Lumbar"], atlasRef: "lumbar-spine-reference" },
  hip: { lessons: ["hip-groin-pain-examination", "mmt-lower-limb-gluteals"], skills: ["special-tests", "manual-muscle-testing"], mt: ["Hip & Pelvis"], atlasRef: "hip-groin-reference" },
  knee: { lessons: ["knee-ligament-meniscus-exam", "open-vs-closed-chain"], skills: ["special-tests", "goniometry"], mt: ["Knee"], atlasRef: "knee-anatomy-reference" },
  foot: { lessons: ["gait-cycle", "ankle-sprain-ottawa-syndesmosis"], skills: ["special-tests", "balance-function"], mt: ["Ankle & Foot"], atlasRef: "plantar-foot-reference" },
  neuro: { lessons: ["umn-vs-lmn", "motor-learning-neuroplasticity"], skills: ["tone-coordination", "reflexes"], mt: [] },
  chest: { lessons: ["exercise-intensity-borg-talk-test", "breathlessness-self-management"], skills: ["vital-signs"], mt: ["Ribs & Chest Wall"] },
  whole: { lessons: ["pain-science-basics", "exercise-dosage"], skills: ["vital-signs"], mt: [] },
};

/** Per condition: handouts (h), extra lessons (l), extra skills (s), extra manual-therapy regions (r), regions to leave out (x). */
type Pick = { h?: string[]; l?: string[]; s?: string[]; r?: string[]; x?: boolean; atlasRef?: string };
const PICK: Record<string, Pick> = {
  "cervical-radiculopathy": { h: ["neck-pain"], l: ["radiculopathy-myelopathy-neuropathy", "dermatomes-myotomes-reflexes", "neural-mobilisation-neurodynamics"], s: ["dermatomes", "myotomes", "reflexes"], r: ["Upper Limb Neural"] },
  "mechanical-neck-pain": { h: ["neck-pain"], l: ["thoracic-manipulation-neck-pain", "posture-plumb-line-analysis", "traction-cervical-lumbar-evidence"], s: ["posture", "palpation"], r: ["Thoracic"] },
  "temporomandibular-disorder": { l: ["pain-science-basics"], s: ["palpation"], r: ["TMJ & Craniofacial"], x: true },
  "whiplash-associated-disorder": { h: ["neck-pain"], l: ["pain-science-basics", "thoracic-manipulation-neck-pain"], s: ["palpation"] },
  "acromioclavicular-joint-injury": { l: ["palpation-upper-body-landmarks"], s: ["palpation"] },
  "adhesive-capsulitis": { l: ["end-feel-capsular-patterns", "convex-concave-rule", "maitland-grades"], s: ["goniometry"] },
  "anterior-shoulder-instability": { l: ["special-tests-sensitivity-clusters"] },
  "rotator-cuff-full-thickness-tear": { l: ["tendinopathy-load-management"], s: ["manual-muscle-testing"] },
  "long-head-biceps-tendinopathy": { l: ["tendinopathy-load-management"] },
  "rotator-cuff-repair-rehabilitation": { l: ["tissue-healing-phases", "exercise-dosage"], s: ["manual-muscle-testing"] },
  "rotator-cuff-tendinopathy": { l: ["tendinopathy-load-management", "exercise-dosage", "differential-duels-shoulder-neck-hip-spine"] },
  "carpal-tunnel-syndrome": { h: ["carpal-tunnel"], l: ["carpal-tunnel-hand-nerve-examination", "arm-nerve-injuries"], s: ["peripheral-nerves", "dermatomes"], r: ["Wrist & Hand", "Upper Limb Neural"], x: true, atlasRef: "wrist-hand-reference" },
  "de-quervain-tenosynovitis": { l: ["tendinopathy-load-management"], r: ["Wrist & Hand"], x: true, atlasRef: "wrist-hand-reference" },
  "lateral-epicondylalgia": { l: ["tendinopathy-load-management", "cyriax-deep-transverse-friction"] },
  "medial-epicondylalgia": { l: ["tendinopathy-load-management"] },
  "trigger-finger": { l: ["tissue-healing-phases"], r: ["Wrist & Hand"], x: true, atlasRef: "wrist-hand-reference" },
  "ankylosing-spondylitis-rehabilitation": { l: ["spinal-and-general-measures"], s: ["limb-measurements"], r: ["Thoracic"] },
  "lumbar-radiculopathy": { h: ["low-back-pain"], l: ["radiculopathy-myelopathy-neuropathy", "dermatomes-myotomes-reflexes", "neural-mobilisation-neurodynamics", "mckenzie-mdt"], s: ["dermatomes", "myotomes", "reflexes"], r: ["Lower Limb Neural"] },
  "lumbar-spinal-stenosis": { h: ["low-back-pain"], l: ["timed-up-and-go-gait-speed", "open-vs-closed-chain"], s: ["balance-function"] },
  "lumbar-spondylolisthesis": { h: ["low-back-pain"], l: ["paivm-ppivm-spinal-assessment"], s: ["palpation"] },
  "non-specific-low-back-pain": { h: ["low-back-pain"], l: ["pain-science-basics", "mckenzie-mdt", "exercise-dosage", "prayer-salah-positions-and-rehab"], s: ["posture", "muscle-length"] },
  "pregnancy-related-pelvic-girdle-pain": { h: ["pelvic-floor"], l: ["pelvic-girdle-pain-pregnancy", "pelvic-floor-pregnancy-postnatal", "postnatal-return-to-exercise"], r: ["Hip & Pelvis"] },
  "thoracic-spine-pain": { l: ["thoracic-manipulation-neck-pain", "posture-plumb-line-analysis", "palpation-spinal-levels"], s: ["posture", "palpation"], r: ["Thoracic", "Ribs & Chest Wall"], x: true },
  "adductor-related-groin-pain": { l: ["training-load-injury-risk"] },
  "femoroacetabular-impingement-syndrome": { l: ["differential-duels-shoulder-neck-hip-spine"], s: ["goniometry"] },
  "gluteal-tendinopathy": { l: ["tendinopathy-load-management"] },
  "greater-trochanteric-pain-syndrome": { l: ["tendinopathy-load-management"] },
  "hamstring-strain": { l: ["tissue-healing-phases", "muscle-length-testing", "training-load-injury-risk"], s: ["muscle-length"], atlasRef: "hip-groin-reference" },
  "hip-osteoarthritis": { l: ["end-feel-capsular-patterns", "exercise-dosage"], s: ["goniometry", "balance-function"] },
  "total-hip-replacement-rehabilitation": { h: ["hip-replacement", "preventing-falls"], l: ["total-hip-replacement-rehab", "timed-up-and-go-gait-speed"], s: ["balance-function"] },
  "acl-reconstruction-rehabilitation": { l: ["return-to-sport-acl-criteria", "tissue-healing-phases"], s: ["limb-measurements"] },
  "acl-injury": { l: ["return-to-sport-acl-criteria", "special-tests-sensitivity-clusters"] },
  "knee-osteoarthritis": { h: ["knee-osteoarthritis"], l: ["exercise-dosage", "sit-to-stand-tests", "strength-training-progression-rpe-rir"], s: ["balance-function"] },
  "mcl-injury": { l: ["tissue-healing-phases"] },
  "meniscal-injury": { l: ["special-tests-sensitivity-clusters"] },
  "patellar-tendinopathy": { l: ["tendinopathy-load-management", "training-load-injury-risk"] },
  "patellofemoral-pain": { l: ["exercise-dosage", "mmt-lower-limb-gluteals"], s: ["manual-muscle-testing"] },
  "pcl-injury": { l: ["tissue-healing-phases"] },
  "total-knee-replacement-rehabilitation": { h: ["knee-replacement", "preventing-falls"], l: ["total-knee-replacement-rehab", "goniometry-lower-limb"], s: ["goniometry"] },
  "achilles-tendinopathy": { l: ["tendinopathy-load-management", "training-load-injury-risk"], atlasRef: "achilles-reference" },
  "achilles-tendon-rupture": { l: ["tissue-healing-phases"], atlasRef: "achilles-reference" },
  "lateral-ankle-sprain": { h: ["ankle-sprain"], l: ["palpation-lower-limb-ottawa-rules", "tissue-healing-phases"] },
  "lower-limb-amputation-rehabilitation": { h: ["preventing-falls"], l: ["gait-cycle", "limb-length-and-girth", "balance-falls-assessment"], s: ["limb-measurements", "balance-function"], x: true },
  "plantar-heel-pain": { l: ["tendinopathy-load-management", "taping-and-kinesiology-tape-evidence", "shockwave-laser-tecar-pemf-evidence"] },
  "posterior-tibial-tendon-dysfunction": { l: ["tendinopathy-load-management"] },
  "tibial-stress-injury": { l: ["training-load-injury-risk"], atlasRef: "shin-reference" },
  "bells-palsy": { l: ["umn-vs-lmn"], s: ["tone-coordination"], r: ["TMJ & Craniofacial"] },
  "vestibular-bppv": { h: ["preventing-falls"], l: ["bppv-dix-hallpike-epley", "choosing-balance-tests"], s: ["balance-function"] },
  "cerebral-palsy": { l: ["cerebral-palsy-gmfcs", "developmental-milestones-0-5-years", "primitive-reflexes-postural-reactions", "spasticity-tardieu-catch-lab"], s: ["tone-coordination"] },
  "diabetic-peripheral-neuropathy": { h: ["preventing-falls"], l: ["radiculopathy-myelopathy-neuropathy", "abpi-and-glucose-exercise-safety", "sensory-exam-dermatomes"], s: ["dermatomes", "balance-function"] },
  "guillain-barre-syndrome": { l: ["mmt-grading-0-to-5", "deep-tendon-reflexes-technique"], s: ["manual-muscle-testing", "vital-signs"] },
  "multiple-sclerosis": { h: ["preventing-falls"], l: ["upper-motor-neuron-signs-bedside", "cerebellar-exam-coordination", "choosing-balance-tests"], s: ["balance-function"] },
  "parkinsons-disease": { h: ["preventing-falls"], l: ["tone-spasticity-rigidity-ashworth", "timed-up-and-go-gait-speed", "balance-falls-assessment"], s: ["balance-function"] },
  "spinal-cord-injury-rehabilitation": { l: ["spinal-cord-syndromes-brown-sequard", "dermatomes-myotomes-reflexes", "orthostatic-hypotension-screen"], s: ["dermatomes", "myotomes", "vital-signs"] },
  "stroke-rehabilitation": { h: ["preventing-falls"], l: ["stroke-syndromes-by-territory", "tone-spasticity-rigidity-ashworth", "spasticity-tardieu-catch-lab", "balance-falls-assessment"], s: ["balance-function"] },
  "traumatic-brain-injury": { l: ["romberg-tandem-pronator-drift", "cerebellar-exam-coordination", "choosing-balance-tests"], s: ["balance-function"] },
  "copd-pulmonary-rehabilitation": { l: ["airway-clearance-acbt", "six-minute-walk-test-breathlessness", "oximetry-temperature-capillary-refill"] },
  "post-cabg-rehabilitation": { l: ["cardiac-rehabilitation-phases", "pulse-blood-pressure-respiration", "exercise-stop-signs-and-ward-mobilisation"] },
  fibromyalgia: { l: ["explaining-manual-therapy-effects"] },
  lymphoedema: { l: ["manual-lymphatic-drainage", "limb-length-and-girth"], s: ["limb-measurements"], r: ["Shoulder"] },
  osteoporosis: { h: ["preventing-falls"], l: ["osteoporosis-exercise-bone-health", "falls-prevention-older-adults"], s: ["balance-function"] },
  "post-mastectomy-rehabilitation": { l: ["manual-lymphatic-drainage", "scar-mobilization", "scapulohumeral-rhythm"], s: ["goniometry", "limb-measurements"], r: ["Shoulder"] },
  "rheumatoid-arthritis": { l: ["medicines-that-change-your-rehab-plan", "heat-and-cold-therapy-evidence"], s: ["goniometry"] },
};

/** Listed regional guides per region, the ones the condition's area points to (at most this many). */
const MT_PER_CONDITION = 3;
const regionSlug = (r: string) => r.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type RelLink = { href: string; title: string };
export type RelatedFor = { handouts: RelLink[]; atlas: RelLink[]; lessons: RelLink[]; skills: RelLink[]; techniques: RelLink[] };

const lessonBy = new Map(lessons.map((l) => [l.slug, l]));
const skillBy = new Map(skills.map((s) => [s.slug, s]));
const handoutBy = new Map(handouts.map((h) => [h.slug, h]));
const atlasBy = new Map(clinicalVisualAtlas.map((a) => [a.slug, a]));
const errors: string[] = [];
const need = <T>(m: Map<string, T>, key: string, what: string, cond: string): T | undefined => {
  const v = m.get(key);
  if (!v) errors.push(`${cond}: unknown ${what} "${key}"`);
  return v;
};
const uniq = (xs: string[]) => [...new Set(xs)];

const byCondition: Record<string, RelatedFor> = {};
for (const c of conditions) {
  const area = AREA[c.area];
  const p = PICK[c.slug];
  if (!area) errors.push(`${c.slug}: no AREA entry for "${c.area}"`);
  if (!p) errors.push(`${c.slug}: no PICK entry`);
  if (!area || !p) continue;
  const atlasOwn = clinicalVisualAtlas.filter((a) => a.conditionSlugs?.includes(c.slug));
  const refSlug = p.atlasRef ?? area.atlasRef;
  const atlasList = atlasOwn.length >= 2 || !refSlug ? atlasOwn : [...atlasOwn, ...(atlasOwn.some((a) => a.slug === refSlug) ? [] : [need(atlasBy, refSlug, "atlas", c.slug)!].filter(Boolean))];
  const regions = uniq([...(p.r ?? []), ...(p.x ? [] : area.mt)]);
  for (const r of regions) if (!mt.regions.includes(r)) errors.push(`${c.slug}: unknown manual therapy region "${r}"`);
  const guides = regions.flatMap((r) => mt.items.filter((i) => i.listed && i.region === r)).slice(0, MT_PER_CONDITION);
  byCondition[c.slug] = {
    handouts: (p.h ?? []).map((s) => need(handoutBy, s, "handout", c.slug)).filter((h) => !!h).map((h) => ({ href: `/handouts/${h!.slug}`, title: h!.title.en })),
    atlas: atlasList.slice(0, 4).map((a) => ({ href: `/clinical-visual-atlas/${a.slug}`, title: a.shortTitle || a.title })),
    lessons: uniq([...(p.l ?? []), ...area.lessons]).slice(0, 6).map((s) => need(lessonBy, s, "lesson", c.slug)).filter((l) => !!l).map((l) => ({ href: l!.href, title: l!.title })),
    skills: uniq([...(p.s ?? []), ...area.skills]).slice(0, 4).map((s) => need(skillBy, s, "skill", c.slug)).filter((s) => !!s).map((s) => ({ href: `/skills/${s!.slug}`, title: s!.title })),
    techniques: [
      ...guides.map((g) => ({ href: `/manual-therapy/regions/${g.slug}`, title: g.title })),
      ...regions.map((r) => ({ href: `/manual-therapy/regions/by-region/${regionSlug(r)}`, title: `${r}: general manual therapy overview` })),
    ],
  };
}
for (const slug of Object.keys(PICK)) if (!conditions.some((c) => c.slug === slug)) errors.push(`PICK has "${slug}", which is not a condition`);

/** Reverse map: page href → the conditions that link to it (so each page can link back). */
const back: Record<string, string[]> = {};
for (const [slug, rel] of Object.entries(byCondition)) {
  for (const l of [...rel.handouts, ...rel.atlas, ...rel.lessons, ...rel.skills, ...rel.techniques]) (back[l.href] ??= []).push(slug);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const out = { version: 1, conditions: Object.fromEntries(conditions.map((c) => [c.slug, c.name])), byCondition, back };
const file = path.join(root, "src/lib/related/generated/related.json");
fs.mkdirSync(path.dirname(file), { recursive: true });
const text = JSON.stringify(out) + "\n";
if (process.argv.includes("--check")) {
  const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (old !== text) {
    console.error("src/lib/related/generated/related.json is stale: run npm run build:related-data");
    process.exit(1);
  }
  console.log("Related links up to date.");
} else {
  fs.writeFileSync(file, text);
  console.log(`Related links written: ${conditions.length} conditions, ${Object.keys(back).length} pages link back, ${(text.length / 1024).toFixed(0)} KiB.`);
}
