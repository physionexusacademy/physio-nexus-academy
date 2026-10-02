"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  LockKeyhole,
} from "lucide-react";
import {
  startWorkshopAssessment,
  submitWorkshopAssessment,
} from "./assessment-actions";

type PublicQuestion = {
  id: string;
  topic: string;
  question: string;
  options: Array<{ value: "A" | "B" | "C" | "D"; label: string }>;
};

type StartedAssessment = {
  attemptId: string;
  title: string;
  timePerQuestionSeconds: number;
  questions: PublicQuestion[];
};

export function WorkshopAssessmentClient({ slug }: { slug: string }) {
  const [assessment, setAssessment] = useState<StartedAssessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionDeadline, setQuestionDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [submitted, setSubmitted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const advancingRef = useRef(false);

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const started = await startWorkshopAssessment(slug);

      if (!started.assessment) {
        setError(started.error ?? "Unable to start the assessment.");
        return;
      }

      const assessmentData = started.assessment;
      setAssessment(assessmentData);
      setAnswers({});
      setCurrentIndex(0);
      setSubmitted(false);
      setExpired(false);
      setSecondsLeft(assessmentData.timePerQuestionSeconds);
      setQuestionDeadline(
        Date.now() + assessmentData.timePerQuestionSeconds * 1000,
      );
      submittingRef.current = false;
      advancingRef.current = false;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start the assessment.",
      );
    } finally {
      setLoading(false);
    }
  }

  const finishAssessment = useCallback(async () => {
    if (!assessment || submittingRef.current || submitted) return;

    submittingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const result = await submitWorkshopAssessment({
        slug,
        attemptId: assessment.attemptId,
        answers,
      });

      setExpired(result.expired);
      setSubmitted(true);
      setQuestionDeadline(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit the assessment.",
      );
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [answers, assessment, slug, submitted]);

  const moveToNextQuestion = useCallback(async () => {
    if (!assessment || submitted || advancingRef.current) return;

    advancingRef.current = true;

    if (currentIndex >= assessment.questions.length - 1) {
      await finishAssessment();
      advancingRef.current = false;
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSecondsLeft(assessment.timePerQuestionSeconds);
    setQuestionDeadline(
      Date.now() + assessment.timePerQuestionSeconds * 1000,
    );
    advancingRef.current = false;
  }, [assessment, currentIndex, finishAssessment, submitted]);

  useEffect(() => {
    if (!assessment || submitted || questionDeadline == null) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((questionDeadline - Date.now()) / 1000),
      );

      setSecondsLeft(remaining);

      if (remaining <= 0 && !advancingRef.current) {
        void moveToNextQuestion();
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 200);

    return () => window.clearInterval(interval);
  }, [assessment, moveToNextQuestion, questionDeadline, submitted]);

  if (submitted) {
    return (
      <div className="mt-5 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-teal-600" />
          <div>
            <h3 className="font-bold text-navy-800">
              {expired
                ? "Assessment time has ended"
                : "Assessment submitted successfully"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              Your result is not displayed in the participant portal. Scores
              and rankings are available only to the PNA administration.
            </p>
            <p className="mt-2 text-xs font-semibold text-teal-700">
              The Top Scorer will be announced by Physio Nexus Academy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <form onSubmit={handleStart} className="mt-5">
        <div className="rounded-xl border border-grey-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <div>
              <p className="font-semibold text-navy-800">
                30 questions · 30 seconds per question
              </p>
              <p className="mt-1 text-sm leading-6 text-navy-500">
                Each question closes automatically when its timer reaches zero.
                You cannot return to a previous question. Only one attempt is
                allowed for each registered participant.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <p
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LockKeyhole className="h-4 w-4" />
          {loading ? "Starting assessment..." : "Start Final Assessment"}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-navy-400">
          Do not refresh or close the page after starting the assessment.
        </p>
      </form>
    );
  }

  const question = assessment.questions[currentIndex];
  const selected = answers[question.id];

  return (
    <div className="mt-5">
      <div className="sticky top-20 z-30 mb-4 rounded-xl border border-grey-200 bg-white/95 p-4 shadow-md backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
              {question.topic}
            </p>
            <p className="mt-1 text-sm font-semibold text-navy-700">
              Question {currentIndex + 1} of {assessment.questions.length}
            </p>
          </div>

          <div
            className={[
              "min-w-[76px] rounded-xl px-4 py-2 text-center",
              secondsLeft <= 10
                ? "bg-red-50 text-red-700"
                : "bg-navy-50 text-navy-800",
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
                (secondsLeft / assessment.timePerQuestionSeconds) * 100,
              )}%`,
            }}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold leading-7 text-navy-800">
          {question.question}
        </h3>

        <div className="mt-5 grid gap-3">
          {question.options.map((option) => {
            const checked = selected === option.value;

            return (
              <label
                key={option.value}
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-grey-300",
                  checked
                    ? "border-teal-400 bg-teal-50"
                    : "border-grey-200",
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
                  <span className="mr-2 font-bold text-teal-700">
                    {option.value}.
                  </span>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>

        {error ? (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-grey-100 pt-5">
          <p className="text-xs leading-5 text-navy-400">
            When time reaches 0, the assessment moves forward automatically.
          </p>
          <button
            type="button"
            onClick={() => void moveToNextQuestion()}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
          >
            {currentIndex === assessment.questions.length - 1
              ? "Submit"
              : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
