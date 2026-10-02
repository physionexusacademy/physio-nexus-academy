import "server-only";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getCookieName(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120);
  return `pna_portal_${safeSlug}`;
}

function createRandomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string) {
  const input = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function getWorkshopPortalPublicInfo(slug: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("workshops")
    .select(
      "id, slug, title, subtitle, start_date, end_date, start_time, end_time, city, venue, contact_hours, topics, status",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data;
}

export async function createWorkshopPortalSession({
  workshopId,
  registrationId,
  slug,
}: {
  workshopId: string;
  registrationId: string;
  slug: string;
}) {
  const token = createRandomToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const supabase = createAdminClient();

  const { error } = await supabase.from("workshop_portal_sessions").insert({
    workshop_id: workshopId,
    registration_id: registrationId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("PNA_WORKSHOP_PORTAL_SESSION_CREATE_ERROR", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Unable to start the participant session.");
  }

  const cookieStore = await cookies();

  cookieStore.set(getCookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/workshops/${slug}/portal`,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getWorkshopPortalSession(slug: string) {
  const cookieStore = await cookies();
  const cookieName = getCookieName(slug);
  const token = cookieStore.get(cookieName)?.value;

  if (!token) return null;

  const tokenHash = await hashToken(token);
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("workshop_portal_sessions")
    .select("id, workshop_id, registration_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    return null;
  }

  const [{ data: workshop }, { data: registration }] = await Promise.all([
    supabase
      .from("workshops")
      .select(
        "id, slug, title, subtitle, start_date, end_date, start_time, end_time, city, venue, contact_hours, topics, status",
      )
      .eq("id", session.workshop_id)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("workshop_registrations")
      .select(
        "id, reference_id, full_name, email, professional_status, institute, city, payment_status, status, created_at",
      )
      .eq("id", session.registration_id)
      .maybeSingle(),
  ]);

  if (!workshop || !registration || registration.status === "Cancelled") {
    return null;
  }

  return { workshop, registration };
}

export async function clearWorkshopPortalSession(slug: string) {
  const cookieStore = await cookies();
  const cookieName = getCookieName(slug);
  const token = cookieStore.get(cookieName)?.value;

  if (token) {
    const tokenHash = await hashToken(token);
    const supabase = createAdminClient();

    await supabase
      .from("workshop_portal_sessions")
      .delete()
      .eq("token_hash", tokenHash);
  }

  cookieStore.delete(cookieName);
}
