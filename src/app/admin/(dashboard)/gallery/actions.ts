"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function addGalleryItem(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) throw new Error("Please choose an image.");

  const ext = file.name.split(".").pop();
  const path = `items/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
  if (uploadError) throw new Error(uploadError.message);
  const { data } = supabase.storage.from("gallery").getPublicUrl(path);

  const { error } = await supabase.from("gallery_items").insert({
    image_url: data.publicUrl,
    caption: formData.get("caption") || null,
    category: formData.get("category") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
}
