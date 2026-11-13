import "server-only";
import { redirect } from "next/navigation";
import { currentUser, getOverview, isStaff, rpc } from "./api";
import type { Overview, PatientSummary } from "./api-types";

type Profile = { full_name?: string; age_years?: number; sex?: string; phone?: string; city?: string; preferred_language?: string; consent?: boolean };

/**
 * Pages for patients call this first: signed-out → sign-in, staff → admin area, new account → the
 * patient record is created from the sign-up form (first sign-in after email confirmation).
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
  return overview as Overview & { patient: PatientSummary };
}
