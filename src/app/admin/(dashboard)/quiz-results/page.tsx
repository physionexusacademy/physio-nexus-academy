import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { currentQuiz } from "@/lib/weekly-quiz";

export default async function AdminQuizResultsPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data: attempts, error } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, full_name, email, score, total_questions, elapsed_ms, status, started_at, submitted_at")
    .order("quiz_id", { ascending: false })
    .order("score", { ascending: false, nullsFirst: false })
    .order("elapsed_ms", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("ADMIN_QUIZ_RESULTS_ERROR", error);
    throw new Error("Unable to load quiz results.");
  }

  const currentAttempts = (attempts ?? []).filter(
    (attempt) => attempt.quiz_id === currentQuiz.id
  );
  const completed = currentAttempts.filter(
    (attempt) => attempt.status === "submitted"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Weekly Quiz Results</h1>
      <p className="mt-1 text-sm text-navy-400">
        Private admin view. Participant Gmail addresses are never shown on the public leaderboard.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-grey-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Current quiz</p>
          <p className="mt-2 font-semibold text-navy-800">{currentQuiz.title}</p>
        </div>
        <div className="rounded-xl border border-grey-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Attempts</p>
          <p className="mt-2 text-2xl font-bold text-navy-800">{currentAttempts.length}</p>
        </div>
        <div className="rounded-xl border border-grey-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Submitted</p>
          <p className="mt-2 text-2xl font-bold text-navy-800">{completed.length}</p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-grey-200 bg-white" data-horizontal-scroll>
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-grey-50 text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Gmail</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Quiz</th>
            </tr>
          </thead>
          <tbody>
            {currentAttempts.map((attempt) => { const rank = completed.findIndex((item) => item.id === attempt.id); return (
              <tr key={attempt.id} className="border-t border-grey-100">
                <td className="px-4 py-3 text-navy-500">
                  {attempt.status === "submitted" && rank >= 0 ? rank + 1 : "—"}
                </td>
                <td className="px-4 py-3 font-medium text-navy-800">{attempt.full_name}</td>
                <td className="px-4 py-3 text-navy-500">{attempt.email}</td>
                <td className="px-4 py-3 text-navy-600">
                  {attempt.score ?? "—"}/{attempt.total_questions}
                </td>
                <td className="px-4 py-3 text-navy-600">
                  {attempt.elapsed_ms != null ? `${(attempt.elapsed_ms / 1000).toFixed(1)}s` : "—"}
                </td>
                <td className="px-4 py-3 text-navy-500">{attempt.status}</td>
                <td className="px-4 py-3 text-xs text-navy-400">{attempt.quiz_id}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>

      {!currentAttempts.length ? (
        <p className="mt-6 rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
          No quiz attempts yet.
        </p>
      ) : null}
    </div>
  );
}
