/**
 * Physio Nexus AI — safety screen. Runs before any search.
 * A person describing emergency warning signs is told to get urgent care first;
 * a learner asking about the same signs academically is taught instead.
 */
import { ACADEMIC, FIRST_PERSON } from "./language.ts";

export type SafetyLevel = "emergency" | "urgent" | "crisis";
export type SafetyAlert = {
  level: SafetyLevel;
  kind: "cauda-equina" | "stroke" | "cardiac" | "breathing" | "neck-vascular" | "fracture" | "serious-pathology" | "crisis";
  title: { en: string; ur: string };
  text: { en: string; ur: string };
};

type Rule = { kind: SafetyAlert["kind"]; level: SafetyLevel; test: (text: string) => boolean; alwaysPersonal?: boolean };

const any = (text: string, ...patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text));

const rules: Rule[] = [
  {
    kind: "crisis",
    level: "crisis",
    alwaysPersonal: true,
    test: (t) => any(t, /\b(suicid\w*|kill (myself|me)|end (my|this) life|want to die|self harm|hurt myself|khudkushi|khud kushi|jeena nahi|marna chahta|marna chahti|mar jana chahta|mar jana chahti)\b/),
  },
  {
    kind: "cauda-equina",
    level: "emergency",
    test: (t) =>
      any(
        t,
        // Saddle numbness on its own is enough.
        /\b(numb\w*|sunn\w*|no feeling|cant feel|can t feel)\b.*\b(saddle|groin|private|genital\w*|between (my |the )?legs|buttocks|anus|sitting area|beech)\b/,
        /\b(saddle|groin|private|genital\w*|between (my |the )?legs)\b.*\b(numb\w*|sunn\w*|no feeling)\b/,
        // Retention: cannot pass urine / start the stream.
        /\b(cant|can t|cannot|unable to|difficult\w*|trouble|not able to)\b.*\b(urinate|urinating|pee|peeing|pass urine|passing urine|pass water|start (the |my )?(urine|stream|urinating|peeing))\b/,
        /\b(peshab|pishab)\b.*\b(nahi (ho|aa|nikal) (raha|rahi)|ruk (gaya|gayi|gya)|band ho)\b/,
        // Loss of bladder/bowel control together with back, leg or numbness symptoms.
        /\b(lost control|no control|cant control|can t control|control nahi)\b.*\b(bladder|bowel|urine|stool|peshab|pakhana)\b.*\b(back|leg|legs|numb\w*|sciatica|kamar|taang|sunn)\b/,
        /\b(back|leg|legs|numb\w*|sciatica|kamar|taang|sunn)\b.*\b(lost control|no control|cant control|can t control|control nahi)\b.*\b(bladder|bowel|urine|stool|peshab|pakhana)\b/,
        /\bcauda equina\b/,
      ),
  },
  {
    kind: "stroke",
    level: "emergency",
    test: (t) =>
      any(
        t,
        /\b(face|munh|muh|chehra|chehre)\b.*\b(droop\w*|tera|tedha|terha|lataka|latak|jhuk|crooked|fallen)\b/,
        /\b(slurred|slurring|larkhar\w*|zaban (atak|larkhar)\w*)\b/,
        /\b(sudden\w*|achanak)\b.*\b(weak\w*|kamzori|numb\w*|sunn\w*|paralys\w*|cant move|can t move)\b.*\b(face|arm|one side|half|left side|right side|body|jism|chehra)\b/,
        /\b(sudden\w*|achanak)\b.*\b(face|arm|one side|half|left side|right side)\b.*\b(weak\w*|numb\w*|paralys\w*)\b/,
        /\b(sudden\w*|achanak)\b.*\b(loss of vision|vision loss|cant see|can t see|cant speak|can t speak|confus\w*)\b/,
        /\b(one side|aadha jism|aadhe jism|half (my |the )?body)\b.*\b(weak\w*|numb\w*|kamzor\w*|sunn\w*|paralys\w*)\b/,
      ),
  },
  {
    kind: "cardiac",
    level: "emergency",
    test: (t) =>
      any(
        t,
        /\b(chest|seena|seene|sina|chhati|chati)\b.*\b(pain|dard|pressure|tight\w*|heavy|bhari|squeez\w*|jakran)\b/,
        /\bheart attack\b/,
      ),
  },
  {
    kind: "breathing",
    level: "emergency",
    test: (t) =>
      any(
        t,
        /\b(cant|can t|cannot|unable to|struggling to|hard to|mushkil|nahi aa)\b.*\b(breath\w*|saans|sans)\b/,
        /\b(saans|sans)\b.*\b(nahi aa|ruk|band|bohat phool)\w*/,
        /\b(blue lips|choking|gasping)\b/,
      ),
  },
  {
    kind: "neck-vascular",
    level: "emergency",
    test: (t) =>
      any(
        t,
        /\b(after|ke baad|since)\b.*\b(manipulat\w*|crack\w*|adjust\w*|chiropract\w*|neck massage|gardan)\b.*\b(dizz\w*|chakkar|double vision|blurred vision|slurred|numb\w*|faint\w*|vomit\w*)\b/,
        /\b(worst headache|thunderclap|sudden severe headache)\b/,
      ),
  },
  {
    kind: "fracture",
    level: "urgent",
    test: (t) =>
      any(
        t,
        /\b(fall|fell|fallen|accident|hadsa|gir (gaya|gayi|gya|gai)|car crash|hit by)\b.*\b(cant|can t|cannot|unable|nahi)\b.*\b(walk|stand|bear weight|move|chal|khara|khari|utha)\w*/,
        /\b(bone|haddi)\b.*\b(sticking out|out of skin|bahar nikal)\b/,
        /\b(deformed|deformity|bent wrong)\b/,
      ),
  },
  {
    kind: "serious-pathology",
    level: "urgent",
    test: (t) =>
      any(
        t,
        /\b(fever|bukhar|bukhaar)\b.*\b(back|spine|neck|kamar|gardan|reerh)\b/,
        /\b(back|spine|neck|kamar|gardan)\b.*\b(fever|bukhar|bukhaar)\b/,
        /\b(weight loss|losing weight|wazan kam)\b.*\b(pain|dard|night|raat)\b/,
        /\b(history of cancer|cancer patient|had cancer|cancer tha|cancer hai)\b.*\b(pain|dard)\b/,
      ),
  },
];

const messages: Record<SafetyAlert["kind"], { title: { en: string; ur: string }; text: { en: string; ur: string } }> = {
  "cauda-equina": {
    title: { en: "This needs emergency care today", ur: "Is ke liye aaj hi emergency care chahiye" },
    text: {
      en: "Numbness around the saddle area or new trouble controlling your bladder or bowels can be signs of **cauda equina syndrome**, a nerve emergency. Please don't wait for physiotherapy: go to the nearest emergency department now, or call **Rescue 1122** or **Edhi 115**.",
      ur: "Saddle area (jahan baith-te hain) mein sunn-pan ya peshab/pakhane par control mein nayi mushkil **cauda equina syndrome** ki nishani ho sakti hai — yeh nerve ki emergency hai. Physiotherapy ka intezar na karein: abhi qareebi emergency department jayein, ya **Rescue 1122** ya **Edhi 115** par call karein.",
    },
  },
  stroke: {
    title: { en: "These can be stroke warning signs", ur: "Yeh stroke ki warning signs ho sakti hain" },
    text: {
      en: "Sudden face drooping, arm or leg weakness, numbness on one side or slurred speech need help **immediately** — every minute matters. Call **Rescue 1122** or **Edhi 115**, or go to the nearest emergency department now.",
      ur: "Achanak chehra latakna, bazu ya taang ki kamzori, ek taraf sunn-pan ya zaban larkharana — **foran** madad chahiye, har minute ahem hai. **Rescue 1122** ya **Edhi 115** par call karein, ya abhi qareebi emergency department jayein.",
    },
  },
  cardiac: {
    title: { en: "Chest pain needs urgent medical care", ur: "Seene ke dard ke liye foran medical care chahiye" },
    text: {
      en: "Chest pain, pressure or tightness can be a heart problem. Please stop any activity and get emergency help now: call **Rescue 1122** or **Edhi 115**, or go to the nearest emergency department.",
      ur: "Seene mein dard, dabao ya jakran dil ka masla ho sakta hai. Har activity rok dein aur abhi emergency madad lein: **Rescue 1122** ya **Edhi 115** par call karein, ya qareebi emergency department jayein.",
    },
  },
  breathing: {
    title: { en: "Breathing difficulty is an emergency", ur: "Saans mein mushkil emergency hai" },
    text: {
      en: "If you are struggling to breathe, please get emergency help now: call **Rescue 1122** or **Edhi 115**, or go to the nearest emergency department.",
      ur: "Agar saans lene mein mushkil ho rahi hai to abhi emergency madad lein: **Rescue 1122** ya **Edhi 115** par call karein, ya qareebi emergency department jayein.",
    },
  },
  "neck-vascular": {
    title: { en: "Stop and get urgent medical help", ur: "Ruk jayein aur foran medical madad lein" },
    text: {
      en: "Dizziness, double vision, slurred speech, numbness or a sudden severe headache — especially after neck manipulation — can signal a blood-vessel problem. Don't continue any neck treatment; go to the nearest emergency department or call **Rescue 1122** / **Edhi 115**.",
      ur: "Chakkar, do do nazar aana, zaban larkharana, sunn-pan ya achanak shadeed sar dard — khaas tor par gardan ki manipulation ke baad — blood vessel ke masle ki nishani ho sakta hai. Gardan ka koi treatment jaari na rakhein; qareebi emergency department jayein ya **Rescue 1122** / **Edhi 115** par call karein.",
    },
  },
  fracture: {
    title: { en: "Please get checked for a fracture first", ur: "Pehle fracture ke liye check karwayein" },
    text: {
      en: "After a fall or accident, not being able to walk, stand or move the limb — or a visibly deformed limb — needs a medical assessment and possibly an X-ray **before** physiotherapy. Please visit an emergency department or doctor today.",
      ur: "Girne ya hadse ke baad chal, khare ho ya limb hila na sakna — ya limb ka shape bigra hua nazar aana — physiotherapy se **pehle** medical assessment aur shayad X-ray mangta hai. Aaj hi emergency department ya doctor ke paas jayein.",
    },
  },
  "serious-pathology": {
    title: { en: "Please see a doctor before physiotherapy", ur: "Physiotherapy se pehle doctor ko dikhayein" },
    text: {
      en: "Pain together with fever, unexplained weight loss, constant night pain or a past history of cancer needs a **doctor's assessment within a day or two** to rule out serious causes — or the emergency department today if you feel very unwell. Once you're cleared, PNA can help with rehabilitation.",
      ur: "Dard ke saath bukhar, be-wajah wazan kam hona, raat ka musalsal dard ya cancer ki purani history ho to serious wajahon ko rule out karne ke liye **ek do din mein doctor ko dikhayein** — ya agar tabiyat bohat kharab ho to aaj hi emergency department jayein. Doctor ke clear karne ke baad PNA rehabilitation mein madad kar sakta hai.",
    },
  },
  crisis: {
    title: { en: "You don't have to go through this alone", ur: "Aap akele nahi hain" },
    text: {
      en: "I'm really sorry you're feeling this way. If you might act on these thoughts or are in danger, please call **Rescue 1122** or **Edhi 115** now, or go to the nearest emergency department. Please also reach out today to someone you trust or a mental-health professional.",
      ur: "Mujhe afsos hai ke aap aisa mehsoos kar rahe hain. Agar aap in khayalaat par amal kar sakte hain ya khatre mein hain to abhi **Rescue 1122** ya **Edhi 115** par call karein, ya qareebi emergency department jayein. Aaj hi kisi bharosemand shakhs ya mental-health professional se zaroor baat karein.",
    },
  },
};

/** Returns an alert only when the message describes a live problem, not a study question. */
export function screenForSafety(normalizedText: string): SafetyAlert | null {
  const academic = ACADEMIC.test(normalizedText) && !FIRST_PERSON.test(normalizedText);
  for (const rule of rules) {
    if (!rule.test(normalizedText)) continue;
    if (academic && !rule.alwaysPersonal) return null;
    return { level: rule.level, kind: rule.kind, ...messages[rule.kind] };
  }
  return null;
}
