import { createClient } from "@/lib/supabase/server";
import { createResource, deleteResource, updateResourceVisibility } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Books & Resources</h1>
      <p className="mt-1 text-sm text-navy-400">
        Manage the resource library. PDFs are stored privately — visibility controls who can
        access them.
      </p>

      <details className="mt-6 rounded-xl border border-grey-200 bg-white p-5">
        <summary className="cursor-pointer font-semibold text-navy-700">+ Add new resource</summary>
        <form action={createResource} className="mt-5 grid gap-4 sm:grid-cols-2" encType="multipart/form-data">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input name="title" required className="input" />
          </div>
          <div>
            <label className="label">Author</label>
            <input name="author" className="input" />
          </div>
          <div>
            <label className="label">Publication year</label>
            <input name="publication_year" type="number" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" rows={3} className="input" />
          </div>
          <div>
            <label className="label">Tags / keywords (comma-separated)</label>
            <input name="tags" className="input" />
          </div>
          <div>
            <label className="label">External link (optional)</label>
            <input name="external_link" type="url" className="input" />
          </div>
          <div>
            <label className="label">Cover image</label>
            <input name="cover" type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label">PDF file (max 50MB)</label>
            <input name="file" type="file" accept="application/pdf" className="input" />
          </div>
          <div>
            <label className="label">Visibility</label>
            <select name="visibility" className="input">
              <option value="Draft">Draft</option>
              <option value="Public">Public</option>
              <option value="Members-only">Members-only</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
          <div>
            <label className="label">Access type</label>
            <select name="access_type" className="input">
              <option value="Free download">Free download</option>
              <option value="View only">View only</option>
              <option value="External link">External link</option>
              <option value="Future paid resource">Future paid resource</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-600">
            <input type="checkbox" name="featured" className="h-4 w-4" /> Feature on homepage
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600">
              Add Resource
            </button>
          </div>
        </form>
      </details>

      <div className="mt-6 overflow-x-auto rounded-xl border border-grey-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-grey-200 text-left text-xs uppercase tracking-wide text-navy-400">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {resources?.map((r) => (
              <tr key={r.id} className="border-b border-grey-100 last:border-0">
                <td className="px-4 py-3 font-medium text-navy-800">{r.title}</td>
                <td className="px-4 py-3 text-navy-500">{r.access_type}</td>
                <td className="px-4 py-3">
                  <form action={updateResourceVisibility} className="inline-flex items-center gap-1.5">
                    <input type="hidden" name="id" value={r.id} />
                    <select
                      name="visibility"
                      defaultValue={r.visibility}
                      className="rounded-md border border-grey-300 px-2 py-1 text-xs"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Public">Public</option>
                      <option value="Members-only">Members-only</option>
                      <option value="Hidden">Hidden</option>
                    </select>
                    <button type="submit" className="text-xs font-semibold text-teal-600 hover:underline">
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-navy-500">{r.download_count}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteResource}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Delete "${r.title}"?`}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {!resources?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-400">
                  No resources yet — add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
