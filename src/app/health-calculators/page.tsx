import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, HeartPulse, ScanLine } from "lucide-react";

const url = "https://physionexusacademy.com/health-calculators";

export const metadata: Metadata = {
  title: "Health and Clinical Calculators | Physio Nexus Academy",
  description:
    "Free calculators from Physio Nexus Academy: an age-aware BMI calculator, and clinical calculators for heart rate zones, waist-hip ratio, one-rep max, daily energy and outcome change. Worked out in your browser.",
  alternates: { canonical: url },
  openGraph: { title: "Health and Clinical Calculators | Physio Nexus Academy", description: "BMI, heart rate zones, waist-hip ratio, one-rep max, daily energy, outcome change and a posture screen.", url, siteName: "Physio Nexus Academy", type: "website" },
  robots: { index: true, follow: true },
};

const tools = [
  {
    href: "/health-calculators/posture",
    icon: ScanLine,
    title: "Posture screen",
    text: "Stand in front of your phone and see head position, trunk lean, shoulder and hip level and knee alignment, each with its margin of error. Read on your device; nothing is stored.",
    tag: "Uses your camera",
  },
  {
    href: "/health-calculators/clinical",
    icon: HeartPulse,
    title: "Clinical calculators",
    text: "Heart rate zones, waist-hip ratio, one-rep max, daily energy, and a check of whether a score change is big enough to matter.",
    tag: "5 tools",
  },
  {
    href: "/health-calculators/bmi",
    icon: Calculator,
    title: "BMI calculator",
    text: "Body Mass Index with clear adult categories and age-aware notes for adolescents.",
    tag: "1 tool",
  },
];

export default function HealthCalculatorsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">Free tools</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-800 sm:text-4xl">Health and clinical calculators</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Everything is calculated in your browser: nothing is sent or stored. They are teaching and screening aids and never replace a clinician&apos;s judgement.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="group nx-holo flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white"><tool.icon className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-3 text-xl font-bold text-navy-800 group-hover:text-teal-800">{tool.title}</h2>
              <p className="mt-1 flex-1 text-sm leading-6 text-slate-600">{tool.text}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal-700">{tool.tag} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
