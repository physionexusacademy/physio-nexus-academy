import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createWorkshop, deleteWorkshop } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { Download } from "lucide-react";

export default async function AdminWorkshopsPage() {
  const supabase = await createClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Workshops</h1>
      <p className="mt-1 text-sm text-navy-400">Create, publish and manage workshops.</p>

      <details className="mt-6 rounded-xl border border-grey-200 bg-white p-5">
        <summary className="cursor-pointer font-semibold text-navy-700">+ Add new workshop</summary>
        <form action={createWorkshop} className="mt-5 grid gap-4 sm:grid-cols-2" encType="multipart/form-data">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input name="title" required className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Subtitle</label>
            <input name="subtitle" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Summary (short card description)</label>
            <textarea name="summary" rows={2} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Full description / learning objectives</label>
            <textarea name="description" rows={4} className="input" />
          </div>
          <div>
            <label className="label">Topics (comma-separated)</label>
            <input name="topics" placeholder="Dry Needling, Cupping Therapy" className="input" />
          </div>
          <div>
            <label className="label">Instructors (comma-separated)</label>
            <input name="instructors" className="input" />
          </div>
          <div>
            <label className="label">City</label>
            <input name="city" className="input" />
          </div>
          <div>
            <label className="label">Venue</label>
            <input name="venue" className="input" />
          </div>
          <div>
            <label className="label">Start date</label>
            <input name="start_date" type="date" className="input" />
          </div>
          <div>
            <label className="label">End date</label>
            <input name="end_date" type="date" className="input" />
          </div>
          <div>
            <label className="label">Regular fee</label>
            <input name="regular_fee" type="number" step="0.01" className="input" />
          </div>
          <div>
            <label className="label">Early-bird fee</label>
            <input name="early_bird_fee" type="number" step="0.01" className="input" />
          </div>
          <div>
            <label className="label">Contact hours</label>
            <input name="contact_hours" type="number" step="0.5" className="input" />
          </div>
          <div>
            <label className="label">Seat limit</label>
            <input name="seat_limit" type="number" className="input" />
          </div>
          <div>
            <label className="label">Poster image</label>
            <input name="poster" type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600">
              Create Workshop
            </button>
          </div>
        </form>
      </details>

      <div className="mt-6 overflow-x-auto rounded-xl border border-grey-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-grey-200 text-left text-xs uppercase tracking-wide text-navy-400">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Registrations</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {workshops?.map((w) => (
              <tr key={w.id} className="border-b border-grey-100 last:border-0">
                <td className="px-4 py-3 font-medium text-navy-800">{w.title}</td>
                <td className="px-4 py-3 text-navy-500">{w.city || "—"}</td>
                <td className="px-4 py-3 text-navy-500">
                  {w.start_date ? new Date(w.start_date).toLocaleDateString() : "TBA"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      w.status === "published"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-grey-100 text-navy-500"
                    }`}
                  >
                    {w.status}
                  </span>
                </td>
                <td className="px-4 py-3">
  <div className="flex flex-col items-start gap-2">
    <Link
      href={`/admin/workshops/${w.id}/registrations`}
      className="text-xs font-semibold text-navy-700 hover:text-teal-600 hover:underline"
    >
      Manage Registrations
    </Link>

    <a
      href={`/admin/workshops/${w.id}/export`}
      className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </a>
  </div>
</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/workshops/${w.id}`} className="text-xs font-semibold text-navy-600 hover:underline">
                      Edit
                    </Link>
                    <form action={deleteWorkshop}>
                      <input type="hidden" name="id" value={w.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Delete "${w.title}"? This cannot be undone.`}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!workshops?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-400">
                  No workshops yet — add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
