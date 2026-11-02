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

export async function registerForWorkshop(values: {
  workshopId: string;
  fullName: string;
  email: string;
  phone: string;
  professionalStatus: string;
  institute?: string;
  city: string;
  groupRegistration: boolean;
}) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("workshop_registrations")
    .insert({
      workshop_id: values.workshopId,
      full_name: values.fullName,
      email: values.email,
      phone: values.phone,
      professional_status: values.professionalStatus,
      institute: values.institute || null,
      city: values.city,
      group_registration: values.groupRegistration,
      consent: true,
    })
    .select("reference_id")
    .single();

  if (error) throw new Error(error.message);

  const referenceId = data.reference_id as string;

  const { data: workshop } = await supabase
    .from("workshops")
    .select("title, start_date, venue")
    .eq("id", values.workshopId)
    .maybeSingle();

  const workshopTitle = workshop?.title || "Physio Nexus Academy Workshop";

  const workshopDate = workshop?.start_date
    ? new Date(workshop.start_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "To be announced";

  const workshopVenue = workshop?.venue || "To be announced";

  const adminMessage = `
New Workshop Registration – Physio Nexus Academy

Registration ID: ${referenceId}

Workshop:
${workshopTitle}

Date: ${workshopDate}
Venue: ${workshopVenue}

Participant Details

Name: ${values.fullName}
Email: ${values.email}
Phone / WhatsApp: ${values.phone}
Professional Status: ${values.professionalStatus}
Institute: ${values.institute || "Not provided"}
City: ${values.city}
Group Registration: ${values.groupRegistration ? "Yes" : "No"}

This registration has also been saved in the PNA database.
`.trim();

  const participantMessage = `
Dear ${values.fullName},

Thank you for registering with Physio Nexus Academy.

We have successfully received your workshop registration.

Registration ID: ${referenceId}

Workshop:
${workshopTitle}

Date: ${workshopDate}
Venue: ${workshopVenue}

Our team will review your registration and contact you regarding confirmation, payment, and any further workshop instructions.

Please keep your Registration ID for future communication.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com
`.trim();

  await Promise.allSettled([
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Workshop Registration – ${values.fullName}`,
      text: adminMessage,
      replyTo: values.email,
    }),

    sendEmail({
      to: values.email,
      subject: `Workshop Registration Received – ${referenceId}`,
      text: participantMessage,
    }),
  ]);

  return referenceId;
}
