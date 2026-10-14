import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCsvRow(values: (string | number | boolean | null)[]) {
  return values
    .map((value) => {
      const raw = value === null || value === undefined ? "" : String(value);
      // Prevent spreadsheet formula execution from user-controlled CSV fields.
      const firstNonWhitespace = raw.trimStart()[0] ?? "";
      const safe = ["=", "+", "-", "@"].includes(firstNonWhitespace) ? "'" + raw : raw;
      return `"${safe.replace(/"/g, '""')}"`;
    })
    .join(",");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "workshop";
  const supabase = await createClient();

  // RLS ensures this route only returns data if the caller's session is an
  // authenticated admin — no need to re-check role here.
  const { data: registrations, error } = await supabase
    .from("workshop_registrations")
    .select("*")
    .eq("workshop_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Unable to export registrations." }, { status: 500 });
  }

  const header = toCsvRow([
    "Reference ID",
    "Full Name",
    "Email",
    "Phone",
    "Professional Status",
    "Institute",
    "City",
    "Group Registration",
    "Payment Status",
    "Submitted At",
  ]);

  const rows = (registrations ?? []).map((r) =>
    toCsvRow([
      r.reference_id,
      r.full_name,
      r.email,
      r.phone,
      r.professional_status,
      r.institute,
      r.city,
      r.group_registration,
      r.payment_status,
      r.created_at,
    ]),
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="workshop-${safeId}-registrations.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
