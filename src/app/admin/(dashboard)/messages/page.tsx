import { createClient } from "@/lib/supabase/server";
import { markMessageRead, deleteMessage } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Contact Messages</h1>

      <div className="mt-6 space-y-3">
        {messages?.map((m) => (
          <div key={m.id} className="rounded-xl border border-grey-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-navy-800">{m.name}</p>
                <p className="text-xs text-navy-400">{m.email} • {new Date(m.created_at).toLocaleString()}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.status === "New" ? "bg-amber-50 text-amber-700" : "bg-grey-100 text-navy-500"}`}>
                {m.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-navy-600">{m.message}</p>
            <div className="mt-3 flex items-center gap-3">
              {m.status === "New" && (
                <form action={markMessageRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="text-xs font-semibold text-teal-600 hover:underline">
                    Mark as read
                  </button>
                </form>
              )}
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmSubmitButton confirmMessage="Delete this message?" className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {!messages?.length && (
          <p className="rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );
}
