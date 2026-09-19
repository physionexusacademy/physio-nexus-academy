"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTestimonial(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").insert({
    name: formData.get("name"),
    role: formData.get("role") || null,
    content: formData.get("content"),
    status: formData.get("status") || "draft",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonials");
}

export async function toggleTestimonialStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const nextStatus = String(formData.get("next_status"));
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update({ status: nextStatus }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonials");
}
