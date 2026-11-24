import type { Bi, ChoiceItem, Instrument } from "./types.ts";

/**
 * The catalogue of outcome measures a RehabVerse physiotherapist can choose from. Every entry says where it comes from, whether its wording may be given to
 * a patient yet, and what a change means. Roman Urdu is natural spoken Roman Urdu used as a help beside the official English wording (it is not a validated
 * translation; the language used is stored with each answer). Never edit the wording of a validated instrument casually: raise its version, so older answers
 * stay tied to the exact words they were given with.
 */
const bi = (en: string, ru: string): Bi => ({ en, ru });
const NPRS_ENDS = { minLabel: bi("0 = no pain", "0 = dard nahi"), maxLabel: bi("10 = worst pain you can imagine", "10 = sab se zyada dard jo aap soch sakein") };

export const GROC_OPTIONS: { value: number; label: Bi }[] = [
  { value: 7, label: bi("A very great deal better", "Bohat hi zyada behtar") },
  { value: 6, label: bi("A great deal better", "Kaafi zyada behtar") },
  { value: 5, label: bi("Quite a bit better", "Achha khaasa behtar") },
  { value: 4, label: bi("Moderately better", "Theek-thaak behtar") },
  { value: 3, label: bi("Somewhat better", "Kuch behtar") },
  { value: 2, label: bi("A little bit better", "Thora sa behtar") },
  { value: 1, label: bi("Almost the same, hardly any better at all", "Taqreeban waisa hi, bas zara sa behtar") },
  { value: 0, label: bi("No change", "Koi farq nahi") },
  { value: -1, label: bi("Almost the same, hardly any worse at all", "Taqreeban waisa hi, bas zara sa bura") },
  { value: -2, label: bi("A little bit worse", "Thora sa bura") },
  { value: -3, label: bi("Somewhat worse", "Kuch bura") },
  { value: -4, label: bi("Moderately worse", "Theek-thaak bura") },
  { value: -5, label: bi("Quite a bit worse", "Achha khaasa bura") },
  { value: -6, label: bi("A great deal worse", "Kaafi zyada bura") },
  { value: -7, label: bi("A very great deal worse", "Bohat hi zyada bura") },
];

/**
 * The 24 statements of the Roland-Morris Disability Questionnaire, compared word for word with the official English copy (rmdq.org PDF, 24 Nov 2026; see
 * scripts/fixtures/rmdq24-official-en.txt). One deliberate difference: statement 9 reads "than usual" where the official copy has the typo "then usual".
 */
const RMDQ_ITEMS: Bi[] = [
  bi("I stay at home most of the time because of my back.", "Meri kamar ki wajah se main zyada tar waqt ghar par rehta/rehti hoon."),
  bi("I change position frequently to try and get my back comfortable.", "Kamar ko aaram dene ke liye main baar baar position badalta/badalti hoon."),
  bi("I walk more slowly than usual because of my back.", "Kamar ki wajah se main aam se aahista chalta/chalti hoon."),
  bi("Because of my back I am not doing any of the jobs that I usually do around the house.", "Kamar ki wajah se main ghar ke woh kaam nahi kar raha/rahi jo aam tor par karta/karti hoon."),
  bi("Because of my back, I use a handrail to get upstairs.", "Kamar ki wajah se main seedhiyan chadhne ke liye railing ka sahara leta/leti hoon."),
  bi("Because of my back, I lie down to rest more often.", "Kamar ki wajah se main aaram ke liye zyada baar let-ta/let-ti hoon."),
  bi("Because of my back, I have to hold on to something to get out of an easy chair.", "Kamar ki wajah se aaram kursi se uthne ke liye mujhe kisi cheez ka sahara lena parta hai."),
  bi("Because of my back, I try to get other people to do things for me.", "Kamar ki wajah se main koshish karta/karti hoon ke doosre log mere kaam kar dein."),
  bi("I get dressed more slowly than usual because of my back.", "Kamar ki wajah se main kapray aam se aahista pehenta/pehenti hoon."),
  bi("I only stand for short periods of time because of my back.", "Kamar ki wajah se main sirf thori der ke liye khara hota/hoti hoon."),
  bi("Because of my back, I try not to bend or kneel down.", "Kamar ki wajah se main jhukne ya ghutnon ke bal baithne se bachta/bachti hoon."),
  bi("I find it difficult to get out of a chair because of my back.", "Kamar ki wajah se mujhe kursi se uthna mushkil lagta hai."),
  bi("My back is painful almost all the time.", "Meri kamar mein taqreeban hamesha dard rehta hai."),
  bi("I find it difficult to turn over in bed because of my back.", "Kamar ki wajah se mujhe bistar mein karwat badalna mushkil lagta hai."),
  bi("My appetite is not very good because of my back pain.", "Kamar ke dard ki wajah se meri bhook zyada achhi nahi hai."),
  bi("I have trouble putting on my socks (or stockings) because of the pain in my back.", "Kamar ke dard ki wajah se mujhe moze pehenne mein mushkil hoti hai."),
  bi("I only walk short distances because of my back.", "Kamar ki wajah se main sirf chhoti doori tak chalta/chalti hoon."),
  bi("I sleep less well because of my back.", "Kamar ki wajah se meri neend achhi nahi aati."),
  bi("Because of my back pain, I get dressed with help from someone else.", "Kamar ke dard ki wajah se main kisi ki madad se kapray pehenta/pehenti hoon."),
  bi("I sit down for most of the day because of my back.", "Kamar ki wajah se main din ka zyada hissa baitha rehta/rehti hoon."),
  bi("I avoid heavy jobs around the house because of my back.", "Kamar ki wajah se main ghar ke bhaari kaam se bachta/bachti hoon."),
  bi("Because of my back pain, I am more irritable and bad tempered with people than usual.", "Kamar ke dard ki wajah se main logon ke saath aam se zyada chirchira aur gusse wala ho gaya/gayi hoon."),
  bi("Because of my back, I go upstairs more slowly than usual.", "Kamar ki wajah se main seedhiyan aam se aahista chadhta/chadhti hoon."),
  bi("I stay in bed most of the time because of my back.", "Kamar ki wajah se main zyada tar waqt bistar mein rehta/rehti hoon."),
];

const AGREE: ChoiceItem["options"] = [
  { value: 0, label: bi("Disagree", "Ittefaq nahi") },
  { value: 1, label: bi("Agree", "Ittefaq hai") },
];

export const INSTRUMENTS: Instrument[] = [
  {
    id: "nprs",
    version: 1,
    short: "NPRS",
    name: bi("Numeric Pain Rating Scale (0–10)", "Dard ka 0–10 number (NPRS)"),
    purpose: bi("How strong the pain is now and over the last week. The simplest measure to follow, and the one every other result is read beside.", "Dard abhi aur pichle hafte kitna tez tha. Sab se aasaan measure, aur baaqi nataij isi ke saath parhe jaate hain."),
    kind: "patient_reported",
    regions: ["any"],
    form: {
      type: "numbers",
      primary: "avg7",
      better: "lower",
      items: [
        { id: "now", prompt: bi("How strong is your pain right now?", "Abhi aap ka dard kitna tez hai?"), min: 0, max: 10, ...NPRS_ENDS },
        { id: "avg7", prompt: bi("On average over the last week, how strong was your pain?", "Pichle hafte ka average dard kitna tez tha?"), min: 0, max: 10, ...NPRS_ENDS },
        { id: "worst7", prompt: bi("At its worst over the last week, how strong was your pain?", "Pichle hafte sab se zyada dard kitna tez tha?"), min: 0, max: 10, ...NPRS_ENDS },
        { id: "best7", prompt: bi("At its best over the last week, how strong was your pain?", "Pichle hafte sab se kam dard kitna tha?"), min: 0, max: 10, ...NPRS_ENDS },
      ],
    },
    atBaseline: true,
    status: "ready",
    statusNote: "Standard 0–10 scale with its usual end labels.",
    citation: "Farrar JT et al. Pain 2001;94:149-158; Dworkin RH et al. (IMMPACT) J Pain 2008;9:105-121; Childs JD et al. Spine 2005;30:1331-1334.",
    licence: "Free to use.",
    translation: "assist_not_validated",
  },
  {
    id: "psfs",
    version: 1,
    short: "PSFS",
    name: bi("Patient-Specific Functional Scale", "Patient-Specific Functional Scale (PSFS)"),
    purpose: bi("The patient names up to three activities that matter to them and rates each 0–10. It follows what the person actually cares about, whatever the region.", "Patient apne zaroori 3 kaam khud batata hai aur har ek ko 0–10 rate karta hai. Yeh dekhta hai ke patient ko asal mein kya zaroori hai, chahe region koi bhi ho."),
    kind: "patient_reported",
    regions: ["any"],
    form: {
      type: "psfs",
      minActivities: 1,
      maxActivities: 3,
      min: 0,
      max: 10,
      instruction: bi(
        "Please name up to 3 important activities that you are unable to do, or find difficult, because of your problem. Then rate how difficult each one is for you today.",
        "Apne masle ki wajah se jo zaroori kaam aap nahi kar paate ya mushkil se karte hain, un mein se 3 tak likhein. Phir har kaam ko aaj ke hisaab se rate karein.",
      ),
      minLabel: bi("0 = unable to do it", "0 = bilkul nahi kar sakta/sakti"),
      maxLabel: bi("10 = able to do it as well as before the problem", "10 = masle se pehle jaise kar sakta/sakti hoon"),
    },
    atBaseline: true,
    status: "ready",
    statusNote: "The activities are written at the start and asked again, in the same order, at every follow-up.",
    citation: "Stratford P et al. Physiother Can 1995;47:258-263; Abbott JH, Schmitt J. Phys Ther 2014;94:1-9 (minimal detectable change about 2 points on the average of three activities).",
    licence: "Free to use.",
    translation: "assist_not_validated",
  },
  {
    id: "groc",
    version: 1,
    short: "GROC",
    name: bi("Global Rating of Change (−7 to +7)", "Global Rating of Change (GROC, −7 se +7)"),
    purpose: bi("One question at follow-up: how the problem is now compared with the start, from a great deal worse to a great deal better. Quick, and patients understand it.", "Follow-up par ek sawal: shuru ke muqable mein masla ab kaisa hai, bohat bura se bohat behtar tak. Tez hai, aur patient aasani se samajhta hai."),
    kind: "patient_reported",
    regions: ["any"],
    form: { type: "change", prompt: bi("Compared with when you started treatment, how would you describe your problem now?", "Shuru ke muqable mein ab aap ka masla kaisa hai?"), options: GROC_OPTIONS },
    atBaseline: false,
    status: "ready",
    statusNote: "Asked at follow-up only; there is nothing to compare with at the start.",
    citation: "Jaeschke R, Singer J, Guyatt GH. Control Clin Trials 1989;10:407-415; Kamper SJ et al. J Man Manip Ther 2009;17:163-170.",
    licence: "Free to use.",
    translation: "assist_not_validated",
  },
  {
    id: "rmdq24",
    version: 1,
    short: "RMDQ-24",
    name: bi("Roland-Morris Disability Questionnaire (24 items)", "Roland-Morris Disability Questionnaire (24 sawal)"),
    purpose: bi("How much low back pain limits daily activities (0–24, tick the statements that apply today). The usual back-specific disability measure.", "Kamar ka dard rozmarra ke kaamon ko kitna rokta hai (0–24, jo statements aaj lagu hon unhein tick karein). Kamar ka sab se aam disability measure."),
    kind: "patient_reported",
    regions: ["lumbar"],
    form: {
      type: "checklist",
      instruction: bi(
        "When your back hurts, you may find it difficult to do some of the things you normally do. This list contains sentences that people have used to describe themselves when they have back pain. When you read them, you may find that some stand out because they describe you today. As you read the list, think of yourself today. When you read a sentence that describes you today, put a tick against it. If the sentence does not describe you, then leave the space blank and go on to the next one. Remember, only tick the sentence if you are sure it describes you today.",
        "Jab kamar dard karti hai to kuch aam kaam mushkil lag sakte hain. Is list mein woh jumle hain jo log kamar dard hone par apne aap ko bayan karne ke liye istemal karte hain. Parhte waqt aap ko lagega ke kuch jumle aaj ke din aap ko bayan karte hain. List parhte hue sirf aaj ke baare mein sochein. Jo jumla aaj aap ko bayan karta ho us par tick lagayein. Jo jumla aap ko bayan na kare use khali chor kar agle par jayein. Yaad rakhein: tick sirf tab lagayein jab aap ko yaqeen ho ke woh jumla aaj aap ko bayan karta hai.",
      ),
      items: RMDQ_ITEMS.map((text, index) => ({ id: `q${index + 1}`, text })),
    },
    atBaseline: true,
    status: "ready",
    statusNote: "The English wording, instruction and scoring were compared with the official copy from rmdq.org (24 Nov 2026): 24 statements in the original order, score = number ticked (0 to 24). One deliberate difference: statement 9 reads \"than usual\" (the official copy has the typo \"then usual\"). The Roman Urdu is a help, not a validated translation.",
    citation: "Roland M, Morris R. Spine 1983;8:141-144; Roland M, Fairbank J. Spine 2000;25:3115-3124.",
    licence: "Free to use. The official copy states that tick boxes may be added and that it may be adapted for online or telephone use (check the custodians' current statement before a published study).",
    translation: "assist_not_validated",
  },
  {
    id: "sbst",
    version: 1,
    short: "STarT Back",
    name: bi("STarT Back Screening Tool", "STarT Back Screening Tool"),
    purpose: bi("Nine questions that sort low back pain patients into low, medium or high risk of a poor outcome, to match the amount of care to the person.", "Nau sawal jo kamar ke dard ke patients ko low, medium ya high risk mein baantte hain, taake care ki miqdaar patient ke hisaab se ho."),
    kind: "patient_reported",
    regions: ["lumbar"],
    form: {
      type: "sbst",
      instruction: bi("Thinking about the last 2 weeks, tick your answer to these questions.", "Pichle 2 hafton ke baare mein soch kar in sawalon ke jawab chunein."),
      items: [
        { id: "q1", prompt: bi("My back pain has spread down my leg(s) at some time in the last 2 weeks.", "Pichle 2 hafton mein kisi waqt meri kamar ka dard meri taang(on) mein neeche tak gaya."), options: AGREE },
        { id: "q2", prompt: bi("I have had pain in the shoulder or neck at some time in the last 2 weeks.", "Pichle 2 hafton mein kisi waqt mujhe kandhe ya gardan mein dard raha."), options: AGREE },
        { id: "q3", prompt: bi("I have only walked short distances because of my back pain.", "Kamar ke dard ki wajah se main sirf chhoti doori tak chala/chali."), options: AGREE },
        { id: "q4", prompt: bi("In the last 2 weeks, I have dressed more slowly than usual because of back pain.", "Pichle 2 hafton mein kamar ke dard ki wajah se maine kapray aam se aahista pehene."), options: AGREE },
        { id: "q5", prompt: bi("It's not really safe for a person with a condition like mine to be physically active.", "Mere jaisi takleef wale insaan ke liye jismani tor par active rehna asal mein mehfooz nahi."), options: AGREE },
        { id: "q6", prompt: bi("Worrying thoughts have been going through my mind a lot of the time.", "Pareshan karne wale khayalat zyada tar waqt mere zehan mein chalte rahe."), options: AGREE },
        { id: "q7", prompt: bi("I feel that my back pain is terrible and it's never going to get any better.", "Mujhe lagta hai meri kamar ka dard bohat bura hai aur kabhi behtar nahi hoga."), options: AGREE },
        { id: "q8", prompt: bi("In general I have not enjoyed all the things I used to enjoy.", "Aam tor par mujhe un cheezon mein maza nahi aaya jin mein pehle aata tha."), options: AGREE },
        {
          id: "q9",
          prompt: bi("Overall, how bothersome has your back pain been in the last 2 weeks?", "Pichle 2 hafton mein kul mila kar kamar ke dard ne aap ko kitna tang kiya?"),
          options: [
            { value: 0, label: bi("Not at all", "Bilkul nahi") },
            { value: 1, label: bi("Slightly", "Zara sa") },
            { value: 2, label: bi("Moderately", "Darmiyana") },
            { value: 3, label: bi("Very much", "Bohat zyada") },
            { value: 4, label: bi("Extremely", "Intihai zyada") },
          ],
        },
      ],
    },
    atBaseline: true,
    status: "verify_wording",
    statusNote: "Free for researchers without permission (Keele University). The wording and the scoring rule must be compared with the official copy, and there is no Urdu version from Keele: the Roman Urdu is only a help.",
    citation: "Hill JC et al. Arthritis Rheum 2008;59:632-641.",
    licence: "Free for research; Keele asks to be contacted about translation and validation in a new language.",
    translation: "assist_not_validated",
  },
  {
    id: "neck_rom",
    version: 1,
    short: "Neck ROM",
    name: bi("Neck movement (degrees)", "Gardan ki harkat (degree)"),
    purpose: bi("Active neck movement measured by the physiotherapist with an inclinometer or CROM device. Use the same device and position every time.", "Gardan ki active harkat jo physiotherapist inclinometer ya CROM device se naapta hai. Har baar wohi device aur position rakhein."),
    kind: "clinician_measured",
    regions: ["cervical"],
    form: {
      type: "measures",
      protocol: bi("Seated, shoulders relaxed, same device and the same landmarks at every visit. Record the best of three attempts in degrees.", "Baith kar, kandhe dheele, har visit par wohi device aur wohi landmarks. Teen koshishon mein se behtareen degree likhein."),
      fields: [
        { id: "flexion", label: bi("Flexion", "Aage jhukna (flexion)"), unit: "°", min: 0, max: 100, decimals: 0, better: "higher" },
        { id: "extension", label: bi("Extension", "Peechay jhukna (extension)"), unit: "°", min: 0, max: 100, decimals: 0, better: "higher" },
        { id: "rotation_left", label: bi("Rotation left", "Left rotation"), unit: "°", min: 0, max: 120, decimals: 0, better: "higher" },
        { id: "rotation_right", label: bi("Rotation right", "Right rotation"), unit: "°", min: 0, max: 120, decimals: 0, better: "higher" },
        { id: "lateral_left", label: bi("Side bend left", "Left side jhukna"), unit: "°", min: 0, max: 80, decimals: 0, better: "higher" },
        { id: "lateral_right", label: bi("Side bend right", "Right side jhukna"), unit: "°", min: 0, max: 80, decimals: 0, better: "higher" },
      ],
    },
    atBaseline: true,
    status: "ready",
    statusNote: "Taken by the physiotherapist; no threshold is built in, so judge change clinically with the device's own error in mind.",
    citation: "Measurement record only; use a device and protocol with published reliability for the study.",
    licence: "Not applicable.",
    translation: "none",
  },
  {
    id: "neck_endurance",
    version: 1,
    short: "Neck endurance",
    name: bi("Deep neck flexor endurance (seconds)", "Gardan ke deep flexors ki endurance (seconds)"),
    purpose: bi("How long the deep neck flexors can hold a chin-tuck head lift. A measure of neck muscle endurance; follow it over time with the same method.", "Gardan ke deep flexors chin-tuck ke saath sar uthaye rakhne ko kitni der sambhaal sakte hain. Gardan ke muscles ki endurance; har baar wohi tareeqa rakh kar dekhein."),
    kind: "clinician_measured",
    regions: ["cervical"],
    form: {
      type: "measures",
      protocol: bi("Lying on the back, knees bent, chin tucked, head lifted slightly off the bed: time the hold until the head drops or the chin tuck is lost. Use one protocol at every visit and record it.", "Peeth ke bal, ghutne mure hue, chin tuck karke sar thora sa bistar se uthayein: jab sar gir jaye ya chin tuck toot jaye tab tak ka waqt naapein. Har visit par ek hi protocol rakhein aur likh lein."),
      fields: [{ id: "hold", label: bi("Hold time", "Hold ka waqt"), unit: "s", min: 0, max: 300, decimals: 0, better: "higher" }],
    },
    atBaseline: true,
    status: "ready",
    statusNote: "Taken by the physiotherapist; no threshold is built in.",
    citation: "Measurement record only; Harris KD et al. J Orthop Sports Phys Ther 2005;35:1-9 describes a published protocol.",
    licence: "Not applicable.",
    translation: "none",
  },
  {
    id: "back_function_tests",
    version: 1,
    short: "Back function tests",
    name: bi("Low back function tests", "Kamar ke function tests"),
    purpose: bi("Physiotherapist-measured tests for the low back: movement, back extensor endurance and sit-to-stand. Record only the ones you actually do.", "Kamar ke liye physiotherapist ke naape hue tests: harkat, back extensors ki endurance aur sit-to-stand. Sirf wohi likhein jo aap ne kiye."),
    kind: "clinician_measured",
    regions: ["lumbar"],
    form: {
      type: "measures",
      protocol: bi("Same method at every visit. Modified Schober: increase in distance from a 10 cm mark on standing flexion. Sorensen: time the unsupported trunk-extension hold. Five times sit-to-stand: time for five full stands from a standard chair, arms crossed.", "Har visit par wohi tareeqa. Modified Schober: 10 cm ke nishan se khare ho kar jhukne par fasla kitna barha. Sorensen: bina sahare trunk extension ka hold waqt. Five times sit-to-stand: standard kursi se baazu kaat kar paanch baar poora khare hone ka waqt."),
      fields: [
        { id: "schober", label: bi("Modified Schober (increase)", "Modified Schober (izafa)"), unit: "cm", min: 0, max: 10, decimals: 1, better: "higher" },
        { id: "finger_floor", label: bi("Finger-to-floor distance", "Ungliyon se farsh ka fasla"), unit: "cm", min: 0, max: 100, decimals: 0, better: "lower" },
        { id: "sorensen", label: bi("Sorensen hold", "Sorensen hold"), unit: "s", min: 0, max: 300, decimals: 0, better: "higher" },
        { id: "five_sts", label: bi("Five times sit-to-stand", "Five times sit-to-stand"), unit: "s", min: 0, max: 120, decimals: 1, better: "lower" },
        { id: "chair_stand_30", label: bi("30-second chair stand", "30 second chair stand"), unit: "reps", min: 0, max: 60, decimals: 0, better: "higher" },
        { id: "tug", label: bi("Timed Up and Go", "Timed Up and Go"), unit: "s", min: 0, max: 120, decimals: 1, better: "lower" },
      ],
    },
    atBaseline: true,
    status: "ready",
    statusNote: "Taken by the physiotherapist; no threshold is built in, so judge change clinically.",
    citation: "Measurement record only; use methods with published reliability for the study.",
    licence: "Not applicable.",
    translation: "none",
  },
  {
    id: "ndi",
    version: 0,
    short: "NDI",
    name: bi("Neck Disability Index", "Neck Disability Index (NDI)"),
    purpose: bi("The usual neck-specific disability questionnaire (10 sections). Not available yet: the author's permission is needed before its words may be used.", "Gardan ka sab se aam disability questionnaire (10 sections). Abhi available nahi: iske lafz istemal karne se pehle author ki permission chahiye."),
    kind: "patient_reported",
    regions: ["cervical"],
    form: { type: "checklist", instruction: bi("", ""), items: [] },
    atBaseline: true,
    status: "needs_permission",
    statusNote: "The test manual says all use is subject to permission from the author (Dr. Howard Vernon). No wording is stored here. Ask for permission (and for the approved Urdu version), then add the wording as version 1.",
    citation: "Vernon H, Mior S. J Manipulative Physiol Ther 1991;14:409-415.",
    licence: "Permission from the author required.",
    translation: "none",
  },
  {
    id: "odi",
    version: 0,
    short: "ODI",
    name: bi("Oswestry Disability Index (version 2.1a)", "Oswestry Disability Index (version 2.1a)"),
    purpose: bi("The usual low back disability questionnaire (10 sections). Not available yet: a licence from the Mapi Research Trust is needed first.", "Kamar ka aam disability questionnaire (10 sections). Abhi available nahi: pehle Mapi Research Trust se licence chahiye."),
    kind: "patient_reported",
    regions: ["lumbar"],
    form: { type: "checklist", instruction: bi("", ""), items: [] },
    atBaseline: true,
    status: "needs_licence",
    statusNote: "Version 2.1a is licensed through the Mapi Research Trust (reported as free for individual clinical practice and unfunded academic research: confirm the terms for this study). No wording is stored here.",
    citation: "Fairbank JC, Pynsent PB. Spine 2000;25:2940-2953.",
    licence: "Licence from Mapi Research Trust required.",
    translation: "none",
  },
];

export const INSTRUMENT_BY_ID: Record<string, Instrument> = Object.fromEntries(INSTRUMENTS.map((instrument) => [instrument.id, instrument]));

/** What a physiotherapist may give a patient or record right now. */
export const AVAILABLE_INSTRUMENTS = INSTRUMENTS.filter((instrument) => instrument.status === "ready");

export function instrumentFor(id: string, version?: number): Instrument | null {
  const found = INSTRUMENT_BY_ID[id];
  if (!found) return null;
  if (version !== undefined && found.version !== version) return null;
  return found;
}
