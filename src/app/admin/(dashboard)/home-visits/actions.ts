"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateHomeVisitStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const admin_notes = formData.get("admin_notes");
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_visit_requests")
    .update({ status, admin_notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/home-visits");
}

export async function deleteHomeVisit(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("home_visit_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/home-visits");
}
