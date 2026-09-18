import type { Metadata } from "next";
import { HomeVisitForm } from "./HomeVisitForm";

export const metadata: Metadata = {
  title: "Request Home Visit",
  description: "Request an eligible physiotherapy home visit from Physio Nexus Academy.",
};

export default function HomeVisitPage() {
  return (
    <div className="container-content section-padding max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Home Visit</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Request a Home Visit</h1>
      <p className="mt-4 text-navy-600">
        Home visits are available in select service areas. Submit the details below and our
        team will confirm availability for your area.
      </p>
      <div className="mt-6 rounded-lg border border-grey-200 bg-grey-50 p-4 text-sm text-navy-500">
        Service area coverage is configured by the academy and updated periodically — availability
        will be confirmed after you submit this request.
      </div>

      <div className="mt-8">
        <HomeVisitForm />
      </div>
    </div>
  );
}
