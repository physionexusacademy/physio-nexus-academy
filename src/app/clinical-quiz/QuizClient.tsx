"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock3, LockKeyhole, Mail, XCircle } from "lucide-react";
import { startWeeklyQuiz, submitWeeklyQuiz } from "./actions";

type PublicQuestion = {
  id: string;
  question: string;
  options: Array<{ value: "A" | "B" | "C" | "D"; label: string }>;
};

type StartedQuiz = {
  attemptId: string;
  quizId: string;
  title: string;
  timeLimitSeconds: number;
  expiresAt: string;
  questions: PublicQuestion[];
};

type QuizResult = {
  expired: boolean;
  score: number;
  total: number;
  elapsedMs: number;
  explanations: Array<{
    id: string;
    correctValue: string;
    explanation: string;
  }>;
};

export function QuizClient() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [quiz, setQuiz] = useState<StartedQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submitStarted = useRef(false);

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const started = await startWeeklyQuiz({ fullName, email, consent });
      setQuiz(started);
      setSecondsLeft(started.timeLimitSeconds);
      setAnswers({});
      submitStarted.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start the quiz.");
    } finally {
      setLoading(false);
    }
  }

  const finishQuiz = useCallback(async () => {
    if (!quiz || submitStarted.current || result) return;

    submitStarted.current = true;
    setLoading(true);
    setError("");

    try {
      const submitted = await submitWeeklyQuiz({
        attemptId: quiz.attemptId,
        answers,
      });
      setResult(submitted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit the quiz.");
      submitStarted.current = false;
    } finally {
      setLoading(false);
    }
  }, [answers, quiz, result]);

  useEffect(() => {
    if (!quiz || result) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(quiz.expiresAt).getTime() - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        void finishQuiz();
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(interval);
  }, [quiz, result, finishQuiz]);

  if (!quiz) {
    return (
      <div className="mt-10 max-w-2xl rounded-2xl border border-grey-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
          <Clock3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-navy-800">30 seconds for the complete quiz</p>
            <p className="mt-1 text-sm leading-6 text-navy-600">
              The timer starts only after you press Start Quiz. Once started, that Gmail is
              counted as the one attempt for this weekly quiz.
            </p>
          </div>
        </div>

        <form onSubmit={handleStart} className="mt-6 space-y-5">
          <div>
            <label htmlFor="quiz-name" className="label">
              Full name
            </label>
            <input
              id="quiz-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="input"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              placeholder="Your name for the leaderboard"
            />
          </div>

          <div>
            <label htmlFor="quiz-email" className="label">
              Gmail address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-navy-300" />
              <input
                id="quiz-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input pl-10"
                required
                autoComplete="email"
                placeholder="yourname@gmail.com"
                pattern="[A-Za-z0-9._%+\-]+@gmail\.com"
              />
            </div>
            <p className="mt-1.5 text-xs leading-5 text-navy-400">
              One Gmail can enter this quiz only once. Gmail dots and +aliases are treated as
              the same account.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-grey-200 p-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 h-4 w-4 accent-teal-600"
              required
            />
            <span className="text-sm leading-6 text-navy-600">
              I understand that my name, Gmail, score and completion time will be stored for this
              quiz. Only winner names/scores may be shown publicly; Gmail addresses remain private.
            </span>
          </label>

          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole className="h-4 w-4" />
            {loading ? "Starting..." : "Start 30-second quiz"}
          </button>
        </form>
      </div>
    );
  }

  const explanationById = Object.fromEntries(
    (result?.explanations ?? []).map((item) => [item.id, item])
  );

  return (
    <div className="mt-8">
      {!result ? (
        <div className="sticky top-20 z-30 mb-6 rounded-xl border border-grey-200 bg-white/95 p-4 shadow-md backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
                {quiz.title}
              </p>
              <p className="mt-1 text-sm text-navy-500">
                Answer all 5 before the timer reaches zero.
              </p>
            </div>
            <div
              className={[
                "min-w-[76px] rounded-xl px-4 py-2 text-center",
                secondsLeft <= 10 ? "bg-red-50 text-red-700" : "bg-navy-50 text-navy-800",
              ].join(" ")}
              aria-live="polite"
            >
              <p className="text-xs font-semibold uppercase">Time</p>
              <p className="text-2xl font-bold tabular-nums">{secondsLeft}s</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-grey-100">
            <div
              className="h-full bg-teal-500 transition-[width] duration-200"
              style={{
                width: `${Math.max(0, (secondsLeft / quiz.timeLimitSeconds) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        {quiz.questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const explanation = explanationById[question.id];

          return (
            <section
              key={question.id}
              className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                Question {questionIndex + 1} of {quiz.questions.length}
              </p>
              <h2 className="mt-2 text-lg font-semibold leading-7 text-navy-800">
                {question.question}
              </h2>

              <div className="mt-4 grid gap-2">
                {question.options.map((option) => {
                  const checked = selected === option.value;
                  const showCorrect = result && explanation?.correctValue === option.value;
                  const showWrong =
                    result && checked && explanation?.correctValue !== option.value;

                  return (
                    <label
                      key={option.value}
                      className={[
                        "flex items-start gap-3 rounded-xl border p-3.5 transition",
                        checked && !result
                          ? "border-teal-400 bg-teal-50"
                          : "border-grey-200",
                        showCorrect ? "border-teal-400 bg-teal-50" : "",
                        showWrong ? "border-red-300 bg-red-50" : "",
                        result ? "cursor-default" : "cursor-pointer hover:border-grey-300",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={checked}
                        disabled={Boolean(result) || loading}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: option.value,
                          }))
                        }
                        className="mt-1 h-4 w-4 accent-teal-600"
                      />
                      <span className="text-sm leading-6 text-navy-700">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {result && explanation ? (
                <div
                  className={[
                    "mt-4 rounded-xl p-4",
                    selected === explanation.correctValue ? "bg-teal-50" : "bg-red-50",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 font-semibold text-navy-800">
                    {selected === explanation.correctValue ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {selected === explanation.correctValue ? "Correct" : "Review this one"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-navy-600">
                    {explanation.explanation}
                  </p>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {!result ? (
        <div className="mt-6 rounded-2xl bg-navy-800 p-5 text-white">
          {error ? (
            <p className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-white" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-grey-200">
              Answered {Object.keys(answers).length}/{quiz.questions.length}
            </p>
            <button
              type="button"
              onClick={() => void finishQuiz()}
              disabled={loading}
              className="rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Finish now"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-7 rounded-2xl bg-navy-800 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
            {result.expired ? "Time finished" : "Your result"}
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-2">
            <p className="text-4xl font-bold text-white">
              {result.score}/{result.total}
            </p>
            <p className="pb-1 text-sm text-grey-200">
              {Math.max(0.1, result.elapsedMs / 1000).toFixed(1)} seconds
            </p>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-grey-200">
            Ranking is based on the highest score first. If scores are tied, the faster valid
            submission ranks higher. This Gmail cannot attempt the same weekly quiz again.
          </p>
        </div>
      )}
    </div>
  );
}
