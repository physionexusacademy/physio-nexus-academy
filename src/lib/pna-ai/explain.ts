/**
 * Physio Nexus AI — "explain it to me", built only from PNA's own content.
 *
 * Reads the same static JSON the website already serves (PNA Teacher lessons, the Conditions & Treatment
 * Guide) and arranges it into a short, friendly explanation in English or Roman Urdu. Nothing is generated:
 * every sentence comes from the lesson or guide, so it is as reliable as the pages themselves.
 * Pure module (no imports) so it can be tested directly with Node.
 */

export type Lang = "en" | "ur";
type Bi = { en?: string; ur?: string } | string | undefined;

export type ExplanationStep = { label: string; text: string; list?: string[] };
export type Explanation = {
  kind: "lesson" | "condition";
  title: string;
  /** One-line heading above the steps, in the learner's language. */
  intro: string;
  steps: ExplanationStep[];
  /** A question the learner can try (lessons only), without its answer. */
  check?: string;
  /** Link to the full page (lesson or condition at the clinical depth). */
  href: string;
  openLabel: string;
  /** Roman Urdu headings over English clinical content (conditions). */
  mixedLanguage?: boolean;
  /** Optional Roman Urdu retelling of a condition guide, checked against the source (see isFaithfulRewrite). */
  urSummary?: string;
};

type LessonBeat = {
  type: string;
  text?: Bi;
  simpler?: Bi;
  question?: Bi;
  title?: Bi;
  steps?: { title?: string; detail?: string }[];
};
export type LessonJson = { slug: string; title: string; goal?: Bi; hook?: Bi; summary?: Bi[]; beats?: LessonBeat[]; minutes?: number };
export type ConditionJson = {
  slug: string;
  name: string;
  summary: string;
  quick?: { looksLike?: string[]; redFlags?: string[]; firstSteps?: string[]; selfCare?: string[] };
  clinical?: { stages?: { label: string; goal: string; do: string[]; dose: string[]; moveOn: string[] }[]; measures?: string[] };
  expert?: { pearls?: string[]; mistakes?: string[] };
};

const L = {
  idea: { en: "The big idea", ur: "Asal baat" },
  picture: { en: "Picture it", ur: "Is tarah socho" },
  explain: { en: "How it works", ur: "Yeh kaise kaam karta hai" },
  next: { en: "Then", ur: "Phir" },
  clinic: { en: "Why it matters in the clinic", ur: "Clinic mein kyun zaroori hai" },
  mistake: { en: "Watch out for this mistake", ur: "Is ghalti se bachein" },
  memory: { en: "A way to remember it", ur: "Yaad rakhne ka tareeqa" },
  safety: { en: "Safety first", ur: "Pehle safety" },
  how: { en: "How it is done", ur: "Kaise karte hain" },
  short: { en: "In short", ur: "Mukhtasar mein" },
  feels: { en: "What it can feel like", ur: "Kaisa mehsoos hota hai" },
  urgent: { en: "Get medical help first if", ur: "Pehle doctor ko dikhayein agar" },
  helps: { en: "What usually helps first", ur: "Shuru mein kya madad karta hai" },
  plan: { en: "The plan, stage by stage", ur: "Plan, stage ba stage" },
  careful: { en: "Be careful", ur: "Dhyan rahe" },
  home: { en: "At home", ur: "Ghar par" },
};

function pick(value: Bi, lang: Lang): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (value[lang] || value.en || "").trim();
}

/** First `count` sentences (keeps **bold**), trimmed to a readable length. */
export function clip(text: string, count = 2, maxChars = 260): string {
  const flat = text.replace(/\s+/g, " ").trim();
  const sentences = flat.match(/[^.!?]+[.!?]+(\s|$)/g);
  let out = sentences ? sentences.slice(0, count).join("").trim() : flat;
  if (out.length > maxChars) out = out.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
  return out;
}

const unbullet = (text: string) => text.split("\n").filter(Boolean)[0] ?? text;

/** A teacher lesson, explained in 5–7 short steps. `simple` keeps it to the essentials. */
export function explainLesson(lesson: LessonJson, lang: Lang, simple = false): Explanation {
  const beats = lesson.beats ?? [];
  const first = (type: string, skip = 0) => beats.filter((beat) => beat.type === type)[skip];
  const text = (beat: LessonBeat | undefined, useSimpler = false) => {
    if (!beat) return "";
    const body = useSimpler && beat.simpler ? pick(beat.simpler, lang) : pick(beat.text, lang);
    return body;
  };

  const steps: ExplanationStep[] = [];
  const goal = pick(lesson.goal, lang) || pick(lesson.hook, lang);
  if (goal) steps.push({ label: L.idea[lang], text: clip(goal, 2) });

  // The first spoken beat is usually a greeting; the next ones carry the explanation.
  const says = beats.filter((beat) => beat.type === "say");
  const core = says.slice(1, simple ? 2 : 3);
  core.forEach((beat, i) => {
    const body = text(beat, simple);
    if (body) steps.push({ label: i === 0 ? L.explain[lang] : L.next[lang], text: clip(unbullet(body), simple ? 1 : 2) });
  });

  const analogy = text(first("analogy"));
  if (analogy && !simple) steps.push({ label: L.picture[lang], text: clip(analogy, 3, 360) });
  const clinic = text(first("clinic"));
  if (clinic && !simple) steps.push({ label: L.clinic[lang], text: clip(clinic, 2, 300) });

  const procedure = first("steps");
  if (procedure?.steps?.length && !simple) {
    steps.push({ label: L.how[lang], text: "", list: procedure.steps.slice(0, 6).map((step, i) => `${i + 1}. ${step.title ?? ""}`.trim()) });
  }

  const mistake = text(first("mistake"));
  if (mistake) steps.push({ label: L.mistake[lang], text: clip(mistake, 2, 300) });
  const safety = text(first("safety"));
  const safetyItems = safety.split("\n").filter((line) => line.trim().startsWith("•")).map((line) => line.replace(/^\s*•\s*/, "").trim()).filter(Boolean).slice(0, 3);
  if (safetyItems.length && !simple) steps.push({ label: L.safety[lang], text: "", list: safetyItems });
  const memory = text(first("memory"));
  if (memory) steps.push({ label: L.memory[lang], text: clip(memory.replace(/^\s*(memory trick|yaad rakhne ka tareeqa)\s*:\s*/i, ""), 1, 220) });

  const takeaways = (lesson.summary ?? []).map((item) => pick(item, lang)).filter(Boolean).slice(0, simple ? 3 : 4);
  if (takeaways.length) steps.push({ label: L.short[lang], text: "", list: takeaways });

  const check = first("check");
  const question = check ? pick(check.question, lang) : "";
  return {
    kind: "lesson",
    title: lesson.title,
    intro: lang === "ur" ? `**${lesson.title}** — PNA Teacher ke lesson se aasan explanation:` : `**${lesson.title}** — explained simply from the PNA Teacher lesson:`,
    steps: steps.filter((step) => step.text || step.list?.length).slice(0, simple ? 5 : 8),
    check: question || undefined,
    href: `/learn/${lesson.slug}`,
    openLabel: lang === "ur" ? "Poora lesson kholein" : "Open the full lesson",
  };
}

const join = (items: string[] | undefined, max: number) => (items ?? []).slice(0, max).filter(Boolean);

/** A condition from the Conditions & Treatment Guide, explained at "quick guide + plan" depth. */
export function explainCondition(condition: ConditionJson, lang: Lang, simple = false): Explanation {
  const steps: ExplanationStep[] = [{ label: L.idea[lang], text: clip(condition.summary, simple ? 1 : 2, 300) }];
  const feels = join(condition.quick?.looksLike, simple ? 3 : 5);
  if (feels.length) steps.push({ label: L.feels[lang], text: "", list: feels });
  const urgent = join(condition.quick?.redFlags, simple ? 2 : 4);
  if (urgent.length) steps.push({ label: L.urgent[lang], text: "", list: urgent });
  const helps = join(condition.quick?.firstSteps, 3);
  if (helps.length) steps.push({ label: L.helps[lang], text: "", list: helps });
  const stages = condition.clinical?.stages ?? [];
  if (stages.length && !simple) {
    steps.push({
      label: L.plan[lang],
      text: "",
      list: stages.map((stage, i) => `Stage ${i + 1}: ${stage.label} — ${clip(stage.goal, 1, 140)}`),
    });
  }
  const careful = condition.expert?.mistakes?.[0] ?? condition.expert?.pearls?.[0];
  if (careful && !simple) steps.push({ label: L.careful[lang], text: clip(careful, 1, 220) });
  const home = join(condition.quick?.selfCare, 3);
  if (home.length && !simple) steps.push({ label: L.home[lang], text: "", list: home });

  return {
    kind: "condition",
    title: condition.name,
    intro:
      lang === "ur"
        ? `**${condition.name}** — PNA ki Conditions & Treatment Guide se (headings Roman Urdu mein, clinical terms English mein):`
        : `**${condition.name}** — explained simply from the PNA Conditions & Treatment Guide:`,
    steps: steps.filter((step) => step.text || step.list?.length).slice(0, simple ? 4 : 7),
    href: `/conditions/${condition.slug}#${simple ? "quick" : "clinical"}`,
    openLabel: lang === "ur" ? "Poori guide kholein" : "Open the full guide",
    mixedLanguage: lang === "ur",
  };
}

/** Plain-text version (used to ground the optional Roman Urdu rewrite and to test completeness). */
export function explanationText(explanation: Explanation): string {
  return [explanation.title, ...explanation.steps.flatMap((step) => [step.label, step.text, ...(step.list ?? [])])].filter(Boolean).join("\n");
}

/** The Roman Urdu rewrite is accepted only if it adds no number, link or unknown dose that is not in the source. */
export function isFaithfulRewrite(source: string, rewrite: string): boolean {
  const text = rewrite.trim();
  if (text.length < 40 || text.length > 900) return false;
  if (/https?:|www\.|@|<|>/.test(text)) return false;
  const numbers = text.match(/\d+(?:[.,]\d+)?/g) ?? [];
  const allowed = new Set(source.match(/\d+(?:[.,]\d+)?/g) ?? []);
  if (numbers.some((n) => !allowed.has(n))) return false;
  // It should read as Roman Urdu, not as English or Urdu script.
  if (/[؀-ۿ]/.test(text)) return false;
  const markers = (text.toLowerCase().match(/\b(hai|hain|ka|ki|ke|mein|aur|se|ko|nahi|karein|karna|hota|hoti|jab|agar|ya)\b/g) ?? []).length;
  return markers >= 4;
}
