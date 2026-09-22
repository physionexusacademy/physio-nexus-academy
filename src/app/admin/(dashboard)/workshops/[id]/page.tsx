import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateWorkshop } from "../actions";

export default async function EditWorkshopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: w } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", id)
    .single();

  if (!w) notFound();

  const updateWithId = updateWorkshop.bind(null, id);
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-navy-800">Edit Workshop</h1>

      <form
        action={updateWithId}
        className="mt-6 grid gap-4 rounded-xl border border-grey-200 bg-white p-6 sm:grid-cols-2"
        encType="multipart/form-data"
      >
        <div className="sm:col-span-2">
          <label className="label">Title</label>
          <input
            name="title"
            defaultValue={w.title}
            required
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Subtitle</label>
          <input
            name="subtitle"
            defaultValue={w.subtitle ?? ""}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Summary</label>
          <textarea
            name="summary"
            defaultValue={w.summary ?? ""}
            rows={2}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Full description</label>
          <textarea
            name="description"
            defaultValue={w.description ?? ""}
            rows={4}
            className="input"
          />
        </div>
        <div>
          <label className="label">Topics (comma-separated)</label>
          <input
            name="topics"
            defaultValue={w.topics?.join(", ") ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Instructors (comma-separated)</label>
          <input
            name="instructors"
            defaultValue={w.instructors?.join(", ") ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">City</label>
          <input name="city" defaultValue={w.city ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Venue</label>
          <input name="venue" defaultValue={w.venue ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Start date</label>
          <input
            name="start_date"
            type="date"
            defaultValue={w.start_date ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">End date</label>
          <input
            name="end_date"
            type="date"
            defaultValue={w.end_date ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Regular fee</label>
          <input
            name="regular_fee"
            type="number"
            step="0.01"
            defaultValue={w.regular_fee ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Early-bird fee</label>
          <input
            name="early_bird_fee"
            type="number"
            step="0.01"
            defaultValue={w.early_bird_fee ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Contact hours</label>
          <input
            name="contact_hours"
            type="number"
            step="0.5"
            defaultValue={w.contact_hours ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Seat limit</label>
          <input
            name="seat_limit"
            type="number"
            defaultValue={w.seat_limit ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Replace poster image</label>
          <input name="poster" type="file" accept="image/*" className="input" />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={w.status} className="input">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-600 sm:col-span-2">
          <input
            type="checkbox"
            name="is_past"
            defaultChecked={w.is_past}
            className="h-4 w-4"
          />
          Mark as past workshop
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
