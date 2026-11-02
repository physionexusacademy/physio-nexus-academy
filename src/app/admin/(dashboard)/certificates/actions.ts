"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required.");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) throw new Error("Admin access required.");

  return supabase;
}

function parseNameLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function firstCsvCell(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith('"')) {
    let value = "";
    for (let i = 1; i < trimmed.length; i += 1) {
      const char = trimmed[i];
      if (char === '"' && trimmed[i + 1] === '"') {
        value += '"';
        i += 1;
        continue;
      }
      if (char === '"') break;
      value += char;
    }
    return value.trim();
  }

  return (trimmed.split(",")[0] ?? "").trim();
}

function parseCsvNames(value: string) {
  const names = value
    .split(/\r?\n/)
    .map(firstCsvCell)
    .filter(Boolean);

  if (
    names.length > 0 &&
    /^(participant\s*name|full\s*name|name)$/i.test(names[0])
  ) {
    names.shift();
  }

  return names;
}

export async function generateCertificates(formData: FormData) {
  const supabase = await requireAdmin();
  const workshopId = String(formData.get("workshop_id") ?? "").trim();
  const pastedNames = String(formData.get("participant_names") ?? "");
  const file = formData.get("names_file") as File | null;

  if (!workshopId) throw new Error("Select a workshop.");

  const { data: workshop, error: workshopError } = await supabase
    .from("workshops")
    .select("id")
    .eq("id", workshopId)
    .maybeSingle();

  if (workshopError || !workshop) throw new Error("Workshop not found.");

  const names = parseNameLines(pastedNames);

  if (file && file.size > 0) {
    if (file.size > 1_000_000) {
      throw new Error("CSV file is too large. Keep it below 1 MB.");
    }
    const text = await file.text();
    names.push(...parseCsvNames(text));
  }

  const cleanedNames = names
    .map((name) => name.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (cleanedNames.length === 0) {
    throw new Error("Add participant names or upload a CSV file.");
  }

  if (cleanedNames.length > 500) {
    throw new Error("A single batch can contain up to 500 participants.");
  }

  const { error } = await supabase.from("certificates").insert(
    cleanedNames.map((participant_name) => ({
      participant_name,
      workshop_id: workshopId,
    }))
  );

  if (error) throw new Error(error.message);

  revalidatePath("/admin/certificates");
}

export async function generateCertificatesFromCompletedRegistrations(
  formData: FormData
) {
  const supabase = await requireAdmin();
  const workshopId = String(formData.get("workshop_id") ?? "").trim();

  if (!workshopId) throw new Error("Select a workshop.");

  const { data: registrations, error: registrationError } = await supabase
    .from("workshop_registrations")
    .select("id, full_name")
    .eq("workshop_id", workshopId)
    .eq("status", "Completed");

  if (registrationError) throw new Error(registrationError.message);

  if (!registrations?.length) {
    throw new Error("No completed participant registrations were found.");
  }

  const rows = registrations.map((registration) => ({
    participant_name: registration.full_name,
    workshop_id: workshopId,
    workshop_registration_id: registration.id,
  }));

  const { error } = await supabase
    .from("certificates")
    .upsert(rows, { onConflict: "workshop_registration_id" });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/certificates");
}

export async function updateCertificateStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !["valid", "revoked"].includes(status)) {
    throw new Error("Invalid certificate status request.");
  }

  const { error } = await supabase
    .from("certificates")
    .update({
      status,
      revoked_at: status === "revoked" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/certificates");
}
