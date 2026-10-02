"use server";

import {
  clearWorkshopPortalSession,
  createWorkshopPortalSession,
  getWorkshopPortalPublicInfo,
} from "@/lib/workshop-portal";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeReferenceId(value: string) {
  return value.trim().toUpperCase();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function loginToWorkshopPortal(values: {
  slug: string;
  registrationId: string;
  email: string;
}) {
  const slug = values.slug.trim();
  const registrationId = normalizeReferenceId(values.registrationId);
  const email = normalizeEmail(values.email);

  if (!slug || registrationId.length < 8) {
    return { ok: false, error: "Please enter your valid Registration ID." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Please enter your registered email address." };
  }

  const workshop = await getWorkshopPortalPublicInfo(slug);

  if (!workshop) {
    return { ok: false, error: "This workshop portal is not available." };
  }

  const supabase = createAdminClient();

  const { data: registration, error } = await supabase
    .from("workshop_registrations")
    .select("id, email, status")
    .eq("workshop_id", workshop.id)
    .eq("reference_id", registrationId)
    .maybeSingle();

  if (error) {
    console.error("PNA_WORKSHOP_PORTAL_LOGIN_READ_ERROR", {
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: "Unable to verify your registration right now." };
  }

  if (
    !registration ||
    registration.email.trim().toLowerCase() !== email ||
    registration.status === "Cancelled"
  ) {
    return {
      ok: false,
      error: "Registration ID and email do not match an active participant.",
    };
  }

  await createWorkshopPortalSession({
    workshopId: workshop.id,
    registrationId: registration.id,
    slug,
  });

  return { ok: true, error: null };
}

export async function logoutFromWorkshopPortal(slug: string) {
  await clearWorkshopPortalSession(slug);
}
