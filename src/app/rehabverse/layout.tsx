import type { Metadata } from "next";
import { RvLangProvider } from "@/components/rehabverse/useLang";
import { RvNav } from "@/components/rehabverse/RvNav";
import "./rehabverse.css";

export const metadata: Metadata = {
  title: { default: "PNA RehabVerse — guided 3D rehabilitation", template: "%s | PNA RehabVerse" },
  description:
    "Guided digital rehabilitation from Physio Nexus Academy: tell us your symptoms, get a physiotherapist-approved programme, learn each exercise from a 3D virtual physio guide and progress day by day.",
};

export default function RehabVerseLayout({ children }: { children: React.ReactNode }) {
  return (
    <RvLangProvider>
      <div className="rv-root">
        <RvNav />
        {children}
      </div>
    </RvLangProvider>
  );
}
