"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateFounderProfile(formData: FormData) {
  const supabase = createClient();
  const messageBody = String(formData.get("message_body") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const update: Record<string, unknown> = {
    name: formData.get("name"),
    credentials_short: formData.get("credentials_short"),
    role: formData.get("role"),
    academic_focus: formData.get("academic_focus"),
    message_heading: formData.get("message_heading"),
    message_body: messageBody,
    updated_at: new Date().toISOString(),
  };

  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop();
    const path = `founder/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(path, photoFile, { upsert: true });
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    update.photo_url = data.publicUrl;
  }

  const { error } = await supabase.from("founder_profile").update(update).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/founder");
  revalidatePath("/");
}

export async function addQualification(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("qualifications").insert({
    title: formData.get("title"),
    issuer: formData.get("issuer") || null,
    year: formData.get("year") || null,
    verification_url: formData.get("verification_url") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export async function deleteQualification(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createClient();
  const { error } = await supabase.from("qualifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export async function updateSiteSetting(formData: FormData) {
  const key = String(formData.get("key"));
  const value = String(formData.get("value"));
  const supabase = createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export async function updateAboutContent(formData: FormData) {
  const supabase = createClient();
  const content = {
    purpose: formData.get("purpose"),
    vision: formData.get("vision"),
    mission: formData.get("mission"),
  };
  const { error } = await supabase.from("editable_page_sections").upsert(
    {
      page: "about",
      section_key: "mission",
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page,section_key" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/about");
  revalidatePath("/");
}
