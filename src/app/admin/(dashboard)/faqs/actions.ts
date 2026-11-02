"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFaq(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert({
    group_label: formData.get("group_label"),
    question: formData.get("question"),
    answer: formData.get("answer"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/faqs");
}

export async function deleteFaq(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/faqs");
}
