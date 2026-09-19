import { createClient } from "@/lib/supabase/server";
import { updateHomeVisitStatus, deleteHomeVisit } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

const statuses = ["New", "Contacted", "Confirmed", "Completed", "Cancelled"];

export default async function AdminHomeVisitsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("home_visit_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Home Visit Requests</h1>
      <p className="mt-1 text-sm text-navy-400">
        Addresses are private and only ever shown on this page.
      </p>

      <div className="mt-6 space-y-4">
        {requests?.map((r) => (
          <div key={r.id} className="rounded-xl border border-grey-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-800">{r.full_name}</p>
                <p className="text-xs text-navy-400">
                  {r.reference_id} • Submitted {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {r.status}
              </span>
            </div>

            <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-navy-600 sm:grid-cols-2">
              <p><span className="text-navy-400">Phone:</span> {r.phone}</p>
              <p><span className="text-navy-400">City / Area:</span> {r.city}, {r.area}</p>
              <p className="sm:col-span-2"><span className="text-navy-400">Address:</span> {r.address}</p>
              <p><span className="text-navy-400">Preferred:</span> {r.preferred_date} — {r.preferred_time}</p>
            </div>
            <p className="mt-2 text-sm text-navy-600">
              <span className="text-navy-400">Mobility / condition:</span> {r.mobility_summary}
            </p>
            {r.accessibility_notes && (
              <p className="mt-1 text-sm text-navy-600">
                <span className="text-navy-400">Accessibility notes:</span> {r.accessibility_notes}
              </p>
            )}

            <form action={updateHomeVisitStatus} className="mt-4 flex flex-wrap items-end gap-3 border-t border-grey-100 pt-4">
              <input type="hidden" name="id" value={r.id} />
              <div>
                <label className="label">Status</label>
                <select name="status" defaultValue={r.status} className="input">
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="label">Admin notes (private)</label>
                <input name="admin_notes" defaultValue={r.admin_notes ?? ""} className="input" />
              </div>
              <button type="submit" className="rounded-md bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700">
                Save
              </button>
            </form>
            <form action={deleteHomeVisit} className="mt-2">
              <input type="hidden" name="id" value={r.id} />
              <ConfirmSubmitButton confirmMessage="Delete this home visit record?" className="text-xs font-semibold text-red-600 hover:underline">
                Delete record
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
        {!requests?.length && (
          <p className="rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No home visit requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
