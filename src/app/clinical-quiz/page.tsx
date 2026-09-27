import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Brain, DatabaseZap } from "lucide-react";
import { QuizClient } from "./QuizClient";

export const metadata: Metadata = {
  title: "Weekly Clinical Quiz",
  description:
    "Take the Physio Nexus Academy weekly physiotherapy clinical reasoning quiz. Five questions with instant explanations and no database storage.",
  alternates: {
    canonical: "https://physionexusacademy.com/clinical-quiz",
  },
};

export default function ClinicalQuizPage() {
  return (
    <div className="container-content section-padding">
      <Link
        href="/knowledge-hub"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Knowledge Hub
      </Link>

      <div className="mt-7 max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-teal-50 p-3">
            <Brain className="h-6 w-6 text-teal-600" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
              Clinical Challenge
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              Weekly Physiotherapy Quiz
            </h1>
          </div>
        </div>

        <p className="mt-5 leading-7 text-navy-600">
          Five short questions covering red flags, manual therapy concepts, pain science and
          clinical reasoning. Submit once you have answered all questions to see your score and
          explanations.
        </p>

        <div className="mt-5 inline-flex items-start gap-3 rounded-xl border border-grey-200 bg-grey-50 p-4">
          <DatabaseZap className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
          <p className="text-sm leading-6 text-navy-600">
            Lightweight by design: the quiz runs in your browser and does not create a Supabase
            record for each attempt.
          </p>
        </div>
      </div>

      <QuizClient />
    </div>
  );
}
