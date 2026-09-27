"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const questions: Question[] = [
  {
    question:
      "A patient with acute low-back pain reports new urinary difficulty and numbness around the saddle area. What is the most appropriate next step?",
    options: [
      "Begin lumbar stretching",
      "Arrange urgent medical assessment",
      "Apply heat and review in one week",
      "Perform repeated flexion exercises",
    ],
    correctIndex: 1,
    explanation:
      "New bladder dysfunction with saddle sensory change is a major neurological red flag and requires urgent in-person medical assessment.",
  },
  {
    question: "Which statement best describes a tender point?",
    options: [
      "Any palpable muscle spasm",
      "A localized area painful to pressure",
      "A diagnosis of nerve compression",
      "A joint that is always hypomobile",
    ],
    correctIndex: 1,
    explanation:
      "A tender point is primarily a localized area of tenderness to pressure. It is not automatically a trigger point or a diagnosis by itself.",
  },
  {
    question:
      "In a direct myofascial-release approach, the therapist generally applies the sustained load in which direction?",
    options: [
      "Toward the perceived tissue restriction",
      "Only away from the tissue barrier",
      "Always perpendicular to the skin",
      "Only along a nerve pathway",
    ],
    correctIndex: 0,
    explanation:
      "Direct MFR generally engages the perceived restrictive barrier with slow, controlled loading while monitoring the patient response.",
  },
  {
    question: "Which statement about pain is most accurate?",
    options: [
      "Pain intensity always equals tissue-damage severity",
      "Persistent pain is always psychological",
      "Pain is influenced by tissue, nervous-system and contextual factors",
      "If imaging is normal, pain cannot be real",
    ],
    correctIndex: 2,
    explanation:
      "Pain is a real protective experience influenced by biological, neurological, psychological and contextual factors; it is not a simple tissue-damage meter.",
  },
  {
    question:
      "Dry needling and acupuncture can both use filiform needles. What most clearly distinguishes them in routine clinical practice?",
    options: [
      "Needles are always different materials",
      "They necessarily use different skin depths",
      "Their assessment and treatment frameworks can differ",
      "Only one requires infection-control procedures",
    ],
    correctIndex: 2,
    explanation:
      "The same general type of filiform needle may be used, but target selection, assessment models, rationale and professional context can differ.",
  },
];

export function QuizClient() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () =>
      questions.reduce(
        (total, question, index) =>
          total + (answers[index] === question.correctIndex ? 1 : 0),
        0
      ),
    [answers]
  );

  const allAnswered = Object.keys(answers).length === questions.length;

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mt-10">
      <div className="space-y-6">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const isCorrect = selected === question.correctIndex;

          return (
            <section
              key={question.question}
              className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                Question {questionIndex + 1} of {questions.length}
              </p>
              <h2 className="mt-2 text-lg font-semibold leading-7 text-navy-800">
                {question.question}
              </h2>

              <div className="mt-5 space-y-3">
                {question.options.map((option, optionIndex) => {
                  const checked = selected === optionIndex;
                  const showCorrect =
                    submitted && optionIndex === question.correctIndex;
                  const showWrong =
                    submitted && checked && optionIndex !== question.correctIndex;

                  return (
                    <label
                      key={option}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                        checked
                          ? "border-teal-400 bg-teal-50"
                          : "border-grey-200 hover:border-grey-300",
                        showCorrect ? "ring-1 ring-teal-400" : "",
                        showWrong ? "border-red-300 bg-red-50" : "",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={checked}
                        disabled={submitted}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [questionIndex]: optionIndex,
                          }))
                        }
                        className="mt-1 h-4 w-4 accent-teal-600"
                      />
                      <span className="text-sm leading-6 text-navy-700">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>

              {submitted ? (
                <div
                  className={[
                    "mt-5 rounded-xl p-4",
                    isCorrect ? "bg-teal-50" : "bg-red-50",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 font-semibold text-navy-800">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {isCorrect ? "Correct" : "Review this one"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-navy-600">
                    {question.explanation}
                  </p>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {!submitted ? (
        <div className="mt-8 rounded-2xl bg-navy-800 p-6 text-white">
          <p className="text-sm text-grey-200">
            Your answers stay in this browser session and are not saved to the PNA database.
          </p>
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="mt-4 rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check my score
          </button>
          {!allAnswered ? (
            <p className="mt-2 text-xs text-grey-300">
              Answer all five questions to submit.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-navy-800 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
            Your result
          </p>
          <p className="mt-2 text-4xl font-bold text-white">
            {score}/{questions.length}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-grey-200">
            Use the explanations above as a quick review. The goal is clinical reasoning, not just the number.
          </p>
          <button
            type="button"
            onClick={resetQuiz}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
