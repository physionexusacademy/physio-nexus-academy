"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function submitContactMessage(values: {
  name: string;
  email: string;
  message: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: values.name,
    email: values.email,
    message: values.message,
  });
  if (error) throw new Error(error.message);
}
