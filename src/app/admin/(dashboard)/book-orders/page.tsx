import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { updateBookOrderStatus, deleteBookOrder } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

const statuses = ["New", "Contacted", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusColor: Record<string, string> = {
  New: "bg-amber-50 text-amber-700",
  Contacted: "bg-blue-50 text-blue-700",
  Confirmed: "bg-teal-50 text-teal-700",
  Shipped: "bg-violet-50 text-violet-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-600",
};

export default async function AdminBookOrdersPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("book_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN_BOOK_ORDERS_READ_ERROR", error);
    throw new Error("Unable to load book orders.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Book Orders</h1>
          <p className="mt-1 text-sm text-navy-400">
            Manage customer orders for Clinical Myofascial Therapy.
          </p>
        </div>
        <div className="rounded-xl border border-grey-200 bg-white px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-navy-400">Total orders</p>
          <p className="text-2xl font-bold text-navy-800">{orders?.length ?? 0}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-xl border border-grey-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-800">{order.full_name}</p>
                <p className="text-xs text-navy-400">
                  {order.reference_id} • Submitted {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[order.status] ?? "bg-grey-100 text-navy-600"}`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-4 grid gap-x-6 gap-y-2 text-sm text-navy-600 sm:grid-cols-2">
              <p><span className="text-navy-400">Phone / WhatsApp:</span> {order.phone}</p>
              <p><span className="text-navy-400">Email:</span> {order.email || "—"}</p>
              <p><span className="text-navy-400">City:</span> {order.city}</p>
              <p><span className="text-navy-400">Quantity:</span> {order.quantity}</p>
              <p><span className="text-navy-400">Unit price:</span> PKR {Number(order.unit_price).toLocaleString("en-PK")}</p>
              <p><span className="text-navy-400">Order total:</span> <strong>PKR {Number(order.total_amount).toLocaleString("en-PK")}</strong></p>
              <p><span className="text-navy-400">Expected delivery:</span> {order.delivery_estimate}</p>
              <p><span className="text-navy-400">Book:</span> {order.book_title}</p>
              <p className="sm:col-span-2">
                <span className="text-navy-400">Delivery address:</span> {order.delivery_address}
              </p>
            </div>

            {order.customer_notes && (
              <p className="mt-3 rounded-lg bg-grey-50 p-3 text-sm text-navy-600">
                <span className="text-navy-400">Customer note:</span> {order.customer_notes}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${order.phone}`}
                className="rounded-md border border-grey-200 px-3 py-2 text-xs font-semibold text-navy-700 hover:bg-grey-50"
              >
                Call customer
              </a>
              <a
                href={`https://wa.me/${String(order.phone).replace(/\D/g, "").replace(/^0/, "92")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100"
              >
                WhatsApp
              </a>
              {order.email && (
                <a
                  href={`mailto:${order.email}`}
                  className="rounded-md border border-grey-200 px-3 py-2 text-xs font-semibold text-navy-700 hover:bg-grey-50"
                >
                  Email
                </a>
              )}
            </div>

            <form
              action={updateBookOrderStatus}
              className="mt-4 flex flex-wrap items-end gap-3 border-t border-grey-100 pt-4"
            >
              <input type="hidden" name="id" value={order.id} />
              <div>
                <label className="label">Status</label>
                <select name="status" defaultValue={order.status} className="input">
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[220px] flex-1">
                <label className="label">Admin notes (private)</label>
                <input
                  name="admin_notes"
                  defaultValue={order.admin_notes ?? ""}
                  placeholder="Courier, payment, follow-up notes..."
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

            <form action={deleteBookOrder} className="mt-2">
              <input type="hidden" name="id" value={order.id} />
              <ConfirmSubmitButton
                confirmMessage="Delete this book order record?"
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete record
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}

        {!orders?.length && (
          <p className="rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No book orders yet.
          </p>
        )}
      </div>
    </div>
  );
}
