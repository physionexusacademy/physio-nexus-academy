"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContactMessage(values: {
  name: string;
  email: string;
  message: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: values.name,
    email: values.email,
    message: values.message,
  });
  if (error) throw new Error(error.message);
}
