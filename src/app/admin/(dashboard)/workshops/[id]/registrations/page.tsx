import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateWorkshopRegistration } from "../../actions";

const registrationStatuses = [
  "New",
  "Contacted",
  "Confirmed",
  "Completed",
  "Cancelled",
];

const paymentStatuses = [
  "unpaid",
  "pending",
  "paid",
  "waived",
];

export default async function WorkshopRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: workshop } = await supabase
    .from("workshops")
    .select("id, title, start_date, venue, city")
    .eq("id", id)
    .single();

  if (!workshop) notFound();

  const { data: registrations, error } = await supabase
    .from("workshop_registrations")
    .select("*")
    .eq("workshop_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/workshops"
            className="text-sm font-semibold text-teal-600 hover:underline"
          >
            ← Back to Workshops
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-navy-800">
            Workshop Registrations
          </h1>

          <p className="mt-1 text-sm font-medium text-navy-600">
            {workshop.title}
          </p>

          <div className="mt-2 space-y-1 text-sm text-navy-400">
            <p>
              Date:{" "}
              {workshop.start_date
                ? new Date(workshop.start_date).toLocaleDateString("en-GB")
                : "TBA"}
            </p>

            <p>
              Venue: {workshop.venue || "TBA"}
              {workshop.city ? `, ${workshop.city}` : ""}
            </p>

            <p>
              Total registrations:{" "}
              <span className="font-semibold text-navy-700">
                {registrations?.length ?? 0}
              </span>
            </p>
          </div>
        </div>

        <a
          href={`/admin/workshops/${id}/export`}
          className="inline-flex items-center justify-center rounded-md border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
        >
          Export CSV
        </a>
      </div>

      {!registrations?.length ? (
        <div className="rounded-xl border border-grey-200 bg-white p-8 text-center">
          <p className="font-semibold text-navy-700">
            No registrations received yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {registrations.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-grey-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                    {r.reference_id}
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-navy-800">
                    {r.full_name}
                  </h2>

                  <div className="mt-3 grid gap-1 text-sm text-navy-600 sm:grid-cols-2 sm:gap-x-8">
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {r.email}
                    </p>

                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {r.phone}
                    </p>

                    <p>
                      <span className="font-semibold">City:</span>{" "}
                      {r.city || "—"}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Professional status:
                      </span>{" "}
                      {r.professional_status || "—"}
                    </p>

                    <p>
                      <span className="font-semibold">Institute:</span>{" "}
                      {r.institute || "—"}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Group registration:
                      </span>{" "}
                      {r.group_registration ? "Yes" : "No"}
                    </p>

                    <p>
                      <span className="font-semibold">Submitted:</span>{" "}
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString("en-GB")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {r.status || "New"}
                  </span>

                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Payment: {r.payment_status || "unpaid"}
                  </span>
                </div>
              </div>

              <form
                action={updateWorkshopRegistration}
                className="mt-5 grid gap-4 border-t border-grey-100 pt-5 md:grid-cols-2"
              >
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="workshop_id" value={id} />

                <div>
                  <label className="label">Registration Status</label>
                  <select
                    name="status"
                    defaultValue={r.status || "New"}
                    className="input"
                  >
                    {registrationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Payment Status</label>
                  <select
                    name="payment_status"
                    defaultValue={r.payment_status || "unpaid"}
                    className="input"
                  >
                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Transaction Reference</label>
                  <input
                    name="transaction_ref"
                    defaultValue={r.transaction_ref ?? ""}
                    placeholder="Transaction / payment reference"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Admin Notes</label>
                  <textarea
                    name="admin_notes"
                    defaultValue={r.admin_notes ?? ""}
                    rows={3}
                    placeholder="Internal notes..."
                    className="input"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
                  >
                    Save Registration Changes
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
