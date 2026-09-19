import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Step 1: check permission the normal way, respecting RLS. An anonymous
  // visitor only gets a row back here if visibility = 'Public'; an admin
  // session gets it regardless.
  const supabase = await createClient();
  const { data: resource, error } = await supabase
    .from("resources")
    .select("id, title, file_url, external_link, visibility, access_type")
    .eq("id", id)
    .maybeSingle();

  if (error || !resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  if (resource.external_link) {
    return NextResponse.redirect(resource.external_link);
  }

  if (!resource.file_url) {
    return NextResponse.json(
      { error: "No file attached to this resource." },
      { status: 404 },
    );
  }

  // Step 2: now that visibility is confirmed, use the service-role client
  // purely to mint a short-lived signed URL for that one already-approved
  // file — never used to bypass the check above.
  const admin = createAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from("resources")
    .createSignedUrl(resource.file_url, 60);

  if (signError || !signed) {
    return NextResponse.json(
      { error: "Could not generate a download link." },
      { status: 500 },
    );
  }

  // Best-effort download counter — failure here shouldn't block the download.
  const { error: countError } = await admin.rpc(
    "increment_resource_downloads",
    { resource_id: id },
  );

  // Download count failure should not block the actual download.
  if (countError) {
    console.error("Could not increment download count:", countError.message);
  }

  return NextResponse.redirect(signed.signedUrl);
}
