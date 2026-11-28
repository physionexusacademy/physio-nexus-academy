/**
 * Virtual Patient — the Treatment stage: what the student can choose, how the PNA Teacher performs it on the 3D patient, and how the
 * choice is judged for each case. Pure data and logic (no three.js): the 3D side is lib/virtual-patient/treatment-props.ts and the
 * stage (lib/avatar/stage.ts) that already plays the PNA Teacher's demonstrations.
 *
 * Every treatment is performed as the clinic would: explain and gain consent, check the skin and sensation where it matters, position,
 * apply with the stated dose, monitor, finish and reassess. Wording is PNA's own (English, with natural Roman Urdu). Doses follow
 * common clinical practice and are teaching examples, not a prescription for a real patient.
 */
import type { PatientPosition, Pose, Side } from "./engine";
import type { BuiltChoreo, BuiltStep, Line } from "../avatar/choreo/built";
import type { TreatArea } from "./treat-points";

export type Bi = { en: string; ur: string };
export type TreatGroup = "manual" | "electro" | "thermal" | "education" | "refer";
export type PropKind = "hotpack" | "icepack" | "tens" | "ift" | "nmes" | "ultrasound";
const B = (en: string, ur: string): Bi => ({ en, ur });

/* ------------------------------------------------------------------ */
/* Areas                                                               */
/* ------------------------------------------------------------------ */

type V3 = [number, number, number];
export type AreaInfo = {
  name: Bi;
  /** How the patient lies or sits for treatment of this area. */
  position: PatientPosition;
  /** The patient's pose for it (the tested side). */
  pose?: (side: Side) => Pose;
  /** Where the teacher stands (a point of lib/skills/points3d.ts) and which way his palm presses (patient frame). */
  at: string;
  palm: V3;
  /** Along the body or limb, for strokes and finger direction (patient frame). */
  along: V3;
};

const k = (joint: string, side: Side) => `${joint}.${side}` as keyof Pose;
const armOut = (s: Side): Pose => ({ [k("shoulder", s)]: { abd: 25 }, [k("elbow", s)]: { flex: 10 } } as Pose);
/** Supine with a small towel roll under the knee (relaxed, slightly bent), as for heat, ice or electrotherapy around the knee. */
const kneeRoll = (s: Side): Pose => ({ [k("hip", s)]: { flex: 10 }, [k("knee", s)]: { flex: 20 }, [k("ankle", s)]: { flex: -8 } } as Pose);

export const AREAS: Record<TreatArea, AreaInfo> = {
  lumbar: { name: B("lower back", "lower back (kamar)"), position: "prone", at: "spine05", palm: [0, 0, 1], along: [0, 1, 0] },
  thoracic: { name: B("upper back", "upper back"), position: "prone", at: "spine02", palm: [0, 0, 1], along: [0, 1, 0] },
  cervical: { name: B("back of the neck", "gardan ka pichla hissa"), position: "sitting", at: "neck01", palm: [0, 0, 1], along: [0, 1, 0] },
  shoulder: { name: B("shoulder", "shoulder (kandha)"), position: "supine", pose: armOut, at: "upperarm01", palm: [-1, 0, 0], along: [0, 1, 0] },
  "elbow-lateral": { name: B("outer elbow", "elbow ki bahar wali side"), position: "supine", pose: armOut, at: "lowerarm01", palm: [-1, 0, 0], along: [0, -1, 0] },
  "elbow-medial": { name: B("inner elbow", "elbow ki andar wali side"), position: "supine", pose: (s) => ({ [k("shoulder", s)]: { abd: 40, rot: -30 }, [k("elbow", s)]: { flex: 20 } } as Pose), at: "lowerarm01", palm: [1, 0, 0], along: [0, -1, 0] },
  wrist: { name: B("front of the wrist", "kalai ka agla hissa"), position: "supine", pose: armOut, at: "wrist", palm: [0, 0, -1], along: [0, -1, 0] },
  "forearm-dorsal": { name: B("back of the forearm", "forearm ka pichla hissa"), position: "supine", pose: armOut, at: "lowerarm02", palm: [-1, 0, 0.4], along: [0, -1, 0] },
  hip: { name: B("outer hip", "hip ki bahar wali side"), position: "sidelying", at: "upperleg01", palm: [-1, 0, 0], along: [0, 1, 0] },
  thigh: { name: B("front of the thigh", "thigh ka agla hissa"), position: "supine", pose: kneeRoll, at: "upperleg02", palm: [0, 0, -1], along: [0, 1, 0] },
  knee: { name: B("knee", "ghutna"), position: "supine", pose: kneeRoll, at: "lowerleg01", palm: [0, 0, -1], along: [0, 1, 0] },
  "fibular-head": { name: B("outer side below the knee", "ghutne ke neeche bahar wali side"), position: "supine", at: "lowerleg01", palm: [-1, 0, 0], along: [0, 1, 0] },
  shin: { name: B("front of the shin", "pindli ka agla hissa"), position: "supine", pose: kneeRoll, at: "lowerleg02", palm: [0, 0, -1], along: [0, 1, 0] },
  calf: { name: B("calf", "pindli"), position: "prone", at: "lowerleg01", palm: [0, 0, 1], along: [0, 1, 0] },
  achilles: { name: B("Achilles tendon", "Achilles tendon"), position: "prone", at: "foot", palm: [0, 0, 1], along: [0, 1, 0] },
  ankle: { name: B("outer ankle", "takhne ki bahar wali side"), position: "supine", at: "foot", palm: [-1, 0, -0.5], along: [0, 1, 0] },
  heel: { name: B("heel", "aedi"), position: "prone", at: "foot", palm: [0, 1, 0], along: [0, 0, 1] },
};

/* ------------------------------------------------------------------ */
/* The treatments                                                      */
/* ------------------------------------------------------------------ */

export type Treatment = {
  id: string;
  group: TreatGroup;
  name: Bi;
  /** One line: what it is and why it is used. */
  what: Bi;
  /** The dose used here. */
  dose: Bi;
  /** Applied to the case's treatment area (a modality), or a fixed technique for one area. */
  area?: TreatArea;
  /** Body regions whose cases offer this technique (generic modalities and education are always offered). */
  regions?: string[];
  prop?: PropKind;
};

export const TREATMENTS: Treatment[] = [
  /* -------- heat and cold -------- */
  { id: "hot-pack", group: "thermal", name: B("Hot pack (moist heat)", "Hot pack (garam sinkai)"), prop: "hotpack",
    what: B("A hydrocollator pack in towel layers: relaxes muscle, eases stiffness and chronic pain.", "Towel mein lapeta hydrocollator pack: muscle ko relax karta hai, stiffness aur purane pain mein araam deta hai."),
    dose: B("15–20 minutes, 6–8 towel layers, skin checked at 5 minutes.", "15–20 minute, 6–8 towel layers, 5 minute par skin check.") },
  { id: "ice-pack", group: "thermal", name: B("Ice pack (cryotherapy)", "Ice pack (thanda sinkai)"), prop: "icepack",
    what: B("A cold pack in a damp towel: eases pain and swelling after a recent injury.", "Geele towel mein cold pack: naye injury ke baad pain aur sujan kam karta hai."),
    dose: B("10–15 minutes in a damp towel, every 2–3 hours in the first days; never directly on skin.", "Geele towel mein 10–15 minute, pehle dinon mein har 2–3 ghante; kabhi seedha skin par nahi.") },
  /* -------- electrotherapy -------- */
  { id: "tens", group: "electro", name: B("TENS (pain relief)", "TENS (pain relief ke liye)"), prop: "tens",
    what: B("Small electrical pulses through skin pads that block pain signals (gate control).", "Skin pads ke zariye halki electric pulses jo pain signals ko block karti hain (gate control)."),
    dose: B("Conventional: 80–120 Hz, 50–200 µs, strong but comfortable tingling, 20–30 minutes.", "Conventional: 80–120 Hz, 50–200 µs, tez magar comfortable jhunjhunahat, 20–30 minute.") },
  { id: "ift", group: "electro", name: B("Interferential therapy (IFT)", "Interferential therapy (IFT)"), prop: "ift",
    what: B("Two medium-frequency currents cross in the tissue to give a deeper, comfortable stimulation for pain.", "Do medium-frequency currents tissue ke andar cross hoti hain, gehri aur comfortable stimulation pain ke liye."),
    dose: B("4-pole, 4 kHz carrier, beat 80–120 Hz (sweep 80–150), 15–20 minutes.", "4-pole, 4 kHz carrier, beat 80–120 Hz (sweep 80–150), 15–20 minute.") },
  { id: "ultrasound", group: "electro", name: B("Therapeutic ultrasound", "Therapeutic ultrasound"), prop: "ultrasound",
    what: B("Sound waves through a gel; evidence for pain relief is weak, so it is never the main treatment.", "Gel ke zariye sound waves; pain relief ke liye evidence kamzor hai, is liye yeh kabhi main treatment nahi."),
    dose: B("Pulsed 20%, 1 MHz deep or 3 MHz superficial, 0.5–1 W/cm², 5 minutes, head kept moving.", "Pulsed 20%, gehre tissue ke liye 1 MHz ya upar wale ke liye 3 MHz, 0.5–1 W/cm², 5 minute, head musalsal harkat mein.") },
  { id: "nmes", group: "electro", name: B("NMES (muscle stimulation)", "NMES (muscle stimulation)"), prop: "nmes",
    what: B("Electrical stimulation that makes a weak muscle contract, used with active effort.", "Electric stimulation jo kamzor muscle ko contract karwati hai, patient ki apni koshish ke saath."),
    dose: B("35–50 Hz, 250–400 µs, 10 s on / 30–50 s off, 10–15 strong contractions.", "35–50 Hz, 250–400 µs, 10 sec on / 30–50 sec off, 10–15 mazboot contractions.") },
  /* -------- manual therapy -------- */
  { id: "massage", group: "manual", name: B("Soft tissue massage", "Soft tissue massage"),
    what: B("Slow, firm strokes over tight, sore muscle to ease pain and guarding.", "Sakht aur dard wale muscle par dheere, mazboot strokes, pain aur guarding kam karne ke liye."),
    dose: B("5–8 minutes, pressure the patient rates as comfortable.", "5–8 minute, utna pressure jitna patient comfortable bataye.") },
  { id: "lumbar-pa", group: "manual", area: "lumbar", regions: ["Lumbar spine"], name: B("Lumbar central PA mobilisation (Maitland)", "Lumbar central PA mobilisation (Maitland)"),
    what: B("Rhythmic pressure on the spinous process to reduce pain and stiffness in the lower back.", "Spinous process par rhythmic pressure, kamar ke pain aur stiffness ke liye."),
    dose: B("Grade III–IV, 3 sets of 30–60 seconds, reassess between sets.", "Grade III–IV, 30–60 second ke 3 sets, har set ke baad reassess.") },
  { id: "thoracic-pa", group: "manual", area: "thoracic", regions: ["Cervical spine", "Shoulder"], name: B("Thoracic central PA mobilisation", "Thoracic central PA mobilisation"),
    what: B("Mobilising the stiff upper back eases neck and shoulder pain.", "Sakht upper back ko mobilise karna gardan aur kandhe ke pain mein madad karta hai."),
    dose: B("Grade III, 3 sets of 30–60 seconds.", "Grade III, 30–60 second ke 3 sets.") },
  { id: "sciatic-slider", group: "manual", area: "calf", regions: ["Lumbar spine"], name: B("Sciatic nerve slider (passive)", "Sciatic nerve slider (passive)"),
    what: B("The nerve is moved gently through its path without stretching it: calms nerve-related leg pain.", "Nerve ko bina khinche uske raaste mein aahista move kiya jata hai: nerve wale leg pain ko calm karta hai."),
    dose: B("10–15 slow, pain-free cycles, 2–3 sets.", "10–15 aahista, pain-free cycles, 2–3 sets.") },
  { id: "cervical-lateral-glide", group: "manual", area: "cervical", regions: ["Cervical spine"], name: B("Cervical lateral glide (Elvey)", "Cervical lateral glide (Elvey)"),
    what: B("A gentle side glide of the neck away from the painful arm: eases nerve-root arm pain.", "Gardan ko dard wale baazu se door aahista side glide: nerve root wale arm pain ko kam karta hai."),
    dose: B("Grade II–III, 3 sets of 30–60 seconds, stop if arm symptoms spread.", "Grade II–III, 30–60 second ke 3 sets, arm symptoms phailein to rok dein.") },
  { id: "shoulder-posterior-glide", group: "manual", area: "shoulder", regions: ["Shoulder"], name: B("Glenohumeral posterior glide", "Glenohumeral posterior glide"),
    what: B("The humeral head is glided backwards to restore internal rotation and flexion.", "Humeral head ko peeche glide kiya jata hai taake internal rotation aur flexion wapas aaye."),
    dose: B("Grade III–IV, 3 sets of 30–60 seconds.", "Grade III–IV, 30–60 second ke 3 sets.") },
  { id: "shoulder-inferior-glide", group: "manual", area: "shoulder", regions: ["Shoulder"], name: B("Glenohumeral inferior glide", "Glenohumeral inferior glide"),
    what: B("The humeral head is glided downwards to stretch the stiff lower capsule and help abduction.", "Humeral head ko neeche glide kiya jata hai taake sakht lower capsule stretch ho aur abduction behtar ho."),
    dose: B("Grade III–IV within pain tolerance, 3–5 sets of 30–60 seconds.", "Pain tolerance ke andar Grade III–IV, 30–60 second ke 3–5 sets.") },
  { id: "elbow-mwm", group: "manual", area: "elbow-lateral", regions: ["Elbow & hand"], name: B("Elbow lateral glide MWM (Mulligan)", "Elbow lateral glide MWM (Mulligan)"),
    what: B("A sustained lateral glide of the forearm while the patient grips: pain-free grip on the spot.", "Patient grip kare to forearm par lateral glide hold: usi waqt pain-free grip."),
    dose: B("6–10 pain-free grips, 3 sets.", "6–10 pain-free grips, 3 sets.") },
  { id: "patellar-mobilisation", group: "manual", area: "knee", regions: ["Knee"], name: B("Patellar mobilisation", "Patellar mobilisation"),
    what: B("Gliding the kneecap up, down and sideways frees a stiff knee after injury or surgery.", "Kneecap ko upar, neeche aur side mein glide karna chot ya surgery ke baad sakht ghutne ko khol deta hai."),
    dose: B("Grade II–III, 2–3 sets of 30 seconds in each direction.", "Grade II–III, har direction mein 30 second ke 2–3 sets.") },
  { id: "knee-flexion-mob", group: "manual", area: "knee", regions: ["Knee"], name: B("Knee flexion mobilisation", "Knee flexion mobilisation"),
    what: B("Rhythmic movement into the stiff end of knee bend to restore flexion.", "Ghutne ke mor ke sakht aakhri hisse mein rhythmic harkat, flexion wapas laane ke liye."),
    dose: B("Grade III, 3 sets of 30–60 seconds, within the surgeon's limits.", "Grade III, 30–60 second ke 3 sets, surgeon ki limit ke andar.") },
  { id: "talocrural-glide", group: "manual", area: "ankle", regions: ["Ankle"], name: B("Talocrural posterior glide", "Talocrural posterior glide"),
    what: B("Gliding the talus backwards restores ankle dorsiflexion after a sprain.", "Talus ko peeche glide karna sprain ke baad ankle dorsiflexion wapas laata hai."),
    dose: B("Grade I–II early for pain, III–IV later for stiffness; 3 sets of 30 seconds.", "Shuru mein pain ke liye Grade I–II, baad mein stiffness ke liye III–IV; 30 second ke 3 sets.") },
  { id: "hip-distraction", group: "manual", area: "hip", regions: ["Hip"], name: B("Hip long-axis distraction", "Hip long-axis distraction"),
    what: B("A gentle pull along the leg eases hip joint pain and stiffness.", "Taang ki lambai mein halki khinchai hip joint ke pain aur stiffness ko kam karti hai."),
    dose: B("Grade III, 3–5 sets of 30–60 seconds.", "Grade III, 30–60 second ke 3–5 sets.") },
  { id: "plantar-release", group: "manual", area: "heel", regions: ["Ankle"], name: B("Plantar fascia and calf soft tissue release", "Plantar fascia aur calf soft tissue release"),
    what: B("Firm strokes along the sole and calf with the toes pulled back eases morning heel pain.", "Pairon ki ungliyan peeche khinch kar talwe aur calf par mazboot strokes, subah ke aedi ke pain mein araam."),
    dose: B("5 minutes, followed by the calf and plantar fascia stretch.", "5 minute, phir calf aur plantar fascia stretch.") },
  /* -------- education and referral -------- */
  { id: "education", group: "education", name: B("Education and advice", "Samjhana aur mashwara"),
    what: B("Explain the problem, what to expect, what to do and what to avoid; agree goals.", "Masla samjhana, kya umeed rakhein, kya karein aur kis se bachein; goals tay karna."),
    dose: B("Every visit, in plain words, checked by asking the patient to repeat it back.", "Har visit par, aasan alfaaz mein, patient se dohra kar check karna.") },
  { id: "refer", group: "refer", name: B("Urgent referral (stop treatment)", "Fori referral (treatment rok dein)"),
    what: B("Stop, explain, and arrange urgent medical assessment when a red flag is present.", "Red flag ho to rok dein, samjhayein aur fori medical assessment ka intezam karein."),
    dose: B("Same day or emergency, with a written handover of your findings.", "Usi din ya emergency mein, apni findings ki likhi hui handover ke saath.") },
];
export const treatment = (id: string) => TREATMENTS.find((t) => t.id === id);

/* ------------------------------------------------------------------ */
/* Each case's plan                                                    */
/* ------------------------------------------------------------------ */

export type TreatPlan = {
  /** Where modalities and massage go, and the side. */
  area: TreatArea;
  side: Side;
  /** The treatments that belong in this visit (the stage is complete when all are done, with the exercises). */
  best: string[];
  /** Reasonable additions. */
  ok?: string[];
  /** Unsafe or clearly wrong here, with the reason the PNA Teacher gives when he refuses. */
  avoid?: Record<string, Bi>;
  /** RehabVerse exercise ids: the right home programme (at least two are performed). Empty for red-flag cases. */
  exercises: string[];
  /** Exercises that would be wrong (with the reason). */
  avoidExercises?: Record<string, Bi>;
  /** What he tells the patient (education), or why he refers. */
  advice: Bi[];
};

const NO_TREAT = (why: Bi): Record<string, Bi> =>
  Object.fromEntries(TREATMENTS.filter((t) => t.group !== "refer" && t.group !== "education").map((t) => [t.id, why]));

export const PLANS: Record<string, TreatPlan> = {
  "lumbar-l5": {
    area: "lumbar", side: "left", best: ["education", "sciatic-slider"], ok: ["lumbar-pa", "tens", "hot-pack", "ift", "massage"],
    avoid: { "ice-pack": B("Ice over the back does nothing for a three-week nerve-root problem and he dislikes cold; heat is the better comfort choice.", "Teen hafte purane nerve root masle mein kamar par ice faida nahi deti; comfort ke liye heat behtar hai.") },
    exercises: ["knee-rock", "glute-bridge", "supine-marching", "knee-to-chest"],
    avoidExercises: { "supine-hamstring-stretch": B("A strong hamstring stretch tensions the irritable L5 root; use the nerve slider instead.", "Zor ka hamstring stretch irritated L5 root ko khinchta hai; is ki jagah nerve slider karein.") },
    advice: [B("This is a nerve root irritated by a disc. Most settle over 6–12 weeks with activity — bed rest slows recovery.", "Yeh disc se irritated nerve root hai. Aksar 6–12 hafton mein activity ke saath theek ho jata hai — bed rest recovery ko dheema karta hai."),
      B("Break up bike riding every 30–40 minutes, and come back at once if the foot gets weaker or the bladder changes.", "Bike riding ko har 30–40 minute baad break karein, aur foot zyada kamzor ho ya urine mein tabdeeli aaye to fauran aayein.")],
  },
  "cauda-equina": {
    area: "lumbar", side: "left", best: ["refer"], exercises: [],
    avoid: NO_TREAT(B("Cauda equina syndrome is a surgical emergency: any treatment here only delays the MRI and decompression.", "Cauda equina syndrome surgical emergency hai: yahan koi bhi treatment sirf MRI aur surgery ko late karta hai.")),
    advice: [B("Your bladder and saddle numbness mean the nerves at the bottom of the spine may be squashed. You need an MRI and a spinal surgeon today — I am arranging it now.", "Aap ke bladder aur saddle numbness ka matlab hai ke reerh ki haddi ke neeche nerves dab rahi ho sakti hain. Aaj hi MRI aur spinal surgeon chahiye — main abhi intezam kar raha hoon.")],
  },
  "c6-radiculopathy": {
    area: "cervical", side: "right", best: ["education", "cervical-lateral-glide"], ok: ["thoracic-pa", "tens", "hot-pack", "massage", "ift"],
    exercises: ["chin-tuck", "supine-nod", "shoulder-blade-squeeze", "neck-rotation"],
    avoidExercises: { "upper-trapezius-stretch": B("A strong side stretch away from the right closes nothing, but pulling the neck to the left tensions the right C6 root — keep to gentle movement first.", "Zor ka side stretch right C6 root ko khinch sakta hai — pehle halki harkat rakhein.") },
    advice: [B("A nerve in your neck is irritated where it leaves the spine. It usually settles in weeks to months with activity and posture changes.", "Aap ki gardan ki ek nerve wahan irritate hai jahan woh reerh se nikalti hai. Aam taur par activity aur posture badalne se hafton se mahinon mein theek ho jati hai."),
      B("Raise your screen to eye level, take a movement break every 30 minutes, and tell me at once if your grip or arm gets weaker.", "Screen aankh ke level par rakhein, har 30 minute break lein, aur grip ya arm kamzor ho to fauran batayein.")],
  },
  "carpal-tunnel": {
    area: "wrist", side: "right", best: ["education"], ok: ["ultrasound"],
    avoid: { "hot-pack": B("Heat can increase swelling in the carpal tunnel and worsen the tingling.", "Heat carpal tunnel mein sujan barha kar tingling ko zyada kar sakti hai."), "massage": B("Deep pressure over the carpal tunnel compresses the median nerve further.", "Carpal tunnel par gehra pressure median nerve ko aur dabata hai.") },
    exercises: ["median-nerve-glide", "tendon-glides", "wrist-flexion-extension"],
    advice: [B("The median nerve is squeezed at the wrist. Wear a night splint with the wrist straight for 6 weeks — bending it at night is what wakes you.", "Median nerve kalai par dab rahi hai. 6 hafte raat ko kalai seedhi rakhne wala splint pehnein — raat ko kalai mur jana hi aap ko jagata hai."),
      B("Break up gripping tasks; if the thumb muscles weaken or the numbness becomes constant, you need nerve tests.", "Grip wale kaam mein break lein; agar thumb ke muscles kamzor hon ya numbness har waqt rahe to nerve tests zaroori hain.")],
  },
  "fibular-palsy": {
    area: "fibular-head", side: "right", best: ["education"], ok: ["nmes"],
    avoid: { "ice-pack": B("Cold over the fibular head can injure the superficial common fibular nerve — the very nerve that is already weak.", "Fibular head par thanda superficial common fibular nerve ko nuqsan de sakta hai — wahi nerve jo pehle se kamzor hai."), "hot-pack": B("His sensation on the leg is reduced: heat over numb skin risks a burn.", "Taang par sensation kam hai: sun skin par heat se jalne ka khatra hai.") },
    exercises: ["ankle-pumps", "toe-raise", "ankle-eversion-band", "single-leg-stance"],
    advice: [B("The nerve at the side of your knee was pressed. Don't cross your legs or squat for long; it usually recovers over weeks to months.", "Ghutne ki side wali nerve dab gayi thi. Taangein cross na karein, der tak ukroon na baithein; aam taur par hafton se mahinon mein theek ho jati hai."),
      B("An ankle-foot orthosis stops the foot catching and you from tripping. If there is no recovery in 6–12 weeks you need nerve studies.", "Ankle-foot orthosis paon ko atakne aur girne se bachata hai. 6–12 hafton mein behtari na ho to nerve studies chahiye.")],
  },
  "rotator-cuff-tear": {
    area: "shoulder", side: "right", best: ["education", "refer"], ok: ["tens", "hot-pack", "ice-pack"],
    avoid: { "shoulder-inferior-glide": B("Forceful capsular mobilisation is not the answer to a fresh traumatic tear; it needs imaging and a surgical opinion first.", "Taaza traumatic tear mein zor ka capsular mobilisation hal nahi; pehle imaging aur surgeon ki raaye."), "shoulder-posterior-glide": B("Mobilising a freshly torn cuff before imaging risks extending the tear.", "Imaging se pehle taaza tear wale cuff ko mobilise karna tear ko barha sakta hai.") },
    exercises: ["codman-pendulum", "wand-flexion"],
    avoidExercises: { "scaption-full-can": B("Loaded raising before the surgical opinion strains the torn tendon.", "Surgeon ki raaye se pehle wazan ke saath baazu uthana phate tendon par zor dalta hai."), "lateral-raise": B("Loaded abduction strains a torn supraspinatus.", "Wazan ke saath abduction phate supraspinatus par zor dalta hai.") },
    advice: [B("After your fall the tendon on top of the shoulder is probably torn. A traumatic tear does best with an early surgical opinion, so I am referring you for imaging within weeks.", "Girne ke baad kandhe ke upar wala tendon shayad phat gaya hai. Traumatic tear mein jaldi surgeon ki raaye behtar hai, is liye main hafton ke andar imaging ke liye refer kar raha hoon."),
      B("Until then: gentle swinging and assisted movement to stop stiffness, ice or heat for comfort, no lifting.", "Tab tak: halka jhulana aur madad se harkat taake sakhti na aaye, comfort ke liye ice ya heat, wazan bilkul nahi.")],
  },
  "frozen-shoulder": {
    area: "shoulder", side: "left", best: ["education", "shoulder-inferior-glide"], ok: ["shoulder-posterior-glide", "hot-pack", "tens", "ift"],
    exercises: ["codman-pendulum", "wand-flexion", "cross-body-shoulder-stretch", "sidelying-external-rotation"],
    advice: [B("Frozen shoulder goes through a painful, a stiff and a thawing phase over 1–3 years. It does get better.", "Frozen shoulder 1–3 saal mein painful, stiff aur thawing phase se guzarta hai. Yeh theek hota hai."),
      B("Stretch only to a mild, short-lasting ache; with your diabetes, keep your sugar well controlled. An injection can help in the painful phase.", "Sirf halke aur jaldi khatam hone wale dard tak stretch karein; diabetes ki wajah se sugar control mein rakhein. Painful phase mein injection madad kar sakta hai.")],
  },
  "acl-tear": {
    area: "knee", side: "right", best: ["education", "ice-pack"], ok: ["patellar-mobilisation", "nmes", "tens"],
    avoid: { "hot-pack": B("The knee is acutely swollen: heat increases bleeding and swelling in the first days.", "Ghutna abhi sooja hua hai: pehle dinon mein heat bleeding aur sujan ko barhati hai."), "knee-flexion-mob": B("Forcing flexion into an acutely swollen, unstable knee aggravates it; restore extension and settle swelling first.", "Taaza sooje aur unstable ghutne mein zor se mor dena takleef barhata hai; pehle extension wapas aur sujan kam."), "massage": B("Massage over an acute haemarthrosis is not helpful and may increase bleeding.", "Taaza haemarthrosis par massage faida nahi deta aur bleeding barha sakta hai.") },
    exercises: ["quad-set", "heel-slide", "straight-leg-raise", "ankle-pumps"],
    avoidExercises: { "mini-squat": B("Not yet: the knee is too swollen and unstable for loaded squatting.", "Abhi nahi: ghutna wazan ke saath squat ke liye bohat sooja aur unstable hai."), "step-up": B("Too early: it needs quadriceps control and a settled knee first.", "Bohat jaldi: pehle quadriceps control aur settled ghutna chahiye.") },
    advice: [B("The pop, the fast swelling and the positive Lachman test point to a torn ACL. First we protect the knee, settle the swelling and get it straight again.", "Pop ki awaz, tez sujan aur positive Lachman test ACL tear ki taraf ishara karte hain. Pehle ghutne ko protect karein, sujan kam karein aur seedha karein."),
      B("I am referring you to sports orthopaedics to decide between surgery and structured rehab; crutches until you walk without a limp.", "Surgery ya structured rehab ka faisla karne ke liye sports orthopaedics refer kar raha hoon; jab tak bina langrahe na chalein crutches.")],
  },
  "knee-oa": {
    area: "knee", side: "right", best: ["education"], ok: ["hot-pack", "tens", "patellar-mobilisation", "ift", "knee-flexion-mob"],
    exercises: ["quad-set", "straight-leg-raise", "sit-to-stand", "mini-squat", "step-up"],
    advice: [B("Knee osteoarthritis is common and exercise is the best treatment we have — it reduces pain as well as a painkiller, without the side effects.", "Ghutne ka osteoarthritis aam hai aur exercise sab se behtar ilaaj hai — painkiller jitna pain kam karti hai, side effects ke baghair."),
      B("Walk most days, build up slowly; a little pain during exercise is acceptable if it settles by the next morning.", "Zyada tar din walk karein, aahista barhayein; exercise ke dauran thora pain theek hai agar agli subah tak khatam ho jaye.")],
  },
  "ankle-sprain": {
    area: "ankle", side: "left", best: ["education", "ice-pack"], ok: ["talocrural-glide", "tens"],
    avoid: { "hot-pack": B("A fresh sprain: heat increases swelling in the first 48–72 hours.", "Taaza sprain: pehle 48–72 ghante heat sujan barhati hai."), "ultrasound": B("No useful evidence for ultrasound in an acute sprain; time is better spent on loading and balance.", "Taaza sprain mein ultrasound ka faida ka saboot nahi; waqt loading aur balance par lagayein."), "massage": B("Deep massage on a fresh ligament injury increases swelling.", "Taaza ligament injury par gehra massage sujan barhata hai.") },
    exercises: ["ankle-pumps", "ankle-circles", "single-leg-stance", "double-heel-raise"],
    advice: [B("You have sprained the outer ankle ligament (ATFL). PEACE first: protect, elevate, avoid anti-inflammatories for 2–3 days, compress, educate.", "Aap ne takhne ka bahar wala ligament (ATFL) moch kar liya hai. Pehle PEACE: protect, elevate, 2–3 din anti-inflammatories se parhez, compress, educate."),
      B("Then LOVE: load it as pain allows, stay optimistic, keep fit, exercise — balance training cuts the chance of spraining it again.", "Phir LOVE: pain ke hisaab se wazan, optimism, fitness, exercise — balance training dobara moch ka khatra kam karti hai.")],
  },
  stroke: {
    area: "shoulder", side: "left", best: ["education"], ok: ["nmes", "massage"],
    avoid: { "hot-pack": B("Sensation on his left side is reduced after the stroke: heat over numb skin can burn.", "Stroke ke baad left side par sensation kam hai: sun skin par heat jala sakti hai."), "ice-pack": B("Impaired sensation and circulation: cold can injure the skin unnoticed.", "Sensation aur circulation kamzor: thanda bina pata chale skin ko nuqsan de sakta hai.") },
    exercises: ["sit-to-stand", "marching", "seated-knee-extension", "single-leg-stance"],
    advice: [B("Practice the tasks you want back — standing up, walking, using the hand — many times a day; repetition rewires the brain.", "Jo kaam wapas chahiye — uthna, chalna, haath istemal — din mein bohat baar practice karein; dohrana dimagh ko dobara jorta hai."),
      B("Check your blood pressure before exercise; support the weak arm so the shoulder does not hang and become painful.", "Exercise se pehle BP check karein; kamzor baazu ko sahara dein taake kandha latak kar dard na kare.")],
  },
  myelopathy: {
    area: "cervical", side: "left", best: ["refer"], exercises: [],
    avoid: { ...NO_TREAT(B("Cord compression needs an urgent spinal surgical opinion; treating the neck now only delays it.", "Spinal cord dabne par fori spinal surgeon ki raaye chahiye; abhi gardan ka ilaaj sirf der karta hai.")), "cervical-lateral-glide": B("Never mobilise or manipulate the neck with signs of cord compression.", "Spinal cord dabne ki alamat ho to gardan ko kabhi mobilise ya manipulate na karein.") },
    advice: [B("The clumsy hands, the unsteady walk and the brisk reflexes suggest the spinal cord is being squeezed in your neck. You need an MRI and a spinal surgeon urgently.", "Haathon ki bedhangi, larkharati chaal aur tez reflexes batate hain ke gardan mein spinal cord dab rahi hai. Fori MRI aur spinal surgeon chahiye.")],
  },
  "radial-nerve-palsy": {
    area: "forearm-dorsal", side: "right", best: ["education"], ok: ["nmes"],
    avoid: { "hot-pack": B("Sensation on the back of the hand is reduced: risk of a burn.", "Haath ki pusht par sensation kam hai: jalne ka khatra."), "ice-pack": B("Cold over a compressed nerve and numb skin risks injury.", "Dabi hui nerve aur sun skin par thanda nuqsan de sakta hai.") },
    exercises: ["wrist-flexion-extension", "tendon-glides", "grip-squeeze"],
    advice: [B("The radial nerve was pressed in the upper arm while you slept. A cock-up splint holds the wrist up so the hand works while the nerve recovers.", "Sote waqt upper arm mein radial nerve dab gayi. Cock-up splint kalai ko upar rakhta hai taake nerve theek hone tak haath kaam kare."),
      B("Keep all the joints moving every day; most recover in weeks to months — nerve studies if not by 6–12 weeks.", "Har din saare joints hilate rahein; aksar hafton se mahinon mein theek ho jata hai — 6–12 hafte tak na ho to nerve studies.")],
  },
  "ulnar-neuropathy-elbow": {
    area: "elbow-medial", side: "left", best: ["education"], ok: ["tens"],
    avoid: { "massage": B("Pressure over the cubital tunnel compresses the ulnar nerve further.", "Cubital tunnel par pressure ulnar nerve ko aur dabata hai."), "ice-pack": B("Cold over the superficial ulnar nerve at the elbow can aggravate it.", "Elbow par superficial ulnar nerve par thanda takleef barha sakta hai.") },
    exercises: ["tendon-glides", "grip-squeeze", "wrist-flexion-extension"],
    advice: [B("The ulnar nerve is irritated at the elbow. Avoid long periods with the elbow bent and don't lean on it; a padded towel around the elbow at night keeps it straighter.", "Ulnar nerve elbow par irritate hai. Der tak elbow mor kar na rakhein aur us par tek na lagayein; raat ko elbow par towel lapetne se woh seedha rehta hai."),
      B("If the hand muscles waste or weakness progresses, you need nerve studies and a surgical opinion.", "Haath ke muscles patle hon ya kamzori barhe to nerve studies aur surgeon ki raaye chahiye.")],
  },
  "diabetic-neuropathy": {
    area: "calf", side: "left", best: ["education"], ok: [],
    avoid: { "hot-pack": B("Diabetic neuropathy: he cannot feel heat properly — a hot pack on the legs is a classic burn.", "Diabetic neuropathy: garmi theek se mehsoos nahi hoti — taangon par hot pack se jalna aam hai."), "ice-pack": B("Neuropathy and poor circulation: cold risks unnoticed skin injury.", "Neuropathy aur kamzor circulation: thanda bina pata chale skin ko nuqsan de sakta hai."), "tens": B("Absent sensation means he cannot judge the intensity safely; it also does nothing for falls.", "Sensation na hone se intensity safely judge nahi ho sakti; aur girne ke masle mein yeh kuch nahi karta.") },
    exercises: ["single-leg-stance", "tandem-stance", "sit-to-stand", "double-heel-raise", "marching"],
    advice: [B("The nerves in your feet are damaged by diabetes, so your balance relies on your eyes — that is why you fall in the dark.", "Diabetes se pairon ki nerves kharab hain, is liye balance aankhon par chalta hai — isi liye andhere mein girte hain."),
      B("Balance and strength exercises, a night-light, good shoes, check your feet every day and see your doctor about sugar control.", "Balance aur strength exercises, night-light, achay jootay, roz pairon ko check karein aur sugar control ke liye doctor se milein.")],
  },
  "guillain-barre": {
    area: "thigh", side: "left", best: ["refer"], exercises: [],
    avoid: NO_TREAT(B("Ascending weakness with breathlessness: this is a medical emergency — breathing must be monitored in hospital now.", "Upar ki taraf barhti kamzori aur saans ki takleef: medical emergency — hospital mein saans ki monitoring abhi zaroori.")),
    advice: [B("The weakness spreading up both sides with lost reflexes after your infection, and your breathing, mean Guillain–Barré syndrome is likely. You need hospital care now — I am calling for help.", "Infection ke baad dono taraf upar barhti kamzori, reflexes ka khatam hona aur saans — Guillain–Barré syndrome ho sakta hai. Abhi hospital chahiye — main madad bula raha hoon.")],
  },
  "lumbar-stenosis": {
    area: "lumbar", side: "left", best: ["education"], ok: ["lumbar-pa", "hot-pack", "tens", "massage"],
    exercises: ["knee-to-chest", "knee-rock", "glute-bridge", "sit-to-stand"],
    avoidExercises: { "prone-on-elbows": B("Extension narrows the spinal canal and brings on his leg symptoms; flexion-based work is better.", "Extension spinal canal ko tang karti hai aur taangon ki takleef laati hai; flexion wali exercise behtar.") },
    advice: [B("The space for the nerves in your lower back is narrowed. Bending forward opens it — that is why leaning on a trolley helps.", "Kamar mein nerves ki jagah tang ho gayi hai. Aage jhukne se khulti hai — isi liye trolley par tek lagane se araam milta hai."),
      B("Walk daily with planned rests before the legs get heavy, and try cycling; tell me if bladder or strength change.", "Roz walk karein, taangein bhaari hone se pehle rest; cycling try karein; bladder ya taqat mein tabdeeli ho to batayein.")],
  },
  "achilles-rupture": {
    area: "achilles", side: "right", best: ["refer", "education"], exercises: [],
    avoid: { ...NO_TREAT(B("An acute Achilles rupture needs orthopaedic care and a boot with the foot pointed down — not modalities.", "Taaza Achilles rupture ko orthopaedic care aur paon neeche wala boot chahiye — modalities nahi.")), "plantar-release": B("Stretching or massaging a ruptured Achilles can widen the gap.", "Phate Achilles ko stretch ya massage karne se gap barh sakta hai.") },
    advice: [B("The tendon at the back of your ankle has torn. You need an orthopaedic assessment this week and a boot or cast with the foot pointed down — no stretching or walking on it bare.", "Takhne ke peeche wala tendon phat gaya hai. Isi hafte orthopaedic assessment aur paon neeche wala boot ya cast chahiye — stretch ya bina support chalna bilkul nahi.")],
  },
  "dvt-post-op": {
    area: "calf", side: "right", best: ["refer"], exercises: [],
    avoid: { ...NO_TREAT(B("Suspected DVT: massage, heat, electrical stimulation and exercise could dislodge a clot. Stop and arrange same-day medical assessment.", "DVT ka shak: massage, heat, electric stimulation aur exercise clot ko hila sakte hain. Rok dein aur usi din medical assessment."))},
    advice: [B("Your swollen, warm, tender calf after surgery and a long journey could be a blood clot. We stop treatment and you need a doctor's assessment and scan today; call emergency services if you get chest pain or breathlessness.", "Surgery aur lambe safar ke baad sooji, garam aur dard wali pindli blood clot ho sakti hai. Treatment rok rahe hain, aaj hi doctor aur scan; seene mein dard ya saans phoole to emergency call karein.")],
  },
  "lateral-elbow": {
    area: "elbow-lateral", side: "right", best: ["education", "elbow-mwm"], ok: ["tens", "massage", "ultrasound"],
    exercises: ["eccentric-wrist-extension", "grip-squeeze", "wrist-extensor-stretch", "forearm-rotation"],
    advice: [B("Tennis elbow is a tendon that has been overloaded; it recovers with the right load over 3–6 months. More steroid injections weaken it long term.", "Tennis elbow overload hua tendon hai; sahi load ke saath 3–6 mahine mein theek hota hai. Zyada steroid injections lambe arse mein ise kamzor karte hain."),
      B("Lift with the palm up for now, and do the wrist-extensor loading daily — mild pain up to 3 out of 10 is fine.", "Abhi palm upar rakh kar uthayein, aur roz wrist-extensor loading karein — 10 mein 3 tak halka pain theek hai.")],
  },
  "plantar-heel-pain": {
    area: "heel", side: "right", best: ["education", "plantar-release"], ok: ["ice-pack", "ultrasound", "massage"],
    exercises: ["supine-calf-stretch", "double-heel-raise", "towel-scrunch", "single-heel-raise"],
    advice: [B("The thick band under your foot is overloaded where it attaches to the heel. Most people improve over 3–6 months.", "Paon ke neeche wala mota band aedi par overload hai. Aksar log 3–6 mahine mein behtar hote hain."),
      B("Stretch the calf and sole before the first steps in the morning, wear supportive shoes, and build up standing and walking gradually.", "Subah pehla qadam rakhne se pehle calf aur talwe ka stretch, supportive jootay, aur khare hone aur chalne ko aahista barhayein.")],
  },
  "hip-oa": {
    area: "hip", side: "right", best: ["education", "hip-distraction"], ok: ["hot-pack", "massage", "tens"],
    exercises: ["clamshell", "glute-bridge", "sit-to-stand", "standing-hip-abduction", "sidelying-hip-abduction"],
    advice: [B("Hip osteoarthritis responds well to strength and range exercise, activity and weight management.", "Hip osteoarthritis strength aur range exercise, activity aur weight control se achi tarah behtar hota hai."),
      B("If you need a stick, hold it in the LEFT hand; a little ache with exercise is fine if it settles by the next day.", "Chhari chahiye to LEFT haath mein pakrein; exercise ke saath halka dard theek hai agar agle din tak khatam ho jaye.")],
  },
  "tkr-stiff-knee": {
    area: "knee", side: "right", best: ["education", "knee-flexion-mob", "ice-pack"], ok: ["patellar-mobilisation", "nmes", "tens"],
    avoid: { "hot-pack": B("A fresh surgical knee that is still warm and swollen: heat adds to the swelling; use ice after exercise.", "Taaza surgery wala garam aur sooja ghutna: heat sujan barhati hai; exercise ke baad ice lagayein."), "ultrasound": B("Ultrasound over a fresh wound and metal implant is not indicated.", "Taaza zakhm aur metal implant par ultrasound ka koi jawaz nahi.") },
    exercises: ["heel-slide", "quad-set", "straight-leg-raise", "short-arc-quad", "ankle-pumps"],
    advice: [B("Bend and straighten the knee little and often — 5 minutes every hour beats an hour once a day. Aim for full straightening and 90 degrees of bend by two weeks.", "Ghutne ko thora thora aur baar baar mor-seedha karein — har ghante 5 minute din mein ek ghante se behtar. Do hafte tak poora seedha aur 90 degree mor ka target."),
      B("Take your painkiller 30–45 minutes before exercise, elevate the leg, and tell the surgical team if the bend does not improve.", "Exercise se 30–45 minute pehle painkiller lein, taang upar rakhein, aur mor behtar na ho to surgical team ko batayein.")],
  },
  "copd-exacerbation": {
    area: "thoracic", side: "left", best: ["refer"], exercises: [],
    avoid: NO_TREAT(B("Breathless at rest with low oxygen, fever and confusion: he is not safe for treatment — urgent medical care.", "Aaram mein saans phoolna, kam oxygen, bukhar aur confusion: treatment safe nahi — fori medical care.")),
    advice: [B("Your breathing, oxygen level and the new confusion mean your chest has flared up badly. Sit upright; I am getting urgent medical help now. Oxygen only as prescribed.", "Aap ki saans, oxygen level aur nayi confusion ka matlab hai ke chest ki takleef bohat barh gayi hai. Seedhe baithein; main abhi fori medical madad bula raha hoon. Oxygen sirf prescription ke mutabiq.")],
  },
  "hip-fracture-fall": {
    area: "hip", side: "right", best: ["refer"], exercises: [],
    avoid: NO_TREAT(B("A suspected hip fracture: do not move or treat the leg; keep her still and arrange hospital transfer.", "Hip fracture ka shak: taang ko hilayein ya treat na karein; unhein seedha letayein aur hospital transfer karein.")),
    advice: [B("The way your leg lies and the pain in your groin after the fall suggest a broken hip. Keep still — I am arranging an ambulance to hospital for an X-ray.", "Girne ke baad taang ka is tarah parhna aur groin mein dard tooti hip ki taraf ishara hai. Hilein nahi — main hospital ke liye ambulance ka intezam kar raha hoon.")],
  },
};

/* ------------------------------------------------------------------ */
/* Which options the student sees                                      */
/* ------------------------------------------------------------------ */

/** Treatments offered for a case: all modalities and education/referral, plus the manual techniques of its region and of the case plan. */
export function offeredTreatments(caseArea: string, plan: TreatPlan): Treatment[] {
  const named = new Set([...plan.best, ...(plan.ok ?? []), ...Object.keys(plan.avoid ?? {})]);
  return TREATMENTS.filter((t) => t.group !== "manual" || !t.regions || t.regions.includes(caseArea) || named.has(t.id));
}

export type Verdict = "best" | "ok" | "avoid" | "unneeded";
export function verdict(plan: TreatPlan, id: string): Verdict {
  if (plan.avoid?.[id]) return "avoid";
  if (plan.best.includes(id)) return "best";
  if (plan.ok?.includes(id)) return "ok";
  return "unneeded";
}
export function exerciseVerdict(plan: TreatPlan, id: string): Verdict {
  if (plan.avoidExercises?.[id]) return "avoid";
  if (plan.exercises.includes(id)) return "best";
  return "unneeded";
}
/** At least two of the plan's exercises (or all of them when it has fewer). */
export const exercisesNeeded = (plan: TreatPlan) => Math.min(2, plan.exercises.length);

export function treatmentComplete(plan: TreatPlan, done: string[], exercisesDone: string[]) {
  const best = plan.best.every((id) => done.includes(id));
  const ex = exercisesDone.filter((id) => plan.exercises.includes(id)).length >= exercisesNeeded(plan);
  return best && ex;
}

export type TreatScore = { total: number; detail: string[]; passed: boolean };
/** Treatment score: the plan's treatments (50), its exercises (30), safety (20, lost for every unsafe choice). */
export function scoreTreatment(plan: TreatPlan, done: string[], exercisesDone: string[], refused: string[]): TreatScore {
  const detail: string[] = [];
  const bestHit = plan.best.filter((id) => done.includes(id));
  for (const id of plan.best) detail.push(`${done.includes(id) ? "✓" : "✗"} ${treatment(id)?.name.en ?? id}`);
  const okHit = (plan.ok ?? []).filter((id) => done.includes(id));
  for (const id of okHit) detail.push(`✓ ${treatment(id)?.name.en ?? id} (reasonable addition)`);
  const unneeded = done.filter((id) => verdict(plan, id) === "unneeded");
  for (const id of unneeded) detail.push(`✗ ${treatment(id)?.name.en ?? id} — not indicated for this patient`);
  const exHit = exercisesDone.filter((id) => plan.exercises.includes(id));
  const need = exercisesNeeded(plan);
  if (need) detail.push(`${exHit.length >= need ? "✓" : "✗"} Home exercises: ${exHit.length} of at least ${need} from the right programme`);
  for (const id of refused) detail.push(`✗ Unsafe choice stopped: ${treatment(id)?.name.en ?? id}`);
  const treatPart = plan.best.length ? (bestHit.length / plan.best.length) * 50 : 50;
  const exPart = need ? (Math.min(need, exHit.length) / need) * 30 : 30;
  const safety = Math.max(0, 20 - refused.length * 10);
  let total = Math.round(treatPart + exPart + safety - unneeded.length * 5);
  // Treating a red-flag patient instead of referring is the critical error.
  if (plan.best.includes("refer") && !done.includes("refer")) total = Math.min(total, 30);
  total = Math.max(0, Math.min(100, total));
  return { total, detail, passed: total >= 70 && refused.length === 0 };
}

/* ------------------------------------------------------------------ */
/* Choreography: how the PNA Teacher performs a treatment              */
/* ------------------------------------------------------------------ */

const line = (b: Bi): Line => ({ en: b.en, ur: b.ur, src: "vp-treatment" });

/** The steps, and which props are on the patient during each step. */
export type TreatShow = { choreo: BuiltChoreo; props: (PropKind | null)[]; timer: (string | null)[] };

export type StepIn = Partial<Omit<BuiltStep, "say">> & { say: Bi[]; prop?: PropKind | null; timer?: string };

export function show(t: Treatment, area: TreatArea, side: Side, position: PatientPosition, patient: Pose, steps: StepIn[]): TreatShow {
  // Contact and glide directions are written for the tested side (x = its outside); the stage reads them in the patient's frame (x = his left).
  const sx = (v: V3): V3 => [side === "left" ? v[0] : -v[0], v[1], v[2]];
  const built: BuiltStep[] = steps.map(({ say, prop: _p, timer: _t, ...rest }) => {
    const step = { chip: rest.chip ?? "", say: say.map(line), overlays: [], notes: [], ...rest } as BuiltStep;
    if (step.contacts) step.contacts = step.contacts.map((c) => ({ ...c, palm: sx(c.palm as V3), fingers: sx(c.fingers as V3) }));
    if (step.move) step.move = { ...step.move, dir: sx(step.move.dir as V3) };
    return step;
  });
  return {
    choreo: {
      kind: "technique",
      slug: `vp-${t.id}`,
      title: t.name,
      side,
      position,
      patient,
      enter: { away: 1.2, towardFeet: 0.6 },
      review: { status: "draft" },
      lessonTitle: t.name.en,
      steps: built,
    },
    props: steps.map((s) => s.prop ?? null),
    timer: steps.map((s) => s.timer ?? null),
  };
}

/** What the therapist asks before a treatment, so the patient moves into position as in a real clinic. */
export function positionCue(position: PatientPosition, side: Side, area?: TreatArea): Bi {
  const other = side === "left" ? B("right", "right") : B("left", "left");
  switch (position) {
    case "prone":
      return area === "calf" || area === "achilles" || area === "heel"
        ? B("Please lie face down on the plinth, your feet just over the end and your arms by your sides.", "Plinth par ulta (pait ke bal) let jayein, paon kinare se zara bahar aur baazu side par.")
        : B("Please lie face down on the plinth with a pillow under your tummy, arms relaxed by your sides.", "Plinth par ulta (pait ke bal) let jayein, pait ke neeche takiya, baazu araam se side par.");
    case "supine":
      return area === "knee" || area === "thigh" || area === "shin"
        ? B("Please lie on your back, head on the pillow; a small towel roll goes under your knee.", "Peeth ke bal let jayein, sar takiye par; ghutne ke neeche chhota towel roll.")
        : B("Please lie on your back with your head on the pillow and relax.", "Peeth ke bal let jayein, sar takiye par, aur dheele ho jayein.");
    case "sidelying":
      return B(`Please lie on your ${other.en} side, knees slightly bent, a pillow between them.`, `Apni ${other.ur} side par let jayein, ghutne zara mure hue, beech mein takiya.`);
    case "sitting":
      return B("Please sit on the edge of the plinth, back upright and feet resting.", "Plinth ke kinare par baith jayein, kamar seedhi aur paon araam se.");
    default:
      return B("Please stand up and face me.", "Khare ho jayein aur meri taraf munh karein.");
  }
}

export const P = (id: string) => `key:tx-${id}`;
/** A finger direction at right angles to the palm. */
export function fingersFor(palm: V3, along: V3): V3 {
  const d = palm[0] * along[0] + palm[1] * along[1] + palm[2] * along[2];
  const f: V3 = [along[0] - palm[0] * d, along[1] - palm[1] * d, along[2] - palm[2] * d];
  return Math.hypot(...f) > 0.2 ? f : [1, 0, 0];
}

export const consent = (area: AreaInfo) => B(`I'll treat your ${area.name.en} now. Tell me at once if anything feels wrong. Is that all right?`, `Ab main aap ke ${area.name.ur} ka treatment karunga. Kuch ajeeb lage to fauran batayein. Theek hai?`);

export function modalityShow(t: Treatment, plan: TreatPlan): TreatShow {
  const area = AREAS[plan.area];
  const side = plan.side;
  const pos = area.position;
  const patient = area.pose?.(side) ?? {};
  const fingers = fingersFor(area.palm, area.along);
  const stand = (distance: number): BuiltStep["stand"] => ({ side: "tested", at: area.at, distance, face: "patient" });
  const touch = (at: string, hand: "L" | "R" = "R") => ({ hand, at, palm: area.palm, fingers, shape: "flat" as const });
  const where = area.name;
  const prop = t.prop!;
  if (prop === "hotpack" || prop === "icepack") {
    const hot = prop === "hotpack";
    return show(t, plan.area, side, pos, patient, [
      { chip: "Explain", stand: stand(0.6), gesture: "open", look: "patient", say: [B(hot ? "A moist hot pack will relax the muscles and ease the stiffness." : "A cold pack will ease the pain and swelling.", hot ? "Garam hot pack muscles ko relax karega aur sakhti kam karega." : "Thanda pack pain aur sujan kam karega."), consent(area)] },
      { chip: "Check skin", stand: stand(0.45), contacts: [touch(P(plan.area))], look: "hands", say: [B(`First I check the skin over your ${where.en} and that you can feel hot and cold normally.`, `Pehle main aap ke ${where.ur} ki skin check karta hoon aur ke aap garam aur thanda theek mehsoos karte hain.`)] },
      { chip: "Apply", contacts: [touch(P(`${plan.area}-e1`)), touch(P(`${plan.area}-e2`), "L")], look: "hands", prop, say: [B(hot ? "The pack goes on wrapped in six to eight towel layers, never straight on the skin." : "The pack is wrapped in a damp towel — never straight on the skin.", hot ? "Pack chhe se aath towel layers mein lapet kar lagta hai, kabhi seedha skin par nahi." : "Pack geele towel mein lapeta jata hai — kabhi seedha skin par nahi.")] },
      { chip: hot ? "15–20 min" : "10–15 min", stand: stand(0.75), gesture: "care", look: "patient", prop, timer: hot ? "20:00" : "15:00", holdSec: 2.5, say: [B(hot ? "It stays on for fifteen to twenty minutes. I check your skin at five minutes — it should feel comfortably warm, never hot." : "It stays on for ten to fifteen minutes. Cold, then burning, aching and numbness are normal stages; I check the skin at five minutes.", hot ? "Yeh pandrah se bees minute rahega. Paanch minute par skin check karunga — comfortable garam lage, kabhi tez garam nahi." : "Yeh das se pandrah minute rahega. Thanda, phir jalan, dard aur sun hona normal stages hain; paanch minute par skin check karunga.")] },
      { chip: "Remove", stand: stand(0.45), contacts: [touch(P(plan.area))], look: "hands", prop, say: [B("Off it comes. The skin is evenly pink with no blotches or blisters. How does it feel now?", "Ab hata diya. Skin barabar gulabi hai, koi dhabba ya chhala nahi. Ab kaisa mehsoos ho raha hai?")] },
    ]);
  }
  if (prop === "tens" || prop === "ift" || prop === "nmes") {
    const lines: Record<string, [Bi, Bi, Bi]> = {
      tens: [B("TENS sends small pulses that block pain signals on their way to the brain.", "TENS halki pulses bhejta hai jo pain signals ko dimagh tak pahunchne se rokti hain."),
        B("Four pads go around the painful area, not over broken skin. Settings: 100 hertz, 100 microseconds.", "Chaar pads dard wale hisse ke ird gird, zakhmi skin par nahi. Settings: 100 hertz, 100 microseconds."),
        B("I turn it up until you feel a strong but comfortable tingling, with no muscle twitching. Twenty to thirty minutes.", "Main intensity barhata hoon jab tak tez magar comfortable jhunjhunahat ho, muscle na phadke. Bees se tees minute.")],
      ift: [B("Interferential therapy crosses two currents deep in the tissue for pain relief.", "Interferential therapy do currents ko tissue ke andar cross karti hai pain relief ke liye."),
        B("Four pads in a cross around the pain, the two channels crossing over it. Carrier 4 kilohertz, beat 80 to 120 hertz.", "Chaar pads dard ke ird gird cross mein, dono channels uske upar cross karte hain. Carrier 4 kilohertz, beat 80 se 120 hertz."),
        B("A strong, comfortable buzzing for fifteen to twenty minutes; tell me if it becomes sharp or burning.", "Pandrah se bees minute tez magar comfortable buzzing; agar chubhan ya jalan ho to batayein.")],
      nmes: [B("Electrical muscle stimulation helps the weak muscle contract fully while you try at the same time.", "Electric muscle stimulation kamzor muscle ko poori tarah contract karne mein madad karti hai jab aap bhi saath koshish karein."),
        B("The pads go over the motor points of the muscle. Settings: 50 hertz, 300 microseconds, 10 seconds on and 50 off.", "Pads muscle ke motor points par lagte hain. Settings: 50 hertz, 300 microseconds, 10 second on aur 50 off."),
        B("When it switches on, tighten the muscle with it. Ten to fifteen strong contractions.", "Jab on ho to saath muscle tight karein. Das se pandrah mazboot contractions.")],
    };
    const [l1, l2, l3] = lines[prop];
    return show(t, plan.area, side, pos, patient, [
      { chip: "Explain", stand: stand(0.6), gesture: "open", look: "patient", say: [l1, B("It is not used if you have a pacemaker, over the front of the neck, over a clot or where the skin is broken or numb.", "Pacemaker ho, gardan ke agle hisse par, clot par ya jahan skin zakhmi ya sun ho wahan yeh istemal nahi hota."), consent(area)] },
      { chip: "Check skin", stand: stand(0.45), contacts: [touch(P(plan.area))], look: "hands", say: [B("I check the skin and test sharp and blunt sensation where the pads will go, then clean it.", "Main skin check karta hoon, pads wali jagah sharp aur blunt sensation test karta hoon, phir saaf karta hoon.")] },
      { chip: "Pads on", contacts: [touch(P(`${plan.area}-e1`)), touch(P(`${plan.area}-e2`), "L")], look: "hands", prop, say: [l2] },
      { chip: "Intensity", stand: stand(0.7), gesture: "point", look: "patient", prop, say: [l3] },
      { chip: prop === "nmes" ? "Contractions" : "20 min", stand: stand(0.75), gesture: "care", look: "patient", prop, timer: prop === "nmes" ? "15 reps" : "20:00", holdSec: 2.5, cycle: prop === "nmes" ? { to: nmesPose(plan.area, side), seconds: 3 } : undefined, say: [B("I stay nearby and check how it feels during the session.", "Main paas rehta hoon aur session ke dauran poochta rehta hoon kaisa lag raha hai.")] },
      { chip: "Remove", stand: stand(0.45), contacts: [touch(P(plan.area))], look: "hands", prop, say: [B("Intensity down to zero first, then the pads come off and I check the skin underneath.", "Pehle intensity zero, phir pads hatate hain aur neeche ki skin check karte hain.")] },
    ]);
  }
  // ultrasound
  return show(t, plan.area, side, pos, patient, [
    { chip: "Explain", stand: stand(0.6), gesture: "open", look: "patient", say: [B("Therapeutic ultrasound uses sound waves through a gel. The evidence for it is weak, so it is only ever an extra.", "Therapeutic ultrasound gel ke zariye sound waves deta hai. Is ka evidence kamzor hai, is liye yeh sirf izafi hai."), consent(area)] },
    { chip: "Check skin", stand: stand(0.45), contacts: [touch(P(plan.area))], look: "hands", say: [B("I check the skin and sensation. Not over a tumour, a clot, the eyes, a growth plate, a pregnant abdomen or a pacemaker.", "Main skin aur sensation check karta hoon. Tumour, clot, aankhon, growth plate, hamla pet ya pacemaker par nahi.")] },
    { chip: "Gel and head", contacts: [touch(P(plan.area))], look: "hands", prop, say: [B("Gel on the skin, then the head flat on it. Pulsed 20 percent, 3 megahertz for this superficial tissue, 0.5 watts per square centimetre.", "Skin par gel, phir head barabar rakha. Pulsed 20 percent, upar wale tissue ke liye 3 megahertz, 0.5 watts per square centimetre.")] },
    { chip: "5 min", contacts: [touch(P(plan.area))], look: "hands", prop, timer: "5:00", holdSec: 2.5, move: { kind: "glide", dir: area.along, amplitudeMm: 18, hz: 0.6 }, say: [B("I keep the head moving slowly in small circles for five minutes; it should feel like nothing or slight warmth.", "Main head ko paanch minute chhote circles mein aahista ghumata rehta hoon; kuch mehsoos na ho ya halki garmi ho.")] },
    { chip: "Finish", stand: stand(0.55), gesture: "open", look: "patient", say: [B("Done. I wipe off the gel and check the skin.", "Ho gaya. Gel saaf karke skin check karta hoon.")] },
  ]);
}

function nmesPose(area: TreatArea, side: Side): Pose {
  if (area === "thigh" || area === "knee") return { [k("knee", side)]: { flex: -2 }, [k("ankle", side)]: { flex: 10 } } as Pose;
  if (area === "fibular-head" || area === "shin") return { [k("ankle", side)]: { flex: 15, rot: -8 } } as Pose;
  if (area === "forearm-dorsal") return { [k("wrist", side)]: { flex: -35 } } as Pose;
  if (area === "shoulder") return { [k("shoulder", side)]: { abd: 35 } } as Pose;
  return {};
}

/** Manual techniques: geometry per technique (DRAFT until the supervising physiotherapist reviews it, like the other demonstrations). */
export function manualShow(t: Treatment, plan: TreatPlan): TreatShow {
  const side = plan.side;
  const say = (en: string, ur: string) => [B(en, ur)];
  const intro = (en: string, ur: string, at: string, d = 0.6): StepIn => ({ chip: "Explain", stand: { side: "tested", at, distance: d, face: "patient" }, gesture: "open", look: "patient", say: [B(en, ur), consent(AREAS[t.area ?? plan.area])] });
  const reassess = (at: string): StepIn => ({ chip: "Reassess", stand: { side: "tested", at, distance: 0.6, face: "patient" }, gesture: "care", look: "patient", say: say("Now let's re-test the movement that was painful — the comparable sign tells us if it helped.", "Ab wohi harkat dobara test karte hain jo dard wali thi — comparable sign batata hai ke faida hua ya nahi.") });
  switch (t.id) {
    case "massage": {
      const area = AREAS[plan.area];
      const fingers = fingersFor(area.palm, area.along);
      const h = (at: string, hand: "L" | "R") => ({ hand, at, palm: area.palm, fingers, shape: "flat" as const });
      return show(t, plan.area, side, area.position, area.pose?.(side) ?? {}, [
        intro(`Some slow massage will ease the tight, sore muscles around your ${area.name.en}.`, `Halka massage aap ke ${area.name.ur} ke sakht aur dard wale muscles ko araam dega.`, area.at),
        { chip: "Effleurage", stand: { side: "tested", at: area.at, distance: 0.45, face: "patient" }, contacts: [h(P(`${plan.area}-e1`), "R"), h(P(`${plan.area}-e2`), "L")], move: { kind: "glide", dir: area.along, amplitudeMm: 45, hz: 0.45 }, look: "hands", say: say("Long, slow strokes first to warm the tissue, towards the heart.", "Pehle lambe, aahista strokes tissue ko garam karne ke liye, dil ki taraf.") },
        { chip: "Kneading", contacts: [h(P(`${plan.area}-e3`), "R"), h(P(`${plan.area}-e4`), "L")], move: { kind: "glide", dir: [1, 0, 0], amplitudeMm: 20, hz: 0.7 }, look: "hands", timer: "6:00", holdSec: 2, say: say("Then firmer kneading over the tight spots. Tell me if the pressure is too much — it should feel good-sore, not sharp.", "Phir sakht jagahon par zyada mazboot kneading. Pressure zyada ho to batayein — achha-dard lage, chubhan nahi.") },
        reassess(area.at),
      ]);
    }
    case "lumbar-pa":
    case "thoracic-pa": {
      const a = t.id === "lumbar-pa" ? "lumbar" : "thoracic";
      const at = a === "lumbar" ? "spine05" : "spine02";
      return show(t, a, "left", "prone", {}, [
        intro(a === "lumbar" ? "I'll mobilise the joints of your lower back with gentle rhythmic pressure." : "I'll loosen the stiff joints of your upper back with gentle rhythmic pressure.", a === "lumbar" ? "Main aap ki kamar ke joints ko halke rhythmic pressure se mobilise karunga." : "Main aap ki upper back ke sakht joints ko halke rhythmic pressure se khol dunga.", at),
        { chip: "Find level", stand: { side: "tested", at, distance: 0.45, face: "patient" }, contacts: [{ hand: "R", at: P(a), palm: [0, 0, 1], fingers: [0, 1, 0], shape: "flat" }], look: "hands", say: say("I find the painful level by palpating each spinous process.", "Har spinous process ko palpate karke dard wali level dhoondta hoon.") },
        { chip: "Grade III–IV", contacts: [{ hand: "R", at: P(a), palm: [0, 0, 1], fingers: [1, 0, 0], shape: "flat" }, { hand: "L", at: `${P(a)}{0,0,-0.03}`, palm: [0, 0, 1], fingers: [0, 1, 0], shape: "flat" }], lean: 18, move: { kind: "glide", dir: [0, 0, 1], amplitudeMm: 7, hz: 1.4 }, look: "hands", timer: "3 × 45 s", holdSec: 2, say: say("Pisiform on the spinous process, arms straight, body weight over the hands: large rhythmic oscillations into the stiffness, about two per second.", "Pisiform spinous process par, baazu seedhe, jism ka wazan haathon par: sakhti mein bari rhythmic oscillations, taqreeban do per second.") },
        reassess(at),
      ]);
    }
    case "sciatic-slider":
      return show(t, "calf", side, "supine", { [k("hip", side)]: { flex: 40 }, [k("knee", side)]: { flex: 5 }, [k("ankle", side)]: { flex: -20 } } as Pose, [
        intro("This gently slides the sciatic nerve without stretching it — it should not hurt.", "Yeh sciatic nerve ko bina khinche aahista slide karta hai — dard nahi hona chahiye.", "lowerleg01"),
        { chip: "Hold the leg", stand: { side: "tested", at: "lowerleg01", distance: 0.42, face: "patient" }, contacts: [{ hand: "R", at: "foot{0,-0.03,-0.05}", palm: [0, 0, 1], fingers: [0, -1, 0], shape: "cupped" }, { hand: "L", at: "lowerleg01{0,0.03,0.07}", palm: [0, 0, -1], fingers: [0, 1, 0], shape: "flat" }], look: "hands", say: say("I cradle the heel and keep the knee straight, the hip bent to just before your symptoms.", "Main aedi ko sahara deta hoon aur ghutna seedha rakhta hoon, hip ko symptoms se zara pehle tak morta hoon.") },
        { chip: "Slide", contacts: [{ hand: "R", at: "foot{0,-0.03,-0.05}", palm: [0, 0, 1], fingers: [0, -1, 0], shape: "cupped" }, { hand: "L", at: "lowerleg01{0,0.03,0.07}", palm: [0, 0, -1], fingers: [0, 1, 0], shape: "flat" }], cycle: { to: { [k("hip", side)]: { flex: 30 }, [k("knee", side)]: { flex: 5 }, [k("ankle", side)]: { flex: 15 } } as Pose, seconds: 3.2 }, look: "hands", timer: "3 × 12", holdSec: 3, say: say("As the foot comes up, the hip lowers a little, so the nerve slides rather than tightens. Ten to fifteen slow cycles.", "Jab paon upar aata hai to hip zara neeche aati hai, taake nerve tight hone ki bajaye slide kare. Das se pandrah aahista cycles.") },
        reassess("lowerleg01"),
      ]);
    case "cervical-lateral-glide":
      return show(t, "cervical", side, "supine", { [k("shoulder", side)]: { abd: 30 }, [k("elbow", side)]: { flex: 90 } } as Pose, [
        intro("A gentle side glide of your neck away from the painful arm can ease the nerve pain.", "Gardan ka dard wale baazu se door halka side glide nerve ke dard ko kam kar sakta hai.", "neck01", 0.55),
        { chip: "Cradle", stand: { side: "tested", at: "neck01", distance: 0.42, face: "patient" }, contacts: [{ hand: "R", at: "@ear{0.015,-0.02,0}", palm: [-1, 0, 0], fingers: [0, 1, 0], shape: "cupped" }, { hand: "L", at: "@ac-joint{0,0.02,0}", palm: [0, -1, 0], fingers: [-1, 0, 0], shape: "flat" }], look: "hands", say: say("One hand cradles the side of your head and neck, the other steadies your shoulder.", "Ek haath sar aur gardan ki side ko sahara deta hai, doosra kandhe ko thaam ta hai.") },
        { chip: "Glide", contacts: [{ hand: "R", at: "@ear{0.015,-0.02,0}", palm: [-1, 0, 0], fingers: [0, 1, 0], shape: "cupped" }, { hand: "L", at: "@ac-joint{0,0.02,0}", palm: [0, -1, 0], fingers: [-1, 0, 0], shape: "flat" }], move: { kind: "glide", dir: [-1, 0, 0], amplitudeMm: 6, hz: 0.9 }, look: "hands", timer: "3 × 45 s", holdSec: 2, say: say("Small, smooth glides of the neck towards the other side, grade two to three. Tell me if the arm symptoms spread — that means stop.", "Gardan ke chhote, smooth glides doosri taraf, grade do se teen. Arm ki takleef phaile to batayein — iska matlab rokna hai.") },
        reassess("neck01"),
      ]);
    case "shoulder-posterior-glide":
    case "shoulder-inferior-glide": {
      const post = t.id === "shoulder-posterior-glide";
      const pose = { [k("shoulder", side)]: { flex: 20, abd: 55 }, [k("elbow", side)]: { flex: 40 } } as Pose;
      const head = post ? "@coracoid{0.03,-0.012,0}" : "upperarm01{0.0,0.035,0.0}";
      const contacts = [
        { hand: "R" as const, at: head, palm: (post ? [0, 0, -1] : [0, -1, 0]) as V3, fingers: (post ? [-1, -0.25, 0] : [-1, 0, 0]) as V3, shape: "flat" as const },
        { hand: "L" as const, at: "lowerarm01{0,0,-0.045}", palm: [0, 0, 1] as V3, fingers: [0, 1, 0] as V3, shape: "cupped" as const },
      ];
      return show(t, "shoulder", side, "supine", pose, [
        intro(post ? "I'll glide the top of your arm bone backwards to free the stiff back of the joint." : "I'll glide the top of your arm bone downwards to stretch the tight lower part of the capsule.", post ? "Main aap ki baazu ki haddi ke sar ko peeche glide karunga taake joint ka sakht pichla hissa khule." : "Main baazu ki haddi ke sar ko neeche glide karunga taake capsule ka tang neechla hissa stretch ho.", "upperarm01"),
        { chip: "Position", stand: { side: "tested", at: "upperarm01", distance: 0.4, face: "patient" }, contacts: [contacts[1]], look: "hands", say: say("Your arm rests at about 55 degrees out to the side, supported under the elbow — the loose-packed position.", "Aap ka baazu taqreeban 55 degree side mein, elbow ke neeche sahara — loose-packed position.") },
        { chip: post ? "Posterior glide" : "Inferior glide", contacts, move: { kind: "glide", dir: post ? [0, 0, -1] : [0, -1, 0], amplitudeMm: 6, hz: 1 }, look: "hands", timer: "3 × 45 s", holdSec: 2, say: say(post ? "Hand over the front of the humeral head, glide straight backwards, grade three to four, smooth and rhythmic." : "Web of the hand just below the acromion, glide the head towards your feet, grade three to four, within a tolerable stretch.", post ? "Haath humeral head ke agle hisse par, seedha peeche glide, grade teen se chaar, smooth aur rhythmic." : "Haath ka web acromion ke zara neeche, sar ko pairon ki taraf glide, grade teen se chaar, bardasht ke andar stretch.") },
        reassess("upperarm01"),
      ]);
    }
    case "elbow-mwm":
      return show(t, "elbow-lateral", side, "supine", { [k("shoulder", side)]: { abd: 20 }, [k("elbow", side)]: { flex: 0, rot: 60 } } as Pose, [
        intro("A Mulligan glide: I hold your forearm slightly sideways while you grip — the grip should then be pain-free.", "Mulligan glide: main aap ke forearm ko zara side mein thaamta hoon jab aap grip karte hain — grip pain-free honi chahiye.", "lowerarm01"),
        { chip: "Glide + grip", stand: { side: "tested", at: "lowerarm01", distance: 0.42, face: "patient" }, contacts: [{ hand: "R", at: "lowerarm01{-0.03,-0.04,0}", palm: [1, 0, 0], fingers: [0, 0, 1], shape: "flat" }, { hand: "L", at: "lowerarm01{0.035,0.05,0}", palm: [-1, 0, 0], fingers: [0, 0, 1], shape: "flat" }], cycle: { to: { [k("hand", side)]: { flex: 85 } } as Pose, seconds: 2.4 }, look: "hands", timer: "3 × 8", holdSec: 3, say: say("I stabilise the arm bone and glide the forearm outwards; squeeze now, and tell me if the pain is gone. Six to ten grips, three sets.", "Main baazu ki haddi ko thaam kar forearm ko bahar glide karta hoon; ab dabayein, aur batayein dard gaya ke nahi. Chhe se das grips, teen sets.") },
        reassess("lowerarm01"),
      ]);
    case "patellar-mobilisation":
      return show(t, "knee", side, "supine", { [k("knee", side)]: { flex: 8 } } as Pose, [
        intro("I'll glide your kneecap in each direction to free up the knee.", "Main aap ki kneecap ko har taraf glide karunga taake ghutna khule.", "lowerleg01"),
        { chip: "Glides", stand: { side: "tested", at: "lowerleg01", distance: 0.42, face: "patient" }, contacts: [{ hand: "R", at: "@patella{0,0.03,0.012}", palm: [0, -1, 0], fingers: [1, 0, 0], shape: "flat" }, { hand: "L", at: "@patella{0,-0.03,0.012}", palm: [0, 1, 0], fingers: [1, 0, 0], shape: "flat" }], move: { kind: "glide", dir: [0, -1, 0], amplitudeMm: 6, hz: 0.8 }, look: "hands", timer: "2 × 30 s", holdSec: 2, say: say("Thigh muscles relaxed, the heels of my hands on the edges of the kneecap: smooth glides down, up and to each side.", "Thigh ke muscles dheele, mere haath ki aedi kneecap ke kinaron par: neeche, upar aur har side smooth glides.") },
        reassess("lowerleg01"),
      ]);
    case "knee-flexion-mob":
      return show(t, "knee", side, "supine", { [k("hip", side)]: { flex: 60 }, [k("knee", side)]: { flex: 80 } } as Pose, [
        intro("I'll gently work your knee into more bend, only as far as you can tolerate.", "Main aap ke ghutne ko aahista zyada mor mein le jaunga, sirf jitna aap bardasht kar sakein.", "lowerleg01"),
        { chip: "Into flexion", stand: { side: "tested", at: "lowerleg01", distance: 0.42, face: "patient" }, contacts: [{ hand: "R", at: "foot{0,0.08,0.045}", palm: [0, 0.5, -1], fingers: [1, 0, 0], shape: "cupped" }, { hand: "L", at: "@patella{0,0.02,0.02}", palm: [0, 0, -1], fingers: [0, 1, 0], shape: "flat" }], cycle: { to: { [k("hip", side)]: { flex: 72 }, [k("knee", side)]: { flex: 98 } } as Pose, seconds: 2.6 }, look: "hands", timer: "3 × 45 s", holdSec: 3, say: say("Rhythmic movement into the end of the bend, grade three, easing off before it becomes sharp. Three sets of 30 to 60 seconds.", "Mor ke aakhir mein rhythmic harkat, grade teen, chubhan se pehle dheela. 30 se 60 second ke teen sets.") },
        reassess("lowerleg01"),
      ]);
    case "talocrural-glide":
      return show(t, "ankle", side, "supine", { [k("ankle", side)]: { flex: 0 } } as Pose, [
        intro("I'll glide the ankle bone backwards to get your ankle bending upwards again.", "Main takhne ki haddi ko peeche glide karunga taake ankle dobara upar mure.", "foot"),
        { chip: "Glide", stand: { side: "tested", at: "foot", distance: 0.42, face: "patient" }, contacts: [{ hand: "R", at: "foot{0,0,0.05}", palm: [0, 0, -1], fingers: [1, 0, 0], shape: "cupped" }, { hand: "L", at: "foot{0,0.07,-0.03}", palm: [0, 0, 1], fingers: [1, 0, 0], shape: "cupped" }], move: { kind: "glide", dir: [0, 0, -1], amplitudeMm: 5, hz: 1 }, look: "hands", timer: "3 × 30 s", holdSec: 2, say: say("One hand steadies the lower leg, the web of the other over the front of the talus glides it straight back.", "Ek haath neeche wali taang ko thaamta hai, doosre ka web talus ke agle hisse par use seedha peeche glide karta hai.") },
        reassess("foot"),
      ]);
    case "hip-distraction":
      return show(t, "hip", side, "supine", { [k("hip", side)]: { flex: 30, abd: 30 } } as Pose, [
        intro("A gentle pull along your leg eases the pressure in the hip joint.", "Taang ki lambai mein halki khinchai hip joint ka pressure kam karti hai.", "foot", 0.6),
        { chip: "Distraction", stand: { side: "tested", at: "foot", distance: 0.45, face: "patient" }, contacts: [{ hand: "R", at: "foot{0,0.05,0.045}", palm: [0, 0, -1], fingers: [-1, 0, 0], shape: "cupped" }, { hand: "L", at: "foot{0,0.05,-0.045}", palm: [0, 0, 1], fingers: [-1, 0, 0], shape: "cupped" }], move: { kind: "glide", dir: [0, -1, 0], amplitudeMm: 9, hz: 0.5 }, lean: 10, look: "hands", timer: "4 × 45 s", holdSec: 2, say: say("Hands above the ankle, the hip in its loose-packed position (about 30 degrees bent and 30 out to the side); I lean back to pull along the leg, grade three, in slow waves.", "Haath takhne ke upar, hip loose-packed position mein (taqreeban 30 degree mori aur 30 side mein); main peeche jhuk kar taang ki lambai mein khinchta hoon, grade teen, aahista lehron mein.") },
        reassess("upperleg01"),
      ]);
    case "plantar-release":
      return show(t, "heel", side, "prone", { [k("knee", side)]: { flex: 80 }, [k("ankle", side)]: { flex: 10 } } as Pose, [
        intro("I'll release the tight band under your foot and the calf above it.", "Main aap ke paon ke neeche wale tang band aur upar calf ko release karunga.", "foot"),
        { chip: "Release", stand: { side: "tested", at: "foot", distance: 0.42, face: "patient" }, contacts: [{ hand: "R", at: P("heel"), palm: [0, 1, 0], fingers: [0, 0, 1], shape: "flat" }, { hand: "L", at: "foot{0,-0.02,0.12}", palm: [0, 0, -1], fingers: [1, 0, 0], shape: "cupped" }], move: { kind: "glide", dir: [0, 0, 1], amplitudeMm: 25, hz: 0.5 }, look: "hands", timer: "5:00", holdSec: 2, say: say("Toes pulled back to tension the fascia, then firm strokes from the heel towards the toes.", "Ungliyan peeche khinch kar fascia ko tight, phir aedi se ungliyon ki taraf mazboot strokes.") },
        reassess("foot"),
      ]);
    default:
      return modalityShow(t, plan);
  }
}

export function talkShow(t: Treatment, plan: TreatPlan, start: PatientPosition): TreatShow {
  const pos: PatientPosition = start === "standing" ? "sitting" : start;
  const lines = plan.advice;
  return show(t, plan.area, plan.side, pos, {}, [
    { chip: t.group === "refer" ? "Stop" : "Explain", stand: { side: "tested", at: "upperarm01", distance: 0.85, face: "patient" }, gesture: t.group === "refer" ? "care" : "open", look: "patient", say: [lines[0]] },
    ...(lines[1] ? [{ chip: "Advice", gesture: "point" as const, look: "patient" as const, say: [lines[1]] }] : []),
    { chip: t.group === "refer" ? "Hand over" : "Check", gesture: "nod", look: "patient", say: [t.group === "refer" ? B("I am writing down my findings for the team now and I will stay with you until help arrives.", "Main abhi team ke liye apni findings likh raha hoon aur madad aane tak aap ke saath rahunga.") : B("Can you tell me in your own words what we agreed?", "Kya aap apne alfaaz mein bata sakte hain ke humne kya tay kiya?")] },
  ]);
}

/** How the PNA Teacher performs treatment `id` for this case. */
export function treatmentShow(id: string, plan: TreatPlan, start: PatientPosition): TreatShow | null {
  const t = treatment(id);
  if (!t) return null;
  if (t.group === "education" || t.group === "refer") return talkShow(t, plan, start);
  if (t.group === "manual") return manualShow(t, plan);
  return modalityShow(t, plan);
}

/** Coaching while the patient does an exercise (the movement itself comes from the RehabVerse player). */
export function exerciseCoach(name: Bi, steps: Bi[], side: Side): BuiltChoreo {
  return {
    kind: "technique",
    slug: "vp-exercise",
    title: name,
    side,
    position: "standing",
    patient: {},
    enter: { away: 1, towardFeet: 0.4 },
    review: { status: "draft" },
    lessonTitle: name.en,
    steps: [
      { chip: "Show", stand: { side: "tested", at: "spine03", distance: 1.05, face: "patient" }, gesture: "point", look: "patient", say: steps.slice(0, 2).map(line), overlays: [], notes: [] },
      { chip: "Coach", gesture: "open", look: "patient", say: steps.slice(2, 4).map(line), overlays: [], notes: [], holdSec: 3 },
    ],
  };
}

