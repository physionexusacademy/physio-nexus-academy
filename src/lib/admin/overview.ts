import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminCounts } from "./types";

export type { AdminCounts } from "./types";

/**
 * Numbers and lists for the admin shell and the overview. Read with the service-role client, so ONLY call these after the caller has verified
 * that the signed-in user is an admin (the admin layout and `requireAdmin()` do). Every query is isolated: a table that cannot be read
 * gives zero / an empty list and a console error, never a broken page.
 */

export type InboxKind = "appointment" | "home-visit" | "order" | "message";

export type AttentionItem = {
  kind: InboxKind;
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
};

export type WorkshopItem = { id: string; title: string; city: string | null; startDate: string | null; status: string | null };


export type AdminOverview = {
  counts: AdminCounts;
  totals: { workshops: number; resources: number; certificates: number; registrations: number };
  attention: AttentionItem[];
  workshops: WorkshopItem[];
  /** Requests received per day for the last 14 days, oldest first. */
  activity: { day: string; label: string; appointments: number; homeVisits: number; orders: number; messages: number }[];
  /** False when none of the tables could be read (shown as a quiet notice, not an error page). */
  connected: boolean;
};

type Row = Record<string, unknown>;

const DAYS = 14;

async function safe<T>(label: string, fallback: T, run: () => PromiseLike<{ data: unknown; count?: number | null; error: unknown }>): Promise<{ value: T; count: number; ok: boolean }> {
  try {
    const result = await run();
    if (result.error) {
      console.error("ADMIN_OVERVIEW_ERROR", label, result.error);
      return { value: fallback, count: 0, ok: false };
    }
    return { value: (result.data ?? fallback) as T, count: result.count ?? 0, ok: true };
  } catch (error) {
    console.error("ADMIN_OVERVIEW_ERROR", label, error);
    return { value: fallback, count: 0, ok: false };
  }
}

const str = (value: unknown) => (typeof value === "string" ? value : value == null ? "" : String(value));

/** Just the "waiting for you" counts (the sidebar badges). One light query per table. */
export async function getAdminCounts(): Promise<AdminCounts> {
  const db = createAdminClient();
  const waiting = (table: string) =>
    safe<Row[]>(`count:${table}`, [], () => db.from(table).select("id", { count: "exact", head: true }).eq("status", "New"));
  const [appointments, homeVisits, orders, messages] = await Promise.all([
    waiting("appointments"),
    waiting("home_visit_requests"),
    waiting("book_orders"),
    waiting("contact_messages"),
  ]);
  // people waiting for access to the members-only website; zero (quietly) until the members migration exists
  let members = 0;
  try {
    const result = await db.from("site_members").select("user_id", { count: "exact", head: true }).eq("status", "pending");
    members = result.error ? 0 : result.count ?? 0;
  } catch {
    members = 0;
  }
  return { appointments: appointments.count, homeVisits: homeVisits.count, orders: orders.count, messages: messages.count, members };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const db = createAdminClient();
  const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const waiting = (table: string) =>
    safe<Row[]>(`count:${table}`, [], () => db.from(table).select("id", { count: "exact", head: true }).eq("status", "New"));
  const total = (table: string) => safe<Row[]>(`total:${table}`, [], () => db.from(table).select("id", { count: "exact", head: true }));
  const latest = (table: string, columns: string) =>
    safe<Row[]>(`latest:${table}`, [], () => db.from(table).select(columns).eq("status", "New").order("created_at", { ascending: false }).limit(6));
  const recent = (table: string) =>
    safe<Row[]>(`activity:${table}`, [], () => db.from(table).select("created_at").gte("created_at", since).limit(1000));

  const [
    cAppointments, cHomeVisits, cOrders, cMessages,
    tWorkshops, tResources, tCertificates, tRegistrations,
    lAppointments, lHomeVisits, lOrders, lMessages,
    rAppointments, rHomeVisits, rOrders, rMessages,
    upcoming,
  ] = await Promise.all([
    waiting("appointments"), waiting("home_visit_requests"), waiting("book_orders"), waiting("contact_messages"),
    total("workshops"), total("resources"), total("certificates"), total("workshop_registrations"),
    latest("appointments", "id, full_name, appointment_type, preferred_date, created_at"),
    latest("home_visit_requests", "id, full_name, area, city, preferred_date, created_at"),
    latest("book_orders", "id, full_name, book_title, quantity, created_at"),
    latest("contact_messages", "id, name, message, created_at"),
    recent("appointments"), recent("home_visit_requests"), recent("book_orders"), recent("contact_messages"),
    safe<Row[]>("upcoming:workshops", [], () => db.from("workshops").select("id, title, city, start_date, status").gte("start_date", today).order("start_date", { ascending: true }).limit(4)),
  ]);

  const attention: AttentionItem[] = [
    ...lAppointments.value.map((r): AttentionItem => ({ kind: "appointment", id: str(r.id), title: str(r.full_name) || "New appointment", detail: [str(r.appointment_type), str(r.preferred_date)].filter(Boolean).join(" · "), href: "/admin/appointments", createdAt: str(r.created_at) })),
    ...lHomeVisits.value.map((r): AttentionItem => ({ kind: "home-visit", id: str(r.id), title: str(r.full_name) || "New home visit", detail: [str(r.area), str(r.city), str(r.preferred_date)].filter(Boolean).join(" · "), href: "/admin/home-visits", createdAt: str(r.created_at) })),
    ...lOrders.value.map((r): AttentionItem => ({ kind: "order", id: str(r.id), title: str(r.full_name) || "New book order", detail: [str(r.book_title), r.quantity ? `× ${str(r.quantity)}` : ""].filter(Boolean).join(" "), href: "/admin/book-orders", createdAt: str(r.created_at) })),
    ...lMessages.value.map((r): AttentionItem => ({ kind: "message", id: str(r.id), title: str(r.name) || "New message", detail: str(r.message).slice(0, 90), href: "/admin/messages", createdAt: str(r.created_at) })),
  ]
    .filter((item) => item.createdAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  // Requests per day (Pakistan calendar day), oldest first.
  const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date(iso));
  const days: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) days.push(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date(Date.now() - i * 86_400_000)));
  const bucket = (rows: Row[]) => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const created = str(row.created_at);
      if (!created) continue;
      const key = dayKey(created);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  };
  const bA = bucket(rAppointments.value), bH = bucket(rHomeVisits.value), bO = bucket(rOrders.value), bM = bucket(rMessages.value);
  const label = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  const activity = days.map((day) => ({
    day,
    label: label.format(new Date(`${day}T12:00:00Z`)),
    appointments: bA.get(day) ?? 0,
    homeVisits: bH.get(day) ?? 0,
    orders: bO.get(day) ?? 0,
    messages: bM.get(day) ?? 0,
  }));

  const checks = [cAppointments, cHomeVisits, cOrders, cMessages, tWorkshops, tResources];
  return {
    counts: { appointments: cAppointments.count, homeVisits: cHomeVisits.count, orders: cOrders.count, messages: cMessages.count, members: 0 }, // (the sidebar badge for waiting members comes from getAdminCounts)
    totals: { workshops: tWorkshops.count, resources: tResources.count, certificates: tCertificates.count, registrations: tRegistrations.count },
    attention,
    workshops: upcoming.value.map((r) => ({ id: str(r.id), title: str(r.title), city: str(r.city) || null, startDate: str(r.start_date) || null, status: str(r.status) || null })),
    activity,
    connected: checks.some((check) => check.ok),
  };
}
