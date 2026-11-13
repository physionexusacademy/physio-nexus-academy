import type { Metadata } from "next";
import { AccountApp } from "@/components/student/AccountApp";

export const metadata: Metadata = {
  title: { absolute: "My PNA — your personal learning record | Physio Nexus Academy" },
  description: "A free student account that records every lesson, skill, patient and challenge you finish, shows your strengths and gaps, and keeps your progress on every device.",
  alternates: { canonical: "https://physionexusacademy.com/account" },
};

export default function AccountPage() {
  return <AccountApp />;
}
