import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

const siteUrl = "https://physionexusacademy.com";
const pageUrl = `${siteUrl}/research`;

export const metadata: Metadata = {
  title: "Physiotherapy Research & Academic Support",
  description:
    "Research mentoring for physiotherapy students and professionals: research questions, literature review planning, methodology, critical appraisal and ethical academic guidance.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Physiotherapy Research & Academic Support | Physio Nexus Academy",
    description:
      "Structured physiotherapy research mentoring covering question development, literature review planning, study design, methodology and critical appraisal.",
    url: pageUrl,
    type: "website",
  },
};

const supportAreas = [
  {
    title: "Research question development",
    text: "Refine a broad idea into a focused, answerable research question with a clearly defined population, variables, intervention or exposure, comparator and outcomes where appropriate.",
  },
  {
    title: "Literature review planning",
    text: "Build a sensible search and reading plan, organize themes, compare evidence and understand how to write a literature review without simply listing studies.",
  },
  {
    title: "Study design & methodology",
    text: "Understand the strengths and limitations of common quantitative, qualitative, observational and experimental designs and align the method with the research question.",
  },
  {
    title: "Outcome measures & variables",
    text: "Clarify independent and dependent variables, measurement concepts, outcome selection, timing and the difference between statistical and clinical importance.",
  },
  {
    title: "Critical appraisal & evidence use",
    text: "Learn how to read research more critically, identify major sources of bias and interpret findings in a clinically meaningful way.",
  },
  {
    title: "Proposal & academic structure",
    text: "Receive guidance on organizing the rationale, objectives, methods and academic flow of a proposal or coursework while keeping the student's own work and institutional requirements central.",
  },
];

export default function ResearchPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#research-support`,
    name: "Physiotherapy Research & Academic Support",
    url: pageUrl,
    description:
      "Ethical academic and research mentoring for physiotherapy students and professionals.",
    provider: {
      "@id": `${siteUrl}/#organization`,
    },
    audience: {
      "@type": "Audience",
      audienceType: "Physiotherapy students, postgraduate learners and professionals",
    },
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
  };

  return (
    <div className="container-content section-padding max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        Research &amp; Academic Support
      </p>
      <h1 className="mt-2 max-w-4xl text-3xl font-bold sm:text-4xl">
        Physiotherapy Research &amp; Academic Guidance
      </h1>

      <p className="mt-4 max-w-3xl text-base leading-7 text-navy-600">
        Physio Nexus Academy provides structured research mentoring for physiotherapy
        students and professionals who want to understand the research process, strengthen
        their academic reasoning and make better evidence-informed decisions. The focus is
        guidance and learning — not doing assessed academic work on a learner&apos;s behalf.
      </p>

      <section className="mt-10">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
          What we can help you understand
        </p>
        <h2 className="mt-2 text-2xl font-bold text-navy-800">
          From a research idea to a defensible plan
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {supportAreas.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-bold text-navy-800">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-navy-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-cyan-100 bg-cyan-50/60 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-800">
          Mentoring pathway
        </p>
        <h2 className="mt-2 text-2xl font-bold text-navy-800">
          A clear step-by-step research discussion
        </h2>
        <ol className="mt-5 grid gap-4 text-sm leading-6 text-navy-600 md:grid-cols-2">
          <li>
            <strong className="text-navy-800">1. Clarify the question:</strong> define what
            you actually want to investigate and why it matters.
          </li>
          <li>
            <strong className="text-navy-800">2. Map the evidence:</strong> identify the
            literature and concepts needed to justify the project.
          </li>
          <li>
            <strong className="text-navy-800">3. Match the methodology:</strong> connect
            design, sampling, variables and outcomes to the research question.
          </li>
          <li>
            <strong className="text-navy-800">4. Review the logic:</strong> check whether the
            objectives, methods and planned interpretation are internally consistent.
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy-800">Academic integrity comes first</h2>
        <p className="mt-3 max-w-3xl leading-7 text-navy-600">
          PNA research support is educational. We can explain concepts, discuss methodology,
          help you critically review your own work and point out areas that need improvement.
          We do not fabricate data, invent references, guarantee publication or replace the
          approval and supervision requirements of your university, ethics committee or
          research supervisor.
        </p>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href="/knowledge-hub/specialty/research"
          className="rounded-2xl border border-grey-200 p-5 transition hover:border-teal-200 hover:shadow-md"
        >
          <p className="text-sm font-bold text-teal-700">Research &amp; Evidence Library</p>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Study critical appraisal, outcome measures, research reporting and evidence
            interpretation in the Knowledge Hub.
          </p>
        </a>
        <a
          href="/contact"
          className="rounded-2xl border border-grey-200 p-5 transition hover:border-teal-200 hover:shadow-md"
        >
          <p className="text-sm font-bold text-teal-700">Discuss your research question</p>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Contact PNA with a brief description of your topic and the type of guidance you
            need.
          </p>
        </a>
      </section>

      <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Research guidance is not a guarantee of publication, grades or academic outcomes.
        Final academic decisions remain with the learner&apos;s institution, supervisor and
        applicable ethics or review bodies.
      </div>

      <Button href="/contact" className="mt-8">
        Request Research Guidance
      </Button>
    </div>
  );
}
