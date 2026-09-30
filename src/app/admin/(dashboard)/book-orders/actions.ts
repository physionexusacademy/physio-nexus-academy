"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const FROM_EMAIL = "Physio Nexus Academy <notifications@physionexusacademy.com>";

const allowedStatuses = new Set([
  "New",
  "Contacted",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
]);

async function sendCustomerEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      console.error("BOOK_ORDER_STATUS_EMAIL_FAILED", await response.text());
    }
  } catch (error) {
    console.error("BOOK_ORDER_STATUS_EMAIL_ERROR", error);
  }
}

export async function updateBookOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const notesValue = formData.get("admin_notes");
  const admin_notes =
    typeof notesValue === "string" && notesValue.trim()
      ? notesValue.trim()
      : null;

  if (!id || !allowedStatuses.has(status)) {
    throw new Error("Invalid book order update.");
  }

  const supabase = createAdminClient();

  const { data: existingOrder, error: readError } = await supabase
    .from("book_orders")
    .select(
      "status,email,full_name,reference_id,book_title,quantity,total_amount,delivery_estimate",
    )
    .eq("id", id)
    .single();

  if (readError || !existingOrder) {
    throw new Error(readError?.message || "Book order not found.");
  }

  const { error } = await supabase
    .from("book_orders")
    .update({ status, admin_notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const statusChanged = existingOrder.status !== status;

  if (statusChanged && existingOrder.email && status === "Confirmed") {
    const total = Number(existingOrder.total_amount).toLocaleString("en-PK");

    await sendCustomerEmail({
      to: existingOrder.email,
      subject: `Book Order Confirmed – ${existingOrder.reference_id}`,
      text: `Dear ${existingOrder.full_name},

Your book order has been confirmed by Physio Nexus Academy.

Order ID: ${existingOrder.reference_id}
Book: ${existingOrder.book_title}
Quantity: ${existingOrder.quantity}
Total: PKR ${total}
Expected Delivery: ${existingOrder.delivery_estimate}

Your order is now being prepared for delivery. Please keep your Order ID for any future communication.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com`,
    });
  }

  if (statusChanged && existingOrder.email && status === "Delivered") {
    await sendCustomerEmail({
      to: existingOrder.email,
      subject: `Book Order Delivered – ${existingOrder.reference_id}`,
      text: `Dear ${existingOrder.full_name},

Your Physio Nexus Academy book order has been marked as delivered.

Order ID: ${existingOrder.reference_id}
Book: ${existingOrder.book_title}
Quantity: ${existingOrder.quantity}

Thank you for ordering from Physio Nexus Academy. We hope you find the book useful in your learning and clinical practice.

If you have not received the order or need any assistance, please contact us and mention your Order ID.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com`,
    });
  }

  if (statusChanged && existingOrder.email && status === "Cancelled") {
    await sendCustomerEmail({
      to: existingOrder.email,
      subject: `Book Order Cancelled – ${existingOrder.reference_id}`,
      text: `Dear ${existingOrder.full_name},

Your book order with Physio Nexus Academy has been marked as cancelled.

Order ID: ${existingOrder.reference_id}
Book: ${existingOrder.book_title}
Quantity: ${existingOrder.quantity}

If you did not request this cancellation, or if you would like to place the order again, please contact Physio Nexus Academy and mention your Order ID.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com`,
    });
  }

  revalidatePath("/admin/book-orders");
  revalidatePath("/admin");
}

export async function deleteBookOrder(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid book order record.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("book_orders").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/book-orders");
  revalidatePath("/admin");
}
