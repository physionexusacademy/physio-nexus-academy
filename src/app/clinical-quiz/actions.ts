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
    return { ok: false as const, error: "Please enter your full name." };
  }

  if (!values.consent) {
    return { ok: false as const, error: "Please confirm the quiz participation notice." };
  }

  let normalized;
  try {
    normalized = normalizeGmail(values.email);
  } catch {
    return { ok: false as const, error: "Please enter a valid Gmail address." };
  }

  const { email, emailKey } = normalized;
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
      return {
        ok: false as const,
        error: "This Gmail has already been used for this week's quiz.",
      };
    }

    console.error("PNA_QUIZ_START_ERROR", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      ok: false as const,
      error: "The quiz could not be started. Please try again.",
    };
  }

  return {
    ok: true as const,
    quiz: {
      attemptId: data.id as string,
      quizId: currentQuiz.id,
      title: currentQuiz.title,
      timePerQuestionSeconds: currentQuiz.timePerQuestionSeconds,
      questions: getPublicQuestions(),
    },
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
  const totalLimitMs =
    currentQuiz.timePerQuestionSeconds * currentQuiz.questions.length * 1000;
  const hardLimitMs = totalLimitMs + NETWORK_GRACE_MS;

  if (elapsedMs > hardLimitMs) {
    await supabase
      .from("quiz_attempts")
      .update({
        score: 0,
        elapsed_ms: totalLimitMs,
        status: "expired",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", attempt.id)
      .eq("status", "started");

    return {
      expired: true,
      score: 0,
      total: currentQuiz.questions.length,
      elapsedMs: totalLimitMs,
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
    totalLimitMs
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
