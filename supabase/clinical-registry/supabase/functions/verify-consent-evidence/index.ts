// Retired endpoint: consent files are no longer uploaded to the Registry.
// Signed originals remain with the treating therapist/institution.
declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

Deno.serve(async (_request: Request) => {
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
