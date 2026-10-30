export type AtlasCategory =
  | "Anatomy"
  | "Pathology"
  | "Mechanism"
  | "Assessment"
  | "Rehabilitation";

export type AtlasRegion =
  | "Head & Neck"
  | "Shoulder"
  | "Elbow & Forearm"
  | "Wrist & Hand"
  | "Spine"
  | "Hip & Groin"
  | "Thigh"
  | "Knee"
  | "Ankle & Foot";

export type AtlasHotspot = {
  label: string;
  x: number;
  y: number;
  note: string;
};

export type AtlasComparison = {
  beforePath: string;
  afterPath: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
};

export type ClinicalVisualEntry = {
  slug: string;
  title: string;
  shortTitle: string;
  region: AtlasRegion;
  category: AtlasCategory;
  summary: string;
  learningPoints: string[];
  imagePath?: string;
  externalImageUrl?: string;
  imageAttribution?: { source: string; sourceUrl: string; license: string; licenseUrl: string };
  thumbnailPath?: string;
  crop?: { x: number; y: number; width: number; height: number };
  assetReady: boolean;
  hotspots?: AtlasHotspot[];
  comparison?: AtlasComparison;
  conditionSlugs?: string[];
  relatedLinks: Array<{ label: string; href: string }>;
};

const masterBase = "pna/clinical-visual-atlas/master/msk-atlas-01";
const kneeMasterBase = "pna/clinical-visual-atlas/master/knee-atlas-02";
const shoulderBase = "pna/clinical-visual-atlas/shoulder";
const headNeckBase = "pna/clinical-visual-atlas/head-neck";
const elbowForearmBase = "pna/clinical-visual-atlas/elbow-forearm";
const wristHandBase = "pna/clinical-visual-atlas/wrist-hand";
const hipGroinBase = "pna/clinical-visual-atlas/hip-groin";
const thighBase = "pna/clinical-visual-atlas/thigh";
const ankleFootBase = "pna/clinical-visual-atlas/ankle-foot";
const kneeBase = "pna/clinical-visual-atlas/knee";

export const clinicalVisualAtlas: ClinicalVisualEntry[] = [
  {
    slug: "normal-shoulder-anatomy",
    title: "Normal Shoulder Anatomy",
    shortTitle: "Normal Shoulder",
    region: "Shoulder",
    category: "Anatomy",
    summary:
      "A clinically oriented 3D view of the glenohumeral complex, rotator cuff, long-head biceps tendon and subacromial-subdeltoid bursa.",
    learningPoints: [
      "Orient the humeral head, glenoid, scapula, clavicle, acromion and coracoid before interpreting pathology.",
      "The supraspinatus tendon passes beneath the acromial region to the greater tuberosity.",
      "The long-head biceps tendon and subacromial-subdeltoid bursa are important neighboring structures in shoulder pain assessment.",
    ],
    imagePath: `${shoulderBase}/normal-shoulder-anatomy`,
    thumbnailPath: `${shoulderBase}/normal-shoulder-anatomy`,
    assetReady: true,
    conditionSlugs: [
      "rotator-cuff-tendinopathy",
      "rotator-cuff-full-thickness-tear",
      "anterior-shoulder-instability",
    ],
    relatedLinks: [
      { label: "Rotator cuff tendinopathy guide", href: "/msk-injuries/rotator-cuff-tendinopathy" },
      { label: "Full-thickness rotator cuff tear guide", href: "/msk-injuries/rotator-cuff-full-thickness-tear" },
    ],
  },
  {
    slug: "rotator-cuff-anatomy",
    title: "Rotator Cuff Anatomy",
    shortTitle: "Rotator Cuff",
    region: "Shoulder",
    category: "Anatomy",
    summary:
      "3D orientation of the supraspinatus, infraspinatus, teres minor and subscapularis around the humeral head.",
    learningPoints: [
      "The four rotator cuff muscles approach the humeral head from different directions and contribute to dynamic shoulder stability.",
      "Supraspinatus, infraspinatus and teres minor insert on the greater tuberosity; subscapularis inserts on the lesser tuberosity.",
      "Rotator cuff anatomy should be interpreted together with scapular position, deltoid function and joint loading.",
    ],
    imagePath: `${shoulderBase}/rotator-cuff-anatomy`,
    thumbnailPath: `${shoulderBase}/rotator-cuff-anatomy`,
    assetReady: true,
    conditionSlugs: [
      "rotator-cuff-tendinopathy",
      "rotator-cuff-full-thickness-tear",
    ],
    relatedLinks: [
      { label: "Rotator cuff tendinopathy guide", href: "/msk-injuries/rotator-cuff-tendinopathy" },
      { label: "Full-thickness rotator cuff tear guide", href: "/msk-injuries/rotator-cuff-full-thickness-tear" },
    ],
  },
  {
    slug: "supraspinatus-full-thickness-tear",
    title: "Supraspinatus Full-Thickness Tear",
    shortTitle: "Supraspinatus Tear",
    region: "Shoulder",
    category: "Pathology",
    summary:
      "A focused 3D pathology view showing full-thickness supraspinatus tendon discontinuity with a visible defect and tendon retraction.",
    learningPoints: [
      "A full-thickness tear represents loss of tendon continuity through its full depth.",
      "Tear size, retraction, muscle quality, symptoms and functional demand all influence clinical decision-making.",
      "Imaging findings should be integrated with history, strength, active motion and functional limitation.",
    ],
    imagePath: `${shoulderBase}/supraspinatus-full-thickness-tear`,
    thumbnailPath: `${shoulderBase}/supraspinatus-full-thickness-tear`,
    assetReady: true,
    conditionSlugs: ["rotator-cuff-full-thickness-tear"],
    relatedLinks: [
      { label: "Full-thickness rotator cuff tear guide", href: "/msk-injuries/rotator-cuff-full-thickness-tear" },
    ],
  },
  {
    slug: "subacromial-bursitis-impingement",
    title: "Subacromial-Subdeltoid Bursa and Pain-Sensitive Region",
    shortTitle: "Subacromial Region",
    region: "Shoulder",
    category: "Pathology",
    summary:
      "3D teaching view of the subacromial-subdeltoid bursa and supraspinatus tendon in their clinically relevant spatial relationship.",
    learningPoints: [
      "The subacromial-subdeltoid bursa lies between the rotator cuff region and the overlying acromial-deltoid structures.",
      "Subacromial pain is multifactorial and should not be reduced to a simple bone-on-tendon pinching model.",
      "Load tolerance, rotator cuff capacity, movement behavior and the overall clinical picture guide rehabilitation.",
    ],
    imagePath: `${shoulderBase}/subacromial-bursitis-impingement`,
    thumbnailPath: `${shoulderBase}/subacromial-bursitis-impingement`,
    assetReady: true,
    conditionSlugs: ["rotator-cuff-tendinopathy"],
    relatedLinks: [
      { label: "Rotator cuff tendinopathy / subacromial pain guide", href: "/msk-injuries/rotator-cuff-tendinopathy" },
    ],
  },
  {
    slug: "anterior-shoulder-instability-pathology",
    title: "Anterior Shoulder Instability — Bankart-Type Lesion",
    shortTitle: "Anterior Instability",
    region: "Shoulder",
    category: "Pathology",
    summary:
      "3D anterior-oblique cutaway showing anterior-inferior capsulolabral injury consistent with a Bankart-type lesion.",
    learningPoints: [
      "Anterior instability commonly involves the anterior-inferior capsulolabral complex.",
      "A Bankart lesion is a labral injury pattern and does not by itself describe the whole instability presentation.",
      "History, apprehension, instability episodes and functional demands remain central to clinical reasoning.",
    ],
    imagePath: `${shoulderBase}/anterior-shoulder-instability`,
    thumbnailPath: `${shoulderBase}/anterior-shoulder-instability`,
    assetReady: true,
    conditionSlugs: ["anterior-shoulder-instability"],
    relatedLinks: [
      { label: "Anterior Shoulder Instability guide", href: "/msk-injuries/anterior-shoulder-instability" },
    ],
  },
  {
    slug: "cervical-spine-anatomy",
    title: "Cervical Spine Anatomy",
    shortTitle: "Cervical Spine",
    region: "Head & Neck",
    category: "Anatomy",
    summary:
      "Oblique 3D anatomy of C2–C7, intervertebral discs, facet joints, spinal canal, neural foramina and exiting cervical nerve roots.",
    learningPoints: [
      "Orient vertebral bodies, discs, facet joints and neural foramina before interpreting radicular pathology.",
      "Cervical nerve roots exit through neural foramina adjacent to discs and uncovertebral structures.",
      "Anatomy supports localization but symptoms must still be interpreted clinically.",
    ],
    imagePath: `${headNeckBase}/cervical-spine-anatomy`,
    thumbnailPath: `${headNeckBase}/cervical-spine-anatomy`,
    assetReady: true,
    conditionSlugs: ["cervical-radiculopathy"],
    relatedLinks: [
      { label: "Cervical Radiculopathy guide", href: "/msk-injuries/cervical-radiculopathy" },
    ],
  },
  {
    slug: "lateral-ankle-sprain",
    title: "Lateral Ankle Sprain",
    shortTitle: "Lateral Ankle Sprain",
    region: "Ankle & Foot",
    category: "Pathology",
    summary:
      "3D lateral ankle view showing the lateral ligament complex with realistic ATFL-predominant injury.",
    learningPoints: [
      "The ATFL is commonly injured in inversion-type lateral ankle sprains.",
      "CFL involvement may occur with more substantial injury while the PTFL is less commonly injured in routine sprains.",
      "Severity and return-to-activity decisions require functional assessment rather than image appearance alone.",
    ],
    imagePath: `${ankleFootBase}/lateral-ankle-sprain`,
    thumbnailPath: `${ankleFootBase}/lateral-ankle-sprain`,
    assetReady: true,
    conditionSlugs: ["lateral-ankle-sprain"],
    relatedLinks: [{ label: "Lateral Ankle Sprain guide", href: "/msk-injuries/lateral-ankle-sprain" }],
  },
  {
    slug: "achilles-tendon-rupture",
    title: "Achilles Tendon Rupture",
    shortTitle: "Achilles Rupture",
    region: "Ankle & Foot",
    category: "Pathology",
    summary:
      "Posterior lower-leg 3D anatomy showing midsubstance Achilles tendon discontinuity and retraction.",
    learningPoints: [
      "The Achilles tendon transmits force from the gastrocnemius-soleus complex to the calcaneus.",
      "Complete rupture creates tendon discontinuity, but gap size varies with position and imaging method.",
      "Diagnosis and management should integrate history, examination, function and specialist referral where indicated.",
    ],
    imagePath: `${ankleFootBase}/achilles-tendon-rupture`,
    thumbnailPath: `${ankleFootBase}/achilles-tendon-rupture`,
    assetReady: true,
    conditionSlugs: ["achilles-tendon-rupture"],
    relatedLinks: [{ label: "Achilles Tendon Rupture guide", href: "/msk-injuries/achilles-tendon-rupture" }],
  },
  {
    slug: "hamstring-strain",
    title: "Hamstring Strain",
    shortTitle: "Hamstring Strain",
    region: "Thigh",
    category: "Pathology",
    summary:
      "Posterior-thigh 3D view showing a realistic musculotendinous biceps femoris strain with localized fiber disruption.",
    learningPoints: [
      "Hamstring strains commonly involve the musculotendinous region and frequently affect biceps femoris long head.",
      "Clinical severity depends on pain, strength loss, function, tissue involvement and recovery response.",
      "Imaging can support selected cases but does not replace functional assessment.",
    ],
    imagePath: `${thighBase}/hamstring-strain`,
    thumbnailPath: `${thighBase}/hamstring-strain`,
    assetReady: true,
    conditionSlugs: ["hamstring-strain"],
    relatedLinks: [{ label: "Hamstring Strain guide", href: "/msk-injuries/hamstring-strain" }],
  },
  {
    slug: "femoroacetabular-impingement-syndrome",
    title: "Femoroacetabular Impingement Syndrome",
    shortTitle: "FAIS",
    region: "Hip & Groin",
    category: "Pathology",
    summary:
      "3D hip cutaway showing cam-type head-neck morphology and the anterosuperior acetabular-labral contact region.",
    learningPoints: [
      "Cam and pincer morphologies are imaging features; symptoms and clinical findings determine the syndrome.",
      "FAIS is assessed through history, hip motion, provocation, function and imaging when appropriate.",
      "Morphology can exist in asymptomatic people, so imaging should not be interpreted in isolation.",
    ],
    imagePath: `${hipGroinBase}/fais`,
    thumbnailPath: `${hipGroinBase}/fais`,
    assetReady: true,
    conditionSlugs: ["femoroacetabular-impingement-syndrome"],
    relatedLinks: [{ label: "FAIS guide", href: "/msk-injuries/femoroacetabular-impingement-syndrome" }],
  },
  {
    slug: "hip-osteoarthritis",
    title: "Hip Osteoarthritis",
    shortTitle: "Hip Osteoarthritis",
    region: "Hip & Groin",
    category: "Pathology",
    summary:
      "3D hip OA view showing joint-space narrowing, cartilage loss, marginal osteophytes and subchondral change.",
    learningPoints: [
      "Hip OA is a whole-joint process that can affect cartilage, subchondral bone and joint margins.",
      "Pain and disability do not correlate perfectly with radiographic severity.",
      "Clinical decisions should integrate symptoms, mobility, strength, function and patient priorities.",
    ],
    imagePath: `${hipGroinBase}/hip-osteoarthritis`,
    thumbnailPath: `${hipGroinBase}/hip-osteoarthritis`,
    assetReady: true,
    conditionSlugs: ["hip-osteoarthritis"],
    relatedLinks: [{ label: "Hip Osteoarthritis guide", href: "/msk-injuries/hip-osteoarthritis" }],
  },
  {
    slug: "carpal-tunnel-syndrome",
    title: "Carpal Tunnel Syndrome",
    shortTitle: "Carpal Tunnel",
    region: "Wrist & Hand",
    category: "Pathology",
    summary:
      "Palmar wrist cutaway showing the median nerve within the carpal tunnel beneath the flexor retinaculum.",
    learningPoints: [
      "The median nerve shares the carpal tunnel with the flexor tendons beneath the flexor retinaculum.",
      "Carpal tunnel syndrome is a median mononeuropathy at the wrist, not simply wrist pain.",
      "Symptoms, sensory findings, strength and electrodiagnostic testing may contribute to assessment when indicated.",
    ],
    imagePath: `${wristHandBase}/carpal-tunnel-syndrome`,
    thumbnailPath: `${wristHandBase}/carpal-tunnel-syndrome`,
    assetReady: true,
    conditionSlugs: ["carpal-tunnel-syndrome"],
    relatedLinks: [{ label: "Carpal Tunnel Syndrome guide", href: "/msk-injuries/carpal-tunnel-syndrome" }],
  },
  {
    slug: "lateral-epicondylalgia",
    title: "Lateral Epicondylalgia",
    shortTitle: "Tennis Elbow",
    region: "Elbow & Forearm",
    category: "Pathology",
    summary:
      "3D lateral elbow view highlighting the common extensor tendon origin, including ECRB, at the lateral epicondyle.",
    learningPoints: [
      "Lateral epicondylalgia is commonly associated with the common extensor tendon origin, especially ECRB.",
      "Symptoms are load-related and should not be interpreted as a simple inflammatory lesion in every case.",
      "Assessment should consider grip, resisted loading, function and alternative sources of lateral elbow pain.",
    ],
    imagePath: `${elbowForearmBase}/lateral-epicondylalgia`,
    thumbnailPath: `${elbowForearmBase}/lateral-epicondylalgia`,
    assetReady: true,
    conditionSlugs: ["lateral-epicondylalgia"],
    relatedLinks: [{ label: "Lateral Epicondylalgia guide", href: "/msk-injuries/lateral-epicondylalgia" }],
  },
  {
    slug: "cervical-disc-herniation-radiculopathy",
    title: "Cervical Disc Herniation and Nerve-Root Compression",
    shortTitle: "Cervical Disc Herniation",
    region: "Head & Neck",
    category: "Pathology",
    summary:
      "A focused 3D teaching view of a C5–C6 disc herniation narrowing the neural exit region and contacting an adjacent cervical nerve root.",
    learningPoints: [
      "A cervical disc herniation can contribute to nerve-root irritation, but imaging findings must be correlated with the clinical pattern.",
      "Radicular symptoms may include arm pain, sensory change, weakness or reflex change in a root-related distribution.",
      "Disc appearance alone does not establish symptomatic cervical radiculopathy; examination and red-flag screening remain essential.",
    ],
    imagePath: masterBase,
    thumbnailPath: masterBase,
    crop: { x: 1033, y: 680, width: 639, height: 261 },
    assetReady: true,
    conditionSlugs: ["cervical-radiculopathy"],
    relatedLinks: [
      { label: "Cervical Radiculopathy guide", href: "/msk-injuries/cervical-radiculopathy" },
      { label: "Manual Therapy Mastery", href: "/manual-therapy" },
    ],
  },
  {
    slug: "normal-knee-anatomy",
    title: "Normal Knee Anatomy",
    shortTitle: "Normal Knee",
    region: "Knee",
    category: "Anatomy",
    summary:
      "A clean 3D orientation view of the tibiofemoral and patellofemoral joints with the major stabilizing structures.",
    learningPoints: [
      "Identify femur, tibia, fibula and patella before interpreting pathology.",
      "Differentiate articular cartilage from the medial and lateral menisci.",
      "Orient the ACL, PCL, MCL and LCL in relation to joint stability.",
    ],
    imagePath: kneeMasterBase,
    thumbnailPath: kneeMasterBase,
    crop: {"x":0,"y":0,"width":384,"height":512},
    assetReady: true,
    relatedLinks: [
      { label: "Knee MSK conditions", href: "/msk-injuries" },
      { label: "Knee treatment plans", href: "/treatment-plans" },
    ],
  },
  {
    slug: "knee-osteoarthritis",
    title: "Knee Osteoarthritis",
    shortTitle: "Knee Osteoarthritis",
    region: "Knee",
    category: "Pathology",
    summary:
      "3D pathology view showing medial-compartment predominant joint-space narrowing, cartilage loss, osteophytes and subchondral change.",
    learningPoints: [
      "Knee OA is a whole-joint disorder rather than cartilage wear alone.",
      "Radiographic severity does not map perfectly to pain or disability.",
      "Clinical management should combine symptoms, function, examination and patient goals rather than imaging alone.",
    ],
    imagePath: `${kneeBase}/knee-osteoarthritis`,
    thumbnailPath: `${kneeBase}/knee-osteoarthritis`,
    assetReady: true,
    conditionSlugs: ["knee-osteoarthritis"],
    relatedLinks: [
      { label: "Open Knee OA clinical guide", href: "/msk-injuries/knee-osteoarthritis" },
      { label: "Open Knee OA treatment plan", href: "/treatment-plans" },
    ],
  },
  {
    slug: "acl-anatomy",
    title: "Anterior Cruciate Ligament (ACL) Anatomy",
    shortTitle: "ACL Anatomy",
    region: "Knee",
    category: "Anatomy",
    summary:
      "3D orientation of the ACL from the femoral attachment to the anterior intercondylar region of the tibia.",
    learningPoints: [
      "The ACL resists excessive anterior tibial translation and contributes to rotational stability.",
      "Its oblique orientation matters when interpreting injury mechanism and clinical testing.",
      "The ACL works as part of a coupled ligament-muscle-joint system rather than in isolation.",
    ],
    imagePath: kneeMasterBase,
    thumbnailPath: kneeMasterBase,
    crop: {"x":768,"y":0,"width":384,"height":512},
    assetReady: true,
    conditionSlugs: ["acl-injury"],
    relatedLinks: [
      { label: "ACL clinical guide", href: "/msk-injuries/acl-injury" },
      { label: "Manual Therapy Mastery", href: "/manual-therapy" },
    ],
  },
  {
    slug: "acl-tear",
    title: "ACL Tear — Partial and Complete Disruption",
    shortTitle: "ACL Tear",
    region: "Knee",
    category: "Pathology",
    summary:
      "Comparison of an intact ACL with realistic partial and complete fiber disruption.",
    learningPoints: [
      "A complete tear is a disruption of ligament continuity, not simply a red highlight.",
      "Associated bone bruising, meniscal injury or collateral injury may coexist clinically.",
      "Diagnosis requires history, examination and imaging when indicated.",
    ],
    imagePath: kneeMasterBase,
    thumbnailPath: kneeMasterBase,
    crop: {"x":0,"y":512,"width":384,"height":512},
    assetReady: true,
    conditionSlugs: ["acl-injury"],
    relatedLinks: [{ label: "ACL Injury guide", href: "/msk-injuries/acl-injury" }],
  },
  {
    slug: "acl-injury-mechanism",
    title: "ACL Injury Mechanism",
    shortTitle: "ACL Mechanism",
    region: "Knee",
    category: "Mechanism",
    summary:
      "Three-frame teaching sequence for a common non-contact mechanism: planted foot, rapid deceleration and coupled knee loading.",
    learningPoints: [
      "Many ACL injuries occur during pivoting, deceleration or landing rather than direct contact.",
      "Mechanism is multidimensional; avoid reducing every ACL injury to a single valgus angle.",
      "Mechanism informs suspicion but does not confirm the diagnosis.",
    ],
    imagePath: `${kneeBase}/acl-injury-mechanism.webp`,
    thumbnailPath: `${kneeBase}/thumbs/acl-injury-mechanism.webp`,
    assetReady: false,
    conditionSlugs: ["acl-injury"],
    relatedLinks: [{ label: "ACL Injury guide", href: "/msk-injuries/acl-injury" }],
  },
  {
    slug: "meniscus-anatomy",
    title: "Medial and Lateral Meniscus Anatomy",
    shortTitle: "Menisci",
    region: "Knee",
    category: "Anatomy",
    summary:
      "Superior and oblique 3D views showing the wedge-shaped menisci between femoral condyles and tibial plateau.",
    learningPoints: [
      "The menisci improve load distribution and contribute to joint congruence.",
      "The medial and lateral menisci differ in mobility and attachment relationships.",
      "Meniscal anatomy should not be confused with the articular cartilage coating bone surfaces.",
    ],
    imagePath: kneeMasterBase,
    thumbnailPath: kneeMasterBase,
    crop: {"x":1152,"y":0,"width":384,"height":512},
    assetReady: true,
    conditionSlugs: ["meniscal-injury"],
    relatedLinks: [{ label: "Meniscal Injury guide", href: "/msk-injuries/meniscal-injury" }],
  },
  {
    slug: "meniscus-tear",
    title: "Meniscal Tear Patterns",
    shortTitle: "Meniscus Tear",
    region: "Knee",
    category: "Pathology",
    summary:
      "Teaching visual for common meniscal tear morphology without implying that MRI appearance alone dictates treatment.",
    learningPoints: [
      "Tear morphology may be longitudinal, radial, horizontal, complex or displaced.",
      "Mechanical symptoms and functional limitation matter alongside imaging.",
      "Degenerative meniscal findings are common and may be incidental.",
    ],
    imagePath: kneeMasterBase,
    thumbnailPath: kneeMasterBase,
    crop: {"x":384,"y":512,"width":384,"height":512},
    assetReady: true,
    conditionSlugs: ["meniscal-injury"],
    relatedLinks: [{ label: "Meniscal Injury guide", href: "/msk-injuries/meniscal-injury" }],
  },
  {
    slug: "patellofemoral-pain",
    title: "Patellofemoral Pain — Load and Contact Region",
    shortTitle: "Patellofemoral Pain",
    region: "Knee",
    category: "Pathology",
    summary:
      "3D teaching visual of the patellofemoral joint emphasizing load-sensitive contact rather than a simplistic misalignment explanation.",
    learningPoints: [
      "Patellofemoral pain is a clinical pain condition, not a single structural lesion.",
      "Symptoms often relate to tasks that increase patellofemoral joint demand.",
      "Rehabilitation commonly addresses load management and progressive hip and knee capacity.",
    ],
    imagePath: `${kneeBase}/patellofemoral-pain`,
    thumbnailPath: `${kneeBase}/patellofemoral-pain`,
    assetReady: true,
    relatedLinks: [{ label: "MSK Injury Hub", href: "/msk-injuries" }],
  },
  {
    slug: "lachman-test",
    title: "Lachman Test — Position, Grip and Translation",
    shortTitle: "Lachman Test",
    region: "Knee",
    category: "Assessment",
    summary:
      "Clinical test visual showing knee position, therapist grip and anterior tibial translation direction.",
    learningPoints: [
      "Stabilize the distal femur while translating the proximal tibia anteriorly.",
      "Interpret translation together with endpoint quality and the overall clinical picture.",
      "Special tests support diagnosis; they do not replace history, examination and appropriate referral.",
    ],
    imagePath: `${kneeBase}/lachman-test.webp`,
    thumbnailPath: `${kneeBase}/thumbs/lachman-test.webp`,
    assetReady: false,
    conditionSlugs: ["acl-injury"],
    relatedLinks: [{ label: "ACL testing guide", href: "/msk-injuries/acl-injury" }],
  },
  {
    slug: "mcmurray-test",
    title: "McMurray Test — Meniscal Assessment",
    shortTitle: "McMurray Test",
    region: "Knee",
    category: "Assessment",
    summary:
      "Step-oriented visual showing knee flexion, tibial rotation and controlled extension during meniscal assessment.",
    learningPoints: [
      "Use controlled movement and interpret familiar joint-line symptoms rather than forceful clicking.",
      "A single negative meniscal test does not confidently exclude pathology.",
      "Combine examination findings with symptom behavior and function.",
    ],
    imagePath: `${kneeBase}/mcmurray-test.webp`,
    thumbnailPath: `${kneeBase}/thumbs/mcmurray-test.webp`,
    assetReady: false,
    conditionSlugs: ["meniscal-injury"],
    relatedLinks: [{ label: "Meniscal testing guide", href: "/msk-injuries/meniscal-injury" }],
  },
  {
    slug: "knee-range-of-motion",
    title: "Knee Range of Motion — Flexion and Extension",
    shortTitle: "Knee ROM",
    region: "Knee",
    category: "Assessment",
    summary:
      "Movement sequence that visually separates knee flexion, extension and clinically relevant loss of terminal extension.",
    learningPoints: [
      "Compare active and passive movement when clinically appropriate.",
      "Document the exact movement limitation rather than using the word stiffness alone.",
      "Reassessment should use the same baseline measure after intervention.",
    ],
    imagePath: `${kneeBase}/knee-range-of-motion.webp`,
    thumbnailPath: `${kneeBase}/thumbs/knee-range-of-motion.webp`,
    assetReady: false,
    relatedLinks: [{ label: "Knee clinical library", href: "/msk-injuries" }],
  },
  {
    slug: "knee-rehabilitation-overview",
    title: "Knee Rehabilitation — From Control to Function",
    shortTitle: "Knee Rehabilitation",
    region: "Knee",
    category: "Rehabilitation",
    summary:
      "Visual progression from symptom-tolerable activation through strength, single-limb control and functional loading.",
    learningPoints: [
      "Progress exercise according to response and criteria rather than calendar time alone.",
      "Strength, movement confidence and task exposure should be connected to the patient's goal.",
      "Manual therapy, when used, should support active rehabilitation rather than replace it.",
    ],
    imagePath: `${kneeBase}/knee-rehabilitation-overview.webp`,
    thumbnailPath: `${kneeBase}/thumbs/knee-rehabilitation-overview.webp`,
    assetReady: false,
    relatedLinks: [
      { label: "Treatment Plans", href: "/treatment-plans" },
      { label: "Clinical Case Lab", href: "/case-lab" },
    ],
  },
  {
    slug: "neck-anatomy-reference", title: "Neck Anatomy Reference", shortTitle: "Neck Anatomy",
    region: "Head & Neck", category: "Anatomy", summary: "Neck anatomy illustration for regional orientation. Not a depiction of whiplash or a specific cervical lesion.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Neck_anatomy.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["mechanical-neck-pain","whiplash-associated-disorder"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "lumbar-spine-reference", title: "Healthy Spine Reference", shortTitle: "Spine Anatomy",
    region: "Spine", category: "Anatomy", summary: "Healthy spine illustration for basic vertebral and disc orientation; it does not depict a patient's pain generator.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Healthy_spine.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["non-specific-low-back-pain","lumbar-radiculopathy","thoracic-spine-pain"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "shoulder-anatomy-reference", title: "Shoulder Anatomy Reference", shortTitle: "Shoulder Anatomy",
    region: "Shoulder", category: "Anatomy", summary: "Shoulder illustration for orientation of the joint and surrounding structures.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shoulder_anatomy.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["adhesive-capsulitis","acromioclavicular-joint-injury","long-head-biceps-tendinopathy"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "elbow-anatomy-reference", title: "Elbow Anatomy Reference", shortTitle: "Elbow Anatomy",
    region: "Elbow & Forearm", category: "Anatomy", summary: "Regional elbow anatomy illustration; it is not a specific medial epicondylalgia lesion image.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Elbow_Anatomy.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["medial-epicondylalgia"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "wrist-hand-reference", title: "Wrist and Hand Reference", shortTitle: "Wrist / Hand",
    region: "Wrist & Hand", category: "Anatomy", summary: "Regional wrist illustration for orientation; it does not depict trigger finger or a specific tendon lesion.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Wrist_pain.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["de-quervain-tenosynovitis","trigger-finger"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "hip-groin-reference", title: "Hip and Groin Reference", shortTitle: "Hip / Groin",
    region: "Hip & Groin", category: "Anatomy", summary: "Hip and groin illustration for regional orientation and surface anatomy.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hip_and_groin_pain.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["greater-trochanteric-pain-syndrome","gluteal-tendinopathy","adductor-related-groin-pain"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "knee-anatomy-reference", title: "Knee Anatomy Reference", shortTitle: "Knee Anatomy",
    region: "Knee", category: "Anatomy", summary: "Knee anatomy and ligament overview for orientation; not a standalone diagnostic image.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Knee_injuries.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["patellofemoral-pain","patellar-tendinopathy","pcl-injury","mcl-injury"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "plantar-foot-reference", title: "Plantar Foot Reference", shortTitle: "Plantar Fascia",
    region: "Ankle & Foot", category: "Anatomy", summary: "Plantar fascia illustration for heel-region anatomical orientation.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Plantar_fascia.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["plantar-heel-pain","posterior-tibial-tendon-dysfunction"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "achilles-reference", title: "Achilles Tendon Reference", shortTitle: "Achilles Tendon",
    region: "Ankle & Foot", category: "Anatomy", summary: "Achilles tendon region illustration; not a definitive depiction of tendinopathy severity.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Achilles_tendonitis.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["achilles-tendinopathy"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  },
  {
    slug: "shin-reference", title: "Shin Region Reference", shortTitle: "Shin Region",
    region: "Ankle & Foot", category: "Anatomy", summary: "Shin pain illustration used for regional orientation, not as proof of bone stress injury.",
    learningPoints: ["Use this illustration to orient the region and nearby structures.", "Do not infer a specific diagnosis or tissue lesion from this regional reference alone.", "Correlate anatomy with the patient's history and examination."],
    externalImageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shin_splints.svg",
    imageAttribution: { source: "Injurymap", sourceUrl: "https://www.injurymap.com/free-human-anatomy-illustrations", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
    assetReady: true, conditionSlugs: ["tibial-stress-injury"],
    relatedLinks: [{ label: "MSK Injury & Rehabilitation Hub", href: "/msk-injuries" }],
  }
];

export const atlasCategories: AtlasCategory[] = [
  "Anatomy",
  "Pathology",
];

export const atlasRegions: AtlasRegion[] = Array.from(
  new Set(clinicalVisualAtlas.map((item) => item.region))
) as AtlasRegion[];

export function getAtlasEntry(slug: string) {
  return clinicalVisualAtlas.find((item) => item.slug === slug);
}

export const atlasPublished = clinicalVisualAtlas.some(
  (item) => item.assetReady && (item.category === "Anatomy" || item.category === "Pathology")
);

export function getAtlasEntriesForCondition(conditionSlug: string) {
  return clinicalVisualAtlas.filter(
    (item) =>
      item.assetReady &&
      (item.category === "Anatomy" || item.category === "Pathology") &&
      item.conditionSlugs?.includes(conditionSlug)
  );
}
