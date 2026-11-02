"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPublicFormRateLimited } from "@/lib/security/public-form-protection";
import { appointmentSubmissionSchema } from "@/lib/validation/public-form-schemas";

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
      console.error("Resend email failed:", await response.text());
    }
  } catch (error) {
    console.error("Resend email error:", error);
  }
}

export async function submitAppointment(input: unknown) {
  const parsed = appointmentSubmissionSchema.safeParse(input);
  if (!parsed.success) throw new Error("Please check the form details and try again.");

  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("cf-connecting-ip") ?? "unknown";
  if (isPublicFormRateLimited(`appointment:${clientIp}`)) {
    throw new Error("Too many requests. Please wait a few minutes and try again.");
  }

  const values = parsed.data;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      full_name: values.fullName,
      age: values.age || null,
      gender: values.gender || null,
      phone: values.phone,
      email: values.email || null,
      city: values.city,
      reason: values.reason,
      preferred_date: values.preferredDate,
      preferred_time: values.preferredTime,
      appointment_type: values.appointmentType,
    })
    .select("reference_id")
    .single();

  if (error) {
    console.error("Appointment request insert failed", { code: error.code });
    throw new Error("Unable to submit your request right now. Please try again later.");
  }

  const referenceId = data.reference_id as string;

  const adminMessage = `
New Appointment Request – Physio Nexus Academy

Reference ID: ${referenceId}

Patient Name: ${values.fullName}
Age: ${values.age || "Not provided"}
Gender: ${values.gender || "Not provided"}
Phone: ${values.phone}
Email: ${values.email || "Not provided"}
City: ${values.city}

Appointment Type: ${values.appointmentType}
Preferred Date: ${values.preferredDate}
Preferred Time: ${values.preferredTime}

Reason / Concern:
${values.reason}

This appointment request has also been saved in the PNA database.
`.trim();

  const emailTasks: Promise<void>[] = [];

  emailTasks.push(
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Appointment Request – ${values.fullName}`,
      text: adminMessage,
      replyTo: values.email || undefined,
    }),
  );

  if (values.email) {
    const patientMessage = `
Dear ${values.fullName},

Thank you for contacting Physio Nexus Academy.

We have successfully received your appointment request.

Reference ID: ${referenceId}
Appointment Type: ${values.appointmentType}
Preferred Date: ${values.preferredDate}
Preferred Time: ${values.preferredTime}

Our team will review your request and contact you shortly to confirm your appointment.

Please keep your Reference ID for future communication.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com
`.trim();

    emailTasks.push(
      sendEmail({
        to: values.email,
        subject: `Appointment Request Received – ${referenceId}`,
        text: patientMessage,
      }),
    );
  }

  await Promise.allSettled(emailTasks);

  return referenceId;
}
