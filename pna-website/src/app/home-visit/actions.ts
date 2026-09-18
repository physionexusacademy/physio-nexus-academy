"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitHomeVisit(values: {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  mobilitySummary: string;
  accessibilityNotes?: string;
  specialInstructions?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("home_visit_requests")
    .insert({
      full_name: values.fullName,
      phone: values.phone,
      city: values.city,
      area: values.area,
      address: values.address,
      preferred_date: values.preferredDate,
      preferred_time: values.preferredTime,
      mobility_summary: values.mobilitySummary,
      accessibility_notes: values.accessibilityNotes || null,
      special_instructions: values.specialInstructions || null,
    })
    .select("reference_id")
    .single();

  if (error) throw new Error(error.message);
  return data.reference_id as string;
}
