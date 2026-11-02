import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Consent documents are no longer uploaded to the Registry. Signed originals
// remain with the treating therapist/institution; only minimal attestations
// are stored in the Registry database.
Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      error: "Signed-consent file uploads are no longer supported. Retain the signed original securely with the treating therapist."
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" }
    }
  );
});
