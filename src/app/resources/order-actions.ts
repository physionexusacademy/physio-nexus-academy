"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_BOOK_ID, getBook } from "@/lib/books";

const ADMIN_EMAIL = "physionexusacademypk@gmail.com";
const FROM_EMAIL = "Physio Nexus Academy <notifications@physionexusacademy.com>";

const schema = z.object({
  bookId: z.string().trim().max(80).optional(),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  deliveryAddress: z.string().trim().min(10).max(500),
  quantity: z.number().int().min(1).max(5),
  customerNotes: z.string().trim().max(500).optional().or(z.literal("")),
});

async function sendEmail({ to, subject, text, replyTo }: {
  to: string; subject: string; text: string; replyTo?: string;
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
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!response.ok) console.error("Resend email failed:", await response.text());
  } catch (error) {
    console.error("Resend email error:", error);
  }
}

export async function submitBookOrder(values: {
  bookId?: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  deliveryAddress: string;
  quantity: number;
  customerNotes?: string;
}) {
  const parsed = schema.safeParse(values);
  if (!parsed.success) throw new Error("Please check your order details and try again.");

  const order = parsed.data;
  // Price and title always come from the server-side catalogue, never from the browser.
  const book = getBook(order.bookId ?? DEFAULT_BOOK_ID);
  if (!book) throw new Error("Please choose a book and try again.");
  const bookTitle = book.orderTitle;
  const unitPrice = book.price;
  const deliveryEstimate = book.deliveryEstimate;
  const totalAmount = unitPrice * order.quantity;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("book_orders")
    .insert({
      book_title: bookTitle,
      unit_price: unitPrice,
      quantity: order.quantity,
      total_amount: totalAmount,
      full_name: order.fullName,
      phone: order.phone,
      email: order.email || null,
      city: order.city,
      delivery_address: order.deliveryAddress,
      delivery_estimate: deliveryEstimate,
      customer_notes: order.customerNotes || null,
    })
    .select("reference_id")
    .single();

  if (error) throw new Error(error.message);

  const referenceId = data.reference_id as string;
  const total = totalAmount.toLocaleString("en-PK");

  const adminText = `New Book Order – Physio Nexus Academy

Order ID: ${referenceId}
Book: ${bookTitle}
Unit Price: PKR ${unitPrice.toLocaleString("en-PK")}
Quantity: ${order.quantity}
Total: PKR ${total}
Expected Delivery: ${deliveryEstimate}

Customer: ${order.fullName}
Phone / WhatsApp: ${order.phone}
Email: ${order.email || "Not provided"}
City: ${order.city}

Delivery Address:
${order.deliveryAddress}

Customer Notes:
${order.customerNotes || "None"}

This order has also been saved in the PNA admin dashboard.`;

  const tasks: Promise<void>[] = [
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Book Order – ${referenceId} – ${order.fullName}`,
      text: adminText,
      replyTo: order.email || undefined,
    }),
  ];

  if (order.email) {
    const customerText = `Dear ${order.fullName},

Thank you for ordering from Physio Nexus Academy.

We have successfully received your book order.

Order ID: ${referenceId}
Book: ${bookTitle}
Quantity: ${order.quantity}
Total: PKR ${total}
Expected Delivery: ${deliveryEstimate}

Our team will contact you if any additional delivery confirmation is required.
Please keep your Order ID for future communication.

Regards,
Physio Nexus Academy
LEARN • APPLY • TRANSFORM LIVES
physionexusacademy.com`;

    tasks.push(sendEmail({
      to: order.email,
      subject: `Book Order Received – ${referenceId}`,
      text: customerText,
    }));
  }

  await Promise.allSettled(tasks);
  return { referenceId, totalAmount, deliveryEstimate: deliveryEstimate };
}
