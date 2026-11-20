import type { Bi } from "../types.ts";
import { fromUrduScript } from "../../pna-ai/language.ts";
import { scrubPII, type Lang } from "./intake-spec.ts";
import { MAX_CHECKIN_NOTE, type CheckinDraft, type CheckinResponse, type CheckinStep } from "./checkin-shared.ts";

/**
 * The recovery check-in chat: what it asks, how it reads the answers WITHOUT any model, and what it says. The model (checkin-turn.ts) only
 * adds a warm acknowledgement and helps with free-form wording; the questions and their order, the safety question, the reading of numbers
 * and the final summary are plain code, so they are exact, tested and work when the model is down. English and Roman Urdu.
 */
export const norm = (text: string) =>
  fromUrduScript(text).toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9+/.\s]/g, " ").replace(/(?<!\d)[./]|[./](?!\d)/g, " ").replace(/\s+/g, " ").trim();

/* ───────────────────────── wording ───────────────────────── */

export const QUESTION: Record<CheckinStep, Bi> = {
  pain: {
    en: "How strong is your pain right now? Please give me a number from 0 (no pain) to 10 (the worst pain you can imagine).",
    ru: "Abhi aap ka dard kitna hai? Meherbani karke 0 (dard nahi) se 10 (sab se shadeed dard) ke beech ek number bata dein.",
  },
  signs: {
    en: "Now one safety question that I ask everyone. Since your session, have you had any of these: chest pain or trouble breathing; dizziness or fainting; new numbness, tingling or weakness in an arm or leg, or trouble controlling your bladder or bowels; a hot, swollen or very painful calf; sharp or severe pain that did not settle when you stopped; a pop, tear, twist or fall; or a joint that became more swollen, hot or locked? Please answer yes or no, and if yes, tell me which.",
    ru: "Ab ek hifazati sawal jo main sab se poochta hoon. Session ke baad kya aap ko inmein se koi cheez hui: seene mein dard ya saans mein mushkil; chakkar ya behoshi; haath ya taang mein naya sunn-pan, jhunjhunahat ya kamzori, ya peshab/pakhana rokne mein mushkil; pindli ka garam, sooja hua ya bohat dardnaak hona; tez ya shadeed dard jo rukne ke baad bhi kam na hua; pop, phatna, mur jana ya girna; ya koi jor jo zyada soojh gaya, garam hua ya phans gaya? Haan ya nahi mein jawab dein, aur haan hai to bataein kaun si.",
  },
  response: {
    en: "Compared with before you exercised, are your symptoms better, about the same, or worse?",
    ru: "Exercise se pehle ke muqable mein aap ki alamaat behtar hain, lagbhag waisi hi hain, ya zyada kharab?",
  },
  function: {
    en: "How easily can you manage everyday things like walking, dressing or household tasks? Give a number from 0 (cannot manage) to 10 (completely normal), or say skip.",
    ru: "Rozmarra ke kaam, jaise chalna, kapray pehenna ya ghar ke kaam, kitni aasani se ho rahe hain? 0 (nahi ho rahe) se 10 (bilkul normal) ke beech number dein, ya skip kahein.",
  },
  new_symptoms: {
    en: "Have you noticed any new symptoms, something you did not have before?",
    ru: "Kya aap ne koi nayi alamat mehsoos ki, jo pehle nahi thi?",
  },
  note: {
    en: "Last one: is there anything else you would like your physiotherapist to know? You can say no.",
    ru: "Aakhri sawal: kya aur kuch hai jo aap apne physiotherapist ko batana chahte hain? Nahi bhi keh sakte hain.",
  },
};

/** Said when an answer was not understood: short, exact and never the model's. */
export const HELP: Record<CheckinStep, Bi> = {
  pain: { en: "I need one number from 0 to 10, where 0 is no pain and 10 is the worst pain you can imagine.", ru: "Mujhe 0 se 10 ke beech ek number chahiye, jahan 0 matlab dard nahi aur 10 matlab sab se shadeed dard." },
  signs: { en: "Please answer yes or no, and if yes, tell me which of the warning signs it was.", ru: "Meherbani karke haan ya nahi mein jawab dein, aur haan hai to bataein ke kaun si alamat thi." },
  response: { en: "Please tell me if your symptoms are better, about the same, or worse than before you exercised.", ru: "Bataein ke exercise se pehle ke muqable mein alamaat behtar hain, lagbhag waisi hi hain, ya zyada kharab." },
  function: { en: "A number from 0 (cannot manage) to 10 (completely normal), or say skip.", ru: "0 (nahi ho rahe) se 10 (bilkul normal) ke beech number dein, ya skip kahein." },
  new_symptoms: { en: "Please answer yes or no.", ru: "Meherbani karke haan ya nahi mein jawab dein." },
  note: { en: "Write anything you want your physiotherapist to know, or say no.", ru: "Jo aap physiotherapist ko batana chahte hain likhein, ya nahi kahein." },
};

export const TRY_AGAIN: Bi = { en: "Sorry, I did not quite understand that.", ru: "Maazrat, mujhe theek se samajh nahi aaya." };

export const checkinGreeting = (lang: Lang): string =>
  lang === "ru"
    ? `Assalam-o-alaikum, main RehabVerse check-in assistant hoon, ek AI. Session ke baad aap kaisa mehsoos kar rahe hain, is baare mein chand chhote sawal poochunga aur aap ka check-in form bhar dunga taake aap use check kar lein. Main diagnose nahi kar sakta aur na aap ka plan badal sakta hoon, aur aap ka physiotherapist sab kuch parhta hai. ${QUESTION.pain.ru}`
    : `Hello, I am the RehabVerse check-in assistant, an AI. I will ask you a few short questions about how you have been since your session, and fill in your check-in form for you to check. I cannot diagnose or change your plan, and your physiotherapist reads everything. ${QUESTION.pain.en}`;

export const FOR_PHYSIO: Bi = {
  en: "That is a question for your physiotherapist, and only they can answer it. I have noted it for them.",
  ru: "Ye sawal aap ke physiotherapist ke liye hai aur sirf wohi iska jawab de sakte hain. Maine ye unke liye note kar liya hai.",
};
export const HIGH_PAIN: Bi = {
  en: "That is a high number, so I have made sure your physiotherapist sees it.",
  ru: "Ye bara number hai, is liye maine yaqeeni banaya hai ke aap ke physiotherapist ise dekhein.",
};
export const LIMIT: Bi = {
  en: "We have talked for a while. I have put what I understood into the form below. Please check it, add anything else there, and save it.",
  ru: "Humein baat karte hue kaafi waqt ho gaya. Jo main samjha woh neeche form mein daal diya hai. Use check karein, kuch aur batana ho to wahin likhein, aur save kar dein.",
};
export const UNCLEAR_SIGNS: Bi = {
  en: "I could not tell from your answer, so please read the list of warning signs on the form below and tick what applies yourself.",
  ru: "Aap ke jawab se main samajh nahi saka, is liye neeche form mein warning signs ki list khud parh kar jo lagu ho use tick kar dein.",
};

/** What the chat says when the patient reports a warning sign (after the shared safety wording of the alert, which says what to do). Never reassures. */
export const CHECKIN_STOP: Bi = {
  en: "Please stop exercising for now. What you describe needs your physiotherapist to look at it, and I have told them. If it feels serious, or you have chest pain, trouble breathing, fainting, or sudden weakness or numbness, call 1122 or go to the nearest emergency department now.",
  ru: "Barah-e-karam abhi exercise rok dein. Jo aap bata rahe hain use aap ke physiotherapist ko dekhna hoga, aur maine unhein bata diya hai. Agar halat serious lage, ya seene mein dard, saans mein mushkil, behoshi, ya achanak kamzori ya sunn-pan ho, to abhi 1122 par call karein ya qareebi emergency department jayein.",
};
export const AFTER_STOP = (ticked: boolean): Bi =>
  ticked
    ? { en: "I have ticked what you reported on the check-in form below. Please save the form so it is on your record, and wait for your physiotherapist's message.", ru: "Jo aap ne bataya woh neeche check-in form mein tick kar diya hai. Form save kar dein taake record mein aa jaye, aur apne physiotherapist ke paigham ka intezar karein." }
    : { en: "Please tick which warning sign it was on the check-in form below, save it so it is on your record, and wait for your physiotherapist's message.", ru: "Neeche check-in form mein tick karein ke kaun si alamat thi, use save kar dein taake record mein aa jaye, aur apne physiotherapist ke paigham ka intezar karein." };

/** The scripted acknowledgement, used when the model is unavailable or breaks a rule. */
export function scriptedAck(learned: { pain: number | null; response: CheckinResponse | null }, lang: Lang, turn: number): string {
  if (learned.response === "worse") return lang === "ru" ? "Afsos hua ke zyada kharab lag raha hai. Aap ke physiotherapist ye zaroor dekhenge." : "I am sorry it feels worse. Your physiotherapist will see that.";
  if (learned.response === "better") return lang === "ru" ? "Ye sun kar acha laga ke behtar mehsoos ho raha hai." : "Good to hear it feels better.";
  if (learned.pain !== null && learned.pain >= 7) return lang === "ru" ? "Mujhe afsos hai ke dard itna zyada hai." : "I am sorry the pain is that strong.";
  return PLAIN_ACKS[Math.abs(turn) % PLAIN_ACKS.length][lang];
}
const PLAIN_ACKS: Bi[] = [
  { en: "Thank you for telling me that.", ru: "Batane ka shukriya." },
  { en: "Thanks, that helps.", ru: "Shukriya, ye madadgaar hai." },
  { en: "Got it, thank you.", ru: "Samajh gaya, shukriya." },
];
/** A bare "thank you" adds nothing in front of the closing summary, which starts with its own. */
export const isPlainAck = (text: string): boolean => PLAIN_ACKS.some((ack) => ack.en === text || ack.ru === text);

/* ───────────────────────── reading answers (plain code) ───────────────────────── */

const WORD_NUMBER: Record<string, number> = { zero: 0, nil: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const UNITS = /\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|days?|weeks?|months?|years?|minutes?|mins?|seconds?|secs?|times|sets?|reps?|kg|mg|ml|din|ghante|ghanta|hafte|haftay|hafta|baar|saal|mahine|minute)\b/g;
const RANGE = /\b(to|or|ya|se|between)\b/;
const ZERO = /\b(no pain|zero|nil|none|pain ?free|no dard|dard nahi|koi dard nahi|dard bilkul nahi)\b/;
const SKIP = /\b(skip|pass|not sure|dont know|do not know|unsure|cant say|cannot say|no idea|pata nahi|maloom nahi|rehne do|chhor do|chor do|na)\b/;

/** A 0 to 10 number in the patient's words ("3", "3/10", "about 4", "three", "3 or 4" (the higher one is taken)), or null when it is missing or unclear. */
export function readScale(text: string, options: { zeroWords?: boolean } = {}): number | null {
  const t = norm(text.replace(/(\d)\s*[-–—]\s*(\d)/g, "$1 to $2")).replace(UNITS, " ").replace(/\s*(?:\/|out of)\s*10\b/g, " ");
  const found = [...t.matchAll(/\b(\d{1,2})(?:\.\d+)?\b/g)].map((m) => Number(m[1])).filter((n) => n >= 0 && n <= 10);
  if (t.split(" ").length <= 5) for (const word of t.split(" ")) if (word in WORD_NUMBER) found.push(WORD_NUMBER[word]);
  const distinct = [...new Set(found)];
  if (distinct.length === 1) return distinct[0];
  if (distinct.length === 2 && RANGE.test(t)) return Math.max(...distinct);
  if (distinct.length === 0 && options.zeroWords && ZERO.test(t)) return 0;
  return null;
}

export const readSkip = (text: string): boolean => SKIP.test(norm(text)) && norm(text).split(" ").length <= 6;

export function readResponse(text: string): CheckinResponse | null {
  const t = norm(text);
  const same = /\b(same|unchanged|no change|not changed|nothing has changed|no better|not (?:any )?(?:better|different)|not (?:much|really|that) (?:better|different|changed)|about the same|waisi|waisa|waise hi|lagbhag wohi|jaisi thi|jaisa tha|barabar|kam nahi)\b/.test(t);
  const worse = /\b(worse|worst|worsen\w*|kharab|bigad\w*|zyada (?:dard|takleef|kharab)|barh\w*|increased|more (?:pain|painful|sore|stiff)|aggravat\w*|flared)\b/.test(t);
  const better = /\b(better|improv\w*|less (?:pain|painful|sore|stiff)|behtar|kam (?:ho|hua|hui|hai))\b/.test(t) && !/\bnot (?:any )?better\b|\bno better\b|\bkam nahi\b/.test(t);
  if (worse && (better || same)) return null;
  if (worse) return "worse";
  if (same) return "same";
  if (better) return "better";
  return null;
}

const NO_START = /^(?:no|nope|nah|none|nothing|nahi|nahin|nai|nhi|na|negative|not really|not at all|bilkul nahi|koi nahi|kuch nahi|sab theek|all (?:good|fine|clear|ok|okay))\b/;
const YES_START = /^(?:yes|yeah|yep|yup|haan|han|ha|ji haan|ji han|hanji|ji|sure|i did|i have|i do|mujhe|ek|there (?:is|was))\b/;

/** Yes or no (the answer to a yes/no question), or null. */
export function readYesNo(text: string): boolean | null {
  const t = norm(text);
  if (NO_START.test(t) || /\b(no new|nothing new|koi nayi nahi|nayi nahi)\b/.test(t)) return false;
  if (YES_START.test(t) || /\b(new symptom|nayi alamat)\b/.test(t)) return true;
  return null;
}

/** A bare "no" to "anything else?" (so nothing is written in the note). */
export const readNothingMore = (text: string): boolean => {
  const t = norm(text);
  return t.split(" ").length <= 6 && (NO_START.test(t) || /\b(thats all|that is all|nothing else|bas|bas itna|theek hai)\b/.test(t));
};

/* ───────────────────────── what only the physiotherapist can answer ───────────────────────── */

const PHYSIO_QUESTIONS: RegExp[] = [
  /\b(medicine|medication|tablet|painkiller|pain killer|paracetamol|panadol|ibuprofen|brufen|diclofenac|voltaren|cream|gel|injection|dawai|dawa|goli|ilaaj|ilaj)\b/,
  /\b(scan|mri|x[ -]?ray|surgery|operation|diagnos\w*|what is wrong|whats wrong|kya hua hai|kya masla)\b/,
  /\b(should|can|could|may|shall) i (stop|skip|continue|carry on|keep|do (more|less|extra|double)|increase|decrease|take|use|rest|go back|return|play|work|drive|lift)\b/,
  /\b(kya main|kya mujhe)\b.{0,30}\b(karna chahiye|kar sakta|kar sakti|rok|chhod|jari|jaari)\b/,
  /\b(when will|how long (?:will|until)|kab tak|kitne din)\b.{0,30}\b(better|heal|recover|theek|behtar)\b/,
];
export const asksPhysio = (text: string): boolean => PHYSIO_QUESTIONS.some((pattern) => pattern.test(norm(text)));

/* ───────────────────────── applying an answer ───────────────────────── */

export type Reading = Partial<Pick<CheckinDraft, "pain" | "function_score" | "symptom_response" | "new_symptoms" | "note">> & { skip?: boolean };

/** Reads the patient's answer to the question that was just asked (not the safety question, which has its own reader in checkin-safety.ts). */
export function readStepAnswer(step: CheckinStep, text: string): Reading | null {
  switch (step) {
    case "pain": {
      const pain = readScale(text, { zeroWords: true });
      return pain === null ? null : { pain };
    }
    case "function": {
      if (readSkip(text)) return { skip: true };
      const score = readScale(text);
      if (score !== null) return { function_score: score };
      return /\b(completely|totally|fully|bilkul)?\s*normal\b/.test(norm(text)) && norm(text).split(" ").length <= 4 ? { function_score: 10 } : null;
    }
    case "response": {
      const response = readResponse(text);
      return response ? { symptom_response: response } : null;
    }
    case "new_symptoms": {
      const answer = readYesNo(text);
      if (answer === null) return null;
      const detail = scrubPII(text.replace(/\s+/g, " ").trim());
      return answer && detail.split(" ").length >= 3 ? { new_symptoms: true, note: `New symptoms: ${detail}`.slice(0, MAX_CHECKIN_NOTE) } : { new_symptoms: answer };
    }
    case "note":
      return readNothingMore(text) ? { skip: true } : { note: scrubPII(text.replace(/\s+/g, " ").trim()).slice(0, MAX_CHECKIN_NOTE) };
    case "signs":
      return null;
  }
}

/** Puts a reading into the draft. The note is added to (never replaced), and nothing already recorded is wiped by an empty reading. */
export function applyReading(draft: CheckinDraft, step: CheckinStep, reading: Reading | null): CheckinDraft {
  const next: CheckinDraft = { ...draft, flags: [...draft.flags], skipped: [...draft.skipped], tries: { ...draft.tries } };
  if (!reading) return next;
  if (reading.skip) { if (!next.skipped.includes(step)) next.skipped.push(step); return next; }
  if (reading.pain !== undefined && reading.pain !== null) next.pain = reading.pain;
  if (reading.function_score !== undefined && reading.function_score !== null) next.function_score = reading.function_score;
  if (reading.symptom_response) next.symptom_response = reading.symptom_response;
  if (reading.new_symptoms !== undefined && reading.new_symptoms !== null) next.new_symptoms = reading.new_symptoms;
  if (reading.note) next.note = (next.note ? `${next.note} ${reading.note}` : reading.note).slice(0, MAX_CHECKIN_NOTE);
  return next;
}

/* ───────────────────────── the summary the patient checks ───────────────────────── */

const RESPONSE_TEXT: Record<CheckinResponse, Bi> = {
  better: { en: "better", ru: "behtar" },
  same: { en: "about the same", ru: "lagbhag waisi hi" },
  worse: { en: "worse", ru: "zyada kharab" },
};

/** Said when every question is answered. Made by code from the recorded answers, so it can never say more than was recorded. */
export function summaryText(draft: CheckinDraft, lang: Lang): string {
  const ru = lang === "ru";
  const parts: string[] = [];
  parts.push(draft.pain !== null ? (ru ? `abhi dard ${draft.pain}/10` : `pain now ${draft.pain}/10`) : ru ? "dard ka number form mein likhna hai" : "the pain number is still to be filled in on the form");
  if (draft.function_score !== null) parts.push(ru ? `rozmarra ke kaam ${draft.function_score}/10` : `everyday activities ${draft.function_score}/10`);
  parts.push(draft.symptom_response ? (ru ? `exercise se pehle ke muqable mein alamaat ${RESPONSE_TEXT[draft.symptom_response].ru}` : `symptoms compared with before exercising: ${RESPONSE_TEXT[draft.symptom_response].en}`) : ru ? "alamaat ka muqabla form mein chunna hai" : "the comparison with before is still to be chosen on the form");
  if (draft.new_symptoms !== null) parts.push(draft.new_symptoms ? (ru ? "nayi alamaat hain" : "new symptoms: yes") : ru ? "koi nayi alamat nahi" : "no new symptoms");
  const signsLine: Bi | null = draft.signs === "no" ? { en: "you told me you had none of the warning signs", ru: "aap ne bataya ke warning signs mein se koi nahi hua" } : draft.signs === "unclear" ? UNCLEAR_SIGNS : null;
  const head = ru ? "Shukriya, mujhe jo chahiye tha mil gaya. Maine ye samjha: " : "Thank you, that is everything I need. Here is what I understood: ";
  const tail = ru
    ? "Maine neeche check-in form bhar diya hai. Har jawab check karein, safety wali list khud tick karein (main 'Inmein se kuch nahi' aap ke liye kabhi tick nahi karta), aur Save dabayein. Aap ka physiotherapist form aur ye baat-cheet dono parhta hai."
    : "I have filled in the check-in form below. Please check every answer, tick the safety list yourself (I never tick 'None of these' for you), and press Save. Your physiotherapist reads the form and this chat.";
  return `${head}${parts.join("; ")}${signsLine ? `; ${signsLine[lang]}` : ""}. ${tail}`;
}
