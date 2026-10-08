import type { Metadata } from "next";
import "./encyclopedia.css";
import { EditorialManualEncyclopedia } from "@/components/manual-therapy/EditorialManualEncyclopedia";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { getManualTherapyStory } from "@/lib/manual-therapy-stories";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { worldManualApproaches } from "@/lib/manual-therapy-world";

const worldLibraryFamily: Record<string, string> = {
  "paris-approach": "Orthopedic Assessment & Reasoning",
  "mckenzie-mdt": "Orthopedic Assessment & Reasoning",
  "mennell-joint-play": "Orthopedic Assessment & Reasoning",
  "fascial-distortion-model": "Fascial & Soft-Tissue",
  "balanced-ligamentous-tension": "Osteopathic & Neuromuscular",
  "spencer-shoulder-sequence": "Osteopathic & Neuromuscular",
  "still-technique": "Osteopathic & Neuromuscular",
  "osteopathic-articulatory": "Osteopathic & Neuromuscular",
  "osteopathic-lymphatic-pump": "Specialized Manual Therapy",
  "rolfing-structural-integration": "Fascial & Soft-Tissue",
  "bowen-technique": "Soft-Tissue Mobilization",
  "visceral-manipulation": "Specialized Manual Therapy",
  "craniosacral-therapy": "Specialized Manual Therapy",
};

const libraryItems = [
  ...manualTherapyTechniques.map((technique) => ({
    slug: technique.slug,
    href: "/manual-therapy/" + technique.slug,
    family: technique.family,
    name: technique.name,
    summary: technique.summary,
    tag: technique.level,
    story: getManualTherapyStory(technique.slug)?.headline ?? "",
    scene: getManualTherapyStory(technique.slug)?.scene ?? "",
    closer: manualTherapyLessonWeaves[technique.slug]?.closer ?? "",
    evidence: "",
  })),
  ...worldManualApproaches.map((approach) => ({
    slug: approach.slug,
    href: "/manual-therapy/" + approach.slug,
    family: worldLibraryFamily[approach.slug] ?? "Specialized Manual Therapy",
    name: approach.title,
    summary: approach.summary,
    tag: "World approach",
    story: approach.headline,
    scene: approach.scene,
    closer: approach.aha,
    evidence: approach.evidenceLabel,
  })),
];
const libraryFamilies = Array.from(new Set(libraryItems.map((item) => item.family)));


export const metadata: Metadata = {
  title: "World Manual Therapy Encyclopedia",
  description:
    "Explore 35 Manual Therapy techniques and approaches in one encyclopedia through entertaining clinical stories, assessment, practical skills, clinical reasoning and evidence-aware safety guidance.",
  alternates: {
    canonical: "https://physionexusacademy.com/manual-therapy",
  },
};

export default function ManualTherapyPage() {
  return (
    <div className="container-content section-padding" data-pna-manual-theme="editorial-anatomy-luxe">
      <EditorialManualEncyclopedia
        items={libraryItems}
        families={libraryFamilies}
      />
    </div>
  );
}
