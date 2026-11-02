"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function markMessageRead(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid message.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status: "Read" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/messages");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid message.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/messages");
}
