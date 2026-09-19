import { createClient } from "@/lib/supabase/server";
import { createFaq, deleteFaq } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminFaqsPage() {
  const supabase = await createClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .order("group_label", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">FAQs</h1>

      <form
        action={createFaq}
        className="mt-6 grid gap-4 rounded-xl border border-grey-200 bg-white p-5 sm:grid-cols-2"
      >
        <div>
          <label className="label">Group (e.g. "Workshops & Students")</label>
          <input name="group_label" required className="input" />
        </div>
        <div>
          <label className="label">Question</label>
          <input name="question" required className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Answer</label>
          <textarea name="answer" required rows={3} className="input" />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Add FAQ
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {faqs?.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-grey-200 bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
              {f.group_label}
            </p>
            <p className="mt-1 font-medium text-navy-800">{f.question}</p>
            <p className="mt-1 text-sm text-navy-500">{f.answer}</p>
            <form action={deleteFaq} className="mt-2">
              <input type="hidden" name="id" value={f.id} />
              <ConfirmSubmitButton
                confirmMessage="Delete this FAQ?"
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
        {!faqs?.length && (
          <p className="rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No FAQs yet.
          </p>
        )}
      </div>
    </div>
  );
}
