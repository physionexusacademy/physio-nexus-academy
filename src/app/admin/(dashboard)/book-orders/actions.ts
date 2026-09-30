"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const allowedStatuses = new Set([
  "New",
  "Contacted",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
]);

export async function updateBookOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const notesValue = formData.get("admin_notes");
  const admin_notes =
    typeof notesValue === "string" && notesValue.trim()
      ? notesValue.trim()
      : null;

  if (!id || !allowedStatuses.has(status)) {
    throw new Error("Invalid book order update.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("book_orders")
    .update({ status, admin_notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/book-orders");
  revalidatePath("/admin");
}

export async function deleteBookOrder(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid book order record.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("book_orders").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/book-orders");
  revalidatePath("/admin");
}
