/**
 * Converts every Manual Therapy Encyclopedia chapter into a PNA Teacher lesson.
 *
 * The English teaching content comes straight from the published Mastery Guides
 * (the source of truth). Roman Urdu comes from the existing Urdu chapter content,
 * matched section by section; where no Urdu section exists for a step, the
 * teacher speaks in Roman Urdu and keeps the clinical wording in English. The
 * three understanding checks are built from the guide itself, so every correct
 * answer is correct by construction (a "when not" item, the first step, a term's
 * own definition).
 *
 * Relative imports only (no "@/") so scripts/validate-pna-teacher.ts can load it.
 */
import type { MasteryGuide } from "../../manual-therapy-mastery-types.ts";
import { avatarDemoBeat } from "../../avatar/choreo/index.ts";
import { masteryJoint } from "../../manual-therapy-mastery-joint.ts";
import { masterySoftTissue } from "../../manual-therapy-mastery-soft.ts";
import { masteryWorld } from "../../manual-therapy-mastery-world.ts";
import { manualTherapyTechniques } from "../../manual-therapy.ts";
import { manualTherapyAdditions } from "../../manual-therapy-additions.ts";
import { worldManualApproaches, type WorldManualApproach } from "../../manual-therapy-world.ts";
import { manualTherapyUrduContent } from "../../manual-therapy-urdu-content.ts";
import { manualTherapyUrduDepth } from "../../manual-therapy-urdu-depth.ts";
import { manualTherapyUrduAnalogies } from "./urdu-analogies.ts";
import type { BiText, CheckOption, TeacherArea, TeacherBeat, TeacherLesson, TeacherSource, TeacherWidgetKey } from "../types.ts";

type Slot = "what" | "analogy" | "core" | "when" | "whenNot" | "steps" | "dose" | "example" | "mistakes" | "evidence" | "recap";

/** First matching rule wins; each Urdu section fills at most one slot. */
const slotRules: [Slot, RegExp][] = [
  ["analogy", /misal se samjh|analogy/i],
  ["what", /kya hai|kya hota|summary|khulasa|basic idea|overview/i],
  ["core", /bunyadi|science|clinical reasoning|concept/i],
  ["when", /kab use|indications/i],
  ["whenNot", /contraindications|kab na|kab ehtiyat|precautions|red flags|safety/i],
  ["steps", /steps|procedure|tareeqa|step-by-step|retest tak/i],
  ["dose", /dose|dosage|miqdaar/i],
  ["example", /clinical example|^misal\s*[—-]/i],
  ["mistakes", /ghaltiyan|mistakes/i],
  ["evidence", /evidence|outcome|limits/i],
  ["recap", /recap|pearl|yaad/i],
];

/** Slots whose matching sections are joined rather than first-wins. */
const joinedSlots = new Set<Slot>(["whenNot"]);

function urduSlots(slug: string): { short?: string; slots: Partial<Record<Slot, string>> } {
  const content = manualTherapyUrduContent[slug];
  const sections = [...(content?.details ?? []), ...(manualTherapyUrduDepth[slug] ?? [])];
  const slots: Partial<Record<Slot, string>> = {};
  for (const section of sections) {
    const match = slotRules.find(([slot, rule]) => rule.test(section.heading) && (!slots[slot] || joinedSlots.has(slot)));
    if (!match) continue;
    const [slot] = match;
    slots[slot] = slots[slot] ? `${slots[slot]}\n${section.text}` : section.text;
  }
  if (manualTherapyUrduAnalogies[slug] && !slots.analogy) slots.analogy = manualTherapyUrduAnalogies[slug];
  return { short: content?.short, slots };
}

function firstSentence(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const match = text.match(/^.+?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
}

function bullets(items: string[]): string {
  return items.map((item) => `• ${item}`).join("\n");
}

/** Roman Urdu: the mapped Urdu section, or a Roman Urdu frame + the clinical English. */
function ur(mapped: string | undefined, frame: string, english: string): string {
  return mapped ?? `${frame}\n${english}`;
}

/** Deterministic position for the correct option so it is not always first. */
function rotate<T>(correct: T, distractors: T[], seed: string): T[] {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const position = hash % (distractors.length + 1);
  const options = [...distractors];
  options.splice(position, 0, correct);
  return options;
}

type Meta = { slug: string; name: string; area: TeacherArea; level: "Foundation" | "Clinical"; world?: WorldManualApproach };

const widgetFor: Record<string, TeacherWidgetKey> = {
  "maitland-joint-mobilization": "maitland-grades",
  "kaltenborn-evjenth-mobilization": "convex-concave",
  "high-velocity-low-amplitude-thrust": "maitland-grades",
};

/** Classic texts per chapter — listed only where the reference is well established. */
const classicTexts: Record<string, string> = {
  "maitland-joint-mobilization": "Hengeveld E, Banks K, eds. Maitland's Peripheral Manipulation and Maitland's Vertebral Manipulation. Elsevier.",
  "paivm-ppivm-spinal-assessment": "Hengeveld E, Banks K, eds. Maitland's Vertebral Manipulation. Elsevier.",
  "kaltenborn-evjenth-mobilization": "Kaltenborn FM. Manual Mobilization of the Joints, Vol. I (The Extremities) and Vol. II (The Spine). Norli.",
  "mulligan-mobilization-with-movement": "Mulligan BR. Manual Therapy: NAGS, SNAGS, MWMS etc. Plane View Services.",
  "mulligan-snags-nags": "Mulligan BR. Manual Therapy: NAGS, SNAGS, MWMS etc. Plane View Services.",
  "neurodynamic-mobilization": "Butler DS. The Sensitive Nervous System. Noigroup Publications; 2000. · Shacklock M. Clinical Neurodynamics. Elsevier; 2005.",
  "muscle-energy-technique": "Chaitow L. Muscle Energy Techniques. Churchill Livingstone / Elsevier.",
  "strain-counterstrain": "Chaitow L. Positional Release Techniques. Churchill Livingstone / Elsevier.",
  "facilitated-positional-release": "Chaitow L. Positional Release Techniques. Churchill Livingstone / Elsevier.",
  "trigger-point-compression": "Simons DG, Travell JG, Simons LS. Travell & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual. Williams & Wilkins.",
  "cyriax-deep-transverse-friction": "Cyriax J. Textbook of Orthopaedic Medicine. Baillière Tindall.",
  "fascial-manipulation": "Stecco L. Fascial Manipulation for Musculoskeletal Pain. Piccin; 2004.",
  "manual-lymphatic-drainage": "Földi M, Földi E, eds. Földi's Textbook of Lymphology. Elsevier.",
  "pnf-manual-techniques": "Adler SS, Beckers D, Buck M. PNF in Practice: An Illustrated Guide. Springer.",
  "high-velocity-low-amplitude-thrust": "Gibbons P, Tehan P. Manipulation of the Spine, Thorax and Pelvis: An Osteopathic Perspective. Churchill Livingstone.",
};

function buildLesson(guide: MasteryGuide, meta: Meta): TeacherLesson {
  const { name, slug } = meta;
  const { short, slots } = urduSlots(slug);
  const steps = guide.steps;
  const n = steps.length;
  const beats: TeacherBeat[] = [];

  beats.push({
    type: "say",
    text: {
      en: guide.whatItIs,
      ur: ur(slots.what ?? short, `${name} kya hai? Asaan alfaaz mein:`, guide.whatItIs),
    },
    simpler: { en: guide.oneLine, ur: firstSentence(short) ?? guide.oneLine },
  });

  beats.push({
    type: "analogy",
    text: { en: guide.analogy, ur: ur(slots.analogy, "Ek misal se samjhein:", guide.analogy) },
  });

  const coreEn = `Three ideas carry this whole technique:\n${guide.coreIdeas.map((idea, i) => `**${i + 1}.** ${idea}`).join("\n")}`;
  beats.push({
    type: "say",
    text: { en: coreEn, ur: ur(slots.core, "Teen bunyadi ideas jin par yeh poori technique khari hai:", coreEn.split("\n").slice(1).join("\n")) },
  });

  if (widgetFor[slug]) {
    beats.push({
      type: "widget",
      widget: widgetFor[slug],
      intro: {
        en: "Let's make that visual. Play with this before we move on:",
        ur: "Chaliye isay aankhon se dekhte hain. Aage barhne se pehle isay khud chala kar dekhein:",
      },
    });
  }

  // Check 1 — vocabulary: a term matched to its own definition.
  const [target, ...others] = guide.terms;
  const termDistractors = others.slice(0, 2);
  const termOptions: CheckOption[] = rotate(
    {
      text: { en: target.meaning, ur: target.meaning },
      correct: true as const,
      feedback: {
        en: `Exactly! **${target.term}** — ${target.meaning}`,
        ur: `Bilkul sahi! **${target.term}** — ${target.meaning}`,
      },
    } as CheckOption,
    termDistractors.map((other) => ({
      text: { en: other.meaning, ur: other.meaning },
      feedback: {
        en: `Close, but that's the meaning of **${other.term}**. Read the word **${target.term}** once more and try again.`,
        ur: `Qareeb hain, lekin yeh **${other.term}** ka matlab hai. **${target.term}** ko dobara parhein aur phir koshish karein.`,
      },
    })),
    slug + ":term",
  );
  beats.push({
    type: "check",
    question: {
      en: `Vocabulary first — clinicians use this word a lot. What does **${target.term}** mean?`,
      ur: `Pehle vocabulary — clinicians yeh lafz bohat use karte hain. **${target.term}** ka matlab kya hai?`,
    },
    options: termOptions,
  });

  beats.push({
    type: "say",
    text: {
      en: `So when does **${name}** make sense?\n${bullets(guide.whenToUse)}`,
      ur: ur(slots.when, `To **${name}** kab samajh mein aati hai?`, bullets(guide.whenToUse)),
    },
  });

  const safetyEn = `And just as important — when you should NOT use it, or should stop:\n${bullets(guide.whenNot)}${meta.world?.stop ? `\n**Stop rule:** ${meta.world.stop}` : ""}`;
  beats.push({
    type: "safety",
    text: { en: safetyEn, ur: ur(slots.whenNot, "Utna hi zaroori — kab yeh technique NAHI karni, ya kab ruk jana hai:", safetyEn.split("\n").slice(1).join("\n")) },
  });

  // Check 2 — safety: a "when not" item among real indications.
  beats.push({
    type: "check",
    question: {
      en: `Safety check: which of these is a reason NOT to use ${name} (or to stop and reassess)?`,
      ur: `Safety check: in mein se kaun si baat ${name} NA karne (ya ruk kar dobara assess karne) ki wajah hai?`,
    },
    options: rotate(
      {
        text: { en: guide.whenNot[0], ur: guide.whenNot[0] },
        correct: true as const,
        feedback: {
          en: "Exactly — that's a stop sign. In that situation you stop, reassess, adapt or refer before any hands-on treatment.",
          ur: "Bilkul sahi — yeh stop sign hai. Aisi surat mein hands-on treatment se pehle ruk kar dobara assess karein, technique badlein ya refer karein.",
        },
      } as CheckOption,
      guide.whenToUse.slice(0, 2).map((item) => ({
        text: { en: item, ur: item },
        feedback: {
          en: `Not quite — that's actually a situation where ${name} can be useful. Look for the warning sign among the options.`,
          ur: `Abhi nahi — yeh to woh surat hai jahan ${name} faida-mand ho sakti hai. Options mein warning sign dhoondein.`,
        },
      })),
      slug + ":safety",
    ),
  });

  beats.push({
    type: "steps",
    title: { en: `How to do it — ${n} steps, each with its reason`, ur: `Kaise karein — ${n} qadam, har ek ki wajah ke saath` },
    steps,
    ur: slots.steps,
  });

  // Dr. Sajjad's 3D demonstration of this technique, when one exists (see lib/avatar/choreo).
  const avatarDemo = avatarDemoBeat(meta.slug);
  if (avatarDemo) beats.push(avatarDemo);

  // Check 3 — sequencing: what comes first?
  const mid = Math.max(2, Math.floor(n / 2));
  const later = [n - 1, mid].filter((index, i, all) => index > 0 && all.indexOf(index) === i);
  beats.push({
    type: "check",
    question: {
      en: "Imagine the patient is in front of you. What do you do FIRST?",
      ur: "Farz karein patient aap ke saamne hai. Aap SAB SE PEHLE kya karenge?",
    },
    options: rotate(
      {
        text: { en: steps[0].title, ur: steps[0].title },
        correct: true as const,
        feedback: { en: `Right — this comes first. ${steps[0].detail}`, ur: `Sahi — sab se pehle yehi. ${steps[0].detail}` },
      } as CheckOption,
      later.map((index) => ({
        text: { en: steps[index].title, ur: steps[index].title },
        feedback: {
          en: `Good thinking, but that's step ${index + 1} of ${n}. What has to happen before anything else?`,
          ur: `Acha socha, lekin yeh ${n} mein se qadam ${index + 1} hai. Sab se pehle kya hona chahiye?`,
        },
      })),
      slug + ":first",
    ),
  });

  beats.push({
    type: "clinic",
    text: { en: `How much? ${guide.dose}`, ur: ur(slots.dose, "Kitna? Dose ki teaching range:", guide.dose) },
  });

  const caseUr = slots.example;
  beats.push({
    type: "case",
    patient: guide.example.patient,
    assessment: guide.example.assessment,
    treatment: guide.example.treatment,
    reassess: guide.example.reassess,
    ur: caseUr ? `Ek misal se poora clinical flow dekhein:\n${caseUr}` : undefined,
  });

  const mistakesEn = `The mistakes I see most often:\n${bullets(guide.mistakes)}${meta.world?.myth ? `\n**Myth to drop:** ${meta.world.myth}` : ""}`;
  beats.push({
    type: "mistake",
    text: { en: mistakesEn, ur: ur(slots.mistakes, "Sab se aam ghaltiyan:", mistakesEn.split("\n").slice(1).join("\n")) },
  });

  if (meta.world && meta.world.options.length >= 2 && meta.world.options[meta.world.answer]) {
    const world = meta.world;
    beats.push({
      type: "check",
      question: { en: world.question, ur: world.question },
      options: world.options.map((option, index) =>
        index === world.answer
          ? { text: { en: option, ur: option }, correct: true as const, feedback: { en: world.explanation, ur: `Sahi! ${world.explanation}` } }
          : {
              text: { en: option, ur: option },
              feedback: {
                en: "Not quite. Think about what this chapter says about evidence, safety and the patient's own response — then try again.",
                ur: "Abhi nahi. Sochiye ke yeh chapter evidence, safety aur patient ke apne response ke baare mein kya kehta hai — phir dobara koshish karein.",
              },
            },
      ),
    });
  }

  guide.selfTest.slice(0, 2).forEach((item) => {
    beats.push({ type: "reveal", question: { en: item.q, ur: item.q }, answer: { en: item.a, ur: item.a } });
  });

  const evidenceEn = meta.world?.evidence ? `${guide.evidence}\n${meta.world.evidence}` : guide.evidence;
  beats.push({
    type: "evidence",
    text: { en: evidenceEn, ur: ur(slots.evidence, "Research is ke baare mein imaandari se kya kehti hai:", evidenceEn) },
  });

  beats.push({
    type: "memory",
    text: {
      en: `One line to carry into the clinic: **${guide.recap}**`,
      ur: ur(slots.recap, "Clinic mein le jane wali ek line:", `**${guide.recap}**`),
    },
  });

  const sources: TeacherSource[] = [
    { citation: `PNA World Manual Therapy Encyclopedia — ${name}: full chapter, hands-on detail, safety and evidence summary.` },
  ];
  if (classicTexts[slug]) sources.push({ citation: classicTexts[slug] });
  for (const source of meta.world?.sources ?? []) sources.push({ citation: source.label, url: source.url });

  const goDeeper = meta.world
    ? [
        { title: "Full chapter (below)", href: `/manual-therapy/${slug}`, note: { en: "Story, deep dive and evidence position.", ur: "Kahani, deep dive aur evidence position." } },
        { title: "World approaches overview", href: "/manual-therapy/world-approaches", note: { en: "Compare this approach with the others.", ur: "Is approach ka doosron se muqabla karein." } },
        { title: "All 35 techniques", href: "/manual-therapy", note: { en: "Pick your next technique.", ur: "Agli technique chunein." } },
      ]
    : [
        { title: "Hands-on detail (below)", href: `/manual-therapy/${slug}#clinical-method`, note: { en: "Patient position, hand placement and force direction.", ur: "Patient position, hand placement aur force direction." } },
        { title: "Safety & dose checklist (below)", href: `/manual-therapy/${slug}#clinical-essentials`, note: { en: "Indications, contraindications and dosage at a glance.", ur: "Indications, contraindications aur dosage ek nazar mein." } },
        { title: "Regional applications", href: "/manual-therapy/regions", note: { en: "See it applied region by region.", ur: "Har region par apply hota dekhein." } },
      ];

  const checkCount = beats.filter((beat) => beat.type === "check").length;
  const minutes = Math.min(15, Math.max(8, Math.round(beats.length * 0.7)));

  return {
    slug,
    title: name,
    hook: { en: guide.oneLine, ur: firstSentence(short) ?? guide.oneLine },
    area: meta.area,
    level: meta.level,
    bestFor: meta.area === "Manual Therapy · World Approaches" ? "Final year, interns & clinicians" : "3rd year onwards",
    minutes,
    goal: {
      en: `By the end, you'll know what ${name} is, when it's safe and useful, how to apply it step by step — and how to prove it worked. (${checkCount} checks along the way.)`,
      ur: `End tak aap jaan jayenge ke ${name} kya hai, kab safe aur faida-mand hai, qadam ba qadam kaise apply hoti hai — aur kaise prove karein ke kaam kiya. (Raste mein ${checkCount} checks.)`,
    },
    beats,
    summary: [
      { en: `In one line: ${guide.recap}`, ur: `Ek line mein: ${guide.recap}` },
      { en: `Use it for: ${guide.whenToUse[0]}`, ur: `Kab use karein: ${guide.whenToUse[0]}` },
      { en: `Stop or avoid when: ${guide.whenNot[0]}`, ur: `Kab ruk jayein: ${guide.whenNot[0]}` },
    ],
    flashcards: [
      ...guide.selfTest.slice(0, 2).map((item, index) => ({
        id: `${slug}--q${index + 1}`,
        front: { en: item.q, ur: item.q },
        back: { en: item.a, ur: item.a },
      })),
      ...guide.terms.slice(0, 2).map((term, index) => ({
        id: `${slug}--t${index + 1}`,
        front: { en: `${name}: what does "${term.term}" mean?`, ur: `${name}: "${term.term}" ka matlab?` },
        back: { en: term.meaning, ur: term.meaning },
      })),
      {
        id: `${slug}--stop`,
        front: { en: `${name}: when should you NOT use it?`, ur: `${name}: kab NAHI karni chahiye?` },
        back: { en: guide.whenNot.join(" • "), ur: guide.whenNot.join(" • ") },
      },
    ],
    goDeeper,
    sources,
  };
}

function metaFor(): Meta[] {
  const techniqueBySlug = new Map([...manualTherapyTechniques, ...manualTherapyAdditions].map((item) => [item.slug, item]));
  const worldBySlug = new Map(worldManualApproaches.map((item) => [item.slug, item]));
  const fromGuides = (guides: MasteryGuide[], area: TeacherArea): Meta[] =>
    guides.map((guide) => {
      const technique = techniqueBySlug.get(guide.slug);
      const world = worldBySlug.get(guide.slug);
      return {
        slug: guide.slug,
        name: technique?.name ?? world?.title ?? guide.slug,
        area,
        level: technique?.level === "Foundation" ? "Foundation" : "Clinical",
        world,
      };
    });
  return [
    ...fromGuides(masteryJoint, "Manual Therapy · Joint"),
    ...fromGuides(masterySoftTissue, "Manual Therapy · Soft Tissue"),
    ...fromGuides(masteryWorld, "Manual Therapy · World Approaches"),
  ];
}

const allGuides = [...masteryJoint, ...masterySoftTissue, ...masteryWorld];
const metas = metaFor();

export const manualTherapyTeacherLessons: TeacherLesson[] = metas.map((meta) => {
  const guide = allGuides.find((item) => item.slug === meta.slug)!;
  return buildLesson(guide, meta);
});

const bySlug = new Map(manualTherapyTeacherLessons.map((lesson) => [lesson.slug, lesson]));

export function getManualTherapyTeacherLesson(slug: string): TeacherLesson | undefined {
  return bySlug.get(slug);
}

/** The next chapter in library order, for the "next lesson" button. */
export function nextManualTherapyLesson(slug: string): { slug: string; title: string; href: string } | null {
  const index = manualTherapyTeacherLessons.findIndex((lesson) => lesson.slug === slug);
  const next = manualTherapyTeacherLessons[index + 1];
  return next ? { slug: next.slug, title: next.title, href: `/manual-therapy/${next.slug}#pna-teacher` } : null;
}
