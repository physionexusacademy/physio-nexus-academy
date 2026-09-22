import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Home, ShieldCheck } from "lucide-react";
import { HomeVisitForm } from "./HomeVisitForm";

export const metadata: Metadata = {
  title: "Request Home Visit",
  description: "Request an eligible physiotherapy home visit from Physio Nexus Academy.",
};

export default function HomeVisitPage() {
  return (
    <div className="container-content section-padding max-w-3xl">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Patient Services</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Request a Home Visit</h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-600">
          Tell us your area, preferred time and essential patient details. We will contact you to confirm whether a visit is available.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/appointment"
          className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grey-100 text-teal-700">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Clinic / Online Appointment</p>
          <p className="mt-1 text-sm text-navy-500">Book a consultation instead.</p>
        </Link>
        <div className="rounded-2xl border-2 border-teal-500 bg-teal-50 p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Home className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Home Visit</p>
          <p className="mt-1 text-sm text-navy-500">You are requesting this service.</p>
        </div>
      </div>

      <div className="mt-8">
        <HomeVisitForm />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-grey-200 bg-white p-4 text-sm text-navy-500">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
        <p>Your address and contact details are used only to process and follow up on your home visit request.</p>
      </div>
    </div>
  );
}
