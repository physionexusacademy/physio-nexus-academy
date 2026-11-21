import { ONSET_IDS, MAX_OWN_WORDS, MAX_TEXT, type FieldKey, type IntakeDraft, type Lang } from "./intake-spec.ts";

/**
 * The scripted side of the assistant: the greeting, the closing line, one warm question per field, and a plain-code way to read an answer when
 * the AI model is unavailable. When the model fails or its reply breaks a rule, the conversation continues from these, so a patient is never
 * stuck. (English and Roman Urdu; Roman Urdu is the natural spoken Urdu-English mix used across RehabVerse.)
 */
type Bi = { en: string; ru: string };
export const pick = (value: Bi, lang: Lang) => value[lang];

export const GREETING: Bi = {
  en: "Hello, I'm the RehabVerse assistant. I work alongside your physiotherapist, and my job is to listen carefully and understand what you're going through, so they have the full picture before they see you. I'm an AI, so I can't diagnose or prescribe, but there's no rush and I'm here to listen. To begin, could you tell me what has been bothering you?",
  ru: "Assalam-o-alaikum, main RehabVerse assistant hoon. Main aap ke physiotherapist ke saath kaam karta hoon, aur mera kaam hai aap ki baat dhyan se sunna aur samajhna, taake unhein aap se milne se pehle poori tasveer mil jaye. Main AI hoon, is liye diagnose ya prescribe karna mere bas mein nahi, lekin koi jaldi nahi, main sun raha hoon. Shuru karne ke liye bataiye, aap ko kya takleef hai?",
};

export const CLOSING: Bi = {
  en: "Thank you for being so open with me. That gives your physiotherapist a clear picture. Next I'll show you what I've noted, so you can check it and change anything that isn't right.",
  ru: "Itni khulkar baat batane ka shukriya. Isse aap ke physiotherapist ko poori tasveer mil jayegi. Ab woh dikhaya jayega jo maine note kiya hai, taake aap use check kar lein aur jo theek na ho use badal dein.",
};

export const TRY_AGAIN: Bi = {
  en: "Sorry, I didn't quite catch that. Could you say it again in your own words?",
  ru: "Maazrat, mujhe theek se samajh nahi aaya. Kya aap apne alfaaz mein dobara bata sakte hain?",
};

const ACKS: Bi[] = [
  { en: "Thank you for telling me that.", ru: "Batane ka shukriya." },
  { en: "I appreciate you explaining that.", ru: "Aap ne acha samjhaya, shukriya." },
  { en: "That helps me picture it.", ru: "Isse mujhe tasveer saaf hui." },
  { en: "Thanks, that is useful.", ru: "Shukriya, ye kaafi madadgaar hai." },
];
export const acknowledgement = (turn: number, lang: Lang) => ACKS[Math.abs(turn) % ACKS.length][lang];

export const QUESTIONS: Partial<Record<FieldKey, Bi>> = {
  regions: { en: "Where exactly are you feeling the problem? You can tell me in your own words, for example neck, lower back, shoulder or knee.", ru: "Aap ko takleef kahan mehsoos ho rahi hai? Apne alfaaz mein bata dein, jaise gardan, kamar, kandha ya ghutna." },
  pain_now: { en: "On a scale from 0 to 10, where 0 is no pain and 10 is the worst pain you can imagine, how strong is it right now?", ru: "0 se 10 ke pemane par, jahan 0 matlab dard nahi aur 10 matlab sab se shadeed dard, abhi aap ka dard kitna hai?" },
  duration: { en: "How long has this been going on?", ru: "Ye takleef kitne arse se hai?" },
  onset: { en: "Did it start suddenly, for example after an injury, or did it build up slowly?", ru: "Ye achanak shuru hui, jaise kisi chot ke baad, ya aahista aahista barhi?" },
  possible_cause: { en: "Is there anything you think may have triggered it?", ru: "Aap ke khayal mein is ki koi wajah ho sakti hai?" },
  aggravating: { en: "What makes it worse, for example certain movements, positions or times of day?", ru: "Kis cheez se ye barhti hai, jaise koi harkat, baithna ya din ka koi waqt?" },
  relieving: { en: "And what helps, even a little?", ru: "Aur kis cheez se thora bhi aaram milta hai?" },
  symptoms: { en: "Besides pain, have you noticed anything else, such as stiffness, weakness, tingling or trouble walking?", ru: "Dard ke ilawa aap ne aur kuch mehsoos kiya, jaise akraahat, kamzori, jhunjhunahat ya chalne mein mushkil?" },
  functional_limitations: { en: "How is this affecting your daily life, for example work, sleep, walking or household tasks?", ru: "Ye aap ki rozmarra zindagi par kaise asar daal rahi hai, jaise kaam, neend, chalna ya ghar ke kaam?" },
  previous_treatment: { en: "Have you already had any treatment or tests for this, such as physiotherapy, medicines or scans?", ru: "Kya is ke liye aap pehle koi ilaaj ya tests karwa chuke hain, jaise physiotherapy, dawaiyan ya scans?" },
  medical_conditions: { en: "Do you have any other health conditions I should note, such as diabetes, high blood pressure or heart problems?", ru: "Kya aap ko koi aur bimari hai jo note karni chahiye, jaise sugar, high blood pressure ya dil ka masla?" },
  medications: { en: "Are you taking any regular medicines at the moment?", ru: "Kya aap abhi koi dawaiyan baqaidgi se le rahe hain?" },
  own_words: { en: "One last thing: what matters most to you about getting better, and is there anything that worries you? Your physiotherapist will read this in your own words.", ru: "Aakhri baat: aap ke liye theek hone mein sab se zaroori kya hai, aur kya koi baat aap ko pareshan kar rahi hai? Aap ka physiotherapist ise aap ke apne alfaaz mein parhega." },
};

/* ------- reading an answer in plain code (used only when the model is unavailable) ------- */
const REGION_WORDS: [string, RegExp][] = [
  ["thoracic", /upper back|mid back|middle back|thoracic|peeth ka upar|ribs?/],
  ["cervical", /\bneck\b|gardan|gardin|cervical/],
  ["lumbar", /lower back|low back|lumbar|kamar|\bback\b/],
  ["shoulder", /shoulder|kandh/],
  ["elbow", /elbow|kohni/],
  ["wrist_hand", /wrist|\bhands?\b|kalai|haath|\bhath\b|finger|ungli/],
  ["hip", /\bhips?\b|kulh/],
  ["knee", /knee|ghutn/],
  ["ankle_foot", /ankle|\bfoot\b|\bfeet\b|takhn|paon|\bpao\b|\bpair\b/],
];
const NONE = /^\s*(no|none|nothing|nil|nahi|nahin|koi nahi|kuch nahi|na|n\/a)\b/i;
/** "More than one area" (the answer the chat's tap button sends) and its everyday spellings. */
const MANY_REGIONS = /more than one|several|multiple|many (?:areas|places|parts)|all over|ek se zyada|kai jagah|kai hisse|poore jism/;

export function extractFromAnswer(focus: FieldKey | null, text: string): Partial<Record<FieldKey, unknown>> {
  const t = text.toLowerCase().trim();
  if (!focus || !t) return {};
  switch (focus) {
    case "regions": {
      const ids = REGION_WORDS.filter(([, re]) => re.test(t)).map(([id]) => id);
      const specific = ids.includes("thoracic") ? ids.filter((id) => id !== "lumbar") : ids;
      if (!specific.length && MANY_REGIONS.test(t)) return { regions: ["multiple"] };
      return specific.length ? { regions: specific } : {};
    }
    case "pain_now": {
      const m = t.match(/\b(10|[0-9])\b/);
      return m ? { pain_now: Number(m[1]) } : {};
    }
    case "duration": {
      if (/yesterday|today|\bkal\b|\baaj\b|few days|couple of days/.test(t)) return { duration: "lt_1w" };
      const n = Number((t.match(/(\d+)/) ?? [])[1] ?? NaN);
      if (/year|saal|\bsal\b/.test(t)) return { duration: "gt_6m" };
      if (/month|mahin|maheen|mahine/.test(t)) return Number.isFinite(n) ? { duration: n <= 3 ? "1_3m" : n <= 6 ? "3_6m" : "gt_6m" } : { duration: "1_3m" };
      if (/week|hafta|hafte|haftay/.test(t)) return Number.isFinite(n) ? { duration: n <= 4 ? "1_4w" : n <= 12 ? "1_3m" : "3_6m" } : { duration: "1_4w" };
      if (/day|din/.test(t)) return Number.isFinite(n) ? { duration: n < 7 ? "lt_1w" : "1_4w" } : { duration: "lt_1w" };
      return {};
    }
    case "onset": {
      const id = /not sure|pata nahi|dont know|don't know/.test(t) ? "unknown" : /surgery|operation|procedure/.test(t) ? "after_surgery" : /sudden|achanak|fall|injur|chot|accident|twist/.test(t) ? "sudden" : /gradual|slow|aahista|dheere|over time/.test(t) ? "gradual" : "";
      // Any answer tells the physiotherapist something: keep the patient's own words even when they do not fit a choice.
      return ONSET_IDS.includes(id) ? { onset: id } : { onset: "unknown", possible_cause: text.trim().slice(0, MAX_TEXT) };
    }
    case "symptoms":
      return { other_symptoms: NONE.test(text) && text.trim().length < 40 ? "None reported" : text.trim().slice(0, MAX_TEXT) };
    default: {
      if (focus === "own_words") return { own_words: text.trim().slice(0, MAX_OWN_WORDS) };
      const value = NONE.test(text) && text.trim().length < 40 ? "None reported" : text.trim().slice(0, MAX_TEXT);
      return { [focus]: value };
    }
  }
}

/** The scripted next question (with a short acknowledgement) for whatever is still missing. */
export function scriptedReply(draft: IntakeDraft, focus: FieldKey | null, lang: Lang, turn: number): string {
  const question = focus ? QUESTIONS[focus] : undefined;
  return question ? `${acknowledgement(turn, lang)} ${question[lang]}` : CLOSING[lang];
}
