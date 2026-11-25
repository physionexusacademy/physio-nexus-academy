import type { Band, PostureMetricId } from "./measures.ts";

/** Words for the posture screen, in English and Roman Urdu. Plain words, short sentences. */
export type Bi = { en: string; ur: string };

export const METRIC_TEXT: Record<PostureMetricId, { label: Bi; what: Bi; unit: Bi }> = {
  headForward: { label: { en: "Head forward of the shoulder", ur: "Sar kandhe se aage" }, what: { en: "How far the ear is in front of the shoulder, as a share of the length of your trunk.", ur: "Kaan kandhe se kitna aage hai, aap ke dhad ki lambai ke hisab se." }, unit: { en: "% of trunk", ur: "% dhad ka" } },
  earShoulderAngle: { label: { en: "Ear-shoulder angle", ur: "Kaan-kandha zaviya" }, what: { en: "The angle of the line from your shoulder to your ear. 90 degrees means the ear is straight above the shoulder; lower means the head is forward. It is a stand-in for the craniovertebral angle, which needs a mark on the neck bone that a phone cannot see.", ur: "Kandhe se kaan tak ki line ka zaviya. 90 degree ka matlab kaan seedha kandhe ke oopar; kam ka matlab sar aage. Yeh craniovertebral angle ka badal hai, jis ke liye gardan ki haddi ka nishan chahiye jo phone nahi dekh sakta." }, unit: { en: "degrees", ur: "degree" } },
  trunkLean: { label: { en: "Trunk lean", ur: "Dhad ka jhukao" }, what: { en: "How far the line from hip to shoulder leans from upright. Positive means leaning forward.", ur: "Kulhay se kandhe ki line seedhi se kitni jhuki hai. Positive ka matlab aage jhukna." }, unit: { en: "degrees", ur: "degree" } },
  standingOffset: { label: { en: "Shoulder over ankle", ur: "Kandha takhne ke oopar" }, what: { en: "How far the shoulder is in front of the ankle, as a share of your height. Near zero means a balanced stance.", ur: "Kandha takhne se kitna aage hai, aap ke qad ke hisab se. Sifar ke qareeb ka matlab mutawazin khara hona." }, unit: { en: "% of height", ur: "% qad ka" } },
  kneeAngle: { label: { en: "Knee angle", ur: "Ghutne ka zaviya" }, what: { en: "The angle at the knee between thigh and shin. 180 degrees is a straight leg. A picture from the side cannot tell a locked knee from one that bends back.", ur: "Ghutne par raan aur pindli ka zaviya. 180 degree seedhi taang hai. Side ki tasveer lock hue ghutne aur peechay mudne wale ghutne mein farq nahi kar sakti." }, unit: { en: "degrees", ur: "degree" } },
  shoulderTilt: { label: { en: "Shoulder level", ur: "Kandhon ki sateh" }, what: { en: "The slope of the line between your shoulders. Positive means your left shoulder is higher, negative your right.", ur: "Dono kandhon ke beech ki line ka dhalwan. Positive ka matlab aap ka left kandha oonchi hai, negative right." }, unit: { en: "degrees", ur: "degree" } },
  hipTilt: { label: { en: "Hip level", ur: "Kulhon ki sateh" }, what: { en: "The slope of the line between your hips. Positive means your left hip is higher, negative your right.", ur: "Dono kulhon ke beech ki line ka dhalwan. Positive ka matlab aap ka left kulha oonchi hai, negative right." }, unit: { en: "degrees", ur: "degree" } },
  headTilt: { label: { en: "Head tilt", ur: "Sar ka jhukao" }, what: { en: "The slope of the line between your ears. Positive means your left ear is higher, negative your right.", ur: "Dono kaanon ke beech ki line ka dhalwan. Positive ka matlab aap ka left kaan oonchi hai, negative right." }, unit: { en: "degrees", ur: "degree" } },
  trunkShift: { label: { en: "Trunk shift", ur: "Dhad ka khisakna" }, what: { en: "How far the middle of your shoulders sits to one side of the middle of your hips, as a share of shoulder width. Positive means to your left, negative to your right.", ur: "Kandhon ka darmiyan kulhon ke darmiyan se ek taraf kitna hai, kandhon ki chaurai ke hisab se. Positive ka matlab aap ke left, negative right." }, unit: { en: "% of shoulder width", ur: "% kandhon ki chaurai" } },
  leftKnee: { label: { en: "Left knee alignment", ur: "Left ghutne ki seedh" }, what: { en: "Whether the knee falls inwards (positive) or bows outwards (negative) from the line between hip and ankle, as a share of the leg.", ur: "Ghutna kulhay aur takhne ki line se andar (positive) ya bahar (negative) kitna hai, taang ke hisab se." }, unit: { en: "% of leg", ur: "% taang ka" } },
  rightKnee: { label: { en: "Right knee alignment", ur: "Right ghutne ki seedh" }, what: { en: "Whether the knee falls inwards (positive) or bows outwards (negative) from the line between hip and ankle, as a share of the leg.", ur: "Ghutna kulhay aur takhne ki line se andar (positive) ya bahar (negative) kitna hai, taang ke hisab se." }, unit: { en: "% of leg", ur: "% taang ka" } },
};

export const BAND_TEXT: Record<Band, { label: Bi; line: Bi }> = {
  typical: { label: { en: "In the usual range", ur: "Aam range mein" }, line: { en: "Nothing to worry about on this measure.", ur: "Is paimane par fikr ki baat nahi." } },
  within_error: { label: { en: "Too small to call", ur: "Kehne ke liye bohat chhota" }, line: { en: "The difference is smaller than this tool can measure reliably, so it is treated as level.", ur: "Farq is tool ki bharosemand paimaish se chhota hai, is liye isay barabar maana gaya hai." } },
  mild: { label: { en: "A little off", ur: "Thora farq" }, line: { en: "A small difference. Very common, and often not a problem. Worth noticing if you also have pain.", ur: "Chhota farq. Bohat aam, aur aksar masla nahi. Dard bhi ho to ghaur karein." } },
  marked: { label: { en: "Worth a closer look", ur: "Qareeb se dekhne ke qabil" }, line: { en: "A clearer difference. This is a screen only: if you have pain or stiffness, ask a physiotherapist to examine you.", ur: "Waazeh farq. Yeh sirf screen hai: dard ya akhrapan ho to physiotherapist se examine karwayein." } },
};

export const TERMS: { title: Bi; items: Bi[] } = {
  title: { en: "Before you start: what this is, and what it is not", ur: "Shuru se pehle: yeh kya hai, aur kya nahi" },
  items: [
    { en: "This is a posture screen: an estimate from a phone picture. It is not a diagnosis and not a medical measurement.", ur: "Yeh posture screen hai: phone ki tasveer se andaza. Yeh tashkhees nahi aur medical paimaish nahi." },
    { en: "It can be wrong. The phone, your clothes, the distance and the picture all add error. Every number is shown with a plus-or-minus, and the cut-offs are provisional until a validation study is complete.", ur: "Yeh ghalat ho sakta hai. Phone, aap ke kapray, faasla aur tasveer sab ghalti paida karte hain. Har number plus-minus ke saath dikhaya gaya hai, aur cut-offs tab tak aarzi hain jab tak validation study mukammal na ho." },
    { en: "It cannot see your spine. It does not check for scoliosis or any spine condition. If you are worried, see a clinician.", ur: "Yeh aap ki reedh nahi dekh sakta. Yeh scoliosis ya reedh ki kisi bimari ki jaanch nahi karta. Fikr ho to clinician ko dikhayein." },
    { en: "Do not use it if you have a fresh injury, severe pain, dizziness or trouble standing. Children under 16 should use it with an adult.", ur: "Taaza chot, shadeed dard, chakkar ya khare hone mein mushkil ho to istemal na karein. 16 saal se kam bachay bade ke saath istemal karein." },
    { en: "Your privacy: the picture is read on your own phone. Nothing is recorded, uploaded or saved. When you close the page, the results are gone.", ur: "Aap ki raaz daari: tasveer aap ke apne phone par parhi jati hai. Kuch record, upload ya save nahi hota. Page band karte hi nateeje khatam." },
    { en: "Stay safe: stand on a flat floor with space around you, nothing to trip on, and have someone near if your balance is poor. Stop at any time.", ur: "Mehfooz rahein: hamwar farsh par khare hon, gird jagah ho, thokar ki cheez na ho, aur balance kamzor ho to koi qareeb ho. Kabhi bhi ruk sakte hain." },
  ],
};

export const SETUP_GUIDE: Record<"side" | "front", Bi[]> = {
  side: [
    { en: "Stand sideways to the phone, so the camera sees one side of you from head to feet.", ur: "Phone ke side mein khare hon, taake camera aap ka ek side sar se pair tak dekhe." },
    { en: "Stand 2 to 3 metres away, with the whole body in the picture and the phone level, at about hip height.", ur: "2 se 3 meter door khare hon, poora jism tasveer mein ho aur phone seedha, takreeban kulhay ki oonchai par." },
    { en: "Wear fitted clothes. Tie long hair back so the ear can be seen.", ur: "Tang kapray pehnein. Lambay baal baandh lein taake kaan nazar aaye." },
    { en: "Stand the way you normally do. Look straight ahead. Do not try to stand 'well'.", ur: "Jaise aam taur par khare hote hain waise khare hon. Seedha dekhein. 'Achha' khare hone ki koshish na karein." },
  ],
  front: [
    { en: "Face the phone, with the camera seeing you from head to feet.", ur: "Phone ki taraf munh karein, camera aap ko sar se pair tak dekhe." },
    { en: "Stand 2 to 3 metres away, with the whole body in the picture and the phone level, at about hip height.", ur: "2 se 3 meter door khare hon, poora jism tasveer mein ho aur phone seedha, takreeban kulhay ki oonchai par." },
    { en: "Wear fitted clothes. Feet hip-width apart, arms relaxed at your sides.", ur: "Tang kapray pehnein. Pair kulhon ki chaurai par, bazu dheelay side mein." },
    { en: "Stand the way you normally do. Look straight ahead. Do not try to stand 'well'.", ur: "Jaise aam taur par khare hote hain waise khare hon. Seedha dekhein. 'Achha' khare hone ki koshish na karein." },
  ],
};

export const NEXT_STEPS: { text: Bi; href: string; label: Bi }[] = [
  { text: { en: "Learn how posture is assessed in the Skills Lab.", ur: "Skills Lab mein posture ki assessment seekhein." }, href: "/skills/posture", label: { en: "Posture assessment skill", ur: "Posture assessment skill" } },
  { text: { en: "Gentle exercises and advice for an aching neck.", ur: "Dardnak gardan ke liye halki exercises aur mashwara." }, href: "/handouts/neck-pain", label: { en: "Neck pain handout", ur: "Gardan dard ki sheet" } },
  { text: { en: "Looking after your back.", ur: "Apni kamar ki dekh-bhaal." }, href: "/handouts/low-back-pain", label: { en: "Back pain handout", ur: "Kamar dard ki sheet" } },
];
