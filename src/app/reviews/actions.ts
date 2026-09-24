"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "physionexusacademypk@gmail.com";
const FROM_EMAIL = "Physio Nexus Academy <notifications@physionexusacademy.com>";

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
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return;
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
      console.error("Resend review email failed:", await response.text());
    }
  } catch (error) {
    console.error("Resend review email error:", error);
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
  if (values.website) return { ok: true };

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
  const { error } = await supabase.from("testimonials").insert({
    name,
    role: `Website review · ${rating}/5`,
    content,
    status: "draft",
  });

  if (error) throw new Error(error.message);

  const adminMessage = `
New Website Review – Physio Nexus Academy

Reviewer: ${name}
Rating: ${rating}/5
Email: ${email || "Not provided"}

Feedback:
${writtenFeedback || "No written feedback — star rating only."}

The review has been saved as DRAFT in the PNA Admin Dashboard.
Review it before publishing publicly on the website.

Google reviews are separate and can only affect the Google Business Profile after the reviewer submits directly on Google.
`.trim();

  const emailTasks: Promise<void>[] = [
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Website Review – ${rating}★ – ${name}`,
      text: adminMessage,
      replyTo: email || undefined,
    }),
  ];

  if (email) {
    const reviewerMessage = `
Dear ${name},

Thank you for sharing your feedback with Physio Nexus Academy.

Your website rating: ${rating}/5

Your feedback has been received. Website submissions are reviewed before they may appear publicly.

If you would also like your feedback to affect our Google Business Profile rating, please submit a separate review on Google using the Google Review button on our Reviews & Feedback page.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com
`.trim();

    emailTasks.push(
      sendEmail({
        to: email,
        subject: "Thank you for your feedback – Physio Nexus Academy",
        text: reviewerMessage,
      }),
    );
  }

  await Promise.allSettled(emailTasks);

  return { ok: true };
}
