import { hasUrduScript } from "../../pna-ai/language.ts";
import type { Lang } from "./intake-spec.ts";
import type { Turn } from "./prompts.ts";

/**
 * Which language the assistants answer in. A patient who writes Roman Urdu is answered in Roman Urdu, and a patient who writes English in
 * English, whatever the language switch of the page says: the switch is only the fallback when the message does not show a language
 * ("ok", "5", "thanks"), and then the language of the patient's earlier messages is kept so a conversation never flips by itself.
 *
 * Plain code (no model): the scripted answers, the safety messages, the next question and the checks on the model's reply all use it.
 * `Lang` is "en" (English) or "ru" (Roman Urdu, the way the site writes it).
 */

/** Roman Urdu words that are not English words. Words that are also English ("me", "main", "to", "he", "par", "per", "the", "do", "den", "so", "na") are left out on purpose. */
const URDU = new Set(
  (
    "hai hain hoon hun ho hoga hogi hoge tha thi thay raha rahi rahe rha rhi rhe nahi nahin nhi nai kya kia kaise kese kaisay kaisa kaisi kyun kyon kyu kab kahan kahaan kidhar kaun kon kaunsa konsa konsi kaunsi " +
    "kitna kitni kitne kitnay kitnee mujhe mujhay mujh mera meri mere mereko hum humein hamein hamara hamari aap ap aapka aapki aapke apna apni apne tum tumhara tumhari ka ki ke ko mein aur ya lekin magar bhi " +
    "bohat bahut bohot zyada zyadah thora thoda abhi phir pehle pehla baad sath saath kar karna karni karne karein karen karo karun karoon karta karti karte kiya kiye kijiye kijiyega dena dein dijiye lena lein jana jaana jaye jaaye " +
    "chahiye chahye chahta chahti sakta sakti sakte sakta hota hoti hote hotay hua hui hue gaya gayi gaye gayee liye wala wali wale yeh ye woh wo isko usko iska uska iski uski isliye isi usi kyunki kyunke agar toh " +
    "theek thik achha acha accha haan ji jee bilkul shukriya meherbani shayad aaj kal subah shaam raat dard dukh takleef kamar ghutna ghutne ghutnay gardan kandha kandhe kandhay haath hath paon taang tang sunn jalan " +
    "sooj soojan sujan chakkar kamzori dawai dawa ilaj ilaaj bimari masla mushkil asaan aasan zaroor zaroori baat batao batayein bataein bataiye samjhao samjhayein poochna poochon poochein puchna rukna ruk rukein aaram karwa " +
    "karwana milta milti milte lagta lagti lagte laga lagi aata aati aate aaya aayi aaye ata ati bahar andar upar neeche seedha ulta dono sirf bas lagbhag kuch koi sab sabhi har ab tak se saal mahine hafte din ghanta " +
    "nahi kyaa hy hn"
  ).split(/\s+/),
);

/** Common English words (function words). A word that is also Roman Urdu ("kar", "ka") is not in here. */
const ENGLISH = new Set(
  (
    "the a an are was were be been am i you she it we they my your his her our their this that these those and but if because of in on at for with from by about as not yes does did have has had can could will would should may might must " +
    "how what when where why who which many much more less very just also than then there here any some all each every again now today tomorrow yesterday please thanks thank hello hi ok okay really too still even only into out up down over under after before " +
    "while during between through off its them myself yourself nothing something anything everything"
  )
    .split(/\s+/)
    .filter(Boolean),
);

/** Short acknowledgements that say nothing about the language. */
const NEUTRAL = new Set("ok okay k yes no yeah yep nope thanks thank thx hmm hm hi hello please you sure maybe".split(/\s+/));

const wordsOf = (text: string) => text.toLowerCase().replace(/[’'`]/g, "").match(/[a-z]+/g) ?? [];

/**
 * The language a text is written in: "ru" for Roman Urdu or Urdu script, "en" for English, null when it does not show one (empty, numbers,
 * "ok", "thanks", a single unknown word). A message that mixes both (Pakistani speech does) counts as Roman Urdu when its Urdu words are at
 * least as many as its English function words.
 */
export function languageOf(text: string): Lang | null {
  if (hasUrduScript(text)) return "ru";
  const words = wordsOf(text);
  if (!words.length) return null;
  let ur = 0;
  let en = 0;
  let onlyNeutral = true;
  for (const word of words) {
    if (URDU.has(word)) ur++;
    else if (ENGLISH.has(word)) {
      en++;
      if (!NEUTRAL.has(word)) onlyNeutral = false;
    }
  }
  if (ur > 0 && ur >= en) return "ru";
  if (en > 0 && ur === 0) return onlyNeutral ? null : "en";
  return en > ur ? "en" : null;
}

/** The language to answer in: the language of this message, else of the patient's earlier messages (newest first), else the page's language switch. */
export function replyLanguage(text: string, history: Turn[], ui: Lang): Lang {
  const now = languageOf(text);
  if (now) return now;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== "patient") continue;
    const before = languageOf(history[i].text);
    if (before) return before;
  }
  return ui;
}

/**
 * Whether a model's reply is in the language asked for. Only a clear mismatch fails: a reply of at least five words that is English when Roman
 * Urdu was asked for (or the other way round), or Urdu script (the site shows Roman Urdu). Short replies and mixed ones pass.
 */
export function replyMatchesLanguage(reply: string, target: Lang): boolean {
  if (hasUrduScript(reply)) return false;
  const words = wordsOf(reply);
  if (words.length < 5) return true;
  const found = languageOf(reply);
  return found === null || found === target;
}

/** One extra line for the model, said in the same breath as the patient's message, because models follow the last instruction best. */
export const LANGUAGE_REMINDER: Record<Lang, string> = {
  en: "(Reply in English only.)",
  ru: "(Jawab sirf Roman Urdu mein dein: English letters mein bolchaal wali Urdu, jaise Pakistan mein log baat karte hain, aam English alfaaz ke saath. English mein jawab na dein.)",
};

/** The language rule in a model's instructions: the language of THIS reply is the language the patient writes in. */
export const languageRule = (lang: Lang): string =>
  lang === "ru"
    ? "Language of this reply: Roman Urdu. The patient writes Roman Urdu, so NEVER answer in English. Write natural, respectful, spoken Pakistani Roman Urdu (Urdu in English letters) with the common English words people mix in (physio, exercise, pain, reps), the way a kind person talks, not like a translation."
    : "Language of this reply: English, in clear, natural, spoken words. (If the patient writes Roman Urdu or Urdu script you will be told to answer in Roman Urdu instead.)";

/** The patient's message for the model, with the language reminder behind it. */
export const withLanguageReminder = (text: string, lang: Lang): string => `${text}\n\n${LANGUAGE_REMINDER[lang]}`;
