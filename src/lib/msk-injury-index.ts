export type MSKConditionIndexItem = {
  slug: string;
  name: string;
  region: string;
  category: string;
  evidenceLevel: "Strong" | "Moderate" | "Mixed";
  summary: string;
};

export const mskConditionIndex: MSKConditionIndexItem[] = [
  {
    slug: "lateral-ankle-sprain",
    name: "Lateral Ankle Sprain",
    region: "Ankle & Foot",
    category: "Sprain / Ligament",
    evidenceLevel: "Strong",
    summary: "Injury of the lateral ankle ligament complex, most commonly the ATFL, often after inversion with plantar flexion.",
  },
  {
    slug: "acl-injury",
    name: "Anterior Cruciate Ligament (ACL) Injury",
    region: "Knee",
    category: "Sprain / Tear",
    evidenceLevel: "Strong",
    summary: "Partial or complete ACL disruption causing rotational and anterior knee instability, often during pivoting, deceleration or awkward landing.",
  },
  {
    slug: "meniscal-injury",
    name: "Meniscal Injury",
    region: "Knee",
    category: "Meniscus / Cartilage",
    evidenceLevel: "Moderate",
    summary: "Traumatic or degenerative injury of the medial or lateral meniscus, presenting with joint-line pain, swelling and sometimes catching or locking.",
  },
  {
    slug: "hamstring-strain",
    name: "Hamstring Strain",
    region: "Thigh",
    category: "Strain / Muscle",
    evidenceLevel: "Moderate",
    summary: "Musculotendinous hamstring injury commonly occurring during high-speed running or excessive lengthening.",
  },
  {
    slug: "achilles-tendon-rupture",
    name: "Achilles Tendon Rupture",
    region: "Ankle & Foot",
    category: "Rupture / Tendon",
    evidenceLevel: "Strong",
    summary: "Partial or complete rupture of the Achilles tendon, commonly presenting with sudden posterior-ankle pain and loss of plantar-flexion function.",
  },
  {
    slug: "rotator-cuff-tendinopathy",
    name: "Rotator Cuff Tendinopathy / Subacromial Pain",
    region: "Shoulder",
    category: "Tendinopathy / Impingement",
    evidenceLevel: "Strong",
    summary: "Load-related rotator cuff pain, often aggravated by elevation and overhead activity; modern management emphasizes active rehabilitation rather than a purely mechanical 'impingement' model.",
  },
  {
    slug: "rotator-cuff-full-thickness-tear",
    name: "Full-Thickness Rotator Cuff Tear",
    region: "Shoulder",
    category: "Tear / Rupture",
    evidenceLevel: "Strong",
    summary: "Complete disruption through the tendon thickness, ranging from degenerative tears with preserved function to acute traumatic tears with major weakness.",
  },
  {
    slug: "anterior-shoulder-instability",
    name: "Anterior Shoulder Instability",
    region: "Shoulder",
    category: "Instability / Subluxation",
    evidenceLevel: "Moderate",
    summary: "Recurrent or traumatic tendency of the humeral head to translate anteriorly, often after dislocation or subluxation.",
  },
  {
    slug: "femoroacetabular-impingement-syndrome",
    name: "Femoroacetabular Impingement Syndrome (FAIS)",
    region: "Hip & Groin",
    category: "Impingement / Joint",
    evidenceLevel: "Moderate",
    summary: "Symptomatic nonarthritic hip condition involving motion-related hip/groin pain with clinical findings and cam/pincer morphology when imaging is relevant.",
  },
  {
    slug: "knee-osteoarthritis",
    name: "Knee Osteoarthritis",
    region: "Knee",
    category: "Arthritis / Degenerative",
    evidenceLevel: "Strong",
    summary: "Clinical osteoarthritis causing activity-related knee pain, stiffness and functional limitation; exercise and education are core treatments.",
  },
  {
    slug: "hip-osteoarthritis",
    name: "Hip Osteoarthritis",
    region: "Hip & Groin",
    category: "Arthritis / Degenerative",
    evidenceLevel: "Strong",
    summary: "Hip OA commonly causes groin/anterior thigh pain, mobility loss and reduced walking function; rehabilitation emphasizes exercise, education and selected manual therapy.",
  },
  {
    slug: "cervical-radiculopathy",
    name: "Cervical Radiculopathy",
    region: "Neck & Upper Quarter",
    category: "Nerve / Compression",
    evidenceLevel: "Moderate",
    summary: "Cervical nerve-root disorder causing neck/arm pain with sensory, motor or reflex changes in a root distribution.",
  },
  {
    slug: "carpal-tunnel-syndrome",
    name: "Carpal Tunnel Syndrome",
    region: "Wrist & Hand",
    category: "Nerve / Compression",
    evidenceLevel: "Strong",
    summary: "Median nerve compression at the carpal tunnel causing nocturnal paresthesia, sensory symptoms and sometimes thenar weakness.",
  },
  {
    slug: "lateral-epicondylalgia",
    name: "Lateral Epicondylalgia (Tennis Elbow)",
    region: "Elbow & Forearm",
    category: "Tendinopathy / Overuse",
    evidenceLevel: "Moderate",
    summary: "Load-related lateral elbow pain involving the common wrist-extensor tendon, especially extensor carpi radialis brevis.",
  },
];

export const mskRegions = Array.from(new Set(mskConditionIndex.map((item) => item.region)));
export const mskCategories = Array.from(new Set(mskConditionIndex.map((item) => item.category)));
