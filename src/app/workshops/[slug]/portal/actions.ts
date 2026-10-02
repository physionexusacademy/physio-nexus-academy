"use server";

import { redirect } from "next/navigation";
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

function portalUrl(slug: string, error?: string) {
  const base = `/workshops/${slug}/portal`;
  return error ? `${base}?error=${encodeURIComponent(error)}` : base;
}

export async function loginToWorkshopPortal(
  slug: string,
  formData: FormData,
) {
  const registrationId = normalizeReferenceId(
    String(formData.get("registrationId") || ""),
  );
  const email = normalizeEmail(String(formData.get("email") || ""));

  if (!slug || registrationId.length < 8 || !/^\S+@\S+\.\S+$/.test(email)) {
    redirect(portalUrl(slug, "invalid-details"));
  }

  const workshop = await getWorkshopPortalPublicInfo(slug);

  if (!workshop) {
    redirect(portalUrl(slug, "unavailable"));
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
    redirect(portalUrl(slug, "system"));
  }

  if (
    !registration ||
    registration.email.trim().toLowerCase() !== email ||
    registration.status === "Cancelled"
  ) {
    redirect(portalUrl(slug, "invalid-details"));
  }

  try {
    await createWorkshopPortalSession({
      workshopId: workshop.id,
      registrationId: registration.id,
      slug,
    });
  } catch (error) {
    console.error("PNA_WORKSHOP_PORTAL_LOGIN_SESSION_ERROR", error);
    redirect(portalUrl(slug, "system"));
  }

  redirect(portalUrl(slug));
}

export async function logoutFromWorkshopPortal(slug: string) {
  await clearWorkshopPortalSession(slug);
  redirect(portalUrl(slug));
}
