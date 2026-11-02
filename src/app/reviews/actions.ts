"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "physionexusacademypk@gmail.com";
const FROM_EMAIL = "Physio Nexus Academy <notifications@physionexusacademy.com>";
const FALLBACK_EMAIL = "notifications@physionexusacademy.com";

async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("PNA_REVIEW_EMAIL_ERROR", { reason: "RESEND_API_KEY is missing" });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error("PNA_REVIEW_EMAIL_ERROR", {
        status: response.status,
        body: await response.text(),
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("PNA_REVIEW_EMAIL_ERROR", { error });
    return false;
  }
}

export async function submitReview(values: {
  name: string;
  email?: string;
  rating: number;
  feedback?: string;
  website?: string;
}) {
  // Honeypot: bots that fill this hidden field get a harmless success response.
  if (values.website) return { ok: true, storedAs: "honeypot" as const };

  const name = values.name.trim();
  const email = values.email?.trim() || "";
  const rating = Number(values.rating);
  const writtenFeedback = values.feedback?.trim() || "";

  if (name.length < 2 || name.length > 80) {
    throw new Error("Please enter a valid name.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Please select a rating from 1 to 5 stars.");
  }

  if (writtenFeedback.length > 1500) {
    throw new Error("Feedback is too long.");
  }

  const content =
    writtenFeedback || `Rated Physio Nexus Academy ${rating}/5 stars.`;

  const supabase = createAdminClient();

  let storedAs: "testimonial" | "message" | "email-only" = "email-only";

  const { error: testimonialError } = await supabase.from("testimonials").insert({
    name,
    role: `Website review · ${rating}/5`,
    content,
    status: "draft",
  });

  if (!testimonialError) {
    storedAs = "testimonial";
  } else {
    console.error("PNA_REVIEW_TESTIMONIAL_INSERT_ERROR", {
      code: testimonialError.code,
      message: testimonialError.message,
      details: testimonialError.details,
      hint: testimonialError.hint,
    });

    const fallbackMessage = [
      `[WEBSITE REVIEW | ${rating}/5]`,
      `Reviewer: ${name}`,
      `Reviewer email: ${email || "Not provided"}`,
      "",
      "Feedback:",
      writtenFeedback || "No written feedback — star rating only.",
      "",
      "This review was saved in Messages because the Testimonials insert failed.",
    ].join("\n");

    const { error: fallbackError } = await supabase.from("contact_messages").insert({
      name: `Website Review — ${name}`,
      email: email || FALLBACK_EMAIL,
      message: fallbackMessage,
      status: "New",
    });

    if (!fallbackError) {
      storedAs = "message";
    } else {
      console.error("PNA_REVIEW_FALLBACK_INSERT_ERROR", {
        code: fallbackError.code,
        message: fallbackError.message,
        details: fallbackError.details,
        hint: fallbackError.hint,
      });
    }
  }

  const storageLabel =
    storedAs === "testimonial"
      ? "Saved as DRAFT in Admin → Testimonials."
      : storedAs === "message"
        ? "Saved in Admin → Messages as a fallback because Testimonials storage failed."
        : "Database storage failed; this email is the recovery copy.";

  const adminMessage = `
New Website Review – Physio Nexus Academy

Reviewer: ${name}
Rating: ${rating}/5
Email: ${email || "Not provided"}

Feedback:
${writtenFeedback || "No written feedback — star rating only."}

Storage status:
${storageLabel}

Google reviews are separate and can only affect the Google Business Profile after the reviewer submits directly on Google.
`.trim();

  const adminEmailSent = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Website Review – ${rating}★ – ${name}`,
    text: adminMessage,
    replyTo: email || undefined,
  });

  if (email) {
    const reviewerMessage = `
Dear ${name},

Thank you for sharing your feedback with Physio Nexus Academy.

Your website rating: ${rating}/5

Your feedback has been received by the PNA team and will be reviewed before it may appear publicly.

If you would also like your feedback to affect our Google Business Profile rating, please submit a separate review on Google using the Google Review button on our Reviews & Feedback page.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com
`.trim();

    // Reviewer acknowledgement is best-effort and must not make the submission fail.
    await sendEmail({
      to: email,
      subject: "Thank you for your feedback – Physio Nexus Academy",
      text: reviewerMessage,
    });
  }

  if (storedAs === "email-only" && !adminEmailSent) {
    throw new Error("Review could not be stored or emailed.");
  }

  return { ok: true, storedAs };
}
