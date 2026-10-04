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
  thumbnailPath?: string;
  assetReady: boolean;
  hotspots?: AtlasHotspot[];
  comparison?: AtlasComparison;
  conditionSlugs?: string[];
  relatedLinks: Array<{ label: string; href: string }>;
};

const kneeBase = "pna/clinical-visual-atlas/knee";

export const clinicalVisualAtlas: ClinicalVisualEntry[] = [
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
    imagePath: `${kneeBase}/normal-knee-anatomy.webp`,
    thumbnailPath: `${kneeBase}/thumbs/normal-knee-anatomy.webp`,
    assetReady: false,
    relatedLinks: [
      { label: "Knee MSK conditions", href: "/msk-injuries" },
      { label: "Knee treatment plans", href: "/treatment-plans" },
    ],
  },
  {
    slug: "knee-osteoarthritis",
    title: "Knee Osteoarthritis — Healthy vs Degenerative Change",
    shortTitle: "Knee Osteoarthritis",
    region: "Knee",
    category: "Pathology",
    summary:
      "Healthy-versus-OA visual showing cartilage loss, joint-space narrowing, marginal osteophytes and subchondral change.",
    learningPoints: [
      "Joint-space narrowing is an imaging correlate of cartilage loss rather than a structure itself.",
      "Osteophytes develop at joint margins and should not be drawn as random bone spikes.",
      "OA is a whole-joint disorder; symptoms do not map perfectly to radiographic severity.",
    ],
    imagePath: `${kneeBase}/knee-osteoarthritis.webp`,
    thumbnailPath: `${kneeBase}/thumbs/knee-osteoarthritis.webp`,
    assetReady: false,
    conditionSlugs: ["knee-osteoarthritis"],
    comparison: {
      beforePath: `${kneeBase}/knee-oa-healthy.webp`,
      afterPath: `${kneeBase}/knee-oa-degenerative.webp`,
      beforeLabel: "Healthy knee",
      afterLabel: "Osteoarthritis",
      alt: "Healthy knee compared with knee osteoarthritis",
    },
    hotspots: [
      { label: "Cartilage loss", x: 50, y: 42, note: "Thinning and surface irregularity at the articular interface." },
      { label: "Osteophyte", x: 74, y: 48, note: "Marginal bony outgrowth at the edge of the joint." },
      { label: "Subchondral bone", x: 52, y: 58, note: "Bone directly beneath the articular cartilage may become sclerotic." },
    ],
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
    imagePath: `${kneeBase}/acl-anatomy.webp`,
    thumbnailPath: `${kneeBase}/thumbs/acl-anatomy.webp`,
    assetReady: false,
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
    imagePath: `${kneeBase}/acl-tear.webp`,
    thumbnailPath: `${kneeBase}/thumbs/acl-tear.webp`,
    assetReady: false,
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
    imagePath: `${kneeBase}/meniscus-anatomy.webp`,
    thumbnailPath: `${kneeBase}/thumbs/meniscus-anatomy.webp`,
    assetReady: false,
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
    imagePath: `${kneeBase}/meniscus-tear.webp`,
    thumbnailPath: `${kneeBase}/thumbs/meniscus-tear.webp`,
    assetReady: false,
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
      "3D teaching visual of the patellofemoral joint emphasizing load-sensitive contact rather than a simplistic 'misalignment' explanation.",
    learningPoints: [
      "Patellofemoral pain is a clinical pain condition, not a single structural lesion.",
      "Symptoms often relate to tasks that increase patellofemoral joint demand.",
      "Rehabilitation commonly addresses load management and progressive hip/knee capacity.",
    ],
    imagePath: `${kneeBase}/patellofemoral-pain.webp`,
    thumbnailPath: `${kneeBase}/thumbs/patellofemoral-pain.webp`,
    assetReady: false,
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
