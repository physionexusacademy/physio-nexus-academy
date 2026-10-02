import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Medal, Trophy } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

function formatTime(elapsedMs: number | null) {
  if (elapsedMs == null) return "—";
  const totalSeconds = Math.max(0, elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;

  return minutes > 0
    ? `${minutes}m ${seconds.toFixed(1)}s`
    : `${seconds.toFixed(1)}s`;
}

export default async function WorkshopAssessmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: workshop } = await supabase
    .from("workshops")
    .select("id, title, start_date, end_date, assessment_open")
    .eq("id", id)
    .maybeSingle();

  if (!workshop) notFound();

  const { data: attempts, error } = await supabase
    .from("workshop_assessment_attempts")
    .select(
      "id, registration_id, score, total_questions, elapsed_ms, status, started_at, submitted_at",
    )
    .eq("workshop_id", id);

  if (error) {
    console.error("ADMIN_WORKSHOP_ASSESSMENT_RESULTS_ERROR", error);
    throw new Error("Unable to load workshop assessment results.");
  }

  const registrationIds = Array.from(
    new Set((attempts ?? []).map((attempt) => attempt.registration_id)),
  );

  const { data: registrations } = registrationIds.length
    ? await supabase
        .from("workshop_registrations")
        .select("id, reference_id, full_name, email")
        .in("id", registrationIds)
    : { data: [] };

  const registrationById = new Map(
    (registrations ?? []).map((registration) => [
      registration.id,
      registration,
    ]),
  );

  const completed = (attempts ?? [])
    .filter((attempt) => attempt.status === "submitted")
    .sort((a, b) => {
      const scoreDifference = (b.score ?? -1) - (a.score ?? -1);
      if (scoreDifference !== 0) return scoreDifference;

      const timeDifference =
        (a.elapsed_ms ?? Number.MAX_SAFE_INTEGER) -
        (b.elapsed_ms ?? Number.MAX_SAFE_INTEGER);
      if (timeDifference !== 0) return timeDifference;

      return new Date(a.submitted_at ?? 0).getTime() -
        new Date(b.submitted_at ?? 0).getTime();
    });

  const incomplete = (attempts ?? [])
    .filter((attempt) => attempt.status !== "submitted")
    .sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );

  const rows = [...completed, ...incomplete];

  return (
    <div>
      <Link
        href="/admin/workshops"
        className="text-sm font-semibold text-teal-600 hover:underline"
      >
        ← Back to Workshops
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Final Assessment
          </p>
          <h1 className="mt-1 text-2xl font-bold text-navy-800">
            Ranked Workshop Results
          </h1>
          <p className="mt-1 text-sm text-navy-500">{workshop.title}</p>
        </div>

        <span
          className={[
            "inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold",
            workshop.assessment_open
              ? "bg-teal-50 text-teal-700"
              : "bg-grey-100 text-navy-500",
          ].join(" ")}
        >
          Assessment {workshop.assessment_open ? "Open" : "Closed"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-grey-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Started
          </p>
          <p className="mt-2 text-3xl font-bold text-navy-800">
            {attempts?.length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-grey-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Submitted
          </p>
          <p className="mt-2 text-3xl font-bold text-navy-800">
            {completed.length}
          </p>
        </div>
        <div className="rounded-xl border border-grey-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Top Score
          </p>
          <p className="mt-2 text-3xl font-bold text-navy-800">
            {completed[0]?.score ?? "—"}
            {completed[0] ? "/30" : ""}
          </p>
        </div>
      </div>

      {completed.length ? (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {completed.slice(0, 3).map((attempt, index) => {
            const registration = registrationById.get(
              attempt.registration_id,
            );

            return (
              <div
                key={attempt.id}
                className={[
                  "rounded-2xl border bg-white p-5 shadow-sm",
                  index === 0
                    ? "border-amber-300"
                    : index === 1
                      ? "border-grey-300"
                      : "border-orange-200",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <Trophy className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Medal className="h-5 w-5 text-navy-400" />
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest text-navy-500">
                    {index === 0
                      ? "Top Scorer"
                      : index === 1
                        ? "2nd Place"
                        : "3rd Place"}
                  </p>
                </div>

                <h2 className="mt-3 text-lg font-bold text-navy-800">
                  {registration?.full_name ?? "Participant"}
                </h2>
                <p className="mt-1 text-xs text-navy-400">
                  {registration?.reference_id ?? "—"}
                </p>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-3xl font-bold text-teal-700">
                    {attempt.score}/{attempt.total_questions}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-navy-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatTime(attempt.elapsed_ms)}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <div
        className="mt-8 overflow-x-auto rounded-xl border border-grey-200 bg-white"
        data-horizontal-scroll
      >
        <table className="min-w-[940px] w-full text-left text-sm">
          <thead className="bg-grey-50 text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Registration ID</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Percentage</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((attempt) => {
              const registration = registrationById.get(
                attempt.registration_id,
              );
              const rank = completed.findIndex(
                (item) => item.id === attempt.id,
              );
              const percentage =
                attempt.score != null && attempt.total_questions
                  ? Math.round(
                      (attempt.score / attempt.total_questions) * 100,
                    )
                  : null;

              return (
                <tr key={attempt.id} className="border-t border-grey-100">
                  <td className="px-4 py-3 font-bold text-navy-700">
                    {rank >= 0 ? rank + 1 : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-800">
                    {registration?.full_name ?? "Participant"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-navy-500">
                    {registration?.reference_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-navy-500">
                    {registration?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-700">
                    {attempt.score ?? "—"}/{attempt.total_questions}
                  </td>
                  <td className="px-4 py-3 text-navy-600">
                    {percentage != null ? `${percentage}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-navy-600">
                    {formatTime(attempt.elapsed_ms)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                        attempt.status === "submitted"
                          ? "bg-teal-50 text-teal-700"
                          : attempt.status === "expired"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700",
                      ].join(" ")}
                    >
                      {attempt.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!rows.length ? (
        <p className="mt-6 rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
          No participant has started the final assessment yet.
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-navy-400">
        Ranking is calculated by highest score first. If scores are tied, the
        faster valid completion time ranks higher; submission time is used only
        as a final tie-breaker.
      </p>
    </div>
  );
}
