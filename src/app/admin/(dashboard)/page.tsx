import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

async function count(table: string, filter?: Record<string, string>) {
  const supabase = await createAdminClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
  }
  const { count: total, error } = await query;

  if (error) {
    const diagnostic = {
      table,
      message: error.message || "(empty message)",
      code: error.code || null,
      details: error.details || null,
      hint: error.hint || null,
    };

    console.error("DASHBOARD_COUNT_ERROR", diagnostic);
    throw new Error(`Dashboard count failed for ${table}: ${JSON.stringify(diagnostic)}`);
  }

  return total ?? 0;
}

export default async function AdminOverviewPage() {
  const [
    upcomingWorkshops,
    registrations,
    newAppointments,
    newHomeVisits,
    resources,
    newMessages,
  ] = await Promise.all([
    count("workshops", { status: "published" }),
    count("workshop_registrations"),
    count("appointments", { status: "New" }),
    count("home_visit_requests", { status: "New" }),
    count("resources"),
    count("contact_messages", { status: "New" }),
  ]);

  const cards = [
    { label: "Published Workshops", value: upcomingWorkshops, href: "/admin/workshops" },
    { label: "Workshop Registrations", value: registrations, href: "/admin/workshops" },
    { label: "New Appointment Requests", value: newAppointments, href: "/admin/appointments" },
    { label: "New Home Visit Requests", value: newHomeVisits, href: "/admin/home-visits" },
    { label: "Resources in Library", value: resources, href: "/admin/resources" },
    { label: "New Contact Messages", value: newMessages, href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Dashboard Overview</h1>
      <p className="mt-1 text-sm text-navy-400">A quick snapshot of activity across the site.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-grey-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-navy-800">{card.value}</p>
            <p className="mt-1 text-sm text-navy-500">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
