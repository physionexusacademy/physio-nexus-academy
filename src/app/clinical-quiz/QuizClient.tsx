"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  LockKeyhole,
  XCircle,
} from "lucide-react";
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
  timePerQuestionSeconds: number;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionDeadline, setQuestionDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const advancingRef = useRef(false);

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const started = await startWeeklyQuiz({ fullName, email, consent });

      if (!started.quiz) {
        setError(started.error ?? "Unable to start the quiz.");
        return;
      }

      const quizData = started.quiz;
      setQuiz(quizData);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setSecondsLeft(quizData.timePerQuestionSeconds);
      setQuestionDeadline(Date.now() + quizData.timePerQuestionSeconds * 1000);
      submittingRef.current = false;
      advancingRef.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start the quiz.");
    } finally {
      setLoading(false);
    }
  }

  const finishQuiz = useCallback(async () => {
    if (!quiz || submittingRef.current || result) return;

    submittingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const submitted = await submitWeeklyQuiz({
        attemptId: quiz.attemptId,
        answers,
      });
      setResult(submitted);
      setQuestionDeadline(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit the quiz.");
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [answers, quiz, result]);

  const moveToNextQuestion = useCallback(async () => {
    if (!quiz || result || advancingRef.current) return;

    advancingRef.current = true;

    if (currentIndex >= quiz.questions.length - 1) {
      await finishQuiz();
      advancingRef.current = false;
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSecondsLeft(quiz.timePerQuestionSeconds);
    setQuestionDeadline(Date.now() + quiz.timePerQuestionSeconds * 1000);
    advancingRef.current = false;
  }, [currentIndex, finishQuiz, quiz, result]);

  useEffect(() => {
    if (!quiz || result || questionDeadline == null) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((questionDeadline - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);

      if (remaining <= 0 && !advancingRef.current) {
        void moveToNextQuestion();
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 200);

    return () => window.clearInterval(interval);
  }, [moveToNextQuestion, questionDeadline, quiz, result]);

  const explanationById = useMemo(
    () =>
      Object.fromEntries(
        (result?.explanations ?? []).map((item) => [item.id, item])
      ),
    [result]
  );

  if (!quiz) {
    return (
      <div className="mt-10 max-w-2xl rounded-2xl border border-grey-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
          <Clock3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-navy-800">
              30 seconds for each question
            </p>
            <p className="mt-1 text-sm leading-6 text-navy-600">
              There are 5 questions. Each question gets its own 30-second timer.
              When time ends, the quiz automatically moves forward and you cannot go back.
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
            <input
              id="quiz-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              required
              autoComplete="email"
              placeholder="yourname@gmail.com"
              pattern="[A-Za-z0-9._%+\-]+@gmail\.com"
            />
            <p className="mt-1.5 text-xs leading-5 text-navy-400">
              One Gmail can enter this weekly quiz only once. Gmail dots and +aliases
              are treated as the same account.
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
              I understand that my name, Gmail, score and completion time will be stored
              for this quiz. Only winner names, scores and times may be shown publicly;
              Gmail addresses remain private.
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
            {loading ? "Starting..." : "Start quiz"}
          </button>
        </form>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mt-8">
        <div className="rounded-2xl bg-navy-800 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
            {result.expired ? "Quiz time finished" : "Your result"}
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-2">
            <p className="text-4xl font-bold text-white">
              {result.score}/{result.total}
            </p>
            <p className="pb-1 text-sm text-grey-200">
              Total completion time: {Math.max(0.1, result.elapsedMs / 1000).toFixed(1)}s
            </p>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-grey-200">
            Ranking uses the highest score first. If scores are tied, the faster valid
            total completion time ranks higher. This Gmail cannot attempt this weekly quiz again.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {quiz.questions.map((question, questionIndex) => {
            const selected = answers[question.id];
            const explanation = explanationById[question.id];
            const isCorrect =
              Boolean(selected) && selected === explanation?.correctValue;

            return (
              <section
                key={question.id}
                className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                  Question {questionIndex + 1}
                </p>
                <h2 className="mt-2 text-lg font-semibold leading-7 text-navy-800">
                  {question.question}
                </h2>
                <p className="mt-3 text-sm text-navy-500">
                  Your answer:{" "}
                  <span className="font-semibold text-navy-700">
                    {selected
                      ? question.options.find((option) => option.value === selected)?.label
                      : "No answer submitted"}
                  </span>
                </p>
                {explanation ? (
                  <div className={`mt-4 rounded-xl p-4 ${isCorrect ? "bg-teal-50" : "bg-red-50"}`}>
                    <div className="flex items-center gap-2 font-semibold text-navy-800">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-teal-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {isCorrect ? "Correct" : "Review this one"}
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
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const selected = answers[question.id];

  return (
    <div className="mt-8">
      <div className="sticky top-20 z-30 mb-6 rounded-xl border border-grey-200 bg-white/95 p-4 shadow-md backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
              {quiz.title}
            </p>
            <p className="mt-1 text-sm text-navy-500">
              Question {currentIndex + 1} of {quiz.questions.length} · no going back
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
              width: `${Math.max(
                0,
                (secondsLeft / quiz.timePerQuestionSeconds) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
          Question {currentIndex + 1} of {quiz.questions.length}
        </p>
        <h2 className="mt-3 text-xl font-semibold leading-8 text-navy-800">
          {question.question}
        </h2>

        <div className="mt-5 grid gap-3">
          {question.options.map((option) => {
            const checked = selected === option.value;

            return (
              <label
                key={option.value}
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-grey-300",
                  checked ? "border-teal-400 bg-teal-50" : "border-grey-200",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={checked}
                  disabled={loading}
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

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-grey-100 pt-5">
          <p className="text-xs text-navy-400">
            If time reaches 0, this question closes automatically.
          </p>
          <button
            type="button"
            onClick={() => void moveToNextQuestion()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
          >
            {currentIndex === quiz.questions.length - 1 ? "Finish quiz" : "Next question"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
