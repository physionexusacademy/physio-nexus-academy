import { createClient } from "@/lib/supabase/server";
import { createPost, togglePostStatus, deletePost } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminUpdatesPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Updates & Announcements</h1>

      <details className="mt-6 rounded-xl border border-grey-200 bg-white p-5">
        <summary className="cursor-pointer font-semibold text-navy-700">+ Write new update</summary>
        <form action={createPost} className="mt-5 space-y-4">
          <div>
            <label className="label">Title</label>
            <input name="title" required className="input" />
          </div>
          <div>
            <label className="label">Short excerpt</label>
            <input name="excerpt" className="input" />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea name="content" rows={6} className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input">
              <option value="draft">Draft</option>
              <option value="published">Publish now</option>
            </select>
          </div>
          <button type="submit" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600">
            Save Update
          </button>
        </form>
      </details>

      <div className="mt-6 space-y-3">
        {posts?.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-grey-200 bg-white p-4">
            <div>
              <p className="font-medium text-navy-800">{p.title}</p>
              <p className="text-xs text-navy-400">{p.status} • {new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <form action={togglePostStatus}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="next_status" value={p.status === "published" ? "draft" : "published"} />
                <button type="submit" className="text-xs font-semibold text-teal-600 hover:underline">
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </form>
              <form action={deletePost}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmSubmitButton confirmMessage="Delete this post?" className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {!posts?.length && (
          <p className="rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No updates yet.
          </p>
        )}
      </div>
    </div>
  );
}
