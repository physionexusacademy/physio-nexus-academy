"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const allowedStatuses = new Set(["draft", "published"]);

export async function createTestimonial(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim() || null;
  const content = String(formData.get("content") || "").trim();
  const status = String(formData.get("status") || "draft");

  if (!name || !content || !allowedStatuses.has(status)) {
    throw new Error("Invalid testimonial.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("testimonials").insert({
    name,
    role,
    content,
    status,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function toggleTestimonialStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const nextStatus = String(formData.get("next_status") || "");

  if (!id || !allowedStatuses.has(nextStatus)) {
    throw new Error("Invalid testimonial update.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ status: nextStatus })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid testimonial record.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
