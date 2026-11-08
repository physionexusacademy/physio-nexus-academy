"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, MessageCircle, PackageCheck, ShoppingCart, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { submitBookOrder } from "./order-actions";

export interface OrderableBook {
  id: string;
  title: string;
  price: number;
  deliveryEstimate: string;
}

const schema = z.object({
  bookId: z.string().min(1, "Please choose a book"),
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone / WhatsApp number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  city: z.string().min(2, "Please enter your city"),
  deliveryAddress: z.string().min(10, "Please enter your complete delivery address"),
  quantity: z.number().int().min(1).max(5),
  customerNotes: z.string().max(500, "Please keep notes under 500 characters").optional(),
  consent: z.literal(true, { error: "Please confirm your order details" }),
});

type FormValues = z.infer<typeof schema>;

export function BookOrderForm({ books, defaultBookId }: { books: OrderableBook[]; defaultBookId: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [confirmedBook, setConfirmedBook] = useState<OrderableBook | null>(null);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { bookId: defaultBookId, quantity: 1, email: "", customerNotes: "" },
  });
  const quantity = watch("quantity") || 1;
  const selectedBook = books.find((book) => book.id === watch("bookId")) ?? books[0];
  const unitPrice = selectedBook.price;
  const total = unitPrice * quantity;

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await submitBookOrder(values);
      setReferenceId(result.referenceId);
      setConfirmedTotal(result.totalAmount);
      setConfirmedBook(selectedBook);
      setStatus("success");
      reset({ bookId: values.bookId, quantity: 1, email: "", customerNotes: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    const whatsappMessage = encodeURIComponent(`Hello Physio Nexus Academy, I placed a book order (${confirmedBook?.title ?? "book"}). Order ID: ${referenceId}`);
    return (
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-6 text-center shadow-sm sm:p-8" role="status" aria-live="polite">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700"><CheckCircle2 className="h-8 w-8" /></span>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-navy-800">Order placed successfully</h2>
        {confirmedBook && <p className="mt-2 text-sm font-medium text-navy-700">{confirmedBook.title}</p>}
        <p className="mt-2 text-sm leading-6 text-navy-600">Your Order ID is <span className="font-mono font-semibold text-navy-800">{referenceId}</span>.</p>
        <div className="mx-auto mt-5 grid max-w-md gap-3 rounded-xl bg-white p-4 text-left text-sm text-navy-600 shadow-sm sm:grid-cols-2">
          <p><span className="block text-xs text-navy-400">Order total</span><strong>PKR {confirmedTotal.toLocaleString("en-PK")}</strong></p>
          <p><span className="block text-xs text-navy-400">Expected delivery</span><strong>{confirmedBook?.deliveryEstimate ?? "3–4 days"}</strong></p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={`https://wa.me/923489009028?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"><MessageCircle className="h-4 w-4" />Contact on WhatsApp</a>
          <Button variant="outline" onClick={() => setStatus("idle")}>Place another order</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-teal-50 text-teal-700"><ShoppingCart className="h-5 w-5" /></span>
          <div><p className="font-heading text-xl font-semibold text-navy-800">Order your copy</p><p className="mt-1 text-sm text-navy-500">Choose your book, then enter your delivery details.</p></div>
        </div>
        <div className="mt-6"><Field label="Book" error={errors.bookId?.message}><select {...register("bookId")} className="input min-h-12">{books.map((book) => <option key={book.id} value={book.id}>{book.title} — PKR {book.price.toLocaleString("en-PK")}</option>)}</select></Field></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.message}><input {...register("fullName")} autoComplete="name" className="input min-h-12" /></Field>
          <Field label="Phone / WhatsApp number" error={errors.phone?.message}><input {...register("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 0348 9009028" className="input min-h-12" /></Field>
          <Field label="Email (optional)" error={errors.email?.message}><input {...register("email")} type="email" autoComplete="email" className="input min-h-12" /></Field>
          <Field label="City" error={errors.city?.message}><input {...register("city")} autoComplete="address-level2" className="input min-h-12" /></Field>
        </div>
        <div className="mt-5"><Field label="Complete delivery address" error={errors.deliveryAddress?.message}><textarea {...register("deliveryAddress")} rows={3} autoComplete="street-address" placeholder="House / flat, street, area and any nearby landmark" className="input" /></Field></div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Quantity" error={errors.quantity?.message}><select {...register("quantity", { valueAsNumber: true })} className="input min-h-12">{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
          <div className="rounded-xl border border-grey-200 bg-grey-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Order total</p><p className="mt-1 text-2xl font-bold text-navy-800">PKR {total.toLocaleString("en-PK")}</p><p className="mt-1 text-xs text-navy-400">PKR {unitPrice.toLocaleString("en-PK")} per book</p></div>
        </div>
        <div className="mt-5"><Field label="Order notes (optional)" error={errors.customerNotes?.message}><textarea {...register("customerNotes")} rows={2} placeholder="Any delivery note you want us to know" className="input" /></Field></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-sm text-navy-700"><Truck className="h-5 w-5 flex-none text-teal-700" /><span><strong>Expected delivery:</strong> {selectedBook.deliveryEstimate}</span></div>
          <div className="flex items-center gap-3 rounded-xl bg-navy-50 p-4 text-sm text-navy-700"><PackageCheck className="h-5 w-5 flex-none text-navy-700" /><span>Your order is saved securely with a unique Order ID.</span></div>
        </div>
        <label className="mt-5 flex items-start gap-3 rounded-xl bg-grey-50 p-4 text-sm text-navy-600"><input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4 accent-teal-600" /><span>I confirm that the contact and delivery details above are correct and may be used to process this order.{errors.consent && <span className="mt-1 block text-xs text-red-600">{errors.consent.message}</span>}</span></label>
        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-6 w-full"><ShoppingCart className="h-4 w-4" />{isSubmitting ? "Placing order..." : `Place Order — PKR ${total.toLocaleString("en-PK")}`}</Button>
      </div>
      {status === "error" && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">Something went wrong while placing your order. Please try again or contact us on WhatsApp.</p>}
    </form>
  );
}
