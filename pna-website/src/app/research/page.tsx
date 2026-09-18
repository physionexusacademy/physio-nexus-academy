import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Research & Academic Support",
  description:
    "Ethical research guidance, academic mentoring, literature and methodology support from Physio Nexus Academy.",
};

export default function ResearchPage() {
  return (
    <div className="container-content section-padding max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        Research & Academic Support
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Research & Academic Guidance</h1>

      <p className="mt-4 text-navy-600">
        Physio Nexus Academy offers ethical academic guidance for physiotherapy students and
        professionals working on research projects, literature reviews or coursework.
      </p>

      <ul className="mt-6 list-disc space-y-2 pl-5 text-navy-600">
        <li>Topic development and research question refinement.</li>
        <li>Understanding and structuring a literature review.</li>
        <li>Guidance on research methodology and study design concepts.</li>
        <li>General academic mentoring for physiotherapy learners.</li>
      </ul>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        This is academic guidance and mentoring — not a guarantee of publication, grades, or
        academic outcomes. Final academic decisions remain with your institution and
        supervisors.
      </div>

      <Button href="/contact" className="mt-8">
        Request Research Guidance
      </Button>
    </div>
  );
}
