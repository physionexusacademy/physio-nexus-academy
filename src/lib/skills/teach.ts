/**
 * PNA Teacher for the Skills Lab: turns any atlas item into a short, spoken-style walkthrough (what to know, how to do it,
 * where students slip, what it means) in English or natural Roman Urdu mixed with English. Nothing here is machine
 * translated: the clinical facts come straight from the authored atlas fields, and every lead-in sentence is written by hand.
 * Pure data: no React, no browser APIs.
 */
import { levelRank, type SkillAtlasItem, type SkillData, type SkillLevelId, type SkillQuestion } from "./types.ts";

export type TeachTone = "plain" | "memory" | "mistake" | "clinic" | "safety" | "evidence";

export type TeachStep = {
  tone: TeachTone;
  /** Small heading above the bubble. */
  label: { en: string; ur: string };
  /** Spoken lead-in before the authored value. */
  lead: { en: string; ur: string };
  value: string;
};

export type TeachPlan = {
  intro: { en: string; ur: string };
  steps: TeachStep[];
  outro: { en: string; ur: string };
  questions: SkillQuestion[];
};

type LabelInfo = { tone: TeachTone; urLabel: string; lead: { en: string; ur: string } };

const L = (tone: TeachTone, urLabel: string, en: string, ur: string): LabelInfo => ({ tone, urLabel, lead: { en, ur } });

/** How the teacher introduces each atlas field. Unknown labels fall back to a neutral lead-in. */
const LABELS: Record<string, LabelInfo> = {
  // What it is / why
  "What it measures": L("plain", "Kya measure hota hai", "First, what this test actually measures:", "Pehle yeh samajh lein ke yeh test asal mein kya measure karta hai:"),
  "What it tests": L("plain", "Kya test hota hai", "Here is what this test is checking:", "Yeh test asal mein kya check kar raha hai:"),
  Purpose: L("plain", "Maqsad", "Why we take this measurement:", "Hum yeh measurement kyun lete hain:"),
  "Best used for": L("plain", "Kab use karein", "Use it when:", "Isay tab use karein jab:"),
  "Muscle(s)": L("plain", "Muscle(s)", "The muscles being tested for length:", "Jin muscles ki length test ho rahi hai:"),
  "Prime movers": L("plain", "Prime movers", "The muscles doing the work:", "Yeh kaam karne wale asal muscles hain:"),
  "Nerve (roots)": L("plain", "Nerve (roots)", "Remember the nerve supply:", "Nerve supply yaad rakhein:"),
  Roots: L("plain", "Roots", "The spinal roots involved:", "Yeh spinal roots involved hain:"),
  Root: L("plain", "Root", "The spinal level behind this reflex:", "Is reflex ke peechay spinal level yeh hai:"),
  "Root / pathway": L("plain", "Root / pathway", "The root and pathway behind it:", "Iske peechay root aur pathway yeh hai:"),
  "Key muscles": L("plain", "Key muscles", "The key muscles it supplies:", "Yeh nerve in key muscles ko chalati hai:"),
  "Sensory area": L("plain", "Sensory area", "And the skin it supplies:", "Aur yeh skin ka area supply karti hai:"),
  "Test movement": L("plain", "Test movement", "The movement you ask for:", "Patient se yeh movement karwayein:"),
  "ISNCSCI key muscle": L("plain", "ISNCSCI key muscle", "In the spinal cord injury exam this is the key muscle:", "Spinal cord injury exam mein iska key muscle yeh hai:"),
  "Reflex link": L("plain", "Reflex link", "The reflex that goes with it:", "Iske saath jo reflex jura hai:"),
  "Level / landmark for": L("plain", "Kis level ka landmark", "This landmark tells you the level of:", "Yeh landmark kis level ka pata deta hai:"),
  "Nearby structures": L("plain", "Qareeb ke structures", "Structures sitting close by:", "Iske qareeb yeh structures hotay hain:"),
  "Key sensory point": L("plain", "Key sensory point", "Test exactly here:", "Test bilkul yahan karein:"),
  "Remember it as": L("memory", "Yaad rakhne ka tareeqa", "A memory trick for this one:", "Yaad rakhne ka asaan tareeqa:"),
  "What you see": L("plain", "Kya nazar aata hai", "What you will see on the patient:", "Patient mein aap ko yeh nazar aayega:"),
  "Short / tight": L("plain", "Chhote / tight muscles", "Tight or shortened muscles:", "Tight ya chhote hone wale muscles:"),
  "Long / weak": L("plain", "Lambay / kamzor muscles", "Lengthened or weak muscles:", "Lambay ya kamzor hone wale muscles:"),
  "Normal value or target": L("plain", "Normal value", "The normal value or target:", "Normal value ya target yeh hai:"),
  "Normal range": L("plain", "Normal range", "The normal range:", "Normal range yeh hai:"),
  "Normal end-feel": L("plain", "Normal end-feel", "At the end of range you should feel:", "Range ke end par aap ko yeh end-feel mehsoos honi chahiye:"),
  "Normal response": L("plain", "Normal response", "A normal response looks like this:", "Normal response aisa hota hai:"),
  "Normal finding": L("plain", "Normal finding", "A normal finding:", "Normal finding yeh hai:"),
  "Normal or significant result": L("plain", "Kya mayne rakhta hai", "What counts as normal or significant:", "Normal ya significant farq kya mana jata hai:"),
  Scoring: L("plain", "Scoring", "How it is scored:", "Isay score kaise karte hain:"),
  "Cut-off / interpretation": L("clinic", "Cut-off", "How to read the number:", "Number ka matlab kaise nikalte hain:"),
  // How to do it
  Position: L("plain", "Position", "Put the patient in this position:", "Patient ko is position mein rakhein:"),
  "Position (grades 3–5)": L("plain", "Position (grade 3–5)", "For grades 3 to 5, position the patient like this:", "Grade 3 se 5 ke liye patient ko is tarah position dein:"),
  "Position (grades 0–2)": L("plain", "Position (grade 0–2)", "For grades 0 to 2, gravity must be removed:", "Grade 0 se 2 ke liye gravity hata dein, position yeh hai:"),
  "Landmarks / set-up": L("plain", "Landmarks / setup", "Set up and find the landmarks:", "Setup karein aur landmarks dhoondein:"),
  Axis: L("plain", "Axis", "Place the goniometer axis here:", "Goniometer ka axis yahan rakhein:"),
  "Stationary arm": L("plain", "Stationary arm", "The stationary arm lines up with:", "Stationary arm is ke saath line mein hogi:"),
  "Moving arm": L("plain", "Moving arm", "The moving arm follows:", "Moving arm is ko follow karegi:"),
  Stabilise: L("plain", "Stabilise", "Stabilise like this, or you will measure false range:", "Aise stabilise karein, warna jhoota range naap lengay:"),
  Resistance: L("plain", "Resistance", "Where and how to give the resistance:", "Resistance kahan aur kaise dena hai:"),
  Instruction: L("plain", "Instruction", "Tell the patient:", "Patient ko yeh kahein:"),
  Palpate: L("plain", "Palpate", "To confirm the muscle is working, palpate:", "Muscle chal raha hai ya nahi, yeh palpate kar ke confirm karein:"),
  Method: L("plain", "Method", "Now the method, step by step:", "Ab method, step by step:"),
  Procedure: L("plain", "Procedure", "The procedure:", "Procedure yeh hai:"),
  "How to perform": L("plain", "Kaise karein", "How to perform it:", "Isay kaise perform karte hain:"),
  "How to test": L("plain", "Kaise test karein", "How to test:", "Test kaise karein:"),
  "How to measure": L("plain", "Kaise naapein", "How to measure it:", "Isay kaise naapte hain:"),
  "How to assess": L("plain", "Kaise assess karein", "How to assess it:", "Isay kaise assess karte hain:"),
  "How to find it": L("plain", "Kaise dhoondein", "How to find it with your hands:", "Isay haathon se kaise dhoondein:"),
  "How to elicit": L("plain", "Kaise elicit karein", "How to bring out the reflex:", "Reflex kaise nikalte hain:"),
  Where: L("plain", "Kahan", "Where it sits:", "Yeh kahan hota hai:"),
  Tap: L("plain", "Tap", "Where you tap:", "Tap kahan karte hain:"),
  "Technique tip": L("memory", "Technique tip", "A technique tip that helps:", "Technique ka ek kaam ka tip:"),
  "Quick motor test": L("plain", "Quick motor test", "Quick bedside motor test:", "Bedside par jaldi motor test:"),
  "Neurodynamic test": L("plain", "Neurodynamic test", "To load this nerve use:", "Is nerve par bojh daalne ke liye:"),
  // Errors and pitfalls
  "Errors & substitutions": L("mistake", "Ghaltiyan", "Where students go wrong:", "Students yahan ghalti karte hain:"),
  "Errors & compensations": L("mistake", "Ghaltiyan", "Where students go wrong:", "Students yahan ghalti karte hain:"),
  "Common errors": L("mistake", "Aam ghaltiyan", "Common errors:", "Aam ghaltiyan:"),
  Substitutions: L("mistake", "Substitutions", "Watch for these tricks the patient uses to cheat:", "Patient cheat karne ke liye yeh tricks use karta hai, dhyan rakhein:"),
  Pitfall: L("mistake", "Pitfall", "The classic pitfall:", "Classic ghalti yeh hai:"),
  "Technique pitfall": L("mistake", "Pitfall", "The classic pitfall:", "Classic ghalti yeh hai:"),
  // Meaning and clinic
  "Tight (positive) finding": L("clinic", "Positive finding", "If it is tight (positive):", "Agar muscle tight (positive) ho:"),
  "Abnormal finding": L("clinic", "Abnormal finding", "An abnormal finding looks like:", "Abnormal finding aisi hoti hai:"),
  "Positive / abnormal": L("clinic", "Abnormal", "The abnormal response:", "Abnormal response yeh hai:"),
  "If reduced or absent": L("clinic", "Kam ya gayab ho to", "If it is reduced or absent, think:", "Agar reflex kam ya gayab ho to socheinge:"),
  "If weak, think": L("clinic", "Kamzor ho to", "If it is weak, think of:", "Agar kamzor ho to in ka khayal rakhein:"),
  "Classic lesion sign": L("clinic", "Classic sign", "The classic sign when this nerve is injured:", "Is nerve ki chot ka classic sign:"),
  "Common injury site": L("clinic", "Chot ki jagah", "Where it is usually injured:", "Aam taur par yeh yahan injure hoti hai:"),
  Interpretation: L("clinic", "Matlab", "What it means:", "Is ka matlab:"),
  Meaning: L("clinic", "Matlab", "What it means:", "Is ka matlab:"),
  "Clinical link": L("clinic", "Clinical link", "Link it to the patient in front of you:", "Ise samne baithe patient se jorein:"),
  "Clinical relevance": L("clinic", "Clinical relevance", "Why it matters clinically:", "Clinically yeh kyun ahem hai:"),
  "Clinical note": L("clinic", "Clinical note", "One clinical point to keep:", "Ek clinical baat yaad rakhein:"),
  "Correction focus": L("clinic", "Correction focus", "In treatment, focus on:", "Treatment mein in par focus karein:"),
  "Response to exercise": L("clinic", "Exercise par response", "What happens with exercise:", "Exercise ke saath kya hota hai:"),
  "Stop / don't start": L("safety", "Kab rokna hai", "Stop, or do not start, if:", "Yeh ho to rok dein, ya shuru hi na karein:"),
};

const FALLBACK: LabelInfo = L("plain", "Note", "Note this:", "Yeh note karein:");

/** Atlas questions generated from this item (built by compile.ts as `<skill>:<item>:<field>`). */
function itemQuestions(data: SkillData, item: SkillAtlasItem, level: SkillLevelId): SkillQuestion[] {
  const rank = levelRank(level);
  return data.questions.filter((q) => q.id.startsWith(`${data.slug}:${item.id}:`) && levelRank(q.level) <= rank).slice(0, 3);
}

export function buildItemTeach(data: SkillData, item: SkillAtlasItem, level: SkillLevelId): TeachPlan {
  const rank = levelRank(level);
  const fields = item.fields.filter((field) => levelRank(field.level) <= rank);
  const steps: TeachStep[] = fields.map((field) => {
    const info = LABELS[field.label] ?? FALLBACK;
    return { tone: info.tone, label: { en: field.label, ur: info.urLabel }, lead: info.lead, value: field.value };
  });
  if (item.tip && rank >= 1) {
    steps.push({ tone: "clinic", label: { en: "Clinical tip", ur: "Clinical tip" }, lead: { en: "Here is the tip I give every student:", ur: "Yeh tip main har student ko deta hoon:" }, value: item.tip });
  }
  const demo = item.demo3d
    ? { en: "Now press play on the 3D demo above and match each step to what you just heard. Try both sides and switch to slow motion.", ur: "Ab upar wali 3D demo play karein aur har step ko jo abhi suna us se match karein. Dono sides try karein aur slow motion bhi lagayein." }
    : { en: "Now look at the diagram above and say the steps out loud once.", ur: "Ab upar diagram dekhein aur steps ek baar zor se bol kar dohraayein." };
  return {
    intro: {
      en: `Let's learn **${item.title}** properly. I'll go step by step: what to know, how to do it, and where students slip. Tap "Next" when you are ready.`,
      ur: `Chalein **${item.title}** ko achhe se seekhte hain. Main step by step chalunga: kya yaad rakhna hai, kaise karna hai, aur students kahan ghalti karte hain. Tayyar hon to "Agla" dabayein.`,
    },
    steps,
    outro: demo,
    questions: itemQuestions(data, item, level),
  };
}

/** Skill pages the new in-depth PNA Teacher lessons belong to (filled in lesson-links.ts). */
export type SkillLessonLink = { slug: string; title: string };
