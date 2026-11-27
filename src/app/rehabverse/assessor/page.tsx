import type { Metadata } from "next";
import { AssessorRoom } from "@/components/rehabverse/research-room/AssessorRoom";

export const metadata: Metadata = { title: "Outcome assessor", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** The study's blinded outcome assessor. Access is checked by the database on every call; the page itself shows nothing to anyone else. */
export default function AssessorPage() {
  return (
    <div className="container-content pb-20 pt-6 sm:pt-9">
      <AssessorRoom />
    </div>
  );
}
