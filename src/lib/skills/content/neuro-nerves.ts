import type { BodyPoint, SkillAtlasItem, SkillDefinition } from "../types.ts";

/* ================================================================== */
/* Peripheral nerve examination                                        */
/* ================================================================== */

const nerve = (o: {
  id: string;
  title: string;
  group: string;
  roots: string;
  muscles: string;
  sensory: string;
  motorTest: string;
  sign: string;
  site: string;
  neuro?: string;
  point?: BodyPoint;
}): SkillAtlasItem => ({
  id: o.id,
  title: o.title,
  group: o.group,
  level: "beginner",
  subtitle: o.roots,
  point: o.point,
  fields: [
    { label: "Roots", value: o.roots, level: "beginner", quiz: true, ask: "Root values of the {title}?" },
    { label: "Key muscles", value: o.muscles, level: "beginner", quiz: true, ask: "Key muscles supplied by the {title}?" },
    { label: "Sensory area", value: o.sensory, level: "intermediate", quiz: true, ask: "Sensory area of the {title}?" },
    { label: "Quick motor test", value: o.motorTest, level: "intermediate", quiz: true, ask: "Quick motor test for the {title}?" },
    { label: "Classic lesion sign", value: o.sign, level: "advanced", quiz: true, ask: "Classic sign of a {title} lesion?" },
    { label: "Common injury site", value: o.site, level: "advanced", quiz: true, ask: "Common site or cause of {title} injury?" },
    ...(o.neuro ? [{ label: "Neurodynamic test", value: o.neuro, level: "expert" as const, quiz: true, ask: "Neurodynamic test that biases the {title}?" }] : []),
  ],
});

const nerveAtlas: SkillAtlasItem[] = [
  nerve({ id: "axillary", title: "Axillary nerve", group: "Upper limb", roots: "C5–C6", muscles: "Deltoid, teres minor", sensory: "Lateral upper arm over the deltoid ('regimental badge' area)", motorTest: "Shoulder abduction 15–90° against resistance", sign: "Flattened shoulder contour, weak abduction, numb badge patch", site: "Anterior shoulder dislocation, surgical-neck fracture of the humerus", point: { view: "front", x: 52, y: 100 } }),
  nerve({ id: "musculocutaneous", title: "Musculocutaneous nerve", group: "Upper limb", roots: "C5–C7", muscles: "Biceps brachii, brachialis, coracobrachialis", sensory: "Lateral forearm (lateral antebrachial cutaneous nerve)", motorTest: "Elbow flexion with the forearm supinated", sign: "Weak elbow flexion and supination, reduced biceps reflex, numb lateral forearm", site: "Rare in isolation — penetrating injury, heavy weight-lifting, shoulder surgery", point: { view: "front", x: 36, y: 190 } }),
  nerve({ id: "radial", title: "Radial nerve", group: "Upper limb", roots: "C5–T1", muscles: "Triceps, brachioradialis, wrist and finger extensors, supinator", sensory: "Dorsum of the first web space (superficial radial nerve)", motorTest: "Wrist and finger extension", sign: "Wrist drop", site: "Spiral groove (mid-shaft humerus fracture, 'Saturday-night palsy'); crutch palsy in the axilla", neuro: "ULNT2b — shoulder depression, elbow extension, internal rotation, pronation, wrist and finger flexion, ulnar deviation", point: { view: "back", x: 24, y: 240 } }),
  nerve({ id: "median", title: "Median nerve", group: "Upper limb", roots: "C6–T1", muscles: "Forearm flexors (pronator teres, FCR, FDS, lateral FDP, FPL), thenar muscles (APB, opponens), lateral two lumbricals", sensory: "Palmar thumb, index, middle and lateral half of the ring finger (test the index fingertip)", motorTest: "Thumb palmar abduction (APB) and the 'OK' sign (FPL + index FDP)", sign: "Thenar wasting, weak thumb abduction; 'hand of benediction' with high lesions", site: "Carpal tunnel at the wrist (commonest); supracondylar fracture at the elbow", neuro: "ULNT1 — shoulder depression, 110° abduction, wrist/finger extension, supination, external rotation, elbow extension", point: { view: "front", x: 27, y: 260 } }),
  nerve({ id: "ulnar", title: "Ulnar nerve", group: "Upper limb", roots: "C8–T1", muscles: "FCU, medial FDP, hypothenar muscles, interossei, medial two lumbricals, adductor pollicis", sensory: "Little finger and the medial half of the ring finger (palmar and dorsal)", motorTest: "Finger abduction/adduction and Froment's sign (pinch paper)", sign: "Claw hand (ring and little fingers), interosseous wasting, positive Froment's sign", site: "Cubital tunnel at the elbow (commonest); Guyon's canal at the wrist", neuro: "ULNT3 — wrist/finger extension, pronation, elbow flexion, shoulder external rotation, abduction, depression", point: { view: "front", x: 40, y: 254 } }),
  nerve({ id: "long-thoracic", title: "Long thoracic nerve", group: "Upper limb", roots: "C5–C7", muscles: "Serratus anterior", sensory: "None (purely motor)", motorTest: "Wall push-up — watch the medial border of the scapula", sign: "Medial winging of the scapula", site: "Heavy loads on the shoulder (backpack palsy), axillary surgery, sports trauma" }),
  nerve({ id: "spinal-accessory", title: "Spinal accessory nerve", group: "Upper limb", roots: "Cranial nerve XI (with C3–C4 contributions)", muscles: "Trapezius, sternocleidomastoid", sensory: "None (purely motor)", motorTest: "Shoulder shrug and resisted head rotation", sign: "Drooping shoulder, lateral scapular winging, weak shrug", site: "Posterior triangle of the neck — lymph-node biopsy or neck dissection" }),
  nerve({ id: "suprascapular", title: "Suprascapular nerve", group: "Upper limb", roots: "C5–C6", muscles: "Supraspinatus, infraspinatus", sensory: "None clinically (deep shoulder joint branches)", motorTest: "Resisted shoulder abduction (first 30°) and external rotation", sign: "Wasting of the supraspinous/infraspinous fossae, weak external rotation", site: "Suprascapular or spinoglenoid notch (cysts, overhead athletes, traction)" }),
  nerve({ id: "femoral", title: "Femoral nerve", group: "Lower limb", roots: "L2–L4", muscles: "Quadriceps, iliacus, sartorius, pectineus", sensory: "Anterior thigh and, via the saphenous nerve, the medial leg", motorTest: "Knee extension (and hip flexion)", sign: "Weak knee extension, knee buckling, absent knee reflex", site: "Pelvic surgery/haematoma, hip surgery, femoral catheterisation", neuro: "Prone knee bend (slump in side-lying for femoral/L2–L4)", point: { view: "front", x: 88, y: 268 } }),
  nerve({ id: "obturator", title: "Obturator nerve", group: "Lower limb", roots: "L2–L4", muscles: "Hip adductors (longus, brevis, part of magnus), gracilis", sensory: "Small area of the medial thigh", motorTest: "Resisted hip adduction", sign: "Weak adduction, wide-based (circumducted) gait, medial thigh numbness", site: "Pelvic fracture or surgery, childbirth, obturator hernia", point: { view: "front", x: 96, y: 284 } }),
  nerve({ id: "lateral-femoral-cutaneous", title: "Lateral femoral cutaneous nerve", group: "Lower limb", roots: "L2–L3", muscles: "None (purely sensory)", sensory: "Anterolateral thigh", motorTest: "No motor test — strength is normal", sign: "Burning or numbness of the anterolateral thigh (meralgia paraesthetica)", site: "Compression near the ASIS — tight belts, obesity, pregnancy", point: { view: "front", x: 74, y: 252 } }),
  nerve({ id: "sciatic", title: "Sciatic nerve", group: "Lower limb", roots: "L4–S3", muscles: "Hamstrings (and, via its branches, all muscles below the knee)", sensory: "Most of the leg below the knee (via tibial and common fibular branches), except the medial leg", motorTest: "Knee flexion plus the tests for its branches", sign: "Weak knee flexion with foot drop and weak plantarflexion", site: "Posterior hip dislocation, hip replacement, misplaced gluteal injection", neuro: "Straight leg raise (positive 30–70° with symptom reproduction) and the slump test", point: { view: "back", x: 74, y: 360 } }),
  nerve({ id: "common-fibular", title: "Common fibular (peroneal) nerve", group: "Lower limb", roots: "L4–S2", muscles: "Tibialis anterior, EHL, EDL (deep branch); fibularis longus and brevis (superficial branch)", sensory: "Dorsum of the foot and lateral leg; first dorsal web space (deep branch)", motorTest: "Ankle dorsiflexion and foot eversion", sign: "Foot drop with a high-stepping gait; inversion and hip abduction normal", site: "Neck of the fibula — fracture, tight cast, crossing the legs, weight loss", neuro: "SLR with ankle plantarflexion and inversion", point: { view: "front", x: 78, y: 430 } }),
  nerve({ id: "tibial", title: "Tibial nerve", group: "Lower limb", roots: "L4–S3", muscles: "Gastrocnemius, soleus, tibialis posterior, toe flexors, intrinsic foot muscles", sensory: "Sole of the foot (medial and lateral plantar nerves)", motorTest: "Plantarflexion (heel raises), inversion, toe flexion", sign: "Weak push-off and toe flexion, numb sole", site: "Tarsal tunnel (behind the medial malleolus); knee dislocation", neuro: "SLR with ankle dorsiflexion and eversion", point: { view: "back", x: 86, y: 428 } }),
  nerve({ id: "superior-gluteal", title: "Superior gluteal nerve", group: "Lower limb", roots: "L4–S1", muscles: "Gluteus medius, gluteus minimus, tensor fasciae latae", sensory: "None (purely motor)", motorTest: "Side-lying hip abduction; single-leg stance", sign: "Trendelenburg sign and gait (pelvis drops on the opposite side)", site: "Hip surgery (lateral approach), misplaced gluteal injection" }),
];

export const peripheralNervesSkill: SkillDefinition = {
  slug: "peripheral-nerves",
  title: "Peripheral Nerve Examination",
  short: "Peripheral nerves",
  keywords: "peripheral nerve nerves median ulnar radial axillary fibular peroneal sciatic tibial femoral nerve injury ulnt slr slump neurodynamic",
  phase: "neuro",
  icon: "nerves",
  summary: "Examine 15 key nerves — roots, muscles, sensory areas, quick tests and classic lesion signs — plus neurodynamic tests (ULNTs, SLR, slump, prone knee bend).",
  ur: "Har bari nerve ki roots, muscles, sensory area aur lesion sign — aur neurodynamic tests (ULNT, SLR, slump).",
  atlasLabel: "Nerve atlas",
  sources: [
    { title: "Aids to the Examination of the Peripheral Nervous System (Guarantors of Brain / MRC)" },
    { title: "Butler — The Sensitive Nervous System", note: "Neurodynamic testing." },
    { title: "Magee — Orthopedic Physical Assessment (7th ed.)" },
  ],
  goals: {
    beginner: "Know each nerve's roots and key muscles.",
    intermediate: "Test each nerve's motor and sensory function quickly.",
    advanced: "Recognise classic lesions and where they happen.",
    expert: "Tell nerve, root and plexus apart; perform neurodynamic tests.",
  },
  simulators: ["body-map"],
  related: [
    { label: "Myotomes skill", href: "/skills/myotomes" },
    { label: "Dermatomes skill", href: "/skills/dermatomes" },
    { label: "MMT skill", href: "/skills/manual-muscle-testing" },
  ],
  atlas: nerveAtlas,
  concepts: [
    {
      id: "nerve-vs-root",
      level: "beginner",
      title: "Nerve or root?",
      body: "A **peripheral nerve** carries fibres from several roots to a defined set of muscles and skin. A nerve lesion weakens **its** muscles and numbs **its** sensory area — which rarely matches a single dermatome or myotome.",
      ur: "Nerve ka area aur root ka area alag hai — isi se pehchaan hoti hai ke masla nerve mein hai ya root mein.",
    },
    {
      id: "big-three-hand",
      level: "beginner",
      title: "The hand's three nerves in 30 seconds",
      body: "**Radial** — extend the wrist and fingers (“stop” sign); sensation on the back of the first web space. **Median** — thumb up from the palm and the “OK” sign; sensation at the index fingertip. **Ulnar** — spread the fingers and grip paper (Froment); sensation at the little fingertip.",
    },
    {
      id: "sensory-autonomous",
      level: "intermediate",
      title: "Test the autonomous zones",
      body: "Each nerve has an **autonomous zone** that only it supplies — test there for a clear answer: index fingertip (median), little fingertip (ulnar), first dorsal web space (radial), lateral upper arm (axillary), first web space of the foot (deep fibular), sole (tibial).",
    },
    {
      id: "plexus",
      level: "intermediate",
      title: "Brachial plexus patterns",
      body: "Plexus lesions mix nerves and roots.",
      table: {
        head: ["Lesion", "Pattern"],
        rows: [
          ["Upper trunk (C5–C6) — Erb's palsy", "Arm hangs adducted and internally rotated, elbow extended, forearm pronated ('waiter's tip')"],
          ["Lower trunk (C8–T1) — Klumpke's palsy", "Weak intrinsic hand muscles, claw hand ± Horner's syndrome"],
          ["Posterior cord", "Axillary + radial nerve signs"],
        ],
      },
    },
    {
      id: "classic-signs",
      level: "advanced",
      title: "Classic lesion signs",
      bullets: [
        "**Wrist drop** — radial nerve at the spiral groove.",
        "**Claw hand** — ulnar nerve (ring and little fingers).",
        "**Thenar wasting / ape hand** — median nerve at the wrist.",
        "**Medial winging** — long thoracic; **lateral winging** — spinal accessory.",
        "**Foot drop with normal inversion** — common fibular at the fibular neck.",
        "**Trendelenburg** — superior gluteal nerve or weak gluteus medius.",
      ],
      body: "Learn these patterns by sight — examiners love them.",
    },
    {
      id: "ulnar-paradox",
      level: "advanced",
      title: "The ulnar paradox",
      body: "A **low** ulnar lesion (wrist) gives **more** clawing than a **high** one (elbow). In a high lesion the ulnar half of FDP is also paralysed, so the fingertips can't curl — the claw looks milder even though more is lost.",
    },
    {
      id: "neurodynamics",
      level: "expert",
      title: "Neurodynamic tests",
      body: "Neurodynamic tests load the nervous system with a sequence of movements. A test is **positive** when it reproduces the patient's symptoms, differs from the other side and the symptoms change with **structural differentiation** (moving a distant joint that affects the nerve but not the local tissue).",
      table: {
        head: ["Test", "Nerve bias", "Sequence (simplified)"],
        rows: [
          ["ULNT1", "Median", "Shoulder depression, abduction 110°, wrist/finger extension, supination, ER, elbow extension"],
          ["ULNT2a", "Median", "Shoulder girdle depression, elbow extension, ER, supination, wrist/finger extension, shoulder abduction"],
          ["ULNT2b", "Radial", "Depression, elbow extension, internal rotation, pronation, wrist/finger flexion, ulnar deviation"],
          ["ULNT3", "Ulnar", "Wrist/finger extension, pronation, elbow flexion, ER, abduction, depression"],
          ["SLR", "Sciatic/tibial (L4–S1)", "Passive hip flexion with knee straight; add ankle dorsiflexion; positive 30–70°"],
          ["Slump", "Neuraxis + sciatic", "Sitting slump, neck flexion, knee extension, ankle dorsiflexion; release neck flexion"],
          ["Prone knee bend", "Femoral (L2–L4)", "Prone, passive knee flexion; anterior thigh symptoms"],
        ],
      },
    },
    {
      id: "nerve-vs-root-expert",
      level: "expert",
      title: "Separating nerve, root and plexus",
      body: "Find a muscle that shares the **root** but not the **nerve**. Weak APB (median) + normal FPL (also median, higher branch) = carpal tunnel. Weak APB + weak FPL + weak pronator teres = high median lesion. Weak APB + weak triceps + numb middle finger = C7–C8 root or lower plexus. Nerve conduction studies confirm.",
    },
  ],
  questions: [
    { id: "nrv-b1", level: "beginner", prompt: "Wrist drop is caused by a lesion of the…", options: ["Radial nerve", "Median nerve", "Ulnar nerve", "Axillary nerve"], answer: 0, explain: "The radial nerve supplies the wrist and finger extensors." },
    { id: "nrv-b2", level: "beginner", prompt: "Which nerve supplies the deltoid?", options: ["Axillary", "Radial", "Musculocutaneous", "Suprascapular"], answer: 0, explain: "Axillary nerve: deltoid and teres minor." },
    { id: "nrv-b3", level: "beginner", prompt: "The median nerve's best sensory test site is…", options: ["The index fingertip (palmar)", "The little fingertip", "The back of the first web space", "The lateral forearm"], answer: 0, explain: "The palmar index tip is supplied only by the median nerve." },
    { id: "nrv-b4", level: "beginner", prompt: "Foot drop after a tight below-knee cast suggests the…", options: ["Common fibular nerve", "Femoral nerve", "Tibial nerve", "Obturator nerve"], answer: 0, explain: "The common fibular nerve wraps around the fibular neck." },
    { id: "nrv-i1", level: "intermediate", prompt: "Froment's sign tests…", options: ["Adductor pollicis (ulnar nerve)", "APB (median)", "EPL (radial)", "FDS (median)"], answer: 0, explain: "The thumb IP flexes (FPL, median) to compensate for weak adductor pollicis." },
    { id: "nrv-i2", level: "intermediate", prompt: "Erb's palsy affects which part of the plexus?", options: ["Upper trunk (C5–C6)", "Lower trunk (C8–T1)", "Posterior cord", "Medial cord"], answer: 0, explain: "Upper trunk: 'waiter's tip' posture." },
    { id: "nrv-i3", level: "intermediate", prompt: "Medial winging of the scapula = weakness of…", options: ["Serratus anterior (long thoracic nerve)", "Trapezius (spinal accessory)", "Rhomboids (dorsal scapular)", "Latissimus dorsi"], answer: 0, explain: "Serratus anterior holds the medial border against the chest wall." },
    { id: "nrv-i4", level: "intermediate", prompt: "Burning anterolateral thigh with normal strength suggests…", options: ["Meralgia paraesthetica (lateral femoral cutaneous)", "L4 radiculopathy", "Femoral nerve palsy", "Obturator palsy"], answer: 0, explain: "A purely sensory nerve compressed near the ASIS." },
    { id: "nrv-a1", level: "advanced", prompt: "Why can a low ulnar lesion look more clawed than a high one?", options: ["In high lesions ulnar FDP is also weak, so the fingertips can't curl", "Low lesions affect the radial nerve too", "High lesions spare the interossei", "It never does"], answer: 0, explain: "The ulnar paradox." },
    { id: "nrv-a2", level: "advanced", prompt: "Mid-shaft humerus fracture with wrist drop: where is the radial nerve injured?", options: ["Spiral groove", "Axilla", "Cubital tunnel", "Carpal tunnel"], answer: 0, explain: "The radial nerve lies in the spiral groove of the humerus." },
    { id: "nrv-a3", level: "advanced", prompt: "Foot drop with normal hip abduction and normal inversion suggests…", options: ["Common fibular nerve lesion", "L5 radiculopathy", "Sciatic nerve lesion", "Stroke"], answer: 0, explain: "Superior gluteal (hip abduction) and tibial (inversion) are spared." },
    { id: "nrv-a4", level: "advanced", prompt: "A positive Trendelenburg sign points to weakness of…", options: ["Gluteus medius (superior gluteal nerve)", "Gluteus maximus", "Iliopsoas", "Adductors"], answer: 0, explain: "The pelvis drops on the unsupported side." },
    { id: "nrv-e1", level: "expert", prompt: "Which neurodynamic test biases the median nerve?", options: ["ULNT1", "ULNT2b", "ULNT3", "Prone knee bend"], answer: 0, explain: "ULNT1 (and 2a) bias the median nerve." },
    { id: "nrv-e2", level: "expert", prompt: "A neurodynamic test is positive when…", options: ["It reproduces symptoms, differs from the other side and changes with structural differentiation", "It is painful", "It feels tight", "The range is less than 90°"], answer: 0, explain: "Stretch discomfort alone is not a positive test." },
    { id: "nrv-e3", level: "expert", case: "Numb index fingertip and weak APB, but FPL and pronator teres are strong.", prompt: "Lesion site?", options: ["Median nerve at the wrist (carpal tunnel)", "High median nerve at the elbow", "C6 root", "Anterior interosseous nerve"], answer: 0, explain: "Branches above the wrist are spared." },
    { id: "nrv-e4", level: "expert", case: "SLR reproduces buttock and calf pain at 40°; adding ankle dorsiflexion worsens it; releasing hip flexion slightly eases it.", prompt: "Interpretation?", options: ["Positive neurodynamic test — sciatic nerve/L5–S1 root sensitivity", "Hamstring tightness only", "Hip osteoarthritis", "Negative test"], answer: 0, explain: "Symptom reproduction with structural differentiation (ankle DF) supports neural involvement." },
    { id: "nrv-e5", level: "expert", case: "Weak shoulder abduction, elbow flexion and external rotation; numb lateral arm and forearm after a motorbike fall onto the shoulder.", prompt: "Most likely lesion?", options: ["Upper trunk of the brachial plexus (C5–C6, Erb's)", "Axillary nerve only", "Radial nerve at the spiral groove", "C8–T1 lower trunk"], answer: 0, explain: "Several C5–C6 nerves (axillary, suprascapular, musculocutaneous) together = upper trunk." },
    { id: "nrv-e6", level: "expert", case: "Wrist drop, but triceps strength and the triceps reflex are normal; numb dorsal first web space.", prompt: "Where is the radial nerve injured?", options: ["Spiral groove of the humerus — below the triceps branches", "Axilla — above the triceps branches", "Posterior interosseous nerve only (no sensory loss)", "C7 root"], answer: 0, explain: "Triceps spared + sensory loss = spiral groove; PIN lesions have no sensory loss." },
    { id: "nrv-e7", level: "expert", case: "Claw hand of the ring and little fingers with weak finger abduction, but normal sensation and strong FDP to the little finger.", prompt: "Lesion site?", options: ["Deep (motor) branch of the ulnar nerve at Guyon's canal", "Ulnar nerve at the elbow", "C8 root", "Median nerve"], answer: 0, explain: "Sensory sparing and strong ulnar FDP place it distally — the deep motor branch at the wrist." },
    { id: "nrv-e8", level: "expert", case: "Tingling in the thumb and index finger at night; positive Phalen's and Tinel's at the wrist; normal neck movements and reflexes.", prompt: "Best next step?", options: ["Treat as carpal tunnel syndrome (night splint, education) and refer for nerve conduction if severe or persistent", "Cervical traction for C6 radiculopathy", "Ulnar nerve gliding", "Immediate surgery for everyone"], answer: 0, explain: "Classic median nerve compression at the wrist; conservative care first unless wasting or severe." },
  ],
  stations: [
    {
      id: "station-hand-nerves",
      title: "Screen the three nerves of the hand",
      minutes: 5,
      scenario: "A patient fell on an outstretched hand. Screen radial, median and ulnar nerve function quickly.",
      tasks: ["Test one motor action and one sensory zone for each nerve.", "Report any deficit."],
      checklist: ["Radial: wrist/finger extension + dorsal first web space", "Median: thumb palmar abduction or 'OK' sign + palmar index fingertip", "Ulnar: finger abduction or Froment + little fingertip", "Compares with the other hand", "Names the nerve affected"],
    },
    {
      id: "station-ulnt1",
      title: "Perform ULNT1 (median bias)",
      minutes: 6,
      scenario: "A patient with arm symptoms in a median distribution. Perform ULNT1 and interpret.",
      tasks: ["Perform the sequence on the unaffected side first.", "Perform on the affected side.", "Use structural differentiation and interpret."],
      checklist: ["Supine near the edge; explains the test", "Shoulder girdle depression maintained", "Abduction ~110°, wrist and finger extension, supination, external rotation", "Elbow extension last, stopping at symptom onset", "Structural differentiation (neck side flexion away/toward)", "Compares sides and interprets positive vs negative correctly"],
    },
    {
      id: "station-foot-drop",
      title: "Foot drop: root or nerve?",
      minutes: 6,
      scenario: "A patient presents with foot drop. Examine to decide between L5 radiculopathy and common fibular neuropathy.",
      tasks: ["Test dorsiflexion, eversion, inversion and hip abduction.", "Test sensation and the medial hamstring reflex.", "Decide."],
      checklist: ["Tests dorsiflexion and eversion", "Tests inversion (tibial) and hip abduction (superior gluteal)", "Tests sensation of the dorsum of the foot and the first web space", "Tests the medial hamstring reflex", "Concludes L5 if hip abduction/inversion are weak; fibular nerve if spared", "Checks the fibular neck for tenderness/Tinel's"],
    },
  ],
};

/* ================================================================== */
/* Tone & coordination                                                 */
/* ================================================================== */

const toneItem = (id: string, title: string, group: string, what: string, how: string, abnormal: string, meaning: string, pitfall: string): SkillAtlasItem => ({
  id,
  title,
  group,
  level: "beginner",
  fields: [
    { label: "What it tests", value: what, level: "beginner", quiz: true, ask: "What does the {title} test?" },
    { label: "How to perform", value: how, level: "intermediate", quiz: true, ask: "How do you perform the {title}?" },
    { label: "Abnormal finding", value: abnormal, level: "intermediate", quiz: true, ask: "What is an abnormal finding in the {title}?" },
    { label: "Interpretation", value: meaning, level: "advanced", quiz: true, ask: "What does an abnormal {title} suggest?" },
    { label: "Pitfall", value: pitfall, level: "expert" },
  ],
});

const toneAtlas: SkillAtlasItem[] = [
  toneItem("mas", "Modified Ashworth Scale", "Tone", "Resistance to passive stretch (spasticity) graded 0, 1, 1+, 2, 3, 4", "Patient relaxed (often supine); move the limb through full range in about one second; grade the resistance felt.", "Catch, resistance through range or rigidity (grades 1–4)", "Spasticity from an upper motor neuron lesion (stroke, SCI, MS, cerebral palsy)", "It does not separate neural spasticity from stiff soft tissue — combine with Tardieu and PROM."),
  toneItem("tardieu", "Modified Tardieu Scale", "Tone", "Velocity-dependent spasticity: the angle of catch versus full passive range", "Move the joint slowly (V1) to find full PROM (R2), then as fast as possible (V3) to find the angle of catch (R1).", "A catch (R1) well before the end of slow range (R2)", "A large R2−R1 gap = dynamic spasticity (may respond to stretching/botulinum toxin); small gap = contracture", "Speed must be standardised and the same angle measured each time."),
  toneItem("clonus", "Clonus", "Tone", "Hyperexcitable stretch reflex", "Briskly dorsiflex the foot (or push the patella down) and hold.", "Rhythmic beats — sustained (more than about 3–5) is abnormal", "Upper motor neuron lesion", "A few unsustained beats can occur in anxious or brisk normal people."),
  toneItem("lead-pipe", "Lead-pipe rigidity", "Tone", "Uniform resistance through range regardless of speed", "Move the limb slowly and quickly through full range; compare.", "Constant 'bending a lead pipe' resistance in both directions", "Extrapyramidal disorder (e.g. Parkinson's disease, neuroleptic side effects)", "Ask the patient to move the other limb (activation) to bring out subtle rigidity."),
  toneItem("cogwheel", "Cogwheel rigidity", "Tone", "Rigidity with a superimposed tremor", "Slowly flex and extend or rotate the wrist; feel for ratchet-like jerks.", "A ratchety, catch-release-catch feel through range", "Parkinson's disease (rigidity + tremor)", "Don't confuse with spasticity — rigidity is not velocity-dependent and affects both directions."),
  toneItem("finger-nose", "Finger-to-nose test", "Coordination", "Accuracy and smoothness of arm movement (cerebellar function)", "Patient touches their nose then your finger, repeatedly; move your finger to new positions.", "Dysmetria (overshooting/undershooting) and intention tremor near the target", "Ipsilateral cerebellar hemisphere lesion; also sensory ataxia if worse with eyes closed", "Severe weakness can mimic incoordination — check power first."),
  toneItem("rapid-alternating", "Rapid alternating movements", "Coordination", "Ability to switch quickly between opposing movements", "Patient pats one hand alternately with the palm and back of the other hand as fast as possible.", "Slow, irregular, clumsy alternation (dysdiadochokinesia)", "Cerebellar lesion (same side)", "Compare with the non-dominant side normally being slightly slower."),
  toneItem("heel-shin", "Heel-to-shin test", "Coordination", "Lower-limb coordination (cerebellar)", "Supine: place one heel on the opposite knee and slide it down the shin to the ankle, then back.", "Heel wobbles off the shin, overshoots or tremors", "Ipsilateral cerebellar lesion; sensory ataxia if much worse with eyes closed", "Hip or knee pain and weakness affect performance."),
  toneItem("romberg", "Romberg test", "Balance & proprioception", "Proprioception (dorsal columns) — not the cerebellum", "Standing, feet together, arms by the sides; eyes open then closed for 30 seconds; stand close to guard.", "Stable with eyes open but sways or falls with eyes closed", "Sensory ataxia: dorsal column or large-fibre neuropathy (e.g. B12 deficiency, diabetes)", "Patients with cerebellar ataxia are unstable even with eyes open — that is not a positive Romberg."),
  toneItem("tandem", "Tandem gait", "Balance & proprioception", "Dynamic balance and midline cerebellar function", "Walk heel-to-toe in a straight line for about 10 steps.", "Unable to keep heel-to-toe, steps off the line, wide base", "Midline (vermis) cerebellar lesion, vestibular or sensory deficits", "Often impaired in normal older adults — interpret with age."),
  toneItem("pronator-drift", "Pronator drift", "Balance & proprioception", "Subtle upper motor neuron weakness", "Arms outstretched, palms up, eyes closed for 20–30 seconds.", "One arm pronates and drifts downward", "Contralateral UMN (pyramidal) lesion", "Upward drift without pronation suggests a parietal (proprioceptive) or cerebellar problem."),
];

export const toneCoordinationSkill: SkillDefinition = {
  slug: "tone-coordination",
  title: "Tone & Coordination",
  short: "Tone & coordination",
  keywords: "tone spasticity grading grade rigidity hypotonia modified ashworth scale mas tardieu coordination cerebellar ataxia finger nose heel shin dysdiadochokinesia",
  phase: "neuro",
  icon: "tone",
  summary: "Grade spasticity with the Modified Ashworth and Tardieu scales, tell spasticity from rigidity, and examine coordination and balance — finger-nose, heel-shin, Romberg and more.",
  ur: "Spasticity ko MAS aur Tardieu se grade karna, rigidity se farq karna, aur coordination tests sahi tareeqe se karna.",
  atlasLabel: "Tone & coordination atlas",
  sources: [
    { title: "Bohannon & Smith (1987) — Modified Ashworth Scale" },
    { title: "Boyd & Graham (1999) — Modified Tardieu Scale" },
    { title: "O'Sullivan, Schmitz & Fulk — Physical Rehabilitation (7th ed.)" },
  ],
  goals: {
    beginner: "Know what tone is and what each coordination test checks.",
    intermediate: "Perform MAS, Tardieu and coordination tests correctly.",
    advanced: "Separate spasticity, rigidity, cerebellar and sensory ataxia.",
    expert: "Use findings to guide treatment and pass neuro OSCE stations.",
  },
  simulators: ["mas-grade"],
  related: [
    { label: "Reflexes & UMN signs skill", href: "/skills/reflexes" },
    { label: "UMN vs LMN lesson", href: "/learn/umn-vs-lmn" },
    { label: "Balance & function skill", href: "/skills/balance-function" },
  ],
  atlas: toneAtlas,
  concepts: [
    {
      id: "what-is-tone",
      level: "beginner",
      title: "What is muscle tone?",
      body: "Tone is the **resistance you feel when you move a relaxed limb**. Too little (hypotonia) feels floppy — LMN or cerebellar problems. Too much (hypertonia) is either **spasticity** or **rigidity**.",
      ur: "Tone = aaram ki halat mein limb ko hilaane par mehsoos hone wali resistance.",
    },
    {
      id: "spasticity-vs-rigidity",
      level: "beginner",
      title: "Spasticity vs rigidity",
      table: {
        head: ["", "Spasticity", "Rigidity"],
        rows: [
          ["Lesion", "Upper motor neuron (pyramidal)", "Extrapyramidal (e.g. Parkinson's)"],
          ["Speed", "Velocity-dependent — worse with fast stretch", "Same at any speed"],
          ["Direction", "Mostly one direction (arm flexors, leg extensors)", "Both directions"],
          ["Feel", "Catch / clasp-knife", "Lead-pipe or cogwheel"],
        ],
      },
      body: "The speed test is the key: move fast, then slow.",
    },
    {
      id: "mas-method",
      level: "intermediate",
      title: "Modified Ashworth Scale — method",
      body: "Position the patient relaxed and supported. Move the limb through its **full available range in about one second**. Grade what you feel; repeat no more than three times (repetition reduces tone).",
      table: {
        head: ["Grade", "Description"],
        rows: [
          ["0", "No increase in tone"],
          ["1", "Slight increase: catch and release or minimal resistance at the end of range"],
          ["1+", "Slight increase: catch, then minimal resistance through less than half of the range"],
          ["2", "Marked increase through most of the range, but the part moves easily"],
          ["3", "Considerable increase; passive movement difficult"],
          ["4", "Rigid in flexion or extension"],
        ],
      },
    },
    {
      id: "coordination-tests",
      level: "intermediate",
      title: "Coordination tests",
      body: "Test the arms (finger-to-nose, rapid alternating movements) and the legs (heel-to-shin), then balance (Romberg, tandem gait). Do them with eyes open and closed: incoordination that worsens dramatically with eyes closed is **sensory**, not cerebellar.",
    },
    {
      id: "cerebellar-signs",
      level: "advanced",
      title: "Cerebellar signs (DANISH)",
      bullets: ["**D**ysdiadochokinesia", "**A**taxia (wide-based, staggering gait)", "**N**ystagmus", "**I**ntention tremor", "**S**lurred (scanning) speech", "**H**ypotonia / heel-shin abnormality"],
      body: "Hemispheric lesions affect the limbs on the same side; midline (vermis) lesions affect trunk and gait.",
    },
    {
      id: "romberg-meaning",
      level: "advanced",
      title: "What Romberg really tests",
      body: "Romberg is positive only when the patient is **steady with eyes open but unsteady with eyes closed** — vision was compensating for lost proprioception. A patient unsteady with eyes open has cerebellar or vestibular ataxia; the test is then not interpretable as 'positive'.",
    },
    {
      id: "treatment-links",
      level: "expert",
      title: "From findings to treatment",
      body: "A large Tardieu R2−R1 gap means the limitation is mostly neural — positioning, stretching, splinting and (medically) botulinum toxin may help. A small gap with reduced R2 means contracture — serial casting or surgery may be needed. Cerebellar ataxia responds to task practice with weights, visual cues and balance training; sensory ataxia to vision, proprioceptive training and safe environments.",
    },
  ],
  questions: [
    { id: "ton-b1", level: "beginner", prompt: "Spasticity is…", options: ["Velocity-dependent increase in tone", "The same at all speeds", "Reduced tone", "Normal tone"], answer: 0, explain: "Faster stretch = more resistance." },
    { id: "ton-b2", level: "beginner", prompt: "Rigidity is typical of…", options: ["Parkinson's disease", "Stroke", "Peripheral neuropathy", "Spinal cord injury"], answer: 0, explain: "Extrapyramidal disorders cause rigidity." },
    { id: "ton-b3", level: "beginner", prompt: "The finger-to-nose test checks…", options: ["Coordination (cerebellar function)", "Strength", "Sensation", "Range of motion"], answer: 0, explain: "Accuracy and smoothness of movement." },
    { id: "ton-b4", level: "beginner", prompt: "Hypotonia (floppy limb) suggests…", options: ["LMN or cerebellar problem", "Parkinson's disease", "Chronic stroke spasticity", "Normal finding in adults"], answer: 0, explain: "Reduced tone = LMN, cerebellar or acute spinal shock." },
    { id: "ton-i1", level: "intermediate", prompt: "MAS grade 1+ means…", options: ["Catch followed by minimal resistance through less than half of the range", "No increase in tone", "Rigid limb", "Marked increase through most of the range"], answer: 0, explain: "1+ adds minimal resistance after the catch." },
    { id: "ton-i2", level: "intermediate", prompt: "How fast should you move the limb for MAS?", options: ["Through full range in about one second", "As slowly as possible", "Over 10 seconds", "Any speed"], answer: 0, explain: "Standard speed ≈ 1 second." },
    { id: "ton-i3", level: "intermediate", prompt: "In the Tardieu scale, R1 is…", options: ["The angle of catch with fast stretch", "Full passive range with slow stretch", "The resting angle", "Active range"], answer: 0, explain: "R1 = catch at fast velocity; R2 = full slow PROM." },
    { id: "ton-i4", level: "intermediate", prompt: "Dysdiadochokinesia is…", options: ["Impaired rapid alternating movements", "Overshooting a target", "Tremor at rest", "Loss of position sense"], answer: 0, explain: "A cerebellar sign." },
    { id: "ton-a1", level: "advanced", prompt: "Steady with eyes open, falls with eyes closed:", options: ["Positive Romberg — sensory (proprioceptive) ataxia", "Cerebellar ataxia", "Normal", "Vestibular neuritis only"], answer: 0, explain: "Vision was compensating for lost proprioception." },
    { id: "ton-a2", level: "advanced", prompt: "Right-sided intention tremor and dysmetria suggest a lesion in the…", options: ["Right cerebellar hemisphere", "Left cerebellar hemisphere", "Left motor cortex", "Right dorsal columns"], answer: 0, explain: "Cerebellar hemisphere lesions affect the same side." },
    { id: "ton-a3", level: "advanced", prompt: "Ratchety resistance at the wrist that doesn't change with speed =", options: ["Cogwheel rigidity", "Spasticity MAS 1+", "Clonus", "Contracture"], answer: 0, explain: "Rigidity with superimposed tremor." },
    { id: "ton-a4", level: "advanced", prompt: "Pronator drift indicates…", options: ["A subtle contralateral UMN lesion", "Cerebellar disease only", "Peripheral nerve lesion", "Normal fatigue"], answer: 0, explain: "The weak arm pronates and drifts down." },
    { id: "ton-e1", level: "expert", case: "Elbow flexors after stroke: slow PROM extension to 0° (R2), fast stretch catch at 60° (R1).", prompt: "What does the large gap suggest?", options: ["Mostly dynamic (neural) spasticity — may respond to stretching/toxin", "Fixed contracture", "No spasticity", "Rigidity"], answer: 0, explain: "R2−R1 = 60° dynamic component." },
    { id: "ton-e2", level: "expert", case: "Wide-based staggering gait, can't tandem walk, limbs coordinate normally lying down.", prompt: "Lesion?", options: ["Midline (vermis) cerebellum", "Cerebellar hemisphere", "Dorsal columns", "Peripheral neuropathy"], answer: 0, explain: "Truncal/gait ataxia with normal limbs = vermis." },
    { id: "ton-e3", level: "expert", prompt: "Which finding best separates spasticity from rigidity?", options: ["Whether resistance changes with stretch speed", "The patient's age", "Muscle bulk", "Reflex hammer type"], answer: 0, explain: "Spasticity is velocity-dependent; rigidity is not." },
    { id: "ton-e4", level: "expert", case: "Numb feet, absent ankle reflexes, unsteady in the dark, positive Romberg.", prompt: "Most helpful treatment focus?", options: ["Visual compensation, proprioceptive and balance training, safe home lighting", "Botulinum toxin", "Spasticity stretching only", "Bed rest"], answer: 0, explain: "Sensory ataxia: train balance and compensate with vision." },
    { id: "ton-e5", level: "expert", case: "Stroke: MAS 3 in the plantarflexors; slow PROM dorsiflexion stops at −10° (cannot reach neutral).", prompt: "What does this add?", options: ["A fixed contracture component is present — stretching/serial casting or orthotic needed, toxin alone won't restore range", "Pure dynamic spasticity", "Normal tone", "Rigidity"], answer: 0, explain: "If slow passive range (R2) is limited, soft-tissue shortening exists alongside spasticity." },
    { id: "ton-e6", level: "expert", case: "Resistance increases on fast elbow extension, with a clasp-knife release near end range.", prompt: "Pattern?", options: ["Spasticity (UMN)", "Lead-pipe rigidity", "Gegenhalten (paratonia)", "Hypotonia"], answer: 0, explain: "Velocity dependence and the clasp-knife phenomenon are classic spasticity." },
    { id: "ton-e7", level: "expert", case: "An older adult with dementia: resistance that increases the harder you try to move the limb, in any direction.", prompt: "Most likely?", options: ["Paratonia (gegenhalten)", "Spasticity", "Cogwheel rigidity", "Contracture"], answer: 0, explain: "Paratonia matches the examiner's force and is seen with frontal-lobe/diffuse disease." },
    { id: "ton-e8", level: "expert", case: "Heel-to-shin test is clumsy only with eyes closed; finger-to-nose is normal.", prompt: "Most likely cause?", options: ["Lower-limb proprioceptive loss (sensory ataxia)", "Cerebellar hemisphere lesion", "Vermis lesion", "Parkinson's disease"], answer: 0, explain: "Cerebellar ataxia does not improve much with vision; sensory ataxia worsens without it." },
    { id: "ton-e9", level: "expert", prompt: "When should MAS be re-tested to judge a botulinum toxin injection?", options: ["Same position, same speed, same time of day, by the same assessor — about 4–6 weeks after injection", "Immediately after the injection", "Only after 1 year", "Any position is fine"], answer: 0, explain: "Toxin peaks at ~4–6 weeks; standardisation is essential for MAS reliability." },
  ],
  stations: [
    {
      id: "station-mas",
      title: "Grade elbow flexor spasticity",
      minutes: 5,
      scenario: "A patient 3 months after a stroke. Grade the elbow flexors with the Modified Ashworth Scale and explain.",
      tasks: ["Position and relax the patient.", "Perform the test at the correct speed.", "Grade and explain."],
      checklist: ["Supine, arm supported, elbow flexed to start", "Moves into full extension in about one second", "Repeats no more than three times", "Grades with the correct definition (0, 1, 1+, 2, 3, 4)", "Compares with the unaffected side", "Mentions Tardieu or PROM to separate contracture"],
    },
    {
      id: "station-cerebellar",
      title: "Cerebellar examination",
      minutes: 7,
      scenario: "A patient reports clumsiness and unsteadiness. Perform a coordination examination.",
      tasks: ["Upper-limb tests.", "Lower-limb test.", "Gait and balance.", "Summarise."],
      checklist: ["Finger-to-nose with a moving target", "Rapid alternating movements both sides", "Heel-to-shin both sides", "Observes gait and tandem walking", "Romberg — eyes open then closed, guarding the patient", "Distinguishes cerebellar from sensory ataxia in the summary"],
    },
  ],
};
