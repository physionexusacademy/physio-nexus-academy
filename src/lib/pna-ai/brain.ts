/**
 * Physio Nexus AI — the navigator's brain.
 *
 * Deterministic and grounded: every sentence it says comes from PNA's own
 * reviewed content (lesson key points, condition/technique summaries) or from
 * fixed, safety-reviewed templates. No generated clinical claims.
 *
 * Pipeline: safety screen → understand (Roman Urdu, lay terms, abbreviations,
 * typos, follow-ups) → intent → weighted whole-word search → diversify →
 * compose an answer + follow-up suggestions in the learner's language.
 *
 * Pure module with relative imports so it can be tested with Node directly.
 */
import { CLINICAL_TERMS, FIRST_PERSON, STOP_WORDS, URDU_MARKERS, URDU_TERMS } from "./language.ts";
import { screenForSafety, type SafetyAlert } from "./safety.ts";

export type BrainResource = {
  id: string;
  title: string;
  href: string;
  category: string;
  summary: string;
  level?: string;
  keywords: string;
  /** Authored key points (PNA Teacher lessons). */
  points?: string[];
  /** Roman Urdu hook/goal (PNA Teacher lessons). */
  hookUr?: string;
  goalUr?: string;
  minutes?: number;
};

export type Lang = "en" | "ur";
export type Kind =
  | "lesson" | "path" | "article" | "topic" | "technique" | "regional" | "condition" | "plan"
  | "tests" | "atlas" | "case" | "practice" | "service" | "tool" | "policy" | "section";

export type BrainContext = { lastTopic?: string; lastQuery?: string };
export type BrainProfile = { stage?: string; goal?: string };

export type BrainResult = {
  lang: Lang;
  message: string;
  safety: SafetyAlert | null;
  resources: (Pick<BrainResource, "id" | "title" | "href" | "category" | "summary" | "level"> & { kind: Kind; why: string })[];
  suggestions: { label: string; query?: string; href?: string }[];
  topic?: string;
  confidence: "high" | "medium" | "low";
  /** Ranked candidates for the optional AI re-ranker. */
  candidates: BrainResource[];
};

/* ---------------- text helpers ---------------- */

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9+\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.length > 3 && token.endsWith("s") && !/(ss|us|is)$/.test(token)) return token.slice(0, -1);
  return token;
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
    .map(stem);
}

export function detectLanguage(normalized: string): Lang {
  const words = normalized.split(" ");
  const hits = words.filter((word) => URDU_MARKERS.has(word)).length;
  return hits >= 2 || (hits === 1 && words.length <= 3) ? "ur" : "en";
}

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) previous[j] = current[j];
  }
  return previous[b.length];
}

/* ---------------- understanding ---------------- */

type Understanding = {
  normalized: string;
  lang: Lang;
  /** Translated, expanded text used for phrase matching. */
  concept: string;
  /** Weighted query tokens. */
  tokens: Map<string, number>;
  phrases: string[];
  intents: Set<Intent>;
  navigation: string[];
  firstPerson: boolean;
  usedContext: boolean;
  /** Previous topic not merged because the question stood on its own; offered as a chip instead. */
  setAsideTopic?: string;
};

type Intent = "define" | "compare" | "learn" | "treat" | "assess" | "technique" | "exam" | "patient" | "policy";

const intentRules: [Intent, RegExp][] = [
  ["define", /\b(what is|what are|define|definition|meaning|kya hai|kya hota|kya hoti|kya hain|matlab)\b/],
  ["compare", /\b(difference|differ|vs|versus|compare|comparison|farq|fark)\b/],
  ["learn", /\b(explain|teach|learn|understand|concept|samjh\w*|sikha\w*|parha\w*|lesson|notes?|step by step)\b/],
  ["treat", /\b(treat\w*|manage\w*|rehab\w*|exercises?|protocol|ilaj|ilaaj|warzish|theek|cure|plan|recover\w*|physiotherapy for)\b/],
  ["assess", /\b(special tests?|tests? for|assess\w*|examin\w*|diagnos\w*|jaanch|evaluat\w*|how to test|positive test)\b/],
  ["technique", /\b(techniques?|mobili[sz]ation|manipulation|manual therapy|release|grades?|glide|thrust|cupping|needling|taping|massage|mwm|snags?|met|scs|mfr)\b/],
  ["exam", /\b(viva|osce|exams?|mcqs?|paper|prepare|preparation|revision|revise|imtihan|imtehan|quiz me|practice questions)\b/],
  ["policy", /\b(privacy|refund|terms|disclaimer|policy|cancellation)\b/],
];

/** Site destinations recognised directly from wording (checked in order). */
const navigationRules: { re: RegExp; href: string }[] = [
  { re: /\b(home visit|home visits|ghar par|ghar pe|ghar aa\w*|house call|at my home|at home physio\w*)\b/, href: "/home-visit" },
  { re: /\b(appointments?|booking|book (a|an|my|me)|consult\w*|session|checkup|check up|time lena|milna hai|dikhana hai)\b/, href: "/appointment" },
  { re: /\b(verify|verification|certificates?|sanad)\b/, href: "/verify" },
  { re: /\b(workshops?|cpd|hands on|practical training|training session)\b/, href: "/workshops" },
  { re: /\b(contact|whatsapp|phone number|call you|email|address|location|rabta|kahan hai|where are you)\b/, href: "/contact" },
  { re: /\b(fee|fees|price|cost|charges|kitne paise|kharcha)\b/, href: "/contact" },
  { re: /\b(flash ?cards?|review cards|spaced review)\b/, href: "/learn/review" },
  { re: /\b(daily challenge|daily quiz|weekly quiz|quiz|mcqs?)\b/, href: "/daily-challenge" },
  { re: /\b(pna teacher|teach me|step by step|courses?|lessons?|learning path)\b/, href: "/learn" },
  { re: /\b(symptom checker|check my symptoms)\b/, href: "/symptom-checker" },
  { re: /\b(books|textbooks?|pdfs?|notes|study material|book recommendations?)\b/, href: "/resources" },
];

/** Words that express what the learner wants, not the topic itself. */
const INTENT_WORDS = new Set([
  "difference", "differ", "between", "vs", "versus", "compare", "comparison", "explain", "define", "definition",
  "meaning", "concept", "understand", "teach", "lesson", "note", "treat", "treatment", "manage", "management",
  "cure", "protocol", "plan", "prepare", "preparation", "revision", "revise", "viva", "exam", "osce", "mcq", "question",
]);

const followUpPronouns = /\b(it|its|this|that|these|them|iska|iski|iske|iss|is ka|is ki|uska|uski|uske|us ka|us ki)\b/;
const followUpWords = /\b(it|its|this|that|these|them|iska|iski|iske|iss|is ka|is ki|uska|uski|uske|us ka|us ki|and|aur|also|what about|how about|then)\b/;

function understand(raw: string, context: BrainContext | undefined, vocabulary: Map<string, number>): Understanding {
  const normalized = normalize(raw);
  const lang = detectLanguage(normalized);

  let translated = normalized;
  for (const rule of URDU_TERMS) {
    if (rule.urduOnly && lang !== "ur") continue;
    translated = translated.replace(rule.re, rule.to);
  }
  // Drop function words so lay phrases ("knee ka pain" → "knee pain") line up.
  let compact = translated.split(" ").filter((word) => !STOP_WORDS.has(word)).join(" ");

  // Short follow-ups ("how to treat it?") inherit the previous topic.
  // Requests that stand on their own ("help me prepare for my viva", "book a home visit")
  // keep their meaning unless they point back with "it / this / iska".
  let usedContext = false;
  let setAsideTopic: string | undefined;
  const compactTokens = compact.split(" ").filter(Boolean);
  const examRule = intentRules.find(([intent]) => intent === "exam")?.[1];
  const standalone =
    !followUpPronouns.test(normalized) &&
    (Boolean(examRule?.test(normalized)) || navigationRules.some((rule) => rule.href !== "/learn" && rule.re.test(normalized)));
  if (context?.lastTopic && standalone) {
    setAsideTopic = context.lastTopic;
  } else if (context?.lastTopic && compactTokens.length <= 4 && (followUpWords.test(normalized) || compactTokens.length <= 2)) {
    const topicTokens = tokenize(context.lastTopic);
    const alreadyAbout = topicTokens.some((token) => compactTokens.includes(token));
    if (!alreadyAbout) {
      compact = `${compact} ${normalize(context.lastTopic)}`.trim();
      usedContext = true;
    }
  }

  const expansions: string[] = [];
  for (const rule of CLINICAL_TERMS) {
    rule.re.lastIndex = 0;
    if (rule.re.test(compact)) expansions.push(rule.to);
    rule.re.lastIndex = 0;
  }
  const concept = [compact, ...expansions].join(" ").trim();

  const tokens = new Map<string, number>();
  const add = (token: string, weight: number) => tokens.set(token, Math.max(tokens.get(token) ?? 0, weight));
  for (const token of tokenize(compact)) add(token, INTENT_WORDS.has(token) ? 0.25 : 1);
  for (const expansion of expansions) for (const token of tokenize(expansion)) add(token, 0.75);

  // Typo correction against the site vocabulary (e.g. "maitlnd" → "maitland").
  for (const [token, weight] of [...tokens]) {
    if (vocabulary.has(token) || token.length < 5 || /\d/.test(token)) continue;
    const max = token.length >= 8 ? 2 : 1;
    let best: { word: string; distance: number; df: number } | null = null;
    for (const [word, df] of vocabulary) {
      if (Math.abs(word.length - token.length) > max || word[0] !== token[0]) continue;
      const distance = editDistance(token, word, max);
      if (distance <= max && (!best || distance < best.distance || (distance === best.distance && df > best.df))) best = { word, distance, df };
    }
    if (best) add(best.word, weight * 0.9);
  }

  const phrases = [...new Set([...expansions, compact].map((phrase) => normalize(phrase)).filter((phrase) => phrase.split(" ").length >= 2))];

  const intents = new Set<Intent>();
  for (const [intent, re] of intentRules) if (re.test(normalized) || re.test(translated)) intents.add(intent);
  if (intents.has("define") || intents.has("compare")) intents.add("learn");
  const firstPerson = FIRST_PERSON.test(normalized);
  if (firstPerson && /\b(pain|numb\w*|tingling|swelling|stiff\w*|weak\w*|injur\w*|sprain|fracture|hurt\w*|ache\w*)\b/.test(translated)) intents.add("patient");

  const navigation: string[] = [];
  for (const rule of navigationRules) if (rule.re.test(normalized) && !navigation.includes(rule.href)) navigation.push(rule.href);
  if (intents.has("exam") && !navigation.includes("/daily-challenge")) navigation.push("/daily-challenge");

  return { normalized, lang, concept: normalize(concept), tokens, phrases, intents, navigation, firstPerson, usedContext, setAsideTopic };
}

/* ---------------- index & search ---------------- */

function kindOf(resource: BrainResource): Kind {
  const prefix = resource.id.split(":")[0];
  switch (prefix) {
    case "teacher": return "lesson";
    case "teacher-path": return "path";
    case "knowledge": return "article";
    case "specialty": return "topic";
    case "manual": case "approach": return "technique";
    case "regional": return "regional";
    case "msk": return "condition";
    case "plan": return "plan";
    case "library": return "tests";
    case "atlas": return "atlas";
    case "case": return "case";
    case "quiz": case "study": return "practice";
    case "teacher-hub": return "path";
    case "service": return "service";
    case "tool": return "tool";
    case "legal": return "policy";
    default: return "section";
  }
}

type Doc = { resource: BrainResource; kind: Kind; title: Set<string>; slug: Set<string>; body: Set<string>; titleNorm: string };
type Index = { docs: Doc[]; df: Map<string, number>; byHref: Map<string, Doc> };

const indexCache = new WeakMap<BrainResource[], Index>();

function buildIndex(resources: BrainResource[]): Index {
  const cached = indexCache.get(resources);
  if (cached) return cached;
  const docs: Doc[] = resources.map((resource) => ({
    resource,
    kind: kindOf(resource),
    title: new Set(tokenize(resource.title)),
    slug: new Set(tokenize(resource.href.replace(/[/-]/g, " "))),
    body: new Set(tokenize(`${resource.keywords} ${resource.summary} ${resource.category}`)),
    titleNorm: ` ${normalize(resource.title)} `,
  }));
  const df = new Map<string, number>();
  for (const doc of docs) for (const token of new Set([...doc.title, ...doc.slug, ...doc.body])) df.set(token, (df.get(token) ?? 0) + 1);
  const index = { docs, df, byHref: new Map(docs.map((doc) => [doc.resource.href, doc])) };
  indexCache.set(resources, index);
  return index;
}

const kindBoost: Partial<Record<Intent, Partial<Record<Kind, number>>>> = {
  learn: { lesson: 1.9, article: 1.1, path: 1.1 },
  define: { lesson: 1.3, condition: 1.1 },
  compare: { lesson: 1.3 },
  treat: { plan: 1.5, condition: 1.15, technique: 1.05 },
  assess: { tests: 1.8, condition: 1.15, lesson: 1.1 },
  technique: { technique: 1.45, regional: 1.15, lesson: 1.1 },
  exam: { practice: 1.7, lesson: 1.2 },
  patient: { condition: 1.45, plan: 1.15, service: 1.2, case: 0.5, article: 0.85, atlas: 0.7 },
};

function profileBoost(kind: Kind, profile?: BrainProfile): number {
  if (!profile) return 1;
  let boost = 1;
  if ((profile.stage === "year1-2" || profile.stage === "year3-4") && kind === "lesson") boost *= 1.15;
  if (profile.stage === "graduate" && (kind === "plan" || kind === "technique")) boost *= 1.12;
  if (profile.goal === "exams" && (kind === "practice" || kind === "lesson")) boost *= 1.1;
  if (profile.goal === "clinic" && kind === "plan") boost *= 1.15;
  if (profile.goal === "manual" && kind === "technique") boost *= 1.2;
  return boost;
}

function scoreDocs(index: Index, u: Understanding, profile?: BrainProfile) {
  const n = index.docs.length;
  const originalTokens = [...u.tokens].filter(([, weight]) => weight === 1).map(([token]) => token);
  return index.docs
    .map((doc) => {
      let score = 0;
      let titleHits = 0;
      for (const [token, weight] of u.tokens) {
        const idf = Math.log(1 + n / (1 + (index.df.get(token) ?? 0)));
        let field = 0;
        if (doc.title.has(token)) field += 6;
        if (doc.slug.has(token)) field += 2;
        if (doc.body.has(token)) field += 1;
        if (field && weight === 1 && doc.title.has(token)) titleHits += 1;
        score += weight * idf * field;
      }
      for (const phrase of u.phrases) if (doc.titleNorm.includes(` ${phrase} `)) score += 14;
      if (originalTokens.length) score *= 0.75 + 0.5 * (titleHits / originalTokens.length);
      for (const intent of u.intents) score *= kindBoost[intent]?.[doc.kind] ?? 1;
      if (doc.kind === "policy" && !u.intents.has("policy")) score *= 0.15;
      score *= profileBoost(doc.kind, profile);
      return { doc, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.resource.title.localeCompare(b.doc.resource.title));
}

function diversify<T extends { doc: Doc }>(ranked: T[], limit: number): T[] {
  const picked: T[] = [];
  const perKind = new Map<Kind, number>();
  for (const item of ranked) {
    const count = perKind.get(item.doc.kind) ?? 0;
    if (count >= 2) continue;
    picked.push(item);
    perKind.set(item.doc.kind, count + 1);
    if (picked.length >= limit) break;
  }
  return picked;
}

/* ---------------- answer composition ---------------- */

const whyText: Record<Kind, { en: string; ur: string }> = {
  lesson: { en: "Step-by-step lesson with checks", ur: "Qadam ba qadam lesson, checks ke saath" },
  path: { en: "Guided learning path", ur: "Guided learning path" },
  article: { en: "Evidence-informed article", ur: "Evidence-based article" },
  topic: { en: "All articles on this topic", ur: "Is topic ke saare articles" },
  technique: { en: "Technique chapter · taught by PNA Teacher", ur: "Technique chapter · PNA Teacher ke saath" },
  regional: { en: "Applied to a body region", ur: "Jism ke region par apply" },
  condition: { en: "Condition guide: symptoms, tests, rehab", ur: "Condition guide: symptoms, tests, rehab" },
  plan: { en: "Treatment plan & progression", ur: "Treatment plan aur progression" },
  tests: { en: "How to perform the tests", ur: "Tests kaise karein" },
  atlas: { en: "Visual anatomy & pathology", ur: "Visual anatomy aur pathology" },
  case: { en: "Real case to reason through", ur: "Asli case par reasoning" },
  practice: { en: "Practise & test yourself", ur: "Practice aur khud ko test karein" },
  service: { en: "PNA patient service", ur: "PNA patient service" },
  tool: { en: "Website tool (not a diagnosis)", ur: "Website tool (diagnosis nahi)" },
  policy: { en: "Policy", ur: "Policy" },
  section: { en: "PNA section", ur: "PNA section" },
};

const navigationCatalog: Record<string, BrainResource> = {
  "/home-visit": { id: "service:home-visit", title: "Request a Physiotherapy Home Visit", href: "/home-visit", category: "Patient services", summary: "Request a home visit in Karachi or Hyderabad; the team confirms area and availability.", keywords: "" },
  "/appointment": { id: "service:appointment", title: "Request an Appointment or Online Consultation", href: "/appointment", category: "Patient services", summary: "Request an in-person or online consultation; the team confirms availability.", keywords: "" },
  "/verify": { id: "service:verify", title: "Verify a PNA Certificate", href: "/verify", category: "Certificates", summary: "Check a PNA workshop or training certificate with its verification ID.", keywords: "" },
  "/workshops": { id: "browse:workshops", title: "Workshops & CPD", href: "/workshops", category: "Hands-on learning", summary: "Upcoming practical workshops, registration and CPD certificates.", keywords: "" },
  "/contact": { id: "browse:contact", title: "Contact PNA", href: "/contact", category: "Contact and support", summary: "Phone, WhatsApp, email and address for questions, fees and support.", keywords: "" },
  "/learn/review": { id: "study:flashcards", title: "My Flashcards (spaced review)", href: "/learn/review", category: "PNA Teacher", summary: "Review the flashcards from your PNA Teacher lessons at the right time.", keywords: "" },
  "/daily-challenge": { id: "quiz:daily-challenge", title: "Daily Clinical Challenge", href: "/daily-challenge", category: "Quiz and clinical practice", summary: "Five timed clinical questions every day, with explanations and a leaderboard.", keywords: "" },
  "/learn": { id: "teacher-hub:learn", title: "PNA Teacher — step-by-step lessons", href: "/learn", category: "PNA Teacher", summary: "Hard concepts and all 35 manual therapy techniques taught as a conversation, with checks and flashcards.", keywords: "" },
  "/symptom-checker": { id: "tool:symptom-checker", title: "Symptom Checker", href: "/symptom-checker", category: "Website tool", summary: "Screen symptom patterns and safety warnings. It does not provide a diagnosis.", keywords: "" },
  "/resources": { id: "browse:resources", title: "Books & Learning Resources", href: "/resources", category: "Books and PDFs", summary: "Books, PDFs and study material available from PNA.", keywords: "" },
};

const navigationLabels: Record<string, { en: string; ur: string }> = {
  "/home-visit": { en: "request a home visit", ur: "home visit request karne" },
  "/appointment": { en: "request an appointment", ur: "appointment request karne" },
  "/verify": { en: "verify a certificate", ur: "certificate verify karne" },
  "/workshops": { en: "see workshops and CPD training", ur: "workshops aur CPD training dekhne" },
  "/contact": { en: "contact the PNA team (fees, timings, address)", ur: "PNA team se rabta karne (fees, timings, address)" },
  "/learn/review": { en: "review your flashcards", ur: "apne flashcards review karne" },
  "/daily-challenge": { en: "practise with today's questions", ur: "aaj ke sawalon se practice karne" },
  "/learn": { en: "learn step by step with PNA Teacher", ur: "PNA Teacher ke saath qadam ba qadam seekhne" },
  "/symptom-checker": { en: "screen your symptoms safely", ur: "symptoms ko safely screen karne" },
  "/resources": { en: "find books and study material", ur: "books aur study material dhoondne" },
};

function firstSentences(text: string, count: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!sentences) return text.trim();
  return sentences.slice(0, count).join("").trim();
}

function shortTopic(title: string): string {
  return title
    .replace(/\s+—.*$/, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/:.*$/, "")
    .trim();
}

function compose(u: Understanding, top: Doc | undefined, picked: Doc[], confidence: BrainResult["confidence"]): { message: string; suggestions: BrainResult["suggestions"] } {
  const ur = u.lang === "ur";
  const lines: string[] = [];
  const suggestions: BrainResult["suggestions"] = [];

  if (u.firstPerson && u.intents.has("patient")) {
    lines.push(
      ur
        ? "Mujhe afsos hai ke aap ko takleef hai. Main online diagnosis nahi kar sakta, lekin yeh bata sakta hoon ke PNA kaise madad kar sakta hai."
        : "I'm sorry you're dealing with this. I can't diagnose online, but here's how PNA can help.",
    );
  }

  if (confidence === "low" || !top) {
    lines.push(
      ur
        ? "Mujhe poora yaqeen nahi ke aap kya dhoond rahe hain. Jism ka hissa, condition ya technique ka naam likhein — jaise \"ghutne ka dard ka ilaj\" ya \"Maitland grades\"."
        : "I'm not fully sure what you're looking for. Try naming a body part, condition or technique — for example \"knee pain treatment\" or \"Maitland grades\".",
    );
    suggestions.push(
      { label: ur ? "Kamar dard ka ilaj" : "Low back pain treatment", query: ur ? "kamar dard ka ilaj" : "low back pain treatment" },
      { label: ur ? "Viva ki tayyari" : "Prepare for my viva", query: "viva preparation" },
      { label: "PNA Teacher", href: "/learn" },
    );
    return { message: lines.join("\n"), suggestions };
  }

  const r = top.resource;
  const name = shortTopic(r.title);

  if (top.kind === "lesson") {
    const hook = ur && r.hookUr ? r.hookUr : r.summary;
    lines.push(`**${name}** — ${firstSentences(hook, 1)}`);
    if (r.points?.length) {
      lines.push(ur ? "**Mukhtasar mein:**" : "**In short:**");
      for (const point of r.points.slice(0, 3)) lines.push(`• ${point}`);
    }
    lines.push(
      ur
        ? `Qadam ba qadam samajhne ke liye PNA Teacher ka lesson kholein${r.minutes ? ` (~${r.minutes} min)` : ""} — checks aur flashcards ke saath.`
        : `Want it step by step? The PNA Teacher lesson takes${r.minutes ? ` ~${r.minutes} min` : " a few minutes"}, with checks and flashcards.`,
    );
    suggestions.push(
      { label: ur ? "Mujhe quiz karein" : "Quiz me", href: "/daily-challenge" },
      { label: ur ? "Mere flashcards" : "My flashcards", href: "/learn/review" },
    );
  } else if (top.kind === "condition" || top.kind === "plan") {
    lines.push(`**${name}**: ${firstSentences(r.summary, 2)}`);
    const treatFirst = u.intents.has("treat") && top.kind === "plan";
    lines.push(
      treatFirst
        ? ur
          ? "Neeche pehle treatment plan hai, phir condition guide aur mutaliqa reading."
          : "Below: the treatment plan first, then the condition guide and related reading."
        : ur
          ? "Neeche condition guide, tests aur treatment plan hain — isi tarteeb se parhein."
          : "Below: the condition guide, how to test it and the treatment plan — read them in that order.",
    );
    suggestions.push(
      { label: ur ? `${name} ka ilaj` : `How to treat ${name}`, query: `${name} treatment plan` },
      { label: ur ? `${name} ke special tests` : `Special tests for ${name}`, query: `special tests for ${name}` },
    );
    if (u.intents.has("patient")) suggestions.push({ label: ur ? "Appointment request" : "Request an appointment", href: "/appointment" });
  } else if (top.kind === "technique" || top.kind === "regional") {
    lines.push(`**${name}**: ${firstSentences(r.summary, 2)}`);
    if (top.kind === "technique" && r.href.startsWith("/manual-therapy/")) {
      lines.push(
        ur
          ? "Yeh chapter PNA Teacher ke saath khulta hai: analogy, safety, steps, patient case aur checks."
          : "This chapter opens with PNA Teacher: analogy, safety, steps with reasons, a patient case and checks.",
      );
      suggestions.push({ label: ur ? `${name} qadam ba qadam` : `Learn ${name} step by step`, href: `${r.href}#pna-teacher` });
    }
    suggestions.push({ label: ur ? "Manual therapy ki saari techniques" : "All 35 manual therapy techniques", href: "/learn#manual-therapy" });
  } else if (top.kind === "practice" || u.intents.has("exam")) {
    lines.push(
      ur
        ? "Exam aur viva ke liye is tarteeb mein practice karein: 1) aaj ka Daily Challenge, 2) apne flashcards, 3) jo topics ghalat hon un ke PNA Teacher lessons."
        : "For exams and viva, practise in this order: 1) today's Daily Challenge, 2) your flashcards, 3) PNA Teacher lessons for any topic you get wrong.",
    );
    suggestions.push({ label: "Safe Assessment Essentials", href: "/learn/paths/safe-assessment-essentials" }, { label: ur ? "Saare lessons" : "All lessons", href: "/learn" });
  } else {
    lines.push(`**${name}**: ${firstSentences(r.summary, 2)}`);
  }

  if (u.intents.has("treat")) for (let i = suggestions.length - 1; i >= 0; i--) if (suggestions[i].query?.endsWith("treatment plan")) suggestions.splice(i, 1);
  if (u.intents.has("assess")) for (let i = suggestions.length - 1; i >= 0; i--) if (suggestions[i].query?.startsWith("special tests")) suggestions.splice(i, 1);
  // De-duplicate suggestions and drop links already shown as results.
  const shown = new Set(picked.map((doc) => doc.resource.href));
  const unique = suggestions.filter((item, i, all) => all.findIndex((other) => other.label === item.label) === i && !(item.href && shown.has(item.href)));
  return { message: lines.filter(Boolean).join("\n"), suggestions: unique.slice(0, 3) };
}

function navigationMessage(u: Understanding, hrefs: string[]): string {
  const ur = u.lang === "ur";
  const labels = hrefs.map((href) => (ur ? navigationLabels[href]?.ur : navigationLabels[href]?.en)).filter(Boolean);
  if (!labels.length) return "";
  return ur ? `Yeh raha link ${labels.join(" aur ")} ke liye:` : `Here's where to ${labels.join(" and ")}:`;
}

/* ---------------- main entry ---------------- */

export function think(
  query: string,
  resources: BrainResource[],
  options: { context?: BrainContext; profile?: BrainProfile; prefer?: string[] } = {},
): BrainResult {
  const index = buildIndex(resources);
  const u = understand(query, options.context, index.df);
  const safety = screenForSafety(u.normalized);
  const toResult = (doc: Doc) => ({
    id: doc.resource.id,
    title: doc.resource.title,
    href: doc.resource.href,
    category: doc.resource.category,
    summary: doc.resource.summary,
    level: doc.resource.level,
    kind: doc.kind,
    why: u.lang === "ur" ? whyText[doc.kind].ur : whyText[doc.kind].en,
  });

  if (safety) {
    // Learners who phrased a study question like a symptom still get the right lesson.
    const lesson = index.byHref.get("/learn/red-flags-screening");
    const related = scoreDocs(index, u, options.profile)
      .filter((item) => item.doc !== lesson && item.doc.kind !== "policy" && item.doc.kind !== "service")
      .slice(0, 2)
      .map((item) => item.doc);
    const learning = safety.level === "crisis" ? [] : [...(lesson ? [lesson] : []), ...related].slice(0, 3);
    return {
      lang: u.lang,
      message:
        safety.level === "crisis"
          ? ""
          : u.lang === "ur"
            ? "Agar aap student hain aur yeh topic parh rahe hain, to neeche ke lessons dekhein."
            : "If you're a student studying this topic, these explain the warning signs and the related care.",
      safety,
      resources: learning.map(toResult),
      suggestions: [],
      confidence: "high",
      candidates: [],
    };
  }

  const ranked = scoreDocs(index, u, options.profile);
  // An optional AI re-ranker may nominate candidates for an unclear question.
  if (options.prefer?.length) {
    const preferred = new Set(options.prefer);
    for (const item of ranked) if (preferred.has(item.doc.resource.id)) item.score = item.score * 3 + 30;
    ranked.sort((a, b) => b.score - a.score);
  }
  const topScore = ranked[0]?.score ?? 0;
  const secondScore = ranked[1]?.score ?? 0;
  // Someone describing their own symptoms should always see how to get care.
  let navHrefs = [...u.navigation];
  // "book a home visit" is about the home visit, not a clinic appointment.
  if (navHrefs.includes("/home-visit") && !/\bappointment/.test(u.normalized)) navHrefs = navHrefs.filter((href) => href !== "/appointment");
  if (u.intents.has("exam")) navHrefs = [...new Set([...navHrefs, "/daily-challenge", "/learn/review", "/learn"])];
  if (u.intents.has("patient") && !navHrefs.includes("/appointment") && !navHrefs.includes("/home-visit")) navHrefs.push("/appointment");
  const navDocs = navHrefs
    .map((href) => index.byHref.get(href) ?? (navigationCatalog[href] ? { resource: navigationCatalog[href], kind: kindOf(navigationCatalog[href]), title: new Set<string>(), slug: new Set<string>(), body: new Set<string>(), titleNorm: "" } : undefined))
    .filter((doc): doc is Doc => Boolean(doc))
    .slice(0, u.intents.has("exam") ? 3 : 2);

  // Navigation-only questions ("book a home visit") don't need topic results.
  const topicTokens = [...u.tokens.keys()].filter((token) => !/^(book|booking|appointment|visit|home|verify|certificate|workshop|contact|quiz|daily|challenge|fee|price|lesson|course|flashcard|teacher)$/.test(token));
  const hasTopic = topicTokens.length > 0 && topScore >= 8;
  const confidence: BrainResult["confidence"] = topScore >= 22 && topScore - secondScore >= 3 ? "high" : topScore >= 10 ? "medium" : "low";

  const relevant = ranked.filter((item) => item.score >= topScore * 0.3 && !navDocs.some((nav) => nav.resource.href === item.doc.resource.href));
  const topical = hasTopic ? diversify(relevant, navDocs.length ? 3 : 4).map((item) => item.doc) : [];
  // Lead with the condition guide, or with the plan when the question is about treatment.
  if (topical.length > 1 && (topical[0].kind === "plan" || topical[0].kind === "condition")) {
    const lead = u.intents.has("treat") ? "plan" : "condition";
    const index = topical.findIndex((doc) => doc.kind === lead);
    if (index > 0) topical.unshift(...topical.splice(index, 1));
  }
  const leadWithTopic = u.intents.has("patient") || (u.intents.has("exam") && hasTopic);
  const picked = [...(leadWithTopic ? topical : navDocs), ...(leadWithTopic ? navDocs : topical)].slice(0, 4);

  if (!picked.length) {
    const { message, suggestions } = compose(u, undefined, [], "low");
    return { lang: u.lang, message, safety: null, resources: [], suggestions, confidence: "low", candidates: ranked.slice(0, 8).map((item) => item.doc.resource) };
  }

  const examLine = u.intents.has("exam") && !hasTopic
    ? u.lang === "ur"
      ? "Exam aur viva ke liye is tarteeb mein practice karein: 1) aaj ka Daily Challenge, 2) apne flashcards, 3) jo topics ghalat hon un ke PNA Teacher lessons. Kisi khaas topic ka naam likhein (jaise \"stroke viva\") to main us ke lessons bhi dhoond dunga."
      : "For exams and viva, practise in this order: 1) today's Daily Challenge, 2) your flashcards, 3) PNA Teacher lessons for any topic you get wrong. Name a topic (e.g. \"stroke viva\") and I'll add the right lessons too."
    : "";
  const navLine = examLine || (navDocs.length ? navigationMessage(u, navDocs.map((doc) => doc.resource.href)) : "");
  const top = topical[0];
  const composed = top ? compose(u, top, picked, confidence) : { message: "", suggestions: [] as BrainResult["suggestions"] };
  const continuing = u.usedContext && options.context?.lastTopic
    ? u.lang === "ur" ? `**${options.context.lastTopic}** ke baare mein aage:` : `Continuing with **${options.context.lastTopic}**:`
    : "";
  const message = [continuing, u.intents.has("patient") ? composed.message : navLine, u.intents.has("patient") ? navLine : composed.message].filter(Boolean).join("\n");

  return {
    lang: u.lang,
    message,
    safety: null,
    resources: picked.map(toResult),
    suggestions: examLine && u.setAsideTopic
      ? [{ label: u.lang === "ur" ? `${u.setAsideTopic} ki exam tayyari` : `Exam prep: ${u.setAsideTopic}`, query: `${u.setAsideTopic} viva` }, ...composed.suggestions].slice(0, 3)
      : composed.suggestions,
    topic: top ? shortTopic(top.resource.title) : undefined,
    confidence: top ? confidence : "high",
    candidates: ranked.slice(0, 8).map((item) => item.doc.resource),
  };
}
