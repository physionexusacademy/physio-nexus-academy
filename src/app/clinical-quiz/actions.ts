"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { currentQuiz, getPublicQuestions } from "@/lib/weekly-quiz";

const NETWORK_GRACE_MS = 2000;

function normalizeGmail(value: string) {
  const email = value.trim().toLowerCase();

  if (!/^[a-z0-9._%+\-]+@gmail\.com$/.test(email)) {
    throw new Error("Please enter a valid Gmail address.");
  }

  const [local] = email.split("@");
  const withoutTag = local.split("+")[0];
  const canonicalLocal = withoutTag.replace(/\./g, "");

  if (!canonicalLocal) {
    throw new Error("Please enter a valid Gmail address.");
  }

  return {
    email,
    emailKey: `${canonicalLocal}@gmail.com`,
  };
}

export async function startWeeklyQuiz(values: {
  fullName: string;
  email: string;
  consent: boolean;
}) {
  const fullName = values.fullName.trim();

  if (fullName.length < 2 || fullName.length > 80) {
    throw new Error("Please enter your full name.");
  }

  if (!values.consent) {
    throw new Error("Please confirm the quiz participation notice.");
  }

  const { email, emailKey } = normalizeGmail(values.email);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: currentQuiz.id,
      full_name: fullName,
      email,
      email_key: emailKey,
      total_questions: currentQuiz.questions.length,
      status: "started",
    })
    .select("id, started_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This Gmail has already been used for this week's quiz.");
    }

    console.error("PNA_QUIZ_START_ERROR", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw new Error("The quiz could not be started. Please try again.");
  }

  const startedAtMs = new Date(data.started_at).getTime();
  const expiresAt = new Date(
    startedAtMs + currentQuiz.timeLimitSeconds * 1000
  ).toISOString();

  return {
    attemptId: data.id as string,
    quizId: currentQuiz.id,
    title: currentQuiz.title,
    timeLimitSeconds: currentQuiz.timeLimitSeconds,
    expiresAt,
    questions: getPublicQuestions(),
  };
}

export async function submitWeeklyQuiz(values: {
  attemptId: string;
  answers: Record<string, string>;
}) {
  const supabase = createAdminClient();

  const { data: attempt, error: readError } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, status, started_at")
    .eq("id", values.attemptId)
    .maybeSingle();

  if (readError || !attempt) {
    throw new Error("Quiz attempt was not found.");
  }

  if (attempt.quiz_id !== currentQuiz.id) {
    throw new Error("This quiz attempt is no longer active.");
  }

  if (attempt.status !== "started") {
    throw new Error("This quiz attempt has already been submitted.");
  }

  const now = Date.now();
  const startedAtMs = new Date(attempt.started_at).getTime();
  const elapsedMs = Math.max(0, now - startedAtMs);
  const hardLimitMs = currentQuiz.timeLimitSeconds * 1000 + NETWORK_GRACE_MS;

  if (elapsedMs > hardLimitMs) {
    await supabase
      .from("quiz_attempts")
      .update({
        score: 0,
        elapsed_ms: currentQuiz.timeLimitSeconds * 1000,
        status: "expired",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", attempt.id)
      .eq("status", "started");

    return {
      expired: true,
      score: 0,
      total: currentQuiz.questions.length,
      elapsedMs: currentQuiz.timeLimitSeconds * 1000,
      explanations: currentQuiz.questions.map((question) => ({
        id: question.id,
        correctValue: question.correctValue,
        explanation: question.explanation,
      })),
    };
  }

  const score = currentQuiz.questions.reduce((total, question) => {
    return total + (values.answers[question.id] === question.correctValue ? 1 : 0);
  }, 0);

  const rankedElapsedMs = Math.min(
    elapsedMs,
    currentQuiz.timeLimitSeconds * 1000
  );

  const { error: updateError } = await supabase
    .from("quiz_attempts")
    .update({
      score,
      elapsed_ms: rankedElapsedMs,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", attempt.id)
    .eq("status", "started");

  if (updateError) {
    console.error("PNA_QUIZ_SUBMIT_ERROR", updateError);
    throw new Error("Your quiz could not be submitted.");
  }

  return {
    expired: false,
    score,
    total: currentQuiz.questions.length,
    elapsedMs: rankedElapsedMs,
    explanations: currentQuiz.questions.map((question) => ({
      id: question.id,
      correctValue: question.correctValue,
      explanation: question.explanation,
    })),
  };
}
