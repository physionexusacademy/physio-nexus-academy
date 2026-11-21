import type { Bi } from "../types.ts";
import { FEEDBACK_FLAGS, INTAKE_DURATION, INTAKE_REGIONS, INTAKE_SYMPTOMS } from "../intake.ts";
import { nextFocus, type FieldKey, type IntakeDraft } from "./intake-spec.ts";
import { nextStep, type CheckinDraft, type CheckinStep } from "./checkin-shared.ts";

/**
 * What the chat tells a patient to do RIGHT NOW, and the answers they can tap instead of typing. Anybody, including a person who finds writing
 * hard, should see at once what the question is, what a good answer looks like, and be able to answer with one tap.
 * `title` is the one-line instruction above the box, `example` the grey example inside it, `quick` the tappable answers (`label` is what the
 * button says, `send` is exactly what is sent, so the assistant reads it like a typed answer, in the language the person uses).
 * Pure data and functions: tested without a browser (scripts/validate-rehabverse-chat-ui.ts).
 */
export type Quick = { label: Bi; send: Bi; tone?: "good" | "mid" | "bad" };
export type ChatPrompt = { title: Bi; example: Bi; quick: Quick[] };

const q = (en: string, ru?: string, send?: { en?: string; ru?: string }): Quick => ({ label: { en, ru: ru ?? en }, send: { en: send?.en ?? en, ru: send?.ru ?? ru ?? en } });
const fromOptions = (options: { id: string; label: Bi }[]): Quick[] => options.map((o) => ({ label: o.label, send: o.label }));
const numbers = (from: number, to: number, tone = true): Quick[] =>
  Array.from({ length: to - from + 1 }, (_, i) => {
    const n = from + i;
    return { label: { en: String(n), ru: String(n) }, send: { en: String(n), ru: String(n) }, ...(tone ? { tone: (n <= 3 ? "good" : n <= 6 ? "mid" : "bad") as Quick["tone"] } : {}) };
  });
const NONE = q("None", "Koi nahi");
const NOT_SURE = q("Not sure", "Pata nahi");

/* ───────────── the intake conversation ───────────── */
const INTAKE: Partial<Record<FieldKey, ChatPrompt>> = {
  regions: { title: { en: "Tap where it hurts, or write it", ru: "Jahan dard hai wahan dabayein, ya likhein" }, example: { en: "For example: my lower back and left knee", ru: "Misal: meri kamar aur left ghutna" }, quick: fromOptions(INTAKE_REGIONS) },
  pain_now: { title: { en: "How strong is the pain right now? Tap a number", ru: "Abhi dard kitna tez hai? Ek number dabayein" }, example: { en: "0 = no pain, 10 = the worst pain", ru: "0 = dard nahi, 10 = sab se zyada dard" }, quick: numbers(0, 10) },
  duration: { title: { en: "How long has it been like this? Tap one", ru: "Kitne arse se ye takleef hai? Ek dabayein" }, example: { en: "For example: about 3 weeks", ru: "Misal: taqreeban 3 hafte se" }, quick: fromOptions(INTAKE_DURATION) },
  onset: {
    title: { en: "How did it start? Tap one, or write it", ru: "Ye kaise shuru hui? Ek dabayein, ya likhein" },
    example: { en: "For example: it started slowly after I began a new job", ru: "Misal: nayi job ke baad aahista aahista shuru hui" },
    quick: [q("Suddenly", "Achanak"), q("Slowly, over time", "Aahista aahista"), q("After surgery or a procedure", "Operation ya procedure ke baad"), NOT_SURE],
  },
  possible_cause: {
    title: { en: "What do you think caused it? Tap one, or write it", ru: "Aap ke khayal mein is ki wajah kya hai? Ek dabayein, ya likhein" },
    example: { en: "For example: I lifted something heavy", ru: "Misal: maine bhaari cheez uthayi" },
    quick: [q("A fall or an injury", "Girna ya chot"), q("Lifting something heavy", "Bhaari cheez uthana"), q("Sitting or standing for long", "Der tak baithna ya khade rehna"), q("No idea", "Pata nahi")],
  },
  aggravating: {
    title: { en: "What makes it worse? Tap, or write it", ru: "Kis cheez se barhta hai? Dabayein, ya likhein" },
    example: { en: "For example: bending forward and climbing stairs", ru: "Misal: aage jhukne aur seedhiyan chadhne se" },
    quick: [q("Bending forward", "Aage jhukna"), q("Walking", "Chalna"), q("Sitting for long", "Der tak baithna"), q("Climbing stairs", "Seedhiyan chadhna"), q("Lifting", "Wazan uthana"), q("Nothing in particular", "Koi khaas cheez nahi")],
  },
  relieving: {
    title: { en: "What makes it feel better? Tap, or write it", ru: "Kis cheez se aaram milta hai? Dabayein, ya likhein" },
    example: { en: "For example: lying down or moving around", ru: "Misal: let jane ya chalne phirne se" },
    quick: [q("Resting", "Aaram karna"), q("Lying down", "Let jana"), q("Moving around", "Chalna phirna"), q("Changing position", "Position badalna"), q("Nothing helps", "Koi cheez madad nahi karti")],
  },
  symptoms: {
    title: { en: "Any other problems, like tingling or numbness? Tap, or write", ru: "Koi aur takleef, jaise jhunjhuni ya sunn-pan? Dabayein, ya likhein" },
    example: { en: "For example: tingling in my left foot at night", ru: "Misal: raat ko left paon mein jhunjhuni" },
    quick: [q("No other problems", "Koi aur takleef nahi", { en: "None", ru: "Koi nahi" }), ...INTAKE_SYMPTOMS.filter((s) => s.id !== "pain").slice(0, 4).map((s) => ({ label: s.label, send: s.label }))],
  },
  functional_limitations: {
    title: { en: "What is hard to do in daily life? Tap, or write it", ru: "Rozmarra zindagi mein kya karna mushkil hai? Dabayein, ya likhein" },
    example: { en: "For example: it is hard to sleep and to put on my shoes", ru: "Misal: sona aur jootay pehnna mushkil hai" },
    quick: [q("Walking", "Chalna"), q("Sleeping", "Sona"), q("Dressing", "Kapde pehnna"), q("Working", "Kaam karna"), q("Climbing stairs", "Seedhiyan chadhna"), q("Nothing is hard", "Kuch mushkil nahi")],
  },
  previous_treatment: {
    title: { en: "Have you had any treatment for this? Tap, or write it", ru: "Is ke liye pehle koi ilaaj karwaya? Dabayein, ya likhein" },
    example: { en: "For example: 5 physiotherapy sessions last year", ru: "Misal: pichle saal 5 physiotherapy sessions" },
    quick: [q("None so far", "Abhi tak koi nahi"), q("Physiotherapy", "Physiotherapy"), q("Medicines", "Dawaiyan"), q("An injection", "Injection"), q("Surgery", "Operation")],
  },
  medical_conditions: {
    title: { en: "Any health conditions? Tap, or write them", ru: "Koi aur bimari? Dabayein, ya likhein" },
    example: { en: "For example: diabetes and high blood pressure", ru: "Misal: sugar aur blood pressure" },
    quick: [NONE, q("Diabetes", "Sugar (diabetes)"), q("High blood pressure", "Blood pressure"), q("Heart problem", "Dil ka masla"), q("Asthma", "Dama (asthma)")],
  },
  medications: {
    title: { en: "Are you taking any medicines? Tap, or write them", ru: "Kya aap koi dawai le rahe hain? Dabayein, ya likhein" },
    example: { en: "For example: a blood pressure tablet every morning", ru: "Misal: subah blood pressure ki goli" },
    quick: [q("No medicines", "Koi dawai nahi", { en: "None", ru: "Koi nahi" }), q("Painkillers", "Dard ki dawai"), q("Blood pressure tablets", "Blood pressure ki goliyan"), q("Sugar medicines", "Sugar ki dawai")],
  },
  own_words: {
    title: { en: "In your own words: what matters most to you? Write it", ru: "Apne alfaaz mein: aap ke liye sab se zaroori kya hai? Likhein" },
    example: { en: "For example: I want to walk to the market without pain", ru: "Misal: main bina dard ke bazaar tak chalna chahta/chahti hoon" },
    quick: [q("Walk without pain", "Bina dard ke chalna"), q("Go back to work", "Kaam par wapas jana"), q("Sleep well", "Achhi neend lena")],
  },
};
const INTAKE_DONE: ChatPrompt = { title: { en: "All done. Press the green button to check what I noted", ru: "Sab ho gaya. Maine jo note kiya wo dekhne ke liye hare button ko dabayein" }, example: { en: "", ru: "" }, quick: [] };

export function intakePrompt(draft: IntakeDraft): ChatPrompt {
  const focus = nextFocus(draft);
  return (focus && INTAKE[focus]) || INTAKE_DONE;
}

/* ───────────── the recovery check-in ───────────── */
const YES_NO = (yes: Quick, no: Quick): Quick[] => [yes, no];
const CHECKIN: Record<CheckinStep, ChatPrompt> = {
  pain: { title: { en: "How strong is your pain now? Tap a number", ru: "Abhi aap ka dard kitna tez hai? Ek number dabayein" }, example: { en: "0 = no pain, 10 = the worst pain", ru: "0 = dard nahi, 10 = sab se zyada dard" }, quick: numbers(0, 10) },
  signs: {
    title: { en: "Safety question: did you have any of these? Tap one, or tap No", ru: "Safety sawal: kya inmein se kuch hua? Ek dabayein, ya Nahi dabayein" },
    example: { en: "Tap the one that happened. If none of them happened, tap No.", ru: "Jo hua wo dabayein. Agar koi nahi hua to Nahi dabayein." },
    quick: [{ ...q("No, none of these", "Nahi, koi nahi", { en: "No", ru: "Nahi" }), tone: "good" }, ...FEEDBACK_FLAGS.map((f): Quick => ({ label: f.label, send: f.label, tone: "bad" }))],
  },
  response: {
    title: { en: "Compared with before, are your symptoms better, the same or worse? Tap one", ru: "Pehle ke muqable mein takleef behtar, wesi hi ya zyada hai? Ek dabayein" },
    example: { en: "For example: a little better than yesterday", ru: "Misal: kal se thori behtar" },
    quick: [{ ...q("Better", "Behtar"), tone: "good" }, { ...q("The same", "Waise hi", { en: "About the same", ru: "Waise hi hai" }), tone: "mid" }, { ...q("Worse", "Zyada kharab"), tone: "bad" }],
  },
  function: { title: { en: "How hard are your daily activities? Tap a number", ru: "Rozmarra kaam kitne mushkil hain? Ek number dabayein" }, example: { en: "0 = no difficulty, 10 = I cannot do them", ru: "0 = koi mushkil nahi, 10 = main kar hi nahi sakta/sakti" }, quick: numbers(0, 10) },
  new_symptoms: {
    title: { en: "Any new symptoms since the session? Tap one", ru: "Session ke baad koi nayi alamat? Ek dabayein" },
    example: { en: "For example: swelling or a new pain somewhere", ru: "Misal: soojan ya kahin naya dard" },
    quick: YES_NO(q("Yes, something new", "Haan, kuch naya", { en: "Yes", ru: "Haan" }), q("No, nothing new", "Nahi, kuch naya nahi", { en: "No", ru: "Nahi" })),
  },
  note: { title: { en: "Anything else for your physiotherapist? Write it, or tap", ru: "Physiotherapist ke liye kuch aur? Likhein, ya dabayein" }, example: { en: "For example: it was hard to finish the last exercise", ru: "Misal: aakhri exercise poori karna mushkil tha" }, quick: [q("Nothing more", "Aur kuch nahi")] },
};
const CHECKIN_DONE: ChatPrompt = { title: { en: "All done. Check the form below and press Save", ru: "Sab ho gaya. Neeche form dekhein aur Save dabayein" }, example: { en: "", ru: "" }, quick: [] };

export function checkinPrompt(draft: CheckinDraft): ChatPrompt {
  const step = nextStep(draft);
  return step ? CHECKIN[step] : CHECKIN_DONE;
}

/* ───────────── the exercise coach ───────────── */
export const COACH_PROMPT: ChatPrompt = {
  title: { en: "Tap a question below, or write your own", ru: "Neeche se sawal dabayein, ya apna sawal likhein" },
  example: { en: "For example: how many times should I do this?", ru: "Misal: ye kitni baar karni hai?" },
  quick: [],
};
