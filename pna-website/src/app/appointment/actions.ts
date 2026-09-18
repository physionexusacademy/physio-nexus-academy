"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitAppointment(values: {
  fullName: string;
  age?: string;
  gender?: string;
  phone: string;
  email?: string;
  city: string;
  reason: string;
  preferredDate: string;
  preferredTime: string;
  appointmentType: "in-person" | "online";
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      full_name: values.fullName,
      age: values.age || null,
      gender: values.gender || null,
      phone: values.phone,
      email: values.email || null,
      city: values.city,
      reason: values.reason,
      preferred_date: values.preferredDate,
      preferred_time: values.preferredTime,
      appointment_type: values.appointmentType,
    })
    .select("reference_id")
    .single();

  if (error) throw new Error(error.message);
  return data.reference_id as string;
}
