import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createTestimonial, toggleTestimonialStatus, deleteTestimonial } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminTestimonialsPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("id, name, role, content, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN_TESTIMONIALS_READ_ERROR", error);
    throw new Error("Unable to load testimonials.");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Testimonials</h1>
      <p className="mt-1 text-sm text-navy-400">
        Only add genuine testimonials — never fabricate one.
      </p>

      <details className="mt-6 rounded-xl border border-grey-200 bg-white p-5">
        <summary className="cursor-pointer font-semibold text-navy-700">+ Add testimonial</summary>
        <form action={createTestimonial} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input name="name" required className="input" />
          </div>
          <div>
            <label className="label">Role (e.g. "Workshop Participant")</label>
            <input name="role" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Testimonial</label>
            <textarea name="content" required rows={3} className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input">
              <option value="draft">Draft</option>
              <option value="published">Publish now</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600">
              Save
            </button>
          </div>
        </form>
      </details>

      <div className="mt-6 space-y-3">
        {testimonials?.map((t) => (
          <div key={t.id} className="rounded-xl border border-grey-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-navy-800">{t.name}</p>
                <p className="text-xs text-navy-400">{t.role}</p>
              </div>
              <span className="rounded-full bg-grey-100 px-2.5 py-1 text-xs font-semibold text-navy-500">
                {t.status}
              </span>
            </div>
            <p className="mt-2 text-sm italic text-navy-600">&ldquo;{t.content}&rdquo;</p>
            <div className="mt-3 flex items-center gap-3">
              <form action={toggleTestimonialStatus}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="next_status" value={t.status === "published" ? "draft" : "published"} />
                <button type="submit" className="text-xs font-semibold text-teal-600 hover:underline">
                  {t.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </form>
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmSubmitButton confirmMessage="Delete this testimonial?" className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {!testimonials?.length && (
          <p className="rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No testimonials yet.
          </p>
        )}
      </div>
    </div>
  );
}
