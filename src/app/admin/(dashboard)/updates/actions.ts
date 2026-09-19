"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "");
  const status = String(formData.get("status") ?? "draft");

  const { error } = await supabase.from("blog_posts").insert({
    slug: `${slugify(title)}-${Date.now().toString().slice(-4)}`,
    title,
    excerpt: formData.get("excerpt") || null,
    content: formData.get("content") || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/updates");
}

export async function togglePostStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const nextStatus = String(formData.get("next_status"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: nextStatus,
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/updates");
}

export async function deletePost(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/updates");
}
