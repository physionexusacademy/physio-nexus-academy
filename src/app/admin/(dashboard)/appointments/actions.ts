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

export async function updateAppointmentStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const notesValue = formData.get("admin_notes");
  const admin_notes =
    typeof notesValue === "string" && notesValue.trim()
      ? notesValue.trim()
      : null;

  if (!id || !allowedStatuses.has(status)) {
    throw new Error("Invalid appointment update.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status, admin_notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/appointments");
}

export async function deleteAppointment(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid appointment record.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}
