import type { Metadata } from "next";
import { AccountApp } from "@/components/student/AccountApp";

export const metadata: Metadata = {
  title: "My PNA — Your Personal Learning Record",
  description: "Create a free My PNA account to save every lesson, skill, virtual patient and challenge, see your streak and get insights on any device.",
  alternates: { canonical: "https://physionexusacademy.com/account" },
};

export default function AccountPage() {
  return <AccountApp />;
}
