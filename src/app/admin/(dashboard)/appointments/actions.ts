"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAppointmentStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const admin_notes = formData.get("admin_notes");
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status, admin_notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/appointments");
}

export async function deleteAppointment(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/appointments");
}
