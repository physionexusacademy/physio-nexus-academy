"use server";

import { getWorkshopPortalSession } from "@/lib/workshop-portal";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPublicWorkshopAssessmentQuestions,
  workshopAssessment,
} from "@/lib/workshop-assessment";

const NETWORK_GRACE_MS = 10_000;

export async function startWorkshopAssessment(slug: string) {
  const session = await getWorkshopPortalSession(slug);

  if (!session) {
    return {
      assessment: null,
      error: "Your participant session has expired. Please sign in again.",
    };
  }

  if (!session.workshop.assessment_open) {
    return {
      assessment: null,
      error: "The final assessment is not open yet.",
    };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("workshop_assessment_attempts")
    .insert({
      workshop_id: session.workshop.id,
      registration_id: session.registration.id,
      total_questions: workshopAssessment.questions.length,
      status: "started",
    })
    .select("id, started_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("workshop_assessment_attempts")
        .select("status")
        .eq("workshop_id", session.workshop.id)
        .eq("registration_id", session.registration.id)
        .maybeSingle();

      if (existing?.status === "submitted") {
        return {
          assessment: null,
          error: "Your final assessment has already been submitted.",
        };
      }

      if (existing?.status === "expired") {
        return {
          assessment: null,
          error: "Your assessment attempt has already ended.",
        };
      }

      return {
        assessment: null,
        error:
          "An assessment attempt has already been started for this registration.",
      };
    }

    console.error("PNA_WORKSHOP_ASSESSMENT_START_ERROR", {
      code: error.code,
      message: error.message,
      details: error.details,
    });

    return {
      assessment: null,
      error: "The assessment could not be started. Please try again.",
    };
  }

  return {
    assessment: {
      attemptId: data.id as string,
      title: workshopAssessment.title,
      timePerQuestionSeconds: workshopAssessment.timePerQuestionSeconds,
      questions: getPublicWorkshopAssessmentQuestions(),
    },
    error: null,
  };
}

export async function submitWorkshopAssessment(values: {
  slug: string;
  attemptId: string;
  answers: Record<string, string>;
}) {
  const session = await getWorkshopPortalSession(values.slug);

  if (!session) {
    throw new Error("Your participant session has expired.");
  }

  const supabase = createAdminClient();

  const { data: attempt, error: readError } = await supabase
    .from("workshop_assessment_attempts")
    .select("id, workshop_id, registration_id, status, started_at")
    .eq("id", values.attemptId)
    .eq("workshop_id", session.workshop.id)
    .eq("registration_id", session.registration.id)
    .maybeSingle();

  if (readError || !attempt) {
    throw new Error("Assessment attempt was not found.");
  }

  if (attempt.status !== "started") {
    throw new Error("This assessment attempt has already ended.");
  }

  const elapsedMs = Math.max(
    0,
    Date.now() - new Date(attempt.started_at).getTime(),
  );

  const totalLimitMs =
    workshopAssessment.timePerQuestionSeconds *
    workshopAssessment.questions.length *
    1000;

  if (elapsedMs > totalLimitMs + NETWORK_GRACE_MS) {
    const { error: expireError } = await supabase
      .from("workshop_assessment_attempts")
      .update({
        score: 0,
        elapsed_ms: totalLimitMs,
        status: "expired",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", attempt.id)
      .eq("status", "started");

    if (expireError) {
      console.error("PNA_WORKSHOP_ASSESSMENT_EXPIRE_ERROR", expireError);
      throw new Error("The assessment could not be submitted.");
    }

    return { submitted: true, expired: true };
  }

  const score = workshopAssessment.questions.reduce((total, question) => {
    return total +
      (values.answers[question.id] === question.correctValue ? 1 : 0);
  }, 0);

  const rankedElapsedMs = Math.min(elapsedMs, totalLimitMs);

  const { error: updateError } = await supabase
    .from("workshop_assessment_attempts")
    .update({
      score,
      elapsed_ms: rankedElapsedMs,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", attempt.id)
    .eq("status", "started");

  if (updateError) {
    console.error("PNA_WORKSHOP_ASSESSMENT_SUBMIT_ERROR", updateError);
    throw new Error("The assessment could not be submitted.");
  }

  return { submitted: true, expired: false };
}
