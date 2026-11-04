import type { SupabaseClient } from "@supabase/supabase-js";

export async function notifyRegistryReviewer(
  client: SupabaseClient,
  caseId: string,
): Promise<{ sent: boolean; message?: string }> {
  const sessionResult = await client.auth.getSession();
  const accessToken = sessionResult.data.session?.access_token;
  if (!accessToken) return { sent: false, message: "Your session expired before the email alert could be sent." };

  try {
    const response = await fetch("/api/clinical-registry/reviewer-notification", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caseId }),
    });
    const result = await response.json() as { ok?: boolean; error?: string };
    if (response.ok && result.ok) return { sent: true };
    return { sent: false, message: result.error || "Email notification could not be delivered." };
  } catch {
    return { sent: false, message: "Email notification service could not be reached." };
  }
}
