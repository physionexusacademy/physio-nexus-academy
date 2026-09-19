"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function registerForWorkshop(values: {
  workshopId: string;
  fullName: string;
  email: string;
  phone: string;
  professionalStatus: string;
  institute?: string;
  city: string;
  groupRegistration: boolean;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("workshop_registrations")
    .insert({
      workshop_id: values.workshopId,
      full_name: values.fullName,
      email: values.email,
      phone: values.phone,
      professional_status: values.professionalStatus,
      institute: values.institute || null,
      city: values.city,
      group_registration: values.groupRegistration,
      consent: true,
    })
    .select("reference_id")
    .single();

  if (error) throw new Error(error.message);
  return data.reference_id as string;
}
