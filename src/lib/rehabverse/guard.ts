import "server-only";
import { redirect } from "next/navigation";
import { currentUser, getOverview, isStaff, rpc } from "./api";
import type { Overview, PatientSummary } from "./api-types";

type Profile = { full_name?: string; age_years?: number; sex?: string; phone?: string; city?: string; preferred_language?: string; consent?: boolean };

/**
 * Pages for patients call this first: signed-out → sign-in, staff → admin area, an account the clinic has not
 * approved yet → the waiting screen, an old account without a patient record → it is created from the sign-up form.
 */
export async function requirePatient(): Promise<Overview & { patient: PatientSummary }> {
  const user = await currentUser();
  if (!user) redirect("/rehabverse/login");
  if (await isStaff()) redirect("/admin/rehabverse");
  let overview = await getOverview();
  if (!overview.patient) {
    const profile = (user.user_metadata?.rehabverse_profile ?? null) as Profile | null;
    if (profile?.consent && profile.full_name) {
      try {
        await rpc("rehab_register_patient", { p_payload: { ...profile, consent_version: "v1" } });
        overview = await getOverview();
      } catch {
        // falls through to the registration page
      }
    }
  }
  if (!overview.patient) redirect("/rehabverse/register");
  // A new account is a request the clinic approves: until then (or if it was declined) the person only sees the waiting screen.
  if (overview.patient.status && overview.patient.status !== "active") redirect("/rehabverse/pending"); // (no status = a database that has not had the approval migration yet: treat as active)
  return overview as Overview & { patient: PatientSummary };
}
