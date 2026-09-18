"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function uploadFile(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  folder: string,
  file: File | null
) {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  return path; // stored as a Storage path, not a public URL (resources bucket is private)
}

export async function createResource(formData: FormData) {
  const supabase = createClient();
  const coverFile = formData.get("cover") as File | null;
  const pdfFile = formData.get("file") as File | null;

  const coverPath = await uploadFile(supabase, "gallery", "resource-covers", coverFile);
  const filePath = await uploadFile(supabase, "resources", "files", pdfFile);

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { error } = await supabase.from("resources").insert({
    title: formData.get("title"),
    author: formData.get("author") || null,
    description: formData.get("description") || null,
    tags,
    publication_year: formData.get("publication_year")
      ? Number(formData.get("publication_year"))
      : null,
    cover_image_url: coverPath,
    file_url: filePath,
    external_link: formData.get("external_link") || null,
    visibility: formData.get("visibility") || "Draft",
    access_type: formData.get("access_type") || "Free download",
    featured: formData.get("featured") === "on",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  redirect("/admin/resources");
}

export async function deleteResource(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
}

export async function updateResourceVisibility(formData: FormData) {
  const id = String(formData.get("id"));
  const visibility = String(formData.get("visibility"));
  const supabase = createClient();
  const { error } = await supabase
    .from("resources")
    .update({ visibility, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
}
