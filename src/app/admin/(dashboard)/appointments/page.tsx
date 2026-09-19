import { createClient } from "@/lib/supabase/server";
import { updateAppointmentStatus, deleteAppointment } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

const statuses = ["New", "Contacted", "Confirmed", "Completed", "Cancelled"];

const statusColor: Record<string, string> = {
  New: "bg-amber-50 text-amber-700",
  Contacted: "bg-blue-50 text-blue-700",
  Confirmed: "bg-teal-50 text-teal-700",
  Completed: "bg-grey-100 text-navy-600",
  Cancelled: "bg-red-50 text-red-600",
};

export default async function AdminAppointmentsPage() {
  const supabase = await createClient();
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Patient Appointments</h1>
      <p className="mt-1 text-sm text-navy-400">
        This data is admin-only — it is never exposed on the public site.
      </p>

      <div className="mt-6 space-y-4">
        {appointments?.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-grey-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-800">{a.full_name}</p>
                <p className="text-xs text-navy-400">
                  {a.reference_id} • Submitted{" "}
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[a.status]}`}
              >
                {a.status}
              </span>
            </div>

            <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-navy-600 sm:grid-cols-2">
              <p>
                <span className="text-navy-400">Phone:</span> {a.phone}
              </p>
              <p>
                <span className="text-navy-400">Email:</span> {a.email || "—"}
              </p>
              <p>
                <span className="text-navy-400">City:</span> {a.city}
              </p>
              <p>
                <span className="text-navy-400">Type:</span>{" "}
                {a.appointment_type}
              </p>
              <p>
                <span className="text-navy-400">Preferred:</span>{" "}
                {a.preferred_date} — {a.preferred_time}
              </p>
              {a.age && (
                <p>
                  <span className="text-navy-400">Age:</span> {a.age}
                </p>
              )}
            </div>
            <p className="mt-2 text-sm text-navy-600">
              <span className="text-navy-400">Reason:</span> {a.reason}
            </p>

            <form
              action={updateAppointmentStatus}
              className="mt-4 flex flex-wrap items-end gap-3 border-t border-grey-100 pt-4"
            >
              <input type="hidden" name="id" value={a.id} />
              <div>
                <label className="label">Status</label>
                <select name="status" defaultValue={a.status} className="input">
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="label">Admin notes (private)</label>
                <input
                  name="admin_notes"
                  defaultValue={a.admin_notes ?? ""}
                  className="input"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
              >
                Save
              </button>
            </form>
            <form action={deleteAppointment} className="mt-2">
              <input type="hidden" name="id" value={a.id} />
              <ConfirmSubmitButton
                confirmMessage="Delete this appointment record?"
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete record
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
        {!appointments?.length && (
          <p className="rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No appointment requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
