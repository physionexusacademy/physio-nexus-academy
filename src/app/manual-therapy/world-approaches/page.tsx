import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "World Manual Therapy Encyclopedia | Physio Nexus Academy",
  alternates: { canonical: "https://physionexusacademy.com/manual-therapy" },
  robots: { index: false, follow: true },
};

/** Legacy collection link now opens the single consolidated encyclopedia. */
export default function OldWorldCollectionRedirect() {
  redirect("/manual-therapy");
}
