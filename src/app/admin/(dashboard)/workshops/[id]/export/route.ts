import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCsvRow(values: (string | number | boolean | null)[]) {
  return values
    .map((v) => {
      const str = v === null || v === undefined ? "" : String(v);
      return `"${str.replace(/"/g, '""')}"`;
    })
    .join(",");
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  // RLS ensures this route only returns data if the caller's session is an
  // authenticated admin — no need to re-check role here.
  const { data: registrations, error } = await supabase
    .from("workshop_registrations")
    .select("*")
    .eq("workshop_id", params.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    ])
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="workshop-${params.id}-registrations.csv"`,
    },
  });
}
