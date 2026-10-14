import { createAdminClient } from "@/lib/supabase/admin";

// This authenticated dashboard depends on request cookies and must never be prerendered.
export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";

type OverviewTable =
  | "workshops"
  | "resources"
  | "appointments"
  | "home_visit_requests"
  | "book_orders";

async function count(table: OverviewTable, allowAdminFallback = false) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select("id");

    if (error) {
      if (allowAdminFallback && error.code === "42501") {
        console.warn("ADMIN_OVERVIEW_AUTH_FALLBACK", { table, error });

        const adminSupabase = createAdminClient();
        const { data: adminData, error: adminError } = await adminSupabase
          .from(table)
          .select("id");

        if (!adminError) {
          return adminData?.length ?? 0;
        }

        console.error("ADMIN_OVERVIEW_COUNT_ERROR", { table, error: adminError });
        return 0;
      }

      console.error("ADMIN_OVERVIEW_COUNT_ERROR", { table, error });
      return 0;
    }

    return data?.length ?? 0;
  } catch (error) {
    console.error("ADMIN_OVERVIEW_COUNT_ERROR", { table, error });
    return 0;
  }
}

export default async function AdminOverviewPage() {
  const [workshops, resources, appointments, homeVisits, bookOrders] = await Promise.all([
    count("workshops"),
    count("resources"),
    count("appointments", true),
    count("home_visit_requests", true),
    count("book_orders", true),
  ]);

  const cards = [
    { label: "Total Workshops", value: workshops, href: "/admin/workshops" },
    { label: "Total Resources", value: resources, href: "/admin/resources" },
    { label: "Book Orders", value: bookOrders, href: "/admin/book-orders" },
    { label: "Total Patient Appointments", value: appointments, href: "/admin/appointments" },
    { label: "Total Home Visit Requests", value: homeVisits, href: "/admin/home-visits" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Dashboard Overview</h1>
      <p className="mt-1 text-sm text-navy-400">A quick snapshot of activity across the site.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="rounded-xl border border-grey-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-navy-800">{card.value}</p>
            <p className="mt-1 text-sm text-navy-500">{card.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
