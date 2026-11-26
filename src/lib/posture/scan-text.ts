import type { BendMetricId, BendNote, Region, ScanView } from "./scan.ts";
import type { Bi } from "./text.ts";

/** Words for the Full Posture Scan, in English and Roman Urdu. Plain words, short sentences. */

export const SCAN_TERMS: { title: Bi; items: Bi[] } = {
  title: { en: "Before you start: what this scan is, and what it is not", ur: "Shuru se pehle: yeh scan kya hai, aur kya nahi" },
  items: [
    { en: "This is a posture screen: four short phone pictures (front, side, back and a forward bend) turned into angles. It is not a diagnosis and not a medical measurement.", ur: "Yeh posture screen hai: phone ki chaar chhoti tasveerein (saamne, side, peeche aur aage jhukna) jo angles mein badli jati hain. Yeh tashkhees nahi aur medical paimaish nahi." },
    { en: "The 3D skeleton is an illustration. It is a standard skeleton, tilted and shifted to match the points the phone could measure. It is NOT an X-ray and does not show your real bones or your real spine.", ur: "3D skeleton ek tasveeri misaal hai. Yeh aam skeleton hai jo un points ke mutabiq jhukaya aur khisakaya gaya jo phone naap saka. Yeh X-ray NAHI hai aur aap ki asal haddiyan ya reedh nahi dikhata." },
    { en: "It cannot see your spine. It does not measure spinal curves or a rib hump, and it does not check for scoliosis or any spine condition. If you are worried, see a clinician.", ur: "Yeh aap ki reedh nahi dekh sakta. Yeh reedh ke curves ya pasli ka ubhaar nahi naapta, aur scoliosis ya reedh ki kisi bimari ki jaanch nahi karta. Fikr ho to clinician ko dikhayein." },
    { en: "It can be wrong. The phone, your clothes, the distance and the picture all add error. Every number is shown with a plus-or-minus, and the cut-offs are provisional until a validation study is complete.", ur: "Yeh ghalat ho sakta hai. Phone, aap ke kapray, fasla aur tasveer sab ghalti jorte hain. Har number plus-minus ke saath dikhaya jata hai, aur hadein tab tak aarzi hain jab tak validation study mukammal na ho." },
    { en: "Do not use it if you have a fresh injury, severe pain, dizziness or trouble standing or bending. Children under 16 should use it with an adult. Skip the forward bend if it hurts.", ur: "Taaza chot, shadeed dard, chakkar, ya khare hone ya jhukne mein mushkil ho to istemal na karein. 16 saal se kam bachay kisi baalig ke saath istemal karein. Agar jhukna dukhe to aage jhukna chhor dein." },
    { en: "Your privacy: the pictures are read on your own phone. Nothing is uploaded. The pictures stay in this page only while you look at it. Only if you choose 'Save numbers on this device' are the numbers (never a picture) kept on this device.", ur: "Aap ki raaz daari: tasveerein aap ke apne phone par parhi jati hain. Kuch upload nahi hota. Tasveerein sirf is page mein rehti hain jab tak aap dekhte hain. Sirf agar aap 'Numbers is device par save karein' chunein to numbers (tasveer kabhi nahi) is device par rakhe jate hain." },
    { en: "Stay safe: stand on a flat floor with space around you, nothing to trip on, and have someone near if your balance is poor. Stop at any time.", ur: "Mehfooz rahein: hamwar farsh par khare hon, gird jagah ho, thokar ki cheez na ho, aur balance kamzor ho to koi paas rahe. Kisi bhi waqt ruk jayein." },
  ],
};

export const VIEW_TEXT: Record<ScanView, { name: Bi; short: Bi; guide: Bi[] }> = {
  front: {
    name: { en: "Front view", ur: "Samne ka view" },
    short: { en: "Shoulder, hip and head level, trunk shift, knees in or out", ur: "Kandhon, kulhon aur sar ki sateh, dhad ka khisakna, ghutne andar ya bahar" },
    guide: [
      { en: "Face the phone, with the camera seeing you from head to feet.", ur: "Phone ki taraf munh karein, camera aap ko sar se pair tak dekhe." },
      { en: "Stand 2 to 3 metres away, with the whole body in the picture and the phone level, at about hip height.", ur: "2 se 3 meter door khare hon, poora jism tasveer mein ho aur phone seedha, takreeban kulhay ki oonchai par." },
      { en: "Wear fitted clothes. Feet hip-width apart, arms relaxed at your sides.", ur: "Tang kapray pehnein. Pair kulhon ki chaurai par, bazu dheelay side mein." },
      { en: "Stand the way you normally do. Look straight ahead. Do not try to stand 'well'.", ur: "Jaise aam taur par khare hote hain waise khare hon. Seedha dekhein. 'Achha' khare hone ki koshish na karein." },
    ],
  },
  side: {
    name: { en: "Side view", ur: "Side view" },
    short: { en: "Head forward, trunk lean, standing balance, knee angle", ur: "Sar aage, dhad ka jhukao, khare hone ka tawazun, ghutne ka zaviya" },
    guide: [
      { en: "Stand sideways to the phone, so the camera sees one side of you from head to feet.", ur: "Phone ke side mein khare hon, taake camera aap ka ek side sar se pair tak dekhe." },
      { en: "Stand 2 to 3 metres away, with the whole body in the picture and the phone level, at about hip height.", ur: "2 se 3 meter door khare hon, poora jism tasveer mein ho aur phone seedha, takreeban kulhay ki oonchai par." },
      { en: "Tie long hair back so the ear can be seen. Arms relaxed at your sides.", ur: "Lambay baal baandh lein taake kaan nazar aaye. Bazu dheelay side mein." },
      { en: "Stand the way you normally do. Look straight ahead. Do not try to stand 'well'.", ur: "Jaise aam taur par khare hote hain waise khare hon. Seedha dekhein. 'Achha' khare hone ki koshish na karein." },
    ],
  },
  back: {
    name: { en: "Back view", ur: "Peeche ka view" },
    short: { en: "Shoulder, hip and head level and trunk shift, seen from behind", ur: "Kandhon, kulhon aur sar ki sateh aur dhad ka khisakna, peeche se" },
    guide: [
      { en: "Turn your back to the phone, so the camera sees you from behind, from head to feet.", ur: "Phone ki taraf peeth karein, taake camera aap ko peeche se, sar se pair tak dekhe." },
      { en: "Stand 2 to 3 metres away, with the whole body in the picture and the phone level, at about hip height.", ur: "2 se 3 meter door khare hon, poora jism tasveer mein ho aur phone seedha, takreeban kulhay ki oonchai par." },
      { en: "Wear fitted clothes that show your shoulders and waist. Feet hip-width apart, arms relaxed at your sides.", ur: "Tang kapray pehnein jo kandhay aur kamar nazar aayein. Pair kulhon ki chaurai par, bazu dheelay side mein." },
      { en: "Stand the way you normally do. Do not try to stand 'well'. If you are alone, the countdown tells you when the picture is taken.", ur: "Jaise aam taur par khare hote hain waise khare hon. 'Achha' khare hone ki koshish na karein. Akelay hon to ginti batati hai tasveer kab li ja rahi hai." },
    ],
  },
  bend: {
    name: { en: "Forward bend", ur: "Aage jhukna" },
    short: { en: "How far you bend, the angle at the hip, whether the knees stay straight, where the hands reach", ur: "Kitna jhukte hain, kulhay ka zaviya, kya ghutne seedhay rehte hain, haath kahan pohanchte hain" },
    guide: [
      { en: "Stand sideways to the phone, as for the side view, with the whole body in the picture.", ur: "Phone ke side mein khare hon, jaise side view mein, poora jism tasveer mein ho." },
      { en: "When the countdown says 'bend', bend forward slowly as far as is comfortable, with straight knees and arms hanging down, and hold.", ur: "Jab ginti 'jhukein' kahe to aahista aage jhukein jahan tak aaram se jhuk sakein, ghutne seedhay aur bazu latke hue, aur ruke rahein." },
      { en: "Do not bounce or force it. Skip this view if bending hurts.", ur: "Uchhalein nahi aur zor na lagayein. Agar jhukna dukhe to yeh view chhor dein." },
      { en: "This is a movement check. It does not look for a rib hump and does not check for scoliosis.", ur: "Yeh harkat ki jaanch hai. Yeh pasli ka ubhaar nahi dhoondti aur scoliosis ki jaanch nahi karti." },
    ],
  },
};

export const BEND_TEXT: Record<BendMetricId, { label: Bi; what: Bi; unit: Bi }> = {
  bendTrunk: { label: { en: "Trunk bend", ur: "Dhad ka jhukna" }, what: { en: "How far the line from hip to shoulder has moved from upright. 0 is upright, 90 is level with the floor.", ur: "Kulhay se kandhe ki line seedhay se kitni hati. 0 seedha, 90 farsh ke barabar." }, unit: { en: "degrees", ur: "degree" } },
  bendHip: { label: { en: "Angle at the hip", ur: "Kulhay ka zaviya" }, what: { en: "The angle between trunk and thigh at the hip. 180 is standing straight; smaller means more bend at the hip.", ur: "Kulhay par dhad aur raan ke beech ka zaviya. 180 seedha khara hona; kam ka matlab kulhay par zyada jhukna." }, unit: { en: "degrees", ur: "degree" } },
  bendKnee: { label: { en: "Knee angle in the bend", ur: "Jhukte waqt ghutne ka zaviya" }, what: { en: "The angle at the knee during the bend. 180 is a straight knee. A lower number means the knee bent.", ur: "Jhukte waqt ghutne ka zaviya. 180 seedha ghutna. Kam number matlab ghutna mura." }, unit: { en: "degrees", ur: "degree" } },
  reach: { label: { en: "Where the hands reach", ur: "Haath kahan pohanchte hain" }, what: { en: "Where the fingertips stop as a share of the leg: 0 is the height of the ankle, 100 the height of the hip, below 0 is below the ankle.", ur: "Ungliyon ke sire kahan rukte hain, taang ke hisab se: 0 takhne ki oonchai, 100 kulhay ki oonchai, 0 se kam takhne se neeche." }, unit: { en: "percent of leg", ur: "taang ka fisad" } },
};

export const BEND_NOTE_TEXT: Record<BendNote, Bi> = {
  straight: { en: "Your knees stayed straight during the bend.", ur: "Jhukte waqt aap ke ghutne seedhay rahe." },
  bent_knees: { en: "Your knees bent during the bend, so the reach is not a pure test of the back and the back of the thighs.", ur: "Jhukte waqt aap ke ghutne mure, is liye haath ka pohanchna sirf peeth aur raan ke peechay ka saaf test nahi." },
  reaches_ankle: { en: "Your hands reached the level of your ankles or lower.", ur: "Aap ke haath takhnon ki satah ya us se neeche pohanche." },
  stops_short: { en: "Your hands stopped above the ankles. This is very common and is not a finding on its own.", ur: "Aap ke haath takhnon se oopar ruk gaye. Yeh bohat aam hai aur akeli koi nishani nahi." },
};

export const REGION_TEXT: Record<Region, { label: Bi; says: Bi }> = {
  neck: { label: { en: "Neck and head", ur: "Gardan aur sar" }, says: { en: "Head position and tilt.", ur: "Sar ki position aur jhukao." } },
  shoulders: { label: { en: "Shoulders", ur: "Kandhay" }, says: { en: "Whether one shoulder sits higher than the other.", ur: "Kya ek kandha doosray se oopar hai." } },
  trunk: { label: { en: "Trunk", ur: "Dhad" }, says: { en: "Lean, sway and sideways shift of the upper body.", ur: "Oopar ke jism ka jhukao, jhoolna aur side ko khisakna." } },
  pelvis: { label: { en: "Hips and pelvis", ur: "Kulhay aur pelvis" }, says: { en: "Whether one hip sits higher than the other.", ur: "Kya ek kulha doosray se oopar hai." } },
  leftKnee: { label: { en: "Left knee", ur: "Left ghutna" }, says: { en: "Knee angle and whether it falls in or out.", ur: "Ghutne ka zaviya aur woh andar ya bahar jhukta hai." } },
  rightKnee: { label: { en: "Right knee", ur: "Right ghutna" }, says: { en: "Knee angle and whether it falls in or out.", ur: "Ghutne ka zaviya aur woh andar ya bahar jhukta hai." } },
};

export const SEVERITY_TEXT: { stops: [Bi, Bi, Bi]; unknown: Bi } = {
  stops: [
    { en: "In the usual range", ur: "Aam range mein" },
    { en: "A little off", ur: "Thora farq" },
    { en: "Worth a closer look", ur: "Qareeb se dekhne ke qabil" },
  ],
  unknown: { en: "Not measured: the view for this was skipped or could not be read.", ur: "Naapa nahi gaya: is ka view chhor diya gaya ya parha nahi ja saka." },
};

/** What can load each region in daily life. Plain, kind and not a cause: these are common habits, not a diagnosis. */
export type FactorId = "phone" | "desk" | "bed" | "bag" | "driving" | "oneleg" | "shoes";
export const FACTORS: Record<FactorId, { label: Bi; note: Bi }> = {
  phone: { label: { en: "Looking down at a phone", ur: "Phone ko neeche dekhna" }, note: { en: "Long spells with the head forward and down.", ur: "Der tak sar aage aur neeche rakhna." } },
  desk: { label: { en: "Long hours at a desk", ur: "Lambay ghantay desk par" }, note: { en: "Sitting for hours with a screen too low or too far.", ur: "Ghanton baithna jab screen bohat neeche ya door ho." } },
  bed: { label: { en: "Reading or scrolling in bed", ur: "Bistar mein parhna ya scroll karna" }, note: { en: "Neck bent on high pillows.", ur: "Oonchay takiyon par gardan mudi hui." } },
  bag: { label: { en: "A heavy bag on one shoulder", ur: "Ek kandhay par bhaari bag" }, note: { en: "One shoulder carries the load day after day.", ur: "Roz ek kandha bojh uthata hai." } },
  driving: { label: { en: "Long drives", ur: "Lambay safar mein gaari chalana" }, note: { en: "Sitting still with the arms forward for hours.", ur: "Ghanton baithna aur bazu aage rakhna." } },
  oneleg: { label: { en: "Standing on one leg", ur: "Ek taang par khare hona" }, note: { en: "Always putting your weight on the same side.", ur: "Hamesha ek hi taraf wazan daalna." } },
  shoes: { label: { en: "Worn or unsuitable shoes", ur: "Ghisay hue ya na-munasib jootay" }, note: { en: "Uneven wear changes how the legs line up.", ur: "Ghisaaw ka farq taangon ki seedh badalta hai." } },
};
export const REGION_FACTORS: Record<Region, FactorId[]> = {
  neck: ["phone", "desk", "bed"],
  shoulders: ["bag", "desk", "driving"],
  trunk: ["desk", "driving", "bag"],
  pelvis: ["oneleg", "desk"],
  leftKnee: ["shoes", "oneleg"],
  rightKnee: ["shoes", "oneleg"],
};

export const REPORT_SAFE: Bi = { en: "See a physiotherapist or doctor if you have pain that does not settle, numbness or tingling, weakness, or any worry about your spine. This tool cannot tell you why your posture looks the way it does, and the skeleton is an illustration.", ur: "Dard jo na thame, sunn hona ya jhunjhunahat, kamzori, ya reedh ke baare mein koi fikr ho to physiotherapist ya doctor ko dikhayein. Yeh tool nahi bata sakta ke aap ki posture aisi kyun hai, aur skeleton ek tasveeri misaal hai." };

export const COMPARE_TEXT: Record<"better" | "worse" | "same", Bi> = {
  better: { en: "Closer to level than last time", ur: "Pichhli baar se zyada barabar" },
  worse: { en: "Further from level than last time", ur: "Pichhli baar se zyada tirchha" },
  same: { en: "No clear change (within the margin of error)", ur: "Koi saaf farq nahi (ghalti ki hadd ke andar)" },
};
