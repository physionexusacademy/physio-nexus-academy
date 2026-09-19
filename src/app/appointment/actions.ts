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
      console.error("Resend email failed:", await response.text());
    }
  } catch (error) {
    console.error("Resend email error:", error);
  }
}

export async function submitAppointment(values: {
  fullName: string;
  age?: string;
  gender?: string;
  phone: string;
  email?: string;
  city: string;
  reason: string;
  preferredDate: string;
  preferredTime: string;
  appointmentType: "in-person" | "online";
}) {
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

  if (error) throw new Error(error.message);

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
