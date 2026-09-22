import { createClient } from "@/lib/supabase/server";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return '"' + text.replace(/"/g, '""') + '"';
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    return new Response("Forbidden", { status: 403 });
  }

  const { data: certificates, error } = await supabase
    .from("certificates")
    .select(
      "certificate_id, participant_name, status, issued_at, workshops(title, start_date, end_date, contact_hours)"
    )
    .order("issued_at", { ascending: false });

  if (error) {
    return new Response("Could not export certificates.", { status: 500 });
  }

  const rows = [
    [
      "Participant Name",
      "Certificate ID",
      "Workshop",
      "Start Date",
      "End Date",
      "Contact Hours",
      "Status",
      "Issued At",
    ].map(csvEscape).join(","),
    ...(certificates ?? []).map((certificate) => {
      const workshop = Array.isArray(certificate.workshops)
        ? certificate.workshops[0]
        : certificate.workshops;

      return [
        certificate.participant_name,
        certificate.certificate_id,
        workshop?.title ?? "",
        workshop?.start_date ?? "",
        workshop?.end_date ?? "",
        workshop?.contact_hours ?? "",
        certificate.status,
        certificate.issued_at,
      ]
        .map(csvEscape)
        .join(",");
    }),
  ];

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pna-certificates.csv"',
      "Cache-Control": "no-store",
    },
  });
}
