import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Clinical Reasoning Cases for Physiotherapy",
  description: "Practise physiotherapy clinical reasoning with interactive patient cases, examination findings, differential diagnosis, safety screening and evidence-informed management decisions.",
  keywords: ["physiotherapy clinical cases", "clinical reasoning physiotherapy", "MSK case studies", "physiotherapy differential diagnosis", "physiotherapy students Pakistan"],
  alternates: { canonical: "https://physionexusacademy.com/clinical-arena" },
};

export default function ClinicalArenaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
