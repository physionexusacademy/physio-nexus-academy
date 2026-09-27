import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Brain, Clock3, Trophy } from "lucide-react";
import { QuizClient } from "./QuizClient";
import { currentQuiz } from "@/lib/weekly-quiz";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Weekly Clinical Quiz",
  description:
    "Take the Physio Nexus Academy weekly physiotherapy clinical reasoning quiz. One Gmail, one attempt, 30 seconds per question, with weekly top scorers.",
  alternates: {
    canonical: "https://physionexusacademy.com/clinical-quiz",
  },
};

async function getPreviousLeaderboard() {
  const supabase = createAdminClient();

  const { data: previous } = await supabase
    .from("quiz_attempts")
    .select("quiz_id")
    .neq("quiz_id", currentQuiz.id)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!previous?.quiz_id) return null;

  const { data: winners } = await supabase
    .from("quiz_attempts")
    .select("full_name, score, total_questions, elapsed_ms")
    .eq("quiz_id", previous.quiz_id)
    .eq("status", "submitted")
    .order("score", { ascending: false })
    .order("elapsed_ms", { ascending: true })
    .order("submitted_at", { ascending: true })
    .limit(3);

  if (!winners?.length) return null;

  return {
    quizId: previous.quiz_id as string,
    winners,
  };
}

export default async function ClinicalQuizPage() {
  const previousLeaderboard = await getPreviousLeaderboard();

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
              {currentQuiz.title}
            </h1>
          </div>
        </div>

        <p className="mt-5 leading-7 text-navy-600">
          Five clinical questions, one Gmail per attempt and only 30 seconds for the complete
          quiz. The timer begins after you press Start Quiz.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-grey-200 bg-grey-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Limit</p>
            <p className="mt-1 font-semibold text-navy-800">1 attempt / Gmail</p>
          </div>
          <div className="rounded-xl border border-grey-200 bg-grey-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Time</p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-semibold text-navy-800">
              <Clock3 className="h-4 w-4 text-teal-600" />
              30 seconds per question
            </p>
          </div>
          <div className="rounded-xl border border-grey-200 bg-grey-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Ranking</p>
            <p className="mt-1 font-semibold text-navy-800">Score → fastest time</p>
          </div>
        </div>
      </div>

      {previousLeaderboard ? (
        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Previous Quiz
              </p>
              <h2 className="text-xl font-semibold text-navy-800">
                Top Scorers Announcement
              </h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {previousLeaderboard.winners.map((winner, index) => (
              <div key={`${winner.full_name}-${index}`} className="rounded-xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  #{index + 1}
                </p>
                <p className="mt-1 font-semibold text-navy-800">{winner.full_name}</p>
                <p className="mt-1 text-sm text-navy-500">
                  {winner.score}/{winner.total_questions} ·{" "}
                  {winner.elapsed_ms ? (winner.elapsed_ms / 1000).toFixed(1) : "—"}s
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-navy-400">
            Gmail addresses are never shown publicly.
          </p>
        </section>
      ) : null}

      <QuizClient />
    </div>
  );
}
