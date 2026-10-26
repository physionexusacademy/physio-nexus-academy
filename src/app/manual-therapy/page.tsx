import type { Metadata } from "next";
import "./encyclopedia.css";
import { EditorialManualEncyclopedia } from "@/components/manual-therapy/EditorialManualEncyclopedia";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { getManualTherapyStory } from "@/lib/manual-therapy-stories";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { getPublishedManualCoverMap } from "@/lib/manual-therapy-cover-publishing";
import { getMasteryGuide } from "@/lib/manual-therapy-mastery";

/**
 * One clear group per purpose, in the order a learner should meet them.
 * (Replaces 12 overlapping groups such as "Soft-Tissue Mobilization" vs "Fascial & Soft-Tissue".)
 */
const libraryFamilyOrder = [
  "Joint Mobilization, Traction & Manipulation",
  "Assessment & Clinical Reasoning",
  "Osteopathic & Neuromuscular",
  "Soft-Tissue & Fascial",
  "Instrument & Cupping",
  "Neural & Specialized",
];

const libraryFamilyBySlug: Record<string, string> = {
  "maitland-joint-mobilization": libraryFamilyOrder[0],
  "kaltenborn-evjenth-mobilization": libraryFamilyOrder[0],
  "manual-traction": libraryFamilyOrder[0],
  "mulligan-mobilization-with-movement": libraryFamilyOrder[0],
  "mulligan-snags-nags": libraryFamilyOrder[0],
  "high-velocity-low-amplitude-thrust": libraryFamilyOrder[0],
  "paivm-ppivm-spinal-assessment": libraryFamilyOrder[1],
  "mennell-joint-play": libraryFamilyOrder[1],
  "paris-approach": libraryFamilyOrder[1],
  "mckenzie-mdt": libraryFamilyOrder[1],
  "muscle-energy-technique": libraryFamilyOrder[2],
  "strain-counterstrain": libraryFamilyOrder[2],
  "facilitated-positional-release": libraryFamilyOrder[2],
  "pnf-manual-techniques": libraryFamilyOrder[2],
  "balanced-ligamentous-tension": libraryFamilyOrder[2],
  "spencer-shoulder-sequence": libraryFamilyOrder[2],
  "still-technique": libraryFamilyOrder[2],
  "osteopathic-articulatory": libraryFamilyOrder[2],
  "cyriax-deep-transverse-friction": libraryFamilyOrder[3],
  "soft-tissue-mobilization": libraryFamilyOrder[3],
  "trigger-point-compression": libraryFamilyOrder[3],
  "active-release-style-soft-tissue": libraryFamilyOrder[3],
  "myofascial-release": libraryFamilyOrder[3],
  "fascial-manipulation": libraryFamilyOrder[3],
  "fascial-distortion-model": libraryFamilyOrder[3],
  "rolfing-structural-integration": libraryFamilyOrder[3],
  "bowen-technique": libraryFamilyOrder[3],
  "iastm": libraryFamilyOrder[4],
  "myofascial-decompression-dry-cupping": libraryFamilyOrder[4],
  "neurodynamic-mobilization": libraryFamilyOrder[5],
  "manual-lymphatic-drainage": libraryFamilyOrder[5],
  "scar-mobilization": libraryFamilyOrder[5],
  "osteopathic-lymphatic-pump": libraryFamilyOrder[5],
  "visceral-manipulation": libraryFamilyOrder[5],
  "craniosacral-therapy": libraryFamilyOrder[5],
};

const libraryItems = [
  ...manualTherapyTechniques.map((technique) => ({
    slug: technique.slug,
    href: "/manual-therapy/" + technique.slug,
    family: libraryFamilyBySlug[technique.slug] ?? technique.family,
    artFamily: technique.family,
    name: technique.name,
    summary: technique.summary,
    tag: technique.level,
    story: getMasteryGuide(technique.slug)?.oneLine ?? getManualTherapyStory(technique.slug)?.headline ?? "",
    scene: getManualTherapyStory(technique.slug)?.scene ?? "",
    closer: manualTherapyLessonWeaves[technique.slug]?.closer ?? "",
    evidence: "",
  })),
  ...worldManualApproaches.map((approach) => ({
    slug: approach.slug,
    href: "/manual-therapy/" + approach.slug,
    family: libraryFamilyBySlug[approach.slug] ?? "Neural & Specialized",
    artFamily: "Specialized Manual Therapy",
    name: approach.title,
    summary: approach.summary,
    tag: "World approach",
    story: getMasteryGuide(approach.slug)?.oneLine ?? approach.headline,
    scene: approach.scene,
    closer: approach.aha,
    evidence: approach.evidenceLabel,
  })),
];
const libraryFamilies = libraryFamilyOrder.filter((name) =>
  libraryItems.some((item) => item.family === name),
);

export const metadata: Metadata = {
  title: "World Manual Therapy Encyclopedia | Techniques & Clinical Guide",
  description:
    "Explore 35+ manual therapy techniques with clinical reasoning, hand placement, dosage, safety and evidence-informed learning for physiotherapy students and professionals in Pakistan.",
  keywords: [
    "manual therapy techniques",
    "manual therapy physiotherapy",
    "Maitland mobilization",
    "Mulligan concept",
    "myofascial release",
    "strain counterstrain",
    "Kaltenborn mobilization",
    "physiotherapy clinical skills",
    "manual therapy training Pakistan",
    "World Manual Therapy Encyclopedia",
  ],
  openGraph: {
    title: "World Manual Therapy Encyclopedia | Physio Nexus Academy",
    description:
      "Trusted approaches, memorable clinical stories and deeper learning for manual therapy techniques used in physiotherapy practice.",
    url: "https://physionexusacademy.com/manual-therapy",
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Manual Therapy Encyclopedia | Physio Nexus Academy",
    description:
      "Clinical guide to major manual therapy systems for physiotherapy students and professionals.",
  },
  alternates: {
    canonical: "https://physionexusacademy.com/manual-therapy",
  },
  robots: { index: true, follow: true },
};

export default function ManualTherapyPage() {
  return (
    <div
      className="container-content section-padding"
      data-pna-manual-theme="editorial-anatomy-luxe"
    >
      <EditorialManualEncyclopedia
        items={libraryItems}
        families={libraryFamilies}
        visualCovers={getPublishedManualCoverMap()}
      />
    </div>
  );
}
