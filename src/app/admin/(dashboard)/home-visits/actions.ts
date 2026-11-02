"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const allowedStatuses = new Set([
  "New",
  "Contacted",
  "Confirmed",
  "Completed",
  "Cancelled",
]);

export async function updateHomeVisitStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const notesValue = formData.get("admin_notes");
  const admin_notes =
    typeof notesValue === "string" && notesValue.trim()
      ? notesValue.trim()
      : null;

  if (!id || !allowedStatuses.has(status)) {
    throw new Error("Invalid home visit update.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("home_visit_requests")
    .update({ status, admin_notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/home-visits");
}

export async function deleteHomeVisit(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid home visit record.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("home_visit_requests")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/home-visits");
  revalidatePath("/admin");
}
