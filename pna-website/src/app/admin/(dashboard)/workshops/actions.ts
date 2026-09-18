"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toArray(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str === "" ? null : Number(str);
}

function toNullableDate(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str === "" ? null : str;
}

async function uploadPoster(supabase: ReturnType<typeof createClient>, file: File | null) {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop();
  const path = `posters/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("workshop-media").upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("workshop-media").getPublicUrl(path);
  return data.publicUrl;
}

export async function createWorkshop(formData: FormData) {
  const supabase = createClient();
  const title = String(formData.get("title") ?? "");
  const posterFile = formData.get("poster") as File | null;
  const posterUrl = await uploadPoster(supabase, posterFile);

  const { error } = await supabase.from("workshops").insert({
    slug: slugify(title) || `workshop-${Date.now()}`,
    title,
    subtitle: formData.get("subtitle") || null,
    summary: formData.get("summary") || null,
    description: formData.get("description") || null,
    topics: toArray(formData.get("topics")),
    instructors: toArray(formData.get("instructors")),
    city: formData.get("city") || null,
    venue: formData.get("venue") || null,
    start_date: toNullableDate(formData.get("start_date")),
    end_date: toNullableDate(formData.get("end_date")),
    cpd_hours: toNullableNumber(formData.get("cpd_hours")),
    regular_fee: toNullableNumber(formData.get("regular_fee")),
    early_bird_fee: toNullableNumber(formData.get("early_bird_fee")),
    seat_limit: toNullableNumber(formData.get("seat_limit")),
    seats_remaining: toNullableNumber(formData.get("seat_limit")),
    poster_image_url: posterUrl,
    status: formData.get("status") || "draft",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/workshops");
  redirect("/admin/workshops");
}

export async function updateWorkshop(id: string, formData: FormData) {
  const supabase = createClient();
  const title = String(formData.get("title") ?? "");
  const posterFile = formData.get("poster") as File | null;
  const posterUrl = await uploadPoster(supabase, posterFile);

  const update: Record<string, unknown> = {
    title,
    subtitle: formData.get("subtitle") || null,
    summary: formData.get("summary") || null,
    description: formData.get("description") || null,
    topics: toArray(formData.get("topics")),
    instructors: toArray(formData.get("instructors")),
    city: formData.get("city") || null,
    venue: formData.get("venue") || null,
    start_date: toNullableDate(formData.get("start_date")),
    end_date: toNullableDate(formData.get("end_date")),
    cpd_hours: toNullableNumber(formData.get("cpd_hours")),
    regular_fee: toNullableNumber(formData.get("regular_fee")),
    early_bird_fee: toNullableNumber(formData.get("early_bird_fee")),
    seat_limit: toNullableNumber(formData.get("seat_limit")),
    status: formData.get("status") || "draft",
    is_past: formData.get("is_past") === "on",
    updated_at: new Date().toISOString(),
  };
  if (posterUrl) update.poster_image_url = posterUrl;

  const { error } = await supabase.from("workshops").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/workshops");
  redirect("/admin/workshops");
}

export async function deleteWorkshop(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createClient();
  const { error } = await supabase.from("workshops").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/workshops");
}
